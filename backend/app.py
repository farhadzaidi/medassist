from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS for all routes with a simpler configuration
CORS(app, origins=["http://localhost:5173"])

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

if __name__ == '__main__':
    app.run(debug=True, port=5001) 