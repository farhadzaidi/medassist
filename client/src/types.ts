export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface Medication {
  id: string;
  name: string;
  description: string;
}

export interface Interaction {
  medication1: string;
  medication2: string;
  severity: string;
  description: string;
}
