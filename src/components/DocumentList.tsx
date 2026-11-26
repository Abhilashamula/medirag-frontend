
import type { Document } from "../types/document";

import DocumentProcessingBadge from "./DocumentProcessingBadge";

import {
  isDocumentProcessing,
} from "../hooks/useDocuments";

interface Props {
  documents: Document[];
  loading: boolean;
  selectedId: number | null;

  onSelect: (document: Document) => void;
  onDelete: (document: Document) => void;
  onDownload: (document: Document) => void;
  onRetry: (document: Document) => void;

  busyIds: number[];
}

function formatFileSize(bytes: number): string {

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(
    bytes / (1024 * 1024)
  ).toFixed(1)} MB`;
}

function formatFileType(document: Document): string {

  const extension =
    document.fileName.split(".").pop();

  return extension
    ? extension.toUpperCase()
    : document.contentType;
}

export default function DocumentList({
  documents,
  loading,
  selectedId,
  onSelect,
  onDelete,
  onDownload,
  onRetry,
  busyIds,
}: Props) {

  return (
    <section className="panel">

      <div className="document-list-heading">
        <h2>Document Library</h2>

        <span className="document-list-count">
          {documents.length} documents
        </span>
      </div>

      {loading && documents.length === 0 ? (

        <p>Loading documents...</p>

      ) : documents.length === 0 ? (

        <div className="document-empty-state">
          <div className="document-empty-icon">
            ▤
          </div>

          <h3>No documents found</h3>

          <p>
            Upload a document or change your
            search filters.
          </p>
        </div>

      ) : (

        <div className="table-wrapper">

          <table className="document-library-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>File Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Status</th>
                <th>Uploaded At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {documents.map((document) => {

                const processing =
                  isDocumentProcessing(document);

                const busy =
                  busyIds.includes(document.id);

                const failed =
                  document.processingStatus === "FAILED";

                const queued =
                  document.processingStatus === "QUEUED";

                return (

                  <tr
                    key={document.id}
                    className={
                      selectedId === document.id
                        ? "selected-row"
                        : ""
                    }
                  >

                    <td>#{document.id}</td>

                    <td>
                      <div className="document-file-cell">

                        <span className="document-file-icon">
                          ▤
                        </span>

                        <div className="document-file-details">

                          <strong>
                            {document.fileName}
                          </strong>

                          {document.processedAt &&
                            document.processingStatus === "READY" && (

                            <small>
                              Processed:{" "}
                              {new Date(
                                document.processedAt
                              ).toLocaleString()}
                            </small>

                          )}

                        </div>

                      </div>
                    </td>

                    <td>
                      <span className="document-type-label">
                        {formatFileType(document)}
                      </span>
                    </td>

                    <td>
                      {formatFileSize(document.fileSize)}
                    </td>

                    <td>

                      <DocumentProcessingBadge
                        status={document.processingStatus}
                      />

                      {failed &&
                        document.processingError && (

                        <div
                          className="document-processing-error"
                        >
                          {document.processingError}
                        </div>

                      )}

                    </td>

                    <td>
                      {document.uploadedAt
                        ? new Date(
                            document.uploadedAt
                          ).toLocaleString()
                        : "-"}
                    </td>

                    <td>

                      <div className="document-row-actions">

                        <button
                          type="button"
                          onClick={() => onSelect(document)}
                          disabled={busy}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => onDownload(document)}
                          disabled={busy}
                        >
                          Download
                        </button>

                        {(failed || queued) && (

                          <button
                            type="button"
                            className="document-retry-button"
                            disabled={busy}
                            onClick={() => onRetry(document)}
                            title="Submit document for processing"
                          >
                            {busy ? "Please wait..." : "Retry"}
                          </button>

                        )}

                        <button
                          type="button"
                          className="danger"
                          disabled={processing || busy}
                          title={
                            processing
                              ? "Cannot delete while processing"
                              : "Delete document"
                          }
                          onClick={() => onDelete(document)}
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      )}

    </section>
  );
}
