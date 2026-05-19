export interface ScanResult {
  id?: string;
  userId: string;
  imageUrl: string;
  diseaseName: string;
  confidence: number;
  symptoms: string[];
  causes: string[];
  precautions: string[];
  treatment: string;
  aiExplanation: string;
  createdAt: string;
}

export interface ChatMessage {
  id?: string;
  userId: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}
