# PDF Chat Assistant — Technical Architecture & Rationale

## Overview

PDF Chat Assistant is a full-stack application that allows users to upload PDF documents and interact with an AI assistant to ask questions about the document’s content. The system consists of a Next.js frontend and a Django backend, with AI-powered Q&A provided by Gemini.

---

## Architecture

### Frontend (Next.js)

- **Framework:** Next.js (React)
- **UI Library:** Material UI
- **Main Features:**
  - File upload component for PDFs
  - Chat interface styled like ChatGPT
  - Streaming AI responses for real-time feedback
  - Maintains chat history in local state
- **API Integration:**
  - Communicates with backend via REST endpoints for upload and chat
  - Handles streaming responses for smooth user experience

### Backend (Django)

- **Framework:** Django & Django REST Framework
- **PDF Processing:** PyMuPDF for fast, reliable text extraction
- **AI Integration:** Gemini API for natural language Q&A
- **Data Model:**
  - Stores extracted text and chat history per document
  - No file storage, only text and conversation context
- **Endpoints:**
  - `/api/document/upload_pdf/` — Accepts PDF, extracts text
  - `/api/document/ask/` — Streams AI answers, maintains chat history

---

## Why These Frameworks?

### Next.js & Material UI

- **Next.js** offers fast development, server-side rendering, and easy API integration. It’s ideal for building modern, scalable web apps with React.
- **Material UI** provides accessible, customizable components and a clean design system, making it easy to build a professional chat interface.

### Django & Django REST Framework

- **Django** is a robust, secure Python web framework with excellent ORM and admin tools. It’s well-suited for rapid backend development and data modeling.
- **Django REST Framework** simplifies API creation, authentication, and serialization, making it easy to expose endpoints for the frontend.

### PyMuPDF

- Chosen for its speed and reliability in extracting text from PDFs, outperforming many alternatives in accuracy and performance.

### Gemini API

- Provides state-of-the-art AI Q&A capabilities, supporting streaming responses and context-aware answers. Integrates easily with Python and supports advanced conversational features.

---

## Data Flow & Conversation Context

- **Upload:** User uploads a PDF; backend extracts text and stores it.
- **Chat:** Each question is sent to the backend with the document ID. The backend builds a prompt including the full chat history and document text, sends it to Gemini, and streams the answer back.
- **Frontend:** Displays chat history and streaming responses, mimicking ChatGPT’s conversational flow.

---

## Challenges Faced & Solutions

### 1. PDF Text Extraction

- **Challenge:** Ensuring reliable extraction of text from a wide variety of PDF formats, including scanned documents and complex layouts.
- **Solution:** Chose PyMuPDF for its speed and accuracy. For scanned/image-based PDFs, fallback strategies (like OCR) could be considered in future improvements.

### 2. Streaming AI Responses

- **Challenge:** Delivering real-time, streaming answers from the Gemini API to the frontend, while maintaining a smooth user experience.
- **Solution:** Implemented server-sent events (SSE) in the backend and handled streaming in the frontend with incremental updates to the chat window.

### 3. Conversation Context

- **Challenge:** Ensuring the AI model receives full chat history for context-aware answers, while keeping prompts efficient and relevant.
- **Solution:** Persisted chat history per document in the backend and included it in every prompt sent to Gemini, balancing context depth and performance.

### 4. Minimalist, Familiar UI

- **Challenge:** Designing a chat interface that feels intuitive and familiar, like ChatGPT, without unnecessary complexity.
- **Solution:** Used Material UI and custom styles to create a clean, focused chat experience, prioritizing usability and accessibility.

---

## Improvements & Reflections

### What I Would Improve

- **Authentication & User Management:** Add user accounts so chat history is tied to users, not just documents.
- **Better Utilisaition of DB for Conversation Context:** Could use session id's and user id's based chat memory in the DB rather than passing it as prompt to consume less token.
- **Scalability:** Move chat history and document storage to a scalable database (e.g., PostgreSQL) and consider file storage for future features.
- **Advanced PDF Handling:** Integrate OCR for scanned PDFs and support for multi-language documents.
- **AI Model Options:** Allow users to choose between different AI models (Gemini, OpenAI, local LLMs) for flexibility and cost control.
- **Testing & CI/CD:** Add automated tests and continuous integration for reliability.
- **Deployment:** Containerize the app (Docker) and deploy to cloud platforms for production use.

### Experience & Takeaways

This development exercise was both challenging and rewarding. The integration of modern frameworks (Next.js, Django) with advanced AI (Gemini) provided a great opportunity to build a full-stack, real-world application. The biggest challenge was ensuring seamless communication between frontend and backend, especially for streaming responses and maintaining context. Material UI made it easy to create a professional, user-friendly interface, while Django REST Framework simplified API development.

Overall, the project reinforced the importance of clear architecture, modular design, and user-centric features. With more time, I would focus on scalability, security, and advanced document handling. The experience was enjoyable and educational, and I’m confident this architecture provides a solid foundation for future enhancements.
