from flask import Blueprint, jsonify, request
from utils.mock_data import symptoms, conditions, medications, medication_interactions

health_bp = Blueprint('health', __name__)

@health_bp.route('/api/symptoms', methods=['GET'])
def get_symptoms():
    return jsonify(symptoms)

@health_bp.route('/api/check-conditions', methods=['POST'])
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

@health_bp.route('/api/medications', methods=['GET'])
def get_medications():
    return jsonify(medications)

@health_bp.route('/api/check-interactions', methods=['POST'])
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