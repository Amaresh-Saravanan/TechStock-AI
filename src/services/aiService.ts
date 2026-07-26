import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  tokens_used?: number;
}

export interface ChatStatusResponse {
  available: boolean;
  model: string;
  message: string;
}

export interface PCComponent {
  name: string;
  price: number;
  brand: string;
  category: string;
}

export interface PCBuild {
  name: string;
  total_price: number;
  components: PCComponent[];
  notes: string;
}

export interface BuildGeneratorResponse {
  builds: PCBuild[];
  budget: number;
  use_case: string;
}

export const aiService = {
  async chat(messages: ChatMessage[], context?: string): Promise<ChatResponse> {
    const res = await api.post<ChatResponse>('/api/chat/', { messages, context });
    return res.data;
  },

  async generateBuild(budget: number, use_case: string, preferences?: string): Promise<BuildGeneratorResponse> {
    const res = await api.post<BuildGeneratorResponse>('/api/generate-build/', {
      budget,
      use_case,
      preferences,
    });
    return res.data;
  },

  async getChatStatus(): Promise<ChatStatusResponse> {
    const res = await api.get<ChatStatusResponse>('/api/chat/status/');
    return res.data;
  },
};
