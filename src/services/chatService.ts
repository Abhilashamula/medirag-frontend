
import axios from "axios";

const API_BASE_URL =
  (import.meta as ImportMeta & {
    readonly env: { readonly VITE_API_BASE_URL?: string };
  }).env.VITE_API_BASE_URL ||
  "http://localhost:8081";

export type ChatMode = "general" | "documents";

export interface ChatSource {
  documentId: number;
  fileName: string;
  chunkIndex: number;
  pageNumber: number | null;
  similarity: number | null;
}

export interface ChatResult {
  answer: string;
  sources: ChatSource[];
  grounded: boolean;
}

export async function sendChatMessage(
  question: string,
  mode: ChatMode
): Promise<ChatResult> {
  const endpoint =
    mode === "documents"
      ? "/api/chat/ask-documents"
      : "/api/chat/ask";

  const response = await axios.post(
    `${API_BASE_URL}${endpoint}`,
    { question },
    { timeout: 120000 }
  );

  return {
    answer: response.data.answer,
    sources: response.data.sources ?? [],
    grounded: response.data.grounded ?? false,
  };
}
