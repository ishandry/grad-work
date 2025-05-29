export interface ChatRequest {
  question: string
  project_id: string
}

export interface ChatResponse {
  response: string
  context_images: string[]
  context_texts: string[]
}

export class ChatApiClient {
  private baseUrl = "http://3.72.95.128:8000"

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.status}`)
    }

    return response.json()
  }
}

export const chatApiClient = new ChatApiClient()
