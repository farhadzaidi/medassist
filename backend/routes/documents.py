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


def analyze_document(text, language="en"):
    """Analyze document text using Gemini."""
    try:
        # Configure Gemini
        genai.configure(api_key=Config.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")

        # Language-specific instructions and section headers
        language_config = {
            "en": {
                "instruction": "Provide the entire analysis in English, including all section headers and content. Make the output user-friendly and easy to understand.",
                "headers": {
                    "overview": "Document Overview",
                    "type": "Type",
                    "purpose": "Purpose",
                    "date": "Date",
                    "key_info": "Key Information",
                    "main_points": "Main Points",
                    "findings": "Findings",
                    "diagnoses": "Diagnoses",
                    "actions": "Required Actions",
                    "followup": "Follow-up Appointments",
                    "medications": "Medications",
                    "lifestyle": "Lifestyle Changes",
                    "tasks": "Other Tasks",
                    "dates": "Important Dates",
                    "appointments": "Appointments",
                    "deadlines": "Deadlines",
                    "schedule": "Follow-up Schedule",
                    "notes": "Additional Notes",
                    "warnings": "Warnings",
                    "questions": "Questions",
                    "additional": "Additional Information",
                },
            },
            "es": {
                "instruction": "Proporciona todo el análisis en español, incluyendo todos los encabezados de sección y contenido. Haz que el resultado sea fácil de entender para el usuario.",
                "headers": {
                    "overview": "Descripción General del Documento",
                    "type": "Tipo",
                    "purpose": "Propósito",
                    "date": "Fecha",
                    "key_info": "Información Clave",
                    "main_points": "Puntos Principales",
                    "findings": "Hallazgos",
                    "diagnoses": "Diagnósticos",
                    "actions": "Acciones Requeridas",
                    "followup": "Citas de Seguimiento",
                    "medications": "Medicamentos",
                    "lifestyle": "Cambios en el Estilo de Vida",
                    "tasks": "Otras Tareas",
                    "dates": "Fechas Importantes",
                    "appointments": "Citas",
                    "deadlines": "Plazos",
                    "schedule": "Calendario de Seguimiento",
                    "notes": "Notas Adicionales",
                    "warnings": "Advertencias",
                    "questions": "Preguntas",
                    "additional": "Información Adicional",
                },
            },
            "fr": {
                "instruction": "Fournir l'analyse complète en français, y compris tous les en-têtes de section et le contenu. Rendez le résultat facile à comprendre pour l'utilisateur.",
                "headers": {
                    "overview": "Aperçu du Document",
                    "type": "Type",
                    "purpose": "Objectif",
                    "date": "Date",
                    "key_info": "Informations Clés",
                    "main_points": "Points Principaux",
                    "findings": "Trouvailles",
                    "diagnoses": "Diagnostics",
                    "actions": "Actions Requises",
                    "followup": "Rendez-vous de Suivi",
                    "medications": "Médicaments",
                    "lifestyle": "Changements de Mode de Vie",
                    "tasks": "Autres Tâches",
                    "dates": "Dates Importantes",
                    "appointments": "Rendez-vous",
                    "deadlines": "Échéances",
                    "schedule": "Calendrier de Suivi",
                    "notes": "Notes Supplémentaires",
                    "warnings": "Avertissements",
                    "questions": "Questions",
                    "additional": "Informations Supplémentaires",
                },
            },
            "de": {
                "instruction": "Geben Sie die vollständige Analyse auf Deutsch ab, einschließlich aller Abschnittsüberschriften und Inhalte. Machen Sie die Ausgabe benutzerfreundlich und leicht verständlich.",
                "headers": {
                    "overview": "Dokumentübersicht",
                    "type": "Typ",
                    "purpose": "Zweck",
                    "date": "Datum",
                    "key_info": "Wichtige Informationen",
                    "main_points": "Hauptpunkte",
                    "findings": "Befunde",
                    "diagnoses": "Diagnosen",
                    "actions": "Erforderliche Maßnahmen",
                    "followup": "Nachfolgetermine",
                    "medications": "Medikamente",
                    "lifestyle": "Lebensstiländerungen",
                    "tasks": "Weitere Aufgaben",
                    "dates": "Wichtige Termine",
                    "appointments": "Termine",
                    "deadlines": "Fristen",
                    "schedule": "Nachfolgeplan",
                    "notes": "Zusätzliche Hinweise",
                    "warnings": "Warnungen",
                    "questions": "Fragen",
                    "additional": "Zusätzliche Informationen",
                },
            },
            "it": {
                "instruction": "Fornisci l'analisi completa in italiano, inclusi tutti gli intestazioni delle sezioni e il contenuto. Rendi l'output facile da capire per l'utente.",
                "headers": {
                    "overview": "Panoramica del Documento",
                    "type": "Tipo",
                    "purpose": "Scopo",
                    "date": "Data",
                    "key_info": "Informazioni Chiave",
                    "main_points": "Punti Principali",
                    "findings": "Risultati",
                    "diagnoses": "Diagnosi",
                    "actions": "Azioni Richieste",
                    "followup": "Appuntamenti di Follow-up",
                    "medications": "Farmaci",
                    "lifestyle": "Modifiche allo Stile di Vita",
                    "tasks": "Altre Attività",
                    "dates": "Date Importanti",
                    "appointments": "Appuntamenti",
                    "deadlines": "Scadenze",
                    "schedule": "Programma di Follow-up",
                    "notes": "Note Aggiuntive",
                    "warnings": "Avvertenze",
                    "questions": "Domande",
                    "additional": "Informazioni Aggiuntive",
                },
            },
            "pt": {
                "instruction": "Forneça a análise completa em português, incluindo todos os cabeçalhos de seção e conteúdo. Torne a saída fácil de entender para o usuário.",
                "headers": {
                    "overview": "Visão Geral do Documento",
                    "type": "Tipo",
                    "purpose": "Propósito",
                    "date": "Data",
                    "key_info": "Informações Principais",
                    "main_points": "Pontos Principais",
                    "findings": "Resultados",
                    "diagnoses": "Diagnósticos",
                    "actions": "Ações Necessárias",
                    "followup": "Consultas de Acompanhamento",
                    "medications": "Medicamentos",
                    "lifestyle": "Mudanças no Estilo de Vida",
                    "tasks": "Outras Tarefas",
                    "dates": "Datas Importantes",
                    "appointments": "Consultas",
                    "deadlines": "Prazos",
                    "schedule": "Agenda de Acompanhamento",
                    "notes": "Notas Adicionais",
                    "warnings": "Avisos",
                    "questions": "Perguntas",
                    "additional": "Informações Adicionais",
                },
            },
            "ru": {
                "instruction": "Предоставьте полный анализ на русском языке, включая все заголовки разделов и содержание. Сделайте вывод удобным для понимания пользователем.",
                "headers": {
                    "overview": "Обзор Документа",
                    "type": "Тип",
                    "purpose": "Назначение",
                    "date": "Дата",
                    "key_info": "Ключевая Информация",
                    "main_points": "Основные Пункты",
                    "findings": "Результаты",
                    "diagnoses": "Диагнозы",
                    "actions": "Необходимые Действия",
                    "followup": "Последующие Приемы",
                    "medications": "Лекарства",
                    "lifestyle": "Изменения Образа Жизни",
                    "tasks": "Другие Задачи",
                    "dates": "Важные Даты",
                    "appointments": "Приемы",
                    "deadlines": "Сроки",
                    "schedule": "График Наблюдения",
                    "notes": "Дополнительные Заметки",
                    "warnings": "Предупреждения",
                    "questions": "Вопросы",
                    "additional": "Дополнительная Информация",
                },
            },
            "zh": {
                "instruction": "用中文提供完整的分析，包括所有章节标题和内容。使输出对用户来说易于理解。",
                "headers": {
                    "overview": "文档概述",
                    "type": "类型",
                    "purpose": "目的",
                    "date": "日期",
                    "key_info": "关键信息",
                    "main_points": "要点",
                    "findings": "发现",
                    "diagnoses": "诊断",
                    "actions": "所需行动",
                    "followup": "后续预约",
                    "medications": "药物",
                    "lifestyle": "生活方式改变",
                    "tasks": "其他任务",
                    "dates": "重要日期",
                    "appointments": "预约",
                    "deadlines": "截止日期",
                    "schedule": "随访时间表",
                    "notes": "补充说明",
                    "warnings": "警告",
                    "questions": "问题",
                    "additional": "补充信息",
                },
            },
            "ja": {
                "instruction": "日本語で完全な分析を提供し、すべてのセクションヘッダーとコンテンツを含めてください。出力をユーザーにとって理解しやすいものにしてください。",
                "headers": {
                    "overview": "文書概要",
                    "type": "種類",
                    "purpose": "目的",
                    "date": "日付",
                    "key_info": "重要情報",
                    "main_points": "主なポイント",
                    "findings": "所見",
                    "diagnoses": "診断",
                    "actions": "必要な行動",
                    "followup": "フォローアップ予約",
                    "medications": "薬物",
                    "lifestyle": "生活習慣の変更",
                    "tasks": "その他のタスク",
                    "dates": "重要な日付",
                    "appointments": "予約",
                    "deadlines": "期限",
                    "schedule": "フォローアップスケジュール",
                    "notes": "追加メモ",
                    "warnings": "警告",
                    "questions": "質問",
                    "additional": "追加情報",
                },
            },
            "ko": {
                "instruction": "한국어로 전체 분석을 제공하고, 모든 섹션 헤더와 내용을 포함하세요. 출력을 사용자가 이해하기 쉽게 만드세요.",
                "headers": {
                    "overview": "문서 개요",
                    "type": "유형",
                    "purpose": "목적",
                    "date": "날짜",
                    "key_info": "주요 정보",
                    "main_points": "주요 포인트",
                    "findings": "발견",
                    "diagnoses": "진단",
                    "actions": "필요한 조치",
                    "followup": "후속 예약",
                    "medications": "약물",
                    "lifestyle": "생활 방식 변경",
                    "tasks": "기타 작업",
                    "dates": "중요 날짜",
                    "appointments": "예약",
                    "deadlines": "마감일",
                    "schedule": "후속 일정",
                    "notes": "추가 메모",
                    "warnings": "경고",
                    "questions": "질문",
                    "additional": "추가 정보",
                },
            },
        }

        # Get language configuration or default to English
        config = language_config.get(language, language_config["en"])
        headers = config["headers"]

        prompt = f"""Analyze the following medical document and provide a clear, well-structured explanation of its contents and any required actions.
{config['instruction']}

Format the response in markdown with the following sections:

## {headers['overview']}
- **{headers['type']}:** [Specify the type of document]
- **{headers['purpose']}:** [Brief description of the document's purpose]
- **{headers['date']}:** [If available]

## {headers['key_info']}
- **{headers['main_points']}:** [List the most important information]
- **{headers['findings']}:** [Any significant findings or results]
- **{headers['diagnoses']}:** [If any are mentioned]

## {headers['actions']}
- **{headers['followup']}:** [List any required follow-ups]
- **{headers['medications']}:** [Any prescribed medications or changes]
- **{headers['lifestyle']}:** [Recommended lifestyle modifications]
- **{headers['tasks']}:** [Any other required actions]

## {headers['dates']}
- **{headers['appointments']}:** [List upcoming appointments]
- **{headers['deadlines']}:** [Any important deadlines]
- **{headers['schedule']}:** [Follow-up timeline]

## {headers['notes']}
- **{headers['warnings']}:** [Any important warnings or precautions]
- **{headers['questions']}:** [Questions that should be asked]
- **{headers['additional']}:** [Any other relevant details]

Document text:
{text}

Make sure to:
1. Use clear, concise language in {language_config[language]['instruction'].split()[0].lower()}
2. Format lists with bullet points
3. Highlight important information in bold
4. Include specific dates and times when available
5. Clearly separate different types of information
6. Ensure ALL content, including section headers and descriptions, is in {language_config[language]['instruction'].split()[0].lower()}
7. Use simple, everyday language when possible
8. Break down complex medical terms into simpler explanations
9. Add brief explanations for any medical terminology used
10. Format the output with proper spacing and line breaks for better readability
11. Use bullet points and bold text to highlight key information
12. Include a brief summary at the top of each section
13. Make sure all dates and times are clearly formatted
14. Use consistent formatting throughout the document
15. Add clear transitions between sections"""

        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error analyzing document: {str(e)}")
        return None


@documents_bp.route("/api/documents/process", methods=["POST"])
def process_documents():
    if "files" not in request.files:
        return jsonify({"error": "No documents provided"}), 400

    files = request.files.getlist("files")
    language = request.form.get("language", "en")

    if not files or files[0].filename == "":
        return jsonify({"error": "No selected files"}), 400

    analyses = {}
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

                # Analyze the document with selected language
                analysis = analyze_document(text, language)
                if not analysis:
                    errors[filename] = "Failed to analyze document"
                    continue

                analyses[filename] = analysis

            except Exception as e:
                errors[filename] = str(e)
                print(f"Error processing {filename}: {str(e)}")
            finally:
                # Clean up temporary file
                if os.path.exists(file_path):
                    os.remove(file_path)
        else:
            errors[file.filename] = "File type not allowed"

    if not analyses and not errors:
        return jsonify({"error": "No documents were successfully processed"}), 400

    return jsonify({"analyses": analyses, "errors": errors})
