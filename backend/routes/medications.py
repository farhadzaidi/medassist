from flask import Blueprint, jsonify, request

medications_bp = Blueprint("medications", __name__)

# Dummy medication data
medications = [
    {
        "id": "1",
        "name": "Ibuprofen",
        "description": "Nonsteroidal anti-inflammatory drug (NSAID)",
    },
    {
        "id": "2",
        "name": "Aspirin",
        "description": "Salicylate drug used for pain relief and blood thinning",
    },
    {"id": "3", "name": "Warfarin", "description": "Blood thinner medication"},
    {"id": "4", "name": "Metformin", "description": "Diabetes medication"},
    {
        "id": "5",
        "name": "Lisinopril",
        "description": "ACE inhibitor for blood pressure",
    },
    {"id": "6", "name": "Amoxicillin", "description": "Antibiotic medication"},
    {
        "id": "7",
        "name": "Omeprazole",
        "description": "Proton pump inhibitor for acid reflux",
    },
    {"id": "8", "name": "Sertraline", "description": "Antidepressant medication"},
    {
        "id": "9",
        "name": "Atorvastatin",
        "description": "Cholesterol-lowering medication",
    },
    {
        "id": "10",
        "name": "Metoprolol",
        "description": "Beta blocker for heart conditions",
    },
]

medication_interactions = [
    {
        "medication1": "1",
        "medication2": "3",
        "severity": "high",
        "description": "Taking ibuprofen while on blood thinners may increase bleeding risk.",
    },
    {
        "medication1": "2",
        "medication2": "3",
        "severity": "high",
        "description": "Combining aspirin with warfarin significantly increases bleeding risk.",
    },
    {
        "medication1": "4",
        "medication2": "7",
        "severity": "moderate",
        "description": "Omeprazole may affect the absorption of metformin.",
    },
    {
        "medication1": "5",
        "medication2": "8",
        "severity": "moderate",
        "description": "Lisinopril may interact with sertraline to increase dizziness risk.",
    },
    {
        "medication1": "6",
        "medication2": "9",
        "severity": "low",
        "description": "Amoxicillin may slightly reduce the effectiveness of atorvastatin.",
    },
    {
        "medication1": "7",
        "medication2": "8",
        "severity": "moderate",
        "description": "Omeprazole may increase sertraline levels in the blood.",
    },
    {
        "medication1": "9",
        "medication2": "10",
        "severity": "moderate",
        "description": "Atorvastatin may increase the effects of metoprolol.",
    },
]


@medications_bp.route("/api/medications", methods=["GET"])
def get_medications():
    return jsonify(medications)


@medications_bp.route("/api/check-interactions", methods=["POST"])
def check_interactions():
    data = request.get_json()
    selected_medication_ids = data.get("medications", [])

    # Find interactions between selected medications
    interactions = []
    for interaction in medication_interactions:
        if (
            interaction["medication1"] in selected_medication_ids
            and interaction["medication2"] in selected_medication_ids
        ):
            interactions.append(interaction)

    return jsonify(interactions)
