
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { documentService } from "../services/documentService";

import type { Document } from "../types/document";

export function isDocumentProcessing(
  document: Document
): boolean {

  return (
    document.processingStatus === "QUEUED" ||
    document.processingStatus === "INDEXING" ||
    document.processingStatus === "EMBEDDING"
  );
}

export function useDocuments() {

  const [documents, setDocuments] =
    useState<Document[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [initialized, setInitialized] =
    useState(false);

  const requestRef =
    useRef<AbortController | null>(null);

  const loadDocuments = useCallback(
    async (silent = false) => {

      requestRef.current?.abort();

      const controller = new AbortController();

      requestRef.current = controller;

      if (!silent) {
        setLoading(true);
      }

      try {

        const response =
          await documentService.getAllDocuments(
            controller.signal
          );

        if (controller.signal.aborted) {
          return;
        }

        setDocuments(response);
        setInitialized(true);
        setError("");

      } catch (err) {

        if (controller.signal.aborted) {
          return;
        }

        console.error(
          "Failed to load documents:",
          err
        );

        setError(
          "Unable to refresh documents. " +
          "Please check the backend connection."
        );

      } finally {

        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {

    void loadDocuments();

    return () => {
      requestRef.current?.abort();
    };

  }, [loadDocuments]);

  const processingCount = documents.filter(
    isDocumentProcessing
  ).length;

  const readyCount = documents.filter(
    (document) =>
      document.processingStatus === "READY"
  ).length;

  const failedCount = documents.filter(
    (document) =>
      document.processingStatus === "FAILED"
  ).length;

  useEffect(() => {

    // Continue refreshing while processing
    // or recovering from a connection error.

    if (processingCount === 0 && !error) {
      return;
    }

    const interval = window.setInterval(() => {

      if (
        requestRef.current &&
        !requestRef.current.signal.aborted
      ) {
        // Requests are cancelled before refreshing.
        // See loadDocuments.
      }

      void loadDocuments(true);

    }, 3000);

    return () => {
      window.clearInterval(interval);
    };

  }, [processingCount, error, loadDocuments]);

  return {
    documents,
    loading,
    error,
    initialized,
    loadDocuments,
    totalCount: documents.length,
    readyCount,
    processingCount,
    failedCount,
  };
}
