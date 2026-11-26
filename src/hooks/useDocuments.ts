
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
  const [initialized, setInitialized] = useState(false);

  const requestRef =
    useRef<AbortController | null>(null);

  const timerRef =
    useRef<number | null>(null);

  const mountedRef = useRef(false);

  const loadDocuments = useCallback(
    async function refreshDocuments(
      silent = false
    ): Promise<void> {

      if (!mountedRef.current) return;

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      requestRef.current?.abort();

      const controller = new AbortController();

      requestRef.current = controller;

      if (!silent) {
        setLoading(true);
      }

      let shouldPoll = false;

      try {
        const response =
          await documentService.getAllDocuments(
            controller.signal
          );

        if (
          controller.signal.aborted ||
          !mountedRef.current
        ) {
          return;
        }

        setDocuments(response);
        setInitialized(true);
        setError("");

        shouldPoll = response.some(
          isDocumentProcessing
        );

      } catch (err) {

        if (
          controller.signal.aborted ||
          !mountedRef.current
        ) {
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

        shouldPoll = true;

      } finally {

        if (
          !controller.signal.aborted &&
          mountedRef.current
        ) {

          setLoading(false);

          if (shouldPoll) {

            timerRef.current =
              window.setTimeout(() => {
                void refreshDocuments(true);
              }, 3000);
          }
        }
      }
    },
    []
  );

  useEffect(() => {

    mountedRef.current = true;

    void loadDocuments();

    return () => {

      mountedRef.current = false;

      requestRef.current?.abort();

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };

  }, [loadDocuments]);

  const readyCount = documents.filter(
    (doc) => doc.processingStatus === "READY"
  ).length;

  const processingCount = documents.filter(
    isDocumentProcessing
  ).length;

  const failedCount = documents.filter(
    (doc) => doc.processingStatus === "FAILED"
  ).length;

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
