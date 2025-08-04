from django.db import models

# Create your models here.


class UploadedPDF(models.Model):
    # file = models.FileField(upload_to="uploads/")
    extracted_text = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    chat_history = models.JSONField(default=list, blank=True)  # Stores Q&A pairs

    def __str__(self):
        return self.file.name
