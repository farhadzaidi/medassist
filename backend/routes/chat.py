from flask import Blueprint, jsonify, request, session
from datetime import datetime
import google.generativeai as genai
from models.models import db, ChatHistory
from config.config import Config, MENTAL_HEALTH_PROMPT

chat_bp = Blueprint('chat', __name__)

# Configure Gemini API
genai.configure(api_key=Config.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

@chat_bp.route('/api/chat', methods=['POST'])
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

@chat_bp.route('/api/chat/history', methods=['GET'])
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

@chat_bp.route('/api/chat/save', methods=['POST'])
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