export interface Medication {
  id: string;
  name: string;
  description: string;
}

export interface Interaction {
  medication1: string;
  medication2: string;
  severity: "high" | "moderate" | "low";
  description: string;
}
