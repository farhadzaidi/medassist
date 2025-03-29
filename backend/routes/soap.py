from flask import Blueprint, jsonify, request
import google.generativeai as genai
from config.config import Config

soap_bp = Blueprint('soap', __name__)

SOAP_PROMPT = """Generate professional SOAP notes using the following format:

# SOAP Notes

## Subjective
- Chief complaint
- History of present illness
- Review of systems
- Past medical history

## Objective
- Vital signs
- Physical examination findings
- Lab results (if mentioned)

## Assessment
- Primary diagnosis
- Differential diagnoses
- Clinical reasoning

## Plan
- Treatment recommendations
- Medications (if needed)
- Follow-up instructions
- Patient education

Format the response in markdown, starting directly with the '# SOAP Notes' header."""

@soap_bp.route('/api/soap/generate', methods=['POST'])
def generate_soap():
    data = request.get_json()
    patient_description = data.get('description', '')
    
    if not patient_description:
        return jsonify({'error': 'Patient description is required'}), 400
    
    try:
        # Configure Gemini
        genai.configure(api_key=Config.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Get or create chat session
        chat = model.start_chat()
        # Initialize with prompt and get response
        chat.send_message(SOAP_PROMPT)
        response = chat.send_message(patient_description)
        
        return jsonify({
            'soap_notes': response.text
        })
    except Exception as e:
        print(f"Error generating SOAP notes: {str(e)}")
        return jsonify({'error': 'Failed to generate SOAP notes'}), 500 