# Stage 1: Builder – install OS libs, build wheels
FROM python:3.11-slim AS builder

# Install build and system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        poppler-utils \
        tesseract-ocr \
        libmagic-dev \
        libgl1-mesa-glx \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender1 && \
    rm -rf /var/lib/apt/lists/*

# Prepare working directory and pre-build all wheels
WORKDIR /wheels
COPY requirements.txt ./
RUN pip wheel --wheel-dir /wheels -r requirements.txt

# Stage 2: Runtime – slimmer image with only needed libs and wheels
FROM python:3.11-slim

# Install runtime system dependencies only
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        poppler-utils \
        tesseract-ocr \
        libmagic-dev \
        libgl1-mesa-glx \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender1 && \
    rm -rf /var/lib/apt/lists/*

# Copy and install pre-built Python wheels
WORKDIR /app
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/*.whl

# Copy app code
COPY . /app

# Expose port and start server
EXPOSE 8000
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
