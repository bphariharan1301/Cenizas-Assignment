from django.urls import path
from .views import UploadPDFView, ask_view

urlpatterns = [
    path("upload_pdf/", UploadPDFView.as_view(), name="upload_pdf"),
    path("ask/", ask_view, name="ask"),
]
