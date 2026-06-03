// lib/axios.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// 1. Structured Chat Message Entry Type
export interface ChatMessage {
  role: 'user' | 'agent';
  text: string;
}

// 2. Exact Payload Structure expected by FastAPI Pydantic validation schema
interface AskRequestPayload {
  url: string | string[];
  question: string;
  session_id: string;
  history: ChatMessage[];
}

interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  answer?: string; // Explicitly map answer parameter returned by server
  data?: T;
  error?: string;
}

// Initialize Global Instance
const API: AxiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Executes a structured multi-turn query across video vector embeddings
 */
export const askQuestion = async (
  urls: string | string[],
  question: string,
  sessionId: string,
  history: ChatMessage[]
): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await API.post('/ask', {
      url: urls,
      question: question,
      session_id: sessionId,
      history: history, // Passes native structured array data down the pipe
    } as AskRequestPayload);
    
    return response.data;
  } catch (err: unknown) {
    const errorMessage = axios.isAxiosError(err)
      ? err.response?.data || err.message
      : err instanceof Error
      ? err.message
      : String(err);
    console.error("/ask call transaction aborted:", errorMessage);
    throw err;
  }
};

/**
 * Triggers video processing and indexing manually if needed
 */
export const generateTranscript = async (
  videoUrl: string
): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await API.post('/transcript', {
      video_url: videoUrl
    });
    return response.data;
  } catch (err: unknown) {
    const errorMessage = axios.isAxiosError(err)
      ? err.response?.data || err.message
      : err instanceof Error
      ? err.message
      : String(err);
    console.error("/transcript failed:", errorMessage);
    throw err;
  }
};