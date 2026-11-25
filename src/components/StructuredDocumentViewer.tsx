
import { useState } from "react";

import { documentService } from "../services/documentService";

import type {
  StructuredDocumentResponse,
} from "../types/document";

interface Props {
  documentId: number;
}

export default function StructuredDocumentViewer({
  documentId,
}: Props) {

  const [result, setResult] =
    useState<StructuredDocumentResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExtract = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response =
        await documentService.getStructuredDocument(
          documentId
        );

      setResult(response);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Structured extraction failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">

      <h3>Structured Document Extraction</h3>

      <button
        onClick={handleExtract}
        disabled={loading}
      >
        {loading
          ? "Extracting..."
          : "Extract Structured Content"}
      </button>

      {error && (
        <p className="error">{error}</p>
      )}

      {result && (
        <div className="result">

          <h4>
            Extracted Blocks: {result.totalBlocks}
          </h4>

          {result.warnings.length > 0 && (
            <div>
              <strong>Extraction warnings</strong>
              <ul>
                {result.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {result.blocks.map((block) => (
            <article
              key={block.blockIndex}
              className="chunk"
            >
              <h4>
                Block {block.blockIndex + 1}
                {" — "}
                {block.type}
              </h4>

              <p>
                <strong>Location:</strong>{" "}
                {block.location}
              </p>

              <p>
                <strong>Method:</strong>{" "}
                {block.extractionMethod}
              </p>

              {block.type === "TABLE" &&
               block.rows.length > 0 ? (
                <div className="table-wrapper">
                  <table>
                    <tbody>
                      {block.rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <pre>{block.content}</pre>
              )}
            </article>
          ))}

        </div>
      )}
    </section>
  );
}
