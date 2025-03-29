import { Symptom, Condition, Medication, Interaction } from '../data/mockData';

const API_BASE_URL = 'http://localhost:5001/api';

interface ChatResponse {
  response: string;
  session_id: string;
}

export const api = {
  getSymptoms: async (): Promise<Symptom[]> => {
    const response = await fetch(`${API_BASE_URL}/symptoms`);
    if (!response.ok) {
      throw new Error('Failed to fetch symptoms');
    }
    return response.json();
  },

  checkConditions: async (symptoms: string[]): Promise<Condition[]> => {
    const response = await fetch(`${API_BASE_URL}/check-conditions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symptoms }),
    });
    if (!response.ok) {
      throw new Error('Failed to check conditions');
    }
    return response.json();
  },

  getMedications: async (): Promise<Medication[]> => {
    const response = await fetch(`${API_BASE_URL}/medications`);
    if (!response.ok) {
      throw new Error('Failed to fetch medications');
    }
    return response.json();
  },

  checkInteractions: async (medications: string[]): Promise<Interaction[]> => {
    const response = await fetch(`${API_BASE_URL}/check-interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ medications }),
    });
    if (!response.ok) {
      throw new Error('Failed to check interactions');
    }
    return response.json();
  },

  sendChatMessage: async (message: string, sessionId: string | null): Promise<ChatResponse> => {
    const response = await fetch('http://localhost:5001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, session_id: sessionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  },
}; 