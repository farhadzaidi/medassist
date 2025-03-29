export interface Symptom {
  id: string;
  name: string;
  description: string;
}

export interface Condition {
  id: string;
  name: string;
  description: string;
  symptoms: string[];
  treatments: string[];
}

export interface Medication {
  id: string;
  name: string;
  description: string;
}

export interface Interaction {
  medication1: string;
  medication2: string;
  severity: 'low' | 'moderate' | 'high';
  description: string;
}

export const symptoms: Symptom[] = [
  { id: '1', name: 'Fever', description: 'Elevated body temperature above normal' },
  { id: '2', name: 'Headache', description: 'Pain in any region of the head' },
  { id: '3', name: 'Cough', description: 'Sudden expulsion of air from the lungs' },
  { id: '4', name: 'Fatigue', description: 'Extreme tiredness or exhaustion' },
  { id: '5', name: 'Nausea', description: 'Feeling of sickness with an inclination to vomit' },
  { id: '6', name: 'Chest Pain', description: 'Pain in the chest area' },
  { id: '7', name: 'Shortness of Breath', description: 'Difficulty breathing' },
  { id: '8', name: 'Joint Pain', description: 'Pain in any joint of the body' },
  { id: '9', name: 'Sore Throat', description: 'Pain or irritation in the throat' },
  { id: '10', name: 'Rash', description: 'Redness or irritation of the skin' },
];

export const conditions: Condition[] = [
  {
    id: '1',
    name: 'Common Cold',
    description: 'Viral infection of the nose and throat',
    symptoms: ['1', '2', '3', '9'],
  },
  {
    id: '2',
    name: 'Influenza',
    description: 'Viral infection affecting the respiratory system',
    symptoms: ['1', '2', '3', '4', '5', '8'],
  },
  {
    id: '3',
    name: 'COVID-19',
    description: 'Coronavirus disease',
    symptoms: ['1', '3', '7', '2', '4'],
  },
  {
    id: '4',
    name: 'Pneumonia',
    description: 'Infection that inflames the air sacs in lungs',
    symptoms: ['1', '3', '7', '6', '4'],
  },
  {
    id: '5',
    name: 'Allergic Reaction',
    description: 'Immune system response to allergens',
    symptoms: ['10', '7', '9'],
  },
];

export const medications: Medication[] = [
  { id: '1', name: 'Ibuprofen', description: 'Nonsteroidal anti-inflammatory drug (NSAID)' },
  { id: '2', name: 'Aspirin', description: 'Salicylate drug used for pain relief and blood thinning' },
  { id: '3', name: 'Warfarin', description: 'Blood thinner medication' },
  { id: '4', name: 'Metformin', description: 'Diabetes medication' },
  { id: '5', name: 'Lisinopril', description: 'ACE inhibitor for blood pressure' },
  { id: '6', name: 'Amoxicillin', description: 'Antibiotic medication' },
  { id: '7', name: 'Omeprazole', description: 'Proton pump inhibitor for acid reflux' },
  { id: '8', name: 'Sertraline', description: 'Antidepressant medication' },
  { id: '9', name: 'Atorvastatin', description: 'Cholesterol-lowering medication' },
  { id: '10', name: 'Metoprolol', description: 'Beta blocker for heart conditions' },
]; 