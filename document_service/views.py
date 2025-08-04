import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from .models import UploadedPDF
import pymupdf
from asgiref.sync import async_to_sync
from backend.settings import GOOGLE_GENAI_CLIENT
from django.views.decorators.csrf import csrf_exempt
from django.http import StreamingHttpResponse, HttpResponseBadRequest
import json


# --- PDF Upload Endpoint ---
class UploadPDFView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        file = request.FILES.get("file")

        if file:
            if file.content_type != "application/pdf":
                return Response(
                    {"error": "File is not a PDF"}, status=status.HTTP_400_BAD_REQUEST
                )

            # Extract text from the PDF
            # try:
            pdf_document = pymupdf.open(stream=io.BytesIO(file.read()))
            extracted_text = "\n".join([page.get_text() for page in pdf_document])
            pdf_document.close()
            uploaded_pdf = UploadedPDF.objects.create(extracted_text=extracted_text)
            # except Exception as e:
            #     return Response(
            #         {"error": f"Failed to process PDF: {str(e)}"},
            #         status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            #     )

            return Response(
                {
                    "message": "File uploaded successfully. Use WebSocket for AI responses.",
                    "id": uploaded_pdf.id,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {"error": "File must be provided for upload."},
            status=status.HTTP_400_BAD_REQUEST,
        )


# --- AI Ask Endpoint (Streaming) ---


@csrf_exempt
async def ask_view(request):
    if request.method != "POST":
        return HttpResponseBadRequest("Only POST allowed")

    # try:
    body = request.body
    data = json.loads(body)

    pdf_id = data.get("pdf_id")
    question = data.get("question")

    if not pdf_id or not question:
        return HttpResponseBadRequest("Missing pdf_id or question")

    uploaded_pdf = await UploadedPDF.objects.aget(id=pdf_id)
    text_content = uploaded_pdf.extracted_text

    if not text_content:
        return HttpResponseBadRequest("PDF text not found")

    # Build chat history string
    chat_history = uploaded_pdf.chat_history if uploaded_pdf.chat_history else []
    history_str = "\n".join(
        [f"User: {item['question']}\nAI: {item['answer']}" for item in chat_history]
    )
    prompt = f"Document:\n{text_content}\n\nConversation History:\n{history_str}\n\nUser Question: {question}\nAnswer:"

    async def event_stream():
        yield f"data: {json.dumps({'type': 'status', 'content': '🤖 AI is answering your question...'})}\n\n"

        try:
            stream = GOOGLE_GENAI_CLIENT.aio.models.generate_content_stream(
                model="gemini-2.5-flash",
                contents=[{"role": "user", "parts": [{"text": prompt}]}],
            )

            full_answer = ""
            async for chunk in await stream:
                text = getattr(chunk, "text", "")
                if text:
                    full_answer += text
                    yield f"data: {json.dumps({'type': 'message', 'content': text})}\n\n"

            # Save new Q&A to chat_history
            chat_history.append({"question": question, "answer": full_answer})
            uploaded_pdf.chat_history = chat_history
            await uploaded_pdf.asave()

            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingHttpResponse(event_stream(), content_type="text/event-stream")


# except Exception as e:
#     return HttpResponseBadRequest(str(e))
