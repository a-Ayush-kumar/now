import axios, { AxiosInstance, AxiosResponse } from 'axios';

// 1. Define Request/Response Type Interfaces
interface AskRequest {
  url: string | string[]; // Handles single URL or up to 3 URLs
  question: string;
}

interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
}

// 2. Initialize Typed Axios Instance
const API: AxiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * 3. Query Multi-Video Context
 * Accepts a single URL string OR an array of up to 3 URLs
 */
export const askQuestion = async (
  urls: string | string[], 
  question: string
): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await API.post('/ask', {
      url: urls,
      question
    } as AskRequest);
    return response.data;
  } catch (err: unknown) {
    const errorMessage = axios.isAxiosError(err)
      ? err.response?.data || err.message
      : err instanceof Error
      ? err.message
      : String(err);
    console.error("/ask failed:", errorMessage);
    throw err;
  }
};

/**
 * 4. Trigger Video Ingestion Pipeline
 * Processes the media, extracts audio, and indexes vector store
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
    console.error("❌ /transcript failed:", errorMessage);
    throw err;
  }
};