from flask import Flask, jsonify, request, session
from flask_cors import CORS
import google.generativeai as genai
import markdown
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime

app = Flask(__name__)
# Enable CORS for all routes with a simpler configuration
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///health_portal.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.urandom(24)  # For session management
db = SQLAlchemy(app)

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    chat_histories = db.relationship('ChatHistory', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class ChatHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_user = db.Column(db.Boolean, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

# Create database tables
with app.app_context():
    db.create_all()

# Configure Gemini API
GEMINI_API_KEY = "AIzaSyDt0e-98t-N1FhWqj-9MO2Rbhv67nxDuOM"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

# Initialize chat sessions dictionary to store user sessions
chat_sessions = {}

# Mental health assistant system prompt
MENTAL_HEALTH_PROMPT = """You are a supportive mental health assistant. Your role is to:
1. Listen empathetically to users' concerns
2. Provide general information about mental health topics
3. Suggest healthy coping strategies and self-care practices
4. Encourage seeking professional help when appropriate
5. Maintain a supportive and non-judgmental tone

Important: While you can offer support and information, you are not a replacement for professional mental health care. Always encourage users to seek professional help for serious concerns.

Keep responses concise, clear, and focused on the user's specific concerns. Use a warm, supportive tone while maintaining appropriate boundaries."""

# Dummy data (same as frontend)
symptoms = [
    {"id": "1", "name": "Fever", "description": "Elevated body temperature above normal"},
    {"id": "2", "name": "Headache", "description": "Pain in any region of the head"},
    {"id": "3", "name": "Cough", "description": "Sudden expulsion of air from the lungs"},
    {"id": "4", "name": "Fatigue", "description": "Extreme tiredness or exhaustion"},
    {"id": "5", "name": "Nausea", "description": "Feeling of sickness with an inclination to vomit"},
    {"id": "6", "name": "Chest Pain", "description": "Pain in the chest area"},
    {"id": "7", "name": "Shortness of Breath", "description": "Difficulty breathing"},
    {"id": "8", "name": "Joint Pain", "description": "Pain in any joint of the body"},
    {"id": "9", "name": "Sore Throat", "description": "Pain or irritation in the throat"},
    {"id": "10", "name": "Rash", "description": "Redness or irritation of the skin"},
]

conditions = [
    {
        "id": "1",
        "name": "Common Cold",
        "description": "Viral infection of the nose and throat",
        "symptoms": ["1", "2", "3", "9"],
        "treatments": [
            "Rest and get plenty of sleep",
            "Stay hydrated with water, tea, or clear broths",
            "Use over-the-counter medications for symptom relief",
            "Use a humidifier to ease congestion",
            "Gargle with warm salt water for sore throat"
        ]
    },
    {
        "id": "2",
        "name": "Influenza",
        "description": "Viral infection affecting the respiratory system",
        "symptoms": ["1", "2", "3", "4", "5", "8"],
        "treatments": [
            "Rest and stay home to prevent spreading",
            "Take antiviral medications if prescribed",
            "Stay hydrated with water and electrolyte drinks",
            "Use over-the-counter medications for fever and pain",
            "Consider getting the flu vaccine annually"
        ]
    },
    {
        "id": "3",
        "name": "COVID-19",
        "description": "Coronavirus disease",
        "symptoms": ["1", "3", "7", "2", "4"],
        "treatments": [
            "Isolate to prevent spreading",
            "Rest and stay hydrated",
            "Monitor oxygen levels if shortness of breath persists",
            "Take prescribed antiviral medications if available",
            "Seek emergency care if symptoms worsen"
        ]
    },
    {
        "id": "4",
        "name": "Pneumonia",
        "description": "Infection that inflames the air sacs in lungs",
        "symptoms": ["1", "3", "7", "6", "4"],
        "treatments": [
            "Take prescribed antibiotics if bacterial",
            "Rest and avoid strenuous activity",
            "Stay hydrated",
            "Use a humidifier to help with breathing",
            "Seek emergency care if breathing becomes difficult"
        ]
    },
    {
        "id": "5",
        "name": "Allergic Reaction",
        "description": "Immune system response to allergens",
        "symptoms": ["10", "7", "9"],
        "treatments": [
            "Take antihistamines",
            "Use prescribed epinephrine if severe",
            "Avoid known allergens",
            "Apply cool compresses for rash",
            "Seek emergency care if breathing becomes difficult"
        ]
    },
]

medications = [
    {"id": "1", "name": "Ibuprofen", "description": "Nonsteroidal anti-inflammatory drug (NSAID)"},
    {"id": "2", "name": "Aspirin", "description": "Salicylate drug used for pain relief and blood thinning"},
    {"id": "3", "name": "Warfarin", "description": "Blood thinner medication"},
    {"id": "4", "name": "Metformin", "description": "Diabetes medication"},
    {"id": "5", "name": "Lisinopril", "description": "ACE inhibitor for blood pressure"},
    {"id": "6", "name": "Amoxicillin", "description": "Antibiotic medication"},
    {"id": "7", "name": "Omeprazole", "description": "Proton pump inhibitor for acid reflux"},
    {"id": "8", "name": "Sertraline", "description": "Antidepressant medication"},
    {"id": "9", "name": "Atorvastatin", "description": "Cholesterol-lowering medication"},
    {"id": "10", "name": "Metoprolol", "description": "Beta blocker for heart conditions"},
]

medication_interactions = [
    {
        "medication1": "1",
        "medication2": "3",
        "severity": "high",
        "description": "Taking ibuprofen while on blood thinners may increase bleeding risk."
    },
    {
        "medication1": "2",
        "medication2": "3",
        "severity": "high",
        "description": "Combining aspirin with warfarin significantly increases bleeding risk."
    },
    {
        "medication1": "4",
        "medication2": "7",
        "severity": "moderate",
        "description": "Omeprazole may affect the absorption of metformin."
    },
    {
        "medication1": "5",
        "medication2": "8",
        "severity": "moderate",
        "description": "Lisinopril may interact with sertraline to increase dizziness risk."
    },
    {
        "medication1": "6",
        "medication2": "9",
        "severity": "low",
        "description": "Amoxicillin may slightly reduce the effectiveness of atorvastatin."
    },
    {
        "medication1": "7",
        "medication2": "8",
        "severity": "moderate",
        "description": "Omeprazole may increase sertraline levels in the blood."
    },
    {
        "medication1": "9",
        "medication2": "10",
        "severity": "moderate",
        "description": "Atorvastatin may increase the effects of metoprolol."
    },
]

# Authentication routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password or not name:
        return jsonify({'error': 'Missing required fields'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    user = User(email=email, name=name)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    session['user_id'] = user.id
    return jsonify({
        'message': 'Registration successful',
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    session['user_id'] = user.id
    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name
        }
    })

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logout successful'})

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name
        }
    })

@app.route('/api/symptoms', methods=['GET'])
def get_symptoms():
    return jsonify(symptoms)

@app.route('/api/check-conditions', methods=['POST'])
def check_conditions():
    data = request.get_json()
    selected_symptom_ids = data.get('symptoms', [])
    
    # Find conditions that match the selected symptoms
    matching_conditions = []
    for condition in conditions:
        matching_symptoms = set(condition['symptoms']) & set(selected_symptom_ids)
        if len(matching_symptoms) >= 1:  # Show conditions with at least one matching symptom
            matching_conditions.append(condition)
    
    return jsonify(matching_conditions)

@app.route('/api/medications', methods=['GET'])
def get_medications():
    return jsonify(medications)

@app.route('/api/check-interactions', methods=['POST'])
def check_interactions():
    data = request.get_json()
    selected_medication_ids = data.get('medications', [])
    
    # Find interactions between selected medications
    interactions = []
    for interaction in medication_interactions:
        if (interaction['medication1'] in selected_medication_ids and 
            interaction['medication2'] in selected_medication_ids):
            interactions.append(interaction)
    
    return jsonify(interactions)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')
    user_id = session.get('user_id')
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    try:
        # Get or create chat session
        chat = model.start_chat()
        # Initialize the chat with the mental health assistant prompt
        chat.send_message(MENTAL_HEALTH_PROMPT)
        
        # Send message and get response
        response = chat.send_message(message)
        
        # Save messages if user is logged in
        if user_id:
            user_message = ChatHistory(
                user_id=user_id,
                message=message,
                is_user=True
            )
            bot_message = ChatHistory(
                user_id=user_id,
                message=response.text,  # Store the raw markdown
                is_user=False
            )
            db.session.add(user_message)
            db.session.add(bot_message)
            db.session.commit()
        
        return jsonify({
            'message': response.text,  # Return the raw markdown
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/history', methods=['GET'])
def get_chat_history():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    chat_history = ChatHistory.query.filter_by(user_id=user_id).order_by(ChatHistory.timestamp.asc()).all()
    return jsonify([{
        'id': chat.id,
        'message': chat.message,
        'is_user': chat.is_user,
        'timestamp': chat.timestamp.isoformat()
    } for chat in chat_history])

@app.route('/api/chat/save', methods=['POST'])
def save_chat_message():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json()
    chat = ChatHistory(
        user_id=user_id,
        message=data['message'],
        is_user=data['is_user']
    )
    
    db.session.add(chat)
    db.session.commit()
    
    return jsonify({
        'id': chat.id,
        'message': chat.message,
        'is_user': chat.is_user,
        'timestamp': chat.timestamp.isoformat()
    })

@app.route('/api/chat/history', methods=['DELETE'])
def delete_chat_history():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        ChatHistory.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        return jsonify({'message': 'Chat history deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001) 