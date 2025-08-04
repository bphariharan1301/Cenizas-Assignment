# PDF Chat Assistant Frontend

This is the frontend for the PDF Chat Assistant, built with Next.js and Material UI. It provides a simple, ChatGPT-style interface for users to upload PDF documents and chat with an AI assistant about their content.

## Features

- Upload PDF files
- Chat interface for asking questions about the document
- Streaming AI responses
- Clean, minimalist UI
- Next.js (App Router) with Material UI
- AgendaBot chat with Google OAuth login and session management
- PDF Q&A and calendar integration
- Real-time streaming of Gemini LLM responses in chat and PDF Q&A

## Streaming LLM Responses

- The frontend uses `fetch` with `ReadableStream` to consume streaming responses from the backend.
- As each chunk arrives, the assistant's message updates live in the chat.

## Getting Started

1. Install dependencies:

   ```bash
   npm install --force
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

- The frontend expects the backend to be running at `https://localhost:8000`.
- API endpoints used:
  - `POST /api/document/upload_pdf/` for uploading PDFs
  - `POST /api/document/ask/` for asking questions

## Folder Structure

- `app/page.tsx`: Main chat UI
- `components/ui/PdfUpload.tsx`: PDF upload component

## Tech Stack

- **Next.js**: React framework for fast, scalable web apps
- **Material UI**: UI library for clean, accessible components

## Usage

- Start the frontend with `npm run dev`.
- Make sure your backend is running and accessible (HTTPS recommended for OAuth).
- On 401 errors, the UI prompts for Google login and redirects to backend OAuth.

## Requirements

- Node.js 18+
- Next.js 14+, Material UI

## Notes

- For streaming to work, your browser must support `fetch` streaming (all modern browsers do).
- If you see CORS or HTTPS issues, check your backend and OAuth settings.

---
