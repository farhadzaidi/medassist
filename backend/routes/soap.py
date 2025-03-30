from flask import Blueprint, jsonify, request
import google.generativeai as genai
from config.config import Config
from dotenv import load_dotenv
import os

load_dotenv()

soap_bp = Blueprint("soap", __name__)

INITIAL_PROMPT = """You are a medical professional conducting a patient interview to gather information for SOAP notes.
Your role is to ask one clear, focused question at a time to gather comprehensive information about the patient's condition.

IMPORTANT LANGUAGE HANDLING:
1. Detect the language of the patient's initial description
2. Use the SAME language as the patient's initial description for ALL questions and responses
3. If the patient writes in Spanish, respond in Spanish
4. If the patient writes in English, respond in English
5. If the patient writes in any other language, respond in that language
6. NEVER switch or mix languages during the interview
7. Maintain the same language throughout the entire conversation

Keep your questions concise and specific. Do not include any explanations or additional text - just the question.
After receiving the patient's answer, ask the next relevant question.
Focus on gathering information about:
1. Chief complaint and symptoms
2. Onset and duration
3. Severity and frequency
4. Associated symptoms
5. Past medical history
6. Medications
7. Family history
8. Social history
9. Review of systems

Remember to:
- Ask only one question at a time
- Return only the question text, no additional formatting or explanation
- Adapt your questions based on previous answers
- Stop after 8-10 questions when you have sufficient information
- Maintain the same language as the patient's initial description"""

SOAP_GENERATION_PROMPT = """Based on the following patient interview, generate a brief summary followed by SOAP notes in English, regardless of the interview language.
Do not include any explanations about SOAP notes or additional text.

{interview_history}

Format the response exactly as follows:

**Summary:** [Write a brief 2-3 sentence summary of the patient's condition, likely diagnosis, and recommended next steps]

## Subjective
- **Chief Complaint (CC):** [Patient's main complaint]
- **History of Present Illness (HPI):** [Onset, duration, severity, frequency]
- **Past Medical History (PMH):** [Relevant past conditions]
- **Medications:** [Current medications]
- **Family History:** [Relevant family history]
- **Social History:** [Relevant social factors]
- **Review of Systems:** [Positive and relevant negative findings]

## Objective
- **Vital Signs:** [If available]
- **Physical Exam:** [If available]
- **Lab Results:** [If available]
- **Imaging:** [If available]

## Assessment
- **Primary Diagnosis:** [Most likely diagnosis]
- **Differential Diagnoses:**
  - [Alternative diagnosis 1]
  - [Alternative diagnosis 2]
  - [Alternative diagnosis 3]
- **Clinical Reasoning:** [Brief explanation of diagnostic reasoning]

## Plan
- **Treatment:**
  - [Immediate treatment recommendations]
  - [Medications if needed]
- **Follow-up:**
  - [Follow-up recommendations]
  - [When to seek emergency care]
- **Patient Education:**
  - [Key points for patient education]
  - [Lifestyle modifications if applicable]"""

# Store active chat sessions
active_sessions = {}


@soap_bp.route("/api/soap/start", methods=["POST"])
def start_interview():
    data = request.get_json()
    initial_description = data.get("description", "")

    if not initial_description:
        return jsonify({"error": "Initial description is required"}), 400

    try:
        # Configure Gemini
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.0-flash")

        # Get or create chat session
        chat = model.start_chat()
        # Initialize with prompt and get first question
        chat.send_message(INITIAL_PROMPT)
        response = chat.send_message(
            f"Patient's initial description: {initial_description}"
        )

        # Store the chat session
        session_id = str(chat)
        active_sessions[session_id] = chat

        return jsonify({"question": response.text, "session_id": session_id})
    except Exception as e:
        print(f"Error starting interview: {str(e)}")
        return jsonify({"error": "Failed to start interview"}), 500


@soap_bp.route("/api/soap/answer", methods=["POST"])
def submit_answer():
    data = request.get_json()
    answer = data.get("answer", "")
    session_id = data.get("session_id", "")

    if not answer or not session_id:
        return jsonify({"error": "Answer and session ID are required"}), 400

    try:
        # Get the existing chat session
        chat = active_sessions.get(session_id)
        if not chat:
            return jsonify({"error": "Invalid or expired session"}), 400

        # Get next question
        response = chat.send_message(answer)

        return jsonify({"question": response.text})
    except Exception as e:
        print(f"Error processing answer: {str(e)}")
        return jsonify({"error": "Failed to process answer"}), 500


@soap_bp.route("/api/soap/generate", methods=["POST"])
def generate_soap():
    data = request.get_json()
    interview_history = data.get("interview_history", [])

    if not interview_history:
        return jsonify({"error": "Interview history is required"}), 400

    try:
        # Format interview history
        formatted_history = "\n".join([f"Q: {q}\nA: {a}" for q, a in interview_history])

        # Configure Gemini
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.0-flash")

        # Generate SOAP notes
        prompt = SOAP_GENERATION_PROMPT.format(interview_history=formatted_history)
        response = model.generate_content(prompt)

        # Clean up the response to ensure it starts with the header
        notes = response.text.strip()
        if not notes.startswith("# SOAP Notes"):
            notes = "# SOAP Notes\n\n" + notes

        return jsonify({"soap_notes": notes})
    except Exception as e:
        print(f"Error generating SOAP notes: {str(e)}")
        return jsonify({"error": "Failed to generate SOAP notes"}), 500
