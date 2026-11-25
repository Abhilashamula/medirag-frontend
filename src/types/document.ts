

export interface Document {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;

  processingStatus: DocumentProcessingStatus;
  processingError: string | null;
  processedAt: string | null;
}



export interface UploadDocumentResponse {
  id: number;
  fileName: string;
  fileSize: number;
  processingStatus: DocumentProcessingStatus;
  message: string;
}


export interface ParsedDocument {
  documentId: number;
  fileName: string;
  contentType: string;
  extractedText: string;
  characterCount: number;
}

export interface DocumentChunk {
  documentId: number;
  chunkIndex: number;
  sectionTitle: string;
  sectionPath: string;
  headingLevel: number;
  startPage: number;
  endPage: number;
  content: string;
}

export interface ChunkingResponse {
  documentId: number;
  totalPages: number;
  totalChunks: number;
  chunks: DocumentChunk[];
}
export interface ContentBlock {
  blockIndex: number;
  type: string;
  pageNumber: number | null;
  location: string;
  content: string;
  rows: string[][];
  extractionMethod: string;
}

export interface StructuredDocumentResponse {
  documentId: number;
  fileName: string;
  contentType: string;
  totalBlocks: number;
  blocks: ContentBlock[];
  warnings: string[];
}

export type DocumentProcessingStatus =
  | "QUEUED"
  | "INDEXING"
  | "EMBEDDING"
  | "READY"
  | "FAILED";
