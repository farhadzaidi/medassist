from flask import Blueprint, jsonify, request
import google.generativeai as genai
import pytesseract
from PIL import Image
import pdf2image
import os
from werkzeug.utils import secure_filename
import tempfile
from config.config import Config

documents_bp = Blueprint("documents", __name__)

# Configure upload folder
UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_text_from_image(image):
    """Extract text from an image using Tesseract OCR."""
    try:
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from image: {str(e)}")
        return None


def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file."""
    try:
        # Convert PDF to images
        images = pdf2image.convert_from_path(pdf_path)

        # Extract text from each page
        text = ""
        for image in images:
            page_text = extract_text_from_image(image)
            if page_text:
                text += page_text + "\n"

        return text.strip()
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        return None


def analyze_document(text):
    """Analyze document text using Gemini."""
    try:
        # Configure Gemini
        genai.configure(api_key=Config.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")

        prompt = f"""Analyze the following medical document and provide a clear, well-structured explanation of its contents and any required actions.
Format the response in markdown with the following sections:

## Document Overview
- **Type:** [Specify the type of document]
- **Purpose:** [Brief description of the document's purpose]
- **Date:** [If available]

## Key Information
- **Main Points:** [List the most important information]
- **Findings:** [Any significant findings or results]
- **Diagnoses:** [If any are mentioned]

## Required Actions
- **Follow-up Appointments:** [List any required follow-ups]
- **Medications:** [Any prescribed medications or changes]
- **Lifestyle Changes:** [Recommended lifestyle modifications]
- **Other Tasks:** [Any other required actions]

## Important Dates
- **Appointments:** [List upcoming appointments]
- **Deadlines:** [Any important deadlines]
- **Follow-up Schedule:** [Follow-up timeline]

## Additional Notes
- **Warnings:** [Any important warnings or precautions]
- **Questions:** [Questions that should be asked]
- **Additional Information:** [Any other relevant details]

Document text:
{text}

Make sure to:
1. Use clear, concise language
2. Format lists with bullet points
3. Highlight important information in bold
4. Include specific dates and times when available
5. Clearly separate different types of information"""

        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error analyzing document: {str(e)}")
        return None


@documents_bp.route("/api/documents/process", methods=["POST"])
def process_documents():
    if "documents" not in request.files:
        return jsonify({"error": "No documents provided"}), 400

    files = request.files.getlist("documents")
    if not files or files[0].filename == "":
        return jsonify({"error": "No selected files"}), 400

    results = {}
    errors = {}

    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)

            try:
                # Save the uploaded file
                file.save(file_path)

                # Extract text based on file type
                if filename.lower().endswith(".pdf"):
                    text = extract_text_from_pdf(file_path)
                else:
                    image = Image.open(file_path)
                    text = extract_text_from_image(image)

                if not text:
                    errors[filename] = "Failed to extract text from document"
                    continue

                # Analyze the document
                analysis = analyze_document(text)
                if not analysis:
                    errors[filename] = "Failed to analyze document"
                    continue

                results[filename] = analysis

            except Exception as e:
                errors[filename] = str(e)
                print(f"Error processing {filename}: {str(e)}")
            finally:
                # Clean up temporary file
                if os.path.exists(file_path):
                    os.remove(file_path)
        else:
            errors[file.filename] = "File type not allowed"

    if not results and not errors:
        return jsonify({"error": "No documents were successfully processed"}), 400

    return jsonify({"results": results, "errors": errors})
