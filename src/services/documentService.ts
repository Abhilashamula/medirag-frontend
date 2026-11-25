
import apiClient from "../api/apiClient";

import type {
  Document,
  UploadDocumentResponse,
  ParsedDocument,
  ChunkingResponse,
  StructuredDocumentResponse,
} from "../types/document";

export const documentService = {

  // Get all uploaded documents
  getAllDocuments: async (
    signal?: AbortSignal
  ): Promise<Document[]> => {
    const response = await apiClient.get<Document[]>(
      "/documents",
      { signal }
    );

    return response.data;
  },

  // Get document metadata
  getDocumentById: async (
    id: number
  ): Promise<Document> => {
    const response = await apiClient.get<Document>(
      `/documents/${id}`
    );

    return response.data;
  },

  // Upload and trigger automatic ingestion
  uploadDocument: async (
    file: File
  ): Promise<UploadDocumentResponse> => {

    const formData = new FormData();

    formData.append("file", file);

    const response =
      await apiClient.post<UploadDocumentResponse>(
        "/documents/upload",
        formData
      );

    return response.data;
  },

  // Get current document processing status
  getDocumentStatus: async (
    id: number
  ): Promise<Document> => {

    const response = await apiClient.get<Document>(
      `/documents/${id}/status`
    );

    return response.data;
  },

  // Retry failed or queued document processing
  retryDocument: async (
    id: number
  ): Promise<{
    documentId: number;
    message: string;
  }> => {

    const response = await apiClient.post<{
      documentId: number;
      message: string;
    }>(`/documents/${id}/retry`);

    return response.data;
  },

  // Parse document
  parseDocument: async (
    id: number
  ): Promise<ParsedDocument> => {

    const response = await apiClient.get<ParsedDocument>(
      `/documents/${id}/parse`
    );

    return response.data;
  },

  // Get document chunks
  getDocumentChunks: async (
    id: number
  ): Promise<ChunkingResponse> => {

    const response = await apiClient.get<ChunkingResponse>(
      `/documents/${id}/chunks`
    );

    return response.data;
  },

  // Download original document
  downloadDocument: async (
    id: number,
    fileName: string
  ): Promise<void> => {

    const response = await apiClient.get<Blob>(
      `/documents/${id}/download`,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(
      response.data
    );

    const link = window.document.createElement("a");

    link.href = url;
    link.download = fileName;

    window.document.body.appendChild(link);

    link.click();
    link.remove();

    window.setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  },

  // Delete document
  deleteDocument: async (
    id: number
  ): Promise<void> => {

    await apiClient.delete(`/documents/${id}`);
  },

  // Get structured extraction results
  getStructuredDocument: async (
    id: number
  ): Promise<StructuredDocumentResponse> => {

    const response =
      await apiClient.get<StructuredDocumentResponse>(
        `/documents/${id}/structured`
      );

    return response.data;
  },

};
