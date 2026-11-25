
import type { Document } from "../types/document";

interface Props {
  documents: Document[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (document: Document) => void;
  onDelete: (document: Document) => void;
  onDownload: (document: Document) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentList({
  documents,
  loading,
  selectedId,
  onSelect,
  onDelete,
  onDownload,
}: Props) {

  return (
    <section className="panel">
      <h2>Document Library</h2>

      {loading ? (
        <p>Loading documents...</p>
      ) : documents.length === 0 ? (
        <p>No documents uploaded yet.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>File Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {documents.map((document) => (
                <tr
                  key={document.id}
                  className={
                    selectedId === document.id
                      ? "selected-row"
                      : ""
                  }
                >
                  <td>{document.id}</td>

                  <td>{document.fileName}</td>

                  <td>{document.contentType}</td>

                  <td>
                    {formatFileSize(document.fileSize)}
                  </td>

                  <td>
                    {document.uploadedAt
                      ? new Date(
                          document.uploadedAt
                        ).toLocaleString()
                      : "-"}
                  </td>

                  <td>
                    <div className="actions">
                      <button
                        onClick={() => onSelect(document)}
                      >
                        View
                      </button>

                      <button
                        onClick={() => onDownload(document)}
                      >
                        Download
                      </button>

                      <button
                        className="danger"
                        onClick={() => onDelete(document)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
