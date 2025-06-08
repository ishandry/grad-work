from fastapi import FastAPI, File, UploadFile, Form, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from posthog import api_key
from pydantic import BaseModel
import os, uuid, tempfile, boto3
from botocore import UNSIGNED
from botocore.client import Config
import logging
logger = logging.getLogger("uvicorn.error")
from urllib.parse import urlparse, unquote
import httpx
from botocore.exceptions import ClientError

# --- Unstructured imports for PDF processing ---
from unstructured.partition.pdf import partition_pdf

# --- LangChain and VectorStore imports ---
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain.schema import Document
from langchain.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import UpstashVectorStore
from upstash_redis import Redis
from langchain.storage import UpstashRedisByteStore
from langchain.retrievers.multi_vector import MultiVectorRetriever
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.messages import SystemMessage, HumanMessage
from base64 import b64decode

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment-based credentials
REDIS_URL = os.getenv("REDIS_URL")
REDIS_TOKEN = os.getenv("REDIS_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
VEC_URL = os.getenv("VEC_URL")
VEC_TOKEN = os.getenv("VEC_TOKEN")
GROQ_KEY = os.getenv("GROQ_KEY")

# Shared embedding & store clients
embeddings = OpenAIEmbeddings()
redis_client = Redis(url=REDIS_URL, token=REDIS_TOKEN)
kv_store = UpstashRedisByteStore(client=redis_client, ttl=None, namespace="test-ns")
id_key = "doc_id"
deployVectorstore = UpstashVectorStore(
    embedding=embeddings,
    index_url=VEC_URL,
    index_token=VEC_TOKEN,
)

# Groq summarizer & prompt template
prompt_text = """
Ви асистент, завдання якого узагальнювати таблиці та текст.
Надайте стисле узагальнення таблиці або тексту.

У відповідь надавайте лише узагальнення, без додаткових коментарів.
Не починайте своє повідомлення словами «Ось узагальнення» або чимось подібним.
Просто надайте саме узагальнення.

Таблиця або фрагмент тексту: {element}

"""
prompt = ChatPromptTemplate.from_template(prompt_text)

# Summary chain
model = ChatGroq(temperature=0.5, model="llama-3.1-8b-instant", api_key=GROQ_KEY)
summarize_chain = {"element": lambda x: x} | prompt | model | StrOutputParser()

class ChatRequest(BaseModel):
    question: str
    project_id: str

class ProcessFileRequest(BaseModel):
    source_id: int
    s3_path: str
    project_id: str
    project_name: str
    callback_url: str

class KeyTermsRequest(BaseModel):
    lecture_text: str

KEYTERMS_PROMPT = ChatPromptTemplate.from_template("""
Ви асистент, завдання якого витягти найважливіші ключові терміни з лекції.
Найважливі ключові терміни слід обирати серед тих, які можуть бути незнайомі студенту через пропущені попередні лекції, а також серед термінів інших дисциплін або тем, що не є предметом даної лекції
Поверніть їх у вигляді списку, розділеного комами, і більше нічого.
Текст лекції: {lecture_text}
""")

keyterms_model = ChatGroq(
    temperature=0.0,
    model="llama-3.1-8b-instant",
    api_key=GROQ_KEY,
)

keyterms_chain = (
    {"lecture_text": lambda x: x}
    | KEYTERMS_PROMPT
    | keyterms_model
    | StrOutputParser()
)

async def _process_and_index(
    tmp_path: str,
    source_id: int,
    s3_path: str,
    project_id: str,
    project_name: str,
    callback_url: str = None
):
    logger.info(f"Start for {source_id} from {s3_path} at {tmp_path} for project {project_id} - {project_name} and callback {callback_url}")
    # Partition document
    chunks = partition_pdf(
        filename=tmp_path,
        infer_table_structure=True,
        strategy="hi_res",
        extract_image_block_types=["Image"],
        extract_image_block_to_payload=True,
        chunking_strategy="by_title",
        max_characters=10000,
        combine_text_under_n_chars=2000,
        new_after_n_chars=6000,
    )

    logger.info(f"Partition completed for {source_id}")

    texts, tables, images = [], [], []
    for chunk in chunks:
        if "Table" in str(type(chunk)):
            tables.append(chunk)

        if "CompositeElement" in str(type((chunk))):
            texts.append(chunk)

    for chunk in chunks:
        if "CompositeElement" in str(type(chunk)):
            chunk_els = chunk.metadata.orig_elements
            for el in chunk_els:
                if "Image" in str(type(el)):
                    images.append(el.metadata.image_base64)

    # Summarize text
    text_summaries = summarize_chain.batch(texts, {"max_concurrency": 3})
    byte_texts = [text.text.encode("utf-8") for text in texts]

    logger.info(f"Text summary completed for {source_id}")

    # Summarize tables
    tables_html = [table.metadata.text_as_html for table in tables]
    byte_tables = [table.text.encode("utf-8") for table in tables_html]
    table_summaries = summarize_chain.batch(tables_html, {"max_concurrency": 3})

    logger.info(f"Table summary completed for {source_id}")

    img_summaries = []
    if images:
        prompt_template = """Опишіть зображення детально. Для контексту,
        зображення є частиною джерела з назвою {s3_path}, завантаженого в проєкт обробки лекцій з назвою {project_name}.
        Будьте конкретні щодо графіків, та інших зображень.
        Найкращим буде той опис, який дасть змогу знайти це зображення векторним пошуком.""".format(
            s3_path=s3_path,
            project_name=project_name
        )
        messages = [
            (
                "user",
                [
                    {"type": "text", "text": prompt_template},
                    {
                        "type": "image_url",
                        "image_url": {"url": "data:image/jpeg;base64,{image}"},
                    },
                ],
            )
        ]

        image_summary_prompt = ChatPromptTemplate.from_messages(messages)

        chain = image_summary_prompt | ChatOpenAI(model="gpt-4o") | StrOutputParser()

        img_summaries = chain.batch(images)

    logger.info(f"Image summary completed for {source_id}")

    # Prepare documents with metadata
    doc_ids = [str(uuid.uuid4()) for _ in texts]
    summary_texts = [
        Document(page_content=summary, metadata={id_key: doc_ids[i], "source_id": source_id,
                    "s3_path": s3_path,
                    "project_id": project_id}) for i, summary in enumerate(text_summaries)
    ]
    deployVectorstore.add_documents(summary_texts)
    kv_store.mset(list(zip(doc_ids, byte_texts)))

    logger.info(f"Texts saved for {source_id}. Count = {len(doc_ids)}")

    table_ids = [str(uuid.uuid4()) for _ in tables]
    summary_tables = [
        Document(page_content=summary, metadata={id_key: table_ids[i], "source_id": source_id,
                    "s3_path": s3_path,
                    "project_id": project_id}) for i, summary in enumerate(table_summaries)
    ]
    if len(summary_tables) > 0:
        deployVectorstore.add_documents(summary_tables)
        kv_store.mset(list(zip(table_ids, byte_tables)))

    logger.info(f"Tables saved for {source_id}. Count = {len(table_ids)}")

    img_ids = [str(uuid.uuid4()) for _ in images]
    summary_img = [
        Document(page_content=summary, metadata={id_key: img_ids[i], "source_id": source_id,
                    "s3_path": s3_path,
                    "project_id": project_id}) for i, summary in enumerate(img_summaries)
    ]
    deployVectorstore.add_documents(summary_img)
    byte_images = [image.encode("utf-8") for image in images]
    kv_store.mset(list(zip(img_ids, byte_images)))

    logger.info(f"Images saved for {source_id}. Count = {len(img_ids)}")

    # Callback if provided
    if callback_url:
        try:
            async with httpx.AsyncClient(timeout=5, verify=False) as client:
                logger.info(f"Callack start for {source_id}")
                await client.post(
                    callback_url,
                    json={"status": "success", "project_id": project_id, "source_id": source_id},
                )
                logger.info(f"Callack success for {source_id}")
        except httpx.RequestError as e:
            print(f"Callback POST to {callback_url} failed: {e}")
            logger.info(f"Callback POST to {callback_url} failed: {e}")

def parse_docs(docs):
    """Split base64-encoded images and texts"""
    b64 = []
    text = []
    for doc in docs:
        try:
            toutf = doc.decode("utf-8")
            b64decode(toutf)
            b64.append(toutf)
        except Exception as e:
            textdoc = doc.decode("utf-8")
            text.append(textdoc)
    return {"images": b64, "texts": text}


def build_prompt(kwargs):
    docs_by_type = kwargs["context"]
    user_question = kwargs["question"]

    context_text = ""
    if len(docs_by_type["texts"]) > 0:
        for text_element in docs_by_type["texts"]:
            context_text += text_element

    # construct prompt with context (including images)
    prompt_template = f"""
    Відповідайте на запитання, спираючись виключно на наведений контекст, який може включати текст, таблиці та зображення нижче.
    Контекст: {context_text}
    Запитання: {user_question}
    """

    prompt_content = [{"type": "text", "text": prompt_template}]

    if len(docs_by_type["images"]) > 0:
        for image in docs_by_type["images"]:
            prompt_content.append(
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image}"},
                }
            )

    return ChatPromptTemplate.from_messages(
        [
            HumanMessage(content=prompt_content),
        ]
    )

@app.post("/process-file")
def process_file(req: ProcessFileRequest,
    background_tasks: BackgroundTasks
):
    """
    Ingest and index a document by downloading it from S3 for a given project.
    """
    parsed = urlparse(req.s3_path)
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.basename(parsed.path))

    if parsed.scheme == "s3":
        # Decode any percent-encoded characters in the key
        raw_key = unquote(parsed.path.lstrip('/'))
        # Derive bucket name
        host = parsed.netloc
        bucket = host.split('.s3')[0] if '.s3' in host else host
        s3 = boto3.client('s3', config=boto3.session.Config(signature_version='unsigned'))
        try:
            s3.download_file(bucket, raw_key, tmp.name)
        except ClientError as e:
            code = e.response.get('Error', {}).get('Code')
            if code in ('NoSuchKey', '404'):
                raise HTTPException(status_code=404, detail=f"S3 object not found: {bucket}/{raw_key}")
            else:
                raise
    elif parsed.scheme in ("https", "http"):
        # Public HTTPS URL
        import requests
        resp = requests.get(req.s3_path, stream=True)
        resp.raise_for_status()
        for chunk in resp.iter_content(1024 * 1024):
            tmp.file.write(chunk)
        tmp.file.flush()
    else:
        raise HTTPException(status_code=400, detail="Unsupported URL scheme")

    tmp.close()

    # Offload heavy work
    background_tasks.add_task(
        _process_and_index,
        tmp.name,
        req.source_id,
        req.s3_path,
        req.project_id,
        req.project_name,
        req.callback_url,
    )

    return {"status": "processing"}  # immediate response

@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Ask a question over the ingested RAG index scoped to a project.
    """
    q = request.question
    pid = request.project_id

    # Dynamic retriever scoped by project
    retriever = MultiVectorRetriever(
        vectorstore=deployVectorstore,
        docstore=kv_store,
        id_key=id_key,
        search_kwargs={"k": 5, "filter": "project_id = '" + str(pid) + "'"},
    )

    chain_with_sources = {
                             "context": retriever | RunnableLambda(parse_docs),
                             "question": RunnablePassthrough(),
                         } | RunnablePassthrough().assign(
        response=(
                RunnableLambda(build_prompt)
                | ChatOpenAI(model="gpt-4o-mini")
                | StrOutputParser()
        )
    )

    response = chain_with_sources.invoke(q)

    return {"response": response['response'], "context_images": response['context']['images'], "context_texts": response['context']['texts']}

@app.post("/extract-key-terms")
async def extract_key_terms(req: KeyTermsRequest):
    terms: str = await keyterms_chain.ainvoke(req.lecture_text)
    return {"key_terms": terms}


