# PDF Chat Assistant Backend

This backend is built with Django and Django REST Framework. It provides endpoints for uploading PDF files, extracting their text, and chatting with an AI assistant powered by Gemini. Chat history is maintained for each document, and answers are streamed to the frontend for a responsive experience.

## Features

- PDF upload and text extraction
- Chat endpoint with streaming AI answers
- Maintains chat history per document

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run migrations:
   ```bash
   python manage.py migrate
   ```
3. Start the server:
   ```bash
   uvicorn backend.asgi:application --reload
   ```

## API Endpoints

- `POST /api/document/upload_pdf/` — Upload a PDF and extract its text
- `POST /api/document/ask/` — Ask questions about the uploaded document

## Tech Stack

- Django & Django REST Framework
- PyMuPDF for PDF text extraction
- Gemini API for AI Q&A
