
import {
  useMemo,
  useState,
} from "react";

import axios from "axios";

import DocumentUpload from "../components/DocumentUpload";
import DocumentList from "../components/DocumentList";
import DocumentViewer from "../components/DocumentViewer";
import DocumentProcessingBadge from "../components/DocumentProcessingBadge";

import { documentService } from "../services/documentService";

import {
  useDocuments,
  isDocumentProcessing,
} from "../hooks/useDocuments";

import type {
  Document,
  DocumentProcessingStatus,
} from "../types/document";

type StatusFilter =
  | "ALL"
  | DocumentProcessingStatus;

function getErrorMessage(
  error: unknown,
  fallback: string
): string {

  if (axios.isAxiosError(error)) {

    const message =
      error.response?.data?.message ??
      error.response?.data?.error;

    return typeof message === "string"
      ? message
      : error.message;
  }

  return error instanceof Error
    ? error.message
    : fallback;
}

export default function DocumentsPage() {

  const {
    documents,
    loading,
    error,
    initialized,
    loadDocuments,
    totalCount,
    readyCount,
    processingCount,
    failedCount,
  } = useDocuments();

  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const [actionError, setActionError] =
    useState("");

  const [actionMessage, setActionMessage] =
    useState("");

  const [busyIds, setBusyIds] =
    useState<number[]>([]);

  const selectedDocument =
    documents.find(
      (doc) => doc.id === selectedId
    ) ??
    documents[0] ??
    null;

  const filteredDocuments = useMemo(() => {

    const searchValue =
      search.trim().toLowerCase();

    return documents.filter((document) => {

      const matchesSearch =
        document.fileName
          .toLowerCase()
          .includes(searchValue) ||

        document.contentType
          .toLowerCase()
          .includes(searchValue) ||

        String(document.id)
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        document.processingStatus === statusFilter;

      return matchesSearch && matchesStatus;

    });

  }, [documents, search, statusFilter]);

  const startAction = (id: number) => {

    setActionError("");
    setActionMessage("");

    setBusyIds((previous) => [
      ...previous,
      id,
    ]);
  };

  const finishAction = (id: number) => {

    setBusyIds((previous) =>
      previous.filter(
        (item) => item !== id
      )
    );
  };

  const handleDelete = async (
    document: Document
  ) => {

    if (
      isDocumentProcessing(document) ||
      busyIds.includes(document.id)
    ) {
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ` +
        `${document.fileName}?`
      )
    ) {
      return;
    }

    startAction(document.id);

    try {

      await documentService.deleteDocument(
        document.id
      );

      if (selectedId === document.id) {
        setSelectedId(null);
      }

      setActionMessage(
        "Document deleted successfully."
      );

      await loadDocuments(true);

    } catch (err) {

      setActionError(
        getErrorMessage(err, "Delete failed.")
      );

    } finally {

      finishAction(document.id);
    }
  };

  const handleDownload = async (
    document: Document
  ) => {

    if (busyIds.includes(document.id)) {
      return;
    }

    startAction(document.id);

    try {

      await documentService.downloadDocument(
        document.id,
        document.fileName
      );

    } catch (err) {

      setActionError(
        getErrorMessage(err, "Download failed.")
      );

    } finally {

      finishAction(document.id);
    }
  };

  const handleRetry = async (
    document: Document
  ) => {

    if (
      busyIds.includes(document.id) ||
      (
        document.processingStatus !== "FAILED" &&
        document.processingStatus !== "QUEUED"
      )
    ) {
      return;
    }

    startAction(document.id);

    try {

      await documentService.retryDocument(
        document.id
      );

      setActionMessage(
        `Processing submitted for ${document.fileName}.`
      );

      await loadDocuments(true);

    } catch (err) {

      setActionError(
        getErrorMessage(err, "Retry failed.")
      );

    } finally {

      finishAction(document.id);
    }
  };

  const stats = [
    {
      label: "Total Documents",
      value: totalCount,
      type: "total",
      icon: "▤",
      description: "Uploaded knowledge base",
    },
    {
      label: "Ready for AI",
      value: readyCount,
      type: "ready",
      icon: "✓",
      description: "Available for retrieval",
    },
    {
      label: "Processing",
      value: processingCount,
      type: "processing",
      icon: "↻",
      description: "Queued, indexing or embedding",
    },
    {
      label: "Failed",
      value: failedCount,
      type: "failed",
      icon: "!",
      description: "Requires attention",
    },
  ];

  return (

    <div className="container">

      <header className="page-header document-page-header">

        <div>

          <span className="document-page-eyebrow">
            KNOWLEDGE BASE
          </span>

          <h1>Document Management</h1>

          <p>
            Upload, organize and process documents
            for your MediRAG AI assistant.
          </p>

        </div>

        <button
          type="button"
          className="secondary"
          disabled={loading}
          onClick={() => void loadDocuments()}
        >
          ↻ Refresh
        </button>

      </header>

      <div className="document-stats">

        {stats.map((stat) => (

          <div
            className="document-stat-card"
            key={stat.type}
          >

            <div className="document-stat-top">

              <span className="document-stat-label">
                {stat.label}
              </span>

              <span
                className={
                  `document-stat-icon ` +
                  `document-stat-${stat.type}`
                }
              >
                {stat.icon}
              </span>

            </div>

            <strong
              className={
                `document-stat-value ` +
                `document-stat-${stat.type}`
              }
            >
              {initialized ? stat.value : "—"}
            </strong>

            <small className="document-stat-description">
              {stat.description}
            </small>

          </div>

        ))}

      </div>

      <DocumentUpload
        onUploadSuccess={() =>
          loadDocuments(true)
        }
      />

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {actionError && (
        <p className="error" role="alert">
          {actionError}
        </p>
      )}

      {actionMessage && (
        <p className="success" role="status">
          {actionMessage}
        </p>
      )}

      <section className="panel document-filter-panel">

        <div className="document-toolbar">

          <input
            type="search"
            placeholder="Search documents..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            aria-label="Search documents"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as StatusFilter
              )
            }
            aria-label="Filter processing status"
          >

            <option value="ALL">
              All Statuses
            </option>

            <option value="READY">
              Ready
            </option>

            <option value="QUEUED">
              Queued
            </option>

            <option value="INDEXING">
              Indexing
            </option>

            <option value="EMBEDDING">
              Embedding
            </option>

            <option value="FAILED">
              Failed
            </option>

          </select>

          <button
            type="button"
            className="secondary"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
            }}
          >
            Clear Filters
          </button>

        </div>

        <div className="document-filter-footer">

          <small>
            Showing {filteredDocuments.length}
            {" "}of {totalCount} documents
          </small>

          {processingCount > 0 && !error && (

            <span className="document-live-indicator">

              <span className="document-live-dot" />

              Auto-refresh enabled

            </span>

          )}

        </div>

      </section>

      <DocumentList
        documents={filteredDocuments}
        loading={loading}
        selectedId={selectedDocument?.id ?? null}
        onSelect={(document) =>
          setSelectedId(document.id)
        }
        onDelete={handleDelete}
        onDownload={handleDownload}
        onRetry={handleRetry}
        busyIds={busyIds}
      />

      {selectedDocument && (

        <>

          <div className="document-viewer-status">

            <div>

              <small>SELECTED DOCUMENT</small>

              <strong>
                {selectedDocument.fileName}
              </strong>

            </div>

            <DocumentProcessingBadge
              status={
                selectedDocument.processingStatus
              }
            />

          </div>

          <DocumentViewer
            key={selectedDocument.id}
            document={selectedDocument}
          />

        </>

      )}

    </div>
  );
}
