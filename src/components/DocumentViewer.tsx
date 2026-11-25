
import { useState } from "react";

import { documentService } from "../services/documentService";
import StructuredDocumentViewer from "./StructuredDocumentViewer";

import type {
  Document,
  ParsedDocument,
  ChunkingResponse,
} from "../types/document";

interface Props {
  document: Document;
}

export default function DocumentViewer({
  document,
}: Props) {

  const [parsed, setParsed] =
    useState<ParsedDocument | null>(null);

  const [chunkResult, setChunkResult] =
    useState<ChunkingResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const extractText = async () => {
    try {
      setLoading(true);
      setError("");
      setParsed(null);
      setChunkResult(null);

      const result =
        await documentService.parseDocument(document.id);

      setParsed(result);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Text extraction failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const generateChunks = async () => {
    try {
      setLoading(true);
      setError("");
      setParsed(null);
      setChunkResult(null);

      const result =
        await documentService.getDocumentChunks(
          document.id
        );

      setChunkResult(result);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Chunk generation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel" key={document.id}>
      <h2>Document Viewer</h2>

      <p>
        <strong>Selected:</strong> {document.fileName}
      </p>

      <div className="actions">
        <button
          onClick={extractText}
          disabled={loading}
        >
          Extract Text
        </button>

        <button
          onClick={generateChunks}
          disabled={
            loading ||
            document.contentType !== "application/pdf"
          }
        >
          Generate Chunks
        </button>
      </div>

      {document.contentType !== "application/pdf" && (
        <p>
          Chunking is currently available only for PDFs.
          Universal chunking will be added next.
        </p>
      )}

      {loading && <p>Processing document...</p>}

      {error && <p className="error">{error}</p>}

      {parsed && (
        <div className="result">
          <h3>Extracted Text</h3>

          <p>
            Characters: {parsed.characterCount}
          </p>

          {parsed.extractedText.trim() ? (
            <pre>{parsed.extractedText}</pre>
          ) : (
            <p>
              No text was extracted. This document may
              require OCR or a specialized parser.
            </p>
          )}
        </div>
      )}

      {chunkResult && (
        <div className="result">
          <h3>
            Generated Chunks: {chunkResult.totalChunks}
          </h3>

          <p>Total pages: {chunkResult.totalPages}</p>

          {chunkResult.chunks.length === 0 && (
            <p>
              No chunks generated. The document may
              require OCR or another chunking strategy.
            </p>
          )}

          {chunkResult.chunks.map((chunk) => (
            <article
              key={chunk.chunkIndex}
              className="chunk"
            >
              <h4>
                Chunk {chunk.chunkIndex + 1}
              </h4>

              <p>
                Section: {chunk.sectionTitle}
              </p>

              <p>
                Pages: {chunk.startPage} -
                {chunk.endPage}
              </p>

              <pre>{chunk.content}</pre>
            </article>
          ))}
        </div>
      )}
<div className="structured-section">
  <StructuredDocumentViewer
    key={document.id}
    documentId={document.id}
  />
</div>
    </section>
  );
}
