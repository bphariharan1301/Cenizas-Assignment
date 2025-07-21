# PDF Chat Assistant Frontend

This is the frontend for the PDF Chat Assistant, built with Next.js and Material UI. It provides a simple, ChatGPT-style interface for users to upload PDF documents and chat with an AI assistant about their content.

## Features

- Upload PDF files
- Chat interface for asking questions about the document
- Streaming AI responses
- Clean, minimalist UI

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

- The frontend expects the backend to be running at `http://localhost:8000`.
- API endpoints used:
  - `POST /api/document/upload_pdf/` for uploading PDFs
  - `POST /api/document/ask/` for asking questions

## Folder Structure

- `app/page.tsx`: Main chat UI
- `components/ui/PdfUpload.tsx`: PDF upload component

## Tech Stack

- **Next.js**: React framework for fast, scalable web apps
- **Material UI**: UI library for clean, accessible components

---
