import { Symptom, Condition, Medication, Interaction } from '../data/mockData';

const API_BASE_URL = 'http://localhost:5001/api';

export interface ChatMessage {
  id: number;
  message: string;
  is_user: boolean;
  timestamp: string;
}

export interface ChatResponse {
  message: string;
  timestamp: string;
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

  // Chat methods
  chat: async (message: string): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    return response.json();
  },

  // Chat history methods
  getChatHistory: async (): Promise<ChatMessage[]> => {
    const response = await fetch(`${API_BASE_URL}/chat/history`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch chat history');
    }
    return response.json();
  },

  deleteChatHistory: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/chat/history`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to delete chat history');
    }
  },

  saveChatMessage: async (message: string, isUser: boolean): Promise<ChatMessage> => {
    const response = await fetch(`${API_BASE_URL}/chat/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        message,
        is_user: isUser,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to save chat message');
    }
    return response.json();
  },
}; 