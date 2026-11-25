
import { useCallback, useEffect, useState } from "react";

import DocumentUpload from "../components/DocumentUpload";
import DocumentList from "../components/DocumentList";
import DocumentViewer from "../components/DocumentViewer";

import { documentService } from "../services/documentService";

import type { Document } from "../types/document";

export default function DocumentsPage() {

  const [documents, setDocuments] =
    useState<Document[]>([]);

  const [selectedDocument, setSelectedDocument] =
    useState<Document | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

     const response = await documentService.getAllDocuments();

setDocuments(response);
setSelectedDocument((previous) =>
  response.find((doc) => doc.id === previous?.id)
  ?? response[0]
  ?? null
);

    } catch (err) {
      console.error("Failed to load documents:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load documents"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const handleDelete = async (document: Document) => {
    if (!window.confirm(
      `Are you sure you want to delete ${document.fileName}?`
    )) {
      return;
    }

    try {
      await documentService.deleteDocument(document.id);

      if (selectedDocument?.id === document.id) {
        setSelectedDocument(null);
      }

      await loadDocuments();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Delete failed"
      );
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      await documentService.downloadDocument(
        document.id,
        document.fileName
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Download failed"
      );
    }
  };

  return (
    <main className="container">

      <h1>MediRAG Document Management</h1>

      <DocumentUpload
        onUploadSuccess={loadDocuments}
      />

      {error && (
        <p className="error">{error}</p>
      )}

      <DocumentList
        documents={documents}
        loading={loading}
        selectedId={selectedDocument?.id ?? null}
        onSelect={setSelectedDocument}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />

      {selectedDocument && (
        <DocumentViewer
          key={selectedDocument.id}
          document={selectedDocument}
        />
      )}

    </main>
  );
}
