import { Medication, Interaction } from "../types";

const API_BASE_URL = "http://localhost:5001/api";

export const api = {
  getMedications: async (): Promise<Medication[]> => {
    const response = await fetch(`${API_BASE_URL}/medications`);
    if (!response.ok) {
      throw new Error("Failed to fetch medications");
    }
    return response.json();
  },

  checkInteractions: async (medications: string[]): Promise<Interaction[]> => {
    const response = await fetch(`${API_BASE_URL}/check-interactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ medications }),
    });
    if (!response.ok) {
      throw new Error("Failed to check interactions");
    }
    return response.json();
  },

  saveReport: async (
    title: string,
    content: string,
    type: "soap" | "analysis"
  ): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/reports/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ title, content, type }),
    });
    if (!response.ok) {
      throw new Error("Failed to save report");
    }
  },
};
