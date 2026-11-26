
import { useRef, useState } from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import axios from "axios";

import { documentService } from "../services/documentService";

interface Props {
  onUploadSuccess: () => void | Promise<void>;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ACCEPTED_FORMATS =
  ".pdf,.docx,.xlsx,.pptx,.txt,.csv," +
  ".json,.html,.htm,.xml,.png,.jpg," +
  ".jpeg,.tif,.tiff";

export default function DocumentUpload({
  onUploadSuccess,
}: Props) {

  const [file, setFile] =
    useState<File | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const inputRef =
    useRef<HTMLInputElement>(null);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {

    const selectedFile =
      event.target.files?.[0] ?? null;

    setMessage("");
    setError("");

    if (
      selectedFile &&
      selectedFile.size > MAX_FILE_SIZE
    ) {

      setFile(null);

      setError(
        "Maximum supported file size is 50 MB."
      );

      event.target.value = "";

      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    if (uploading) return;

    if (!file) {
      setError("Please select a file.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {

      const response =
        await documentService.uploadDocument(file);

      setMessage(
        `${response.fileName} uploaded successfully. ` +
        `Document ID: ${response.id}. ` +
        "Automatic indexing and embedding " +
        "processing has been submitted."
      );

      setFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

    } catch (err) {

      if (axios.isAxiosError(err)) {

        const backendError =
          err.response?.data?.error ??
          err.response?.data?.message;

        setError(
          typeof backendError === "string"
            ? backendError
            : err.message
        );

      } else {

        setError(
          err instanceof Error
            ? err.message
            : "Upload failed."
        );
      }

      setUploading(false);
      return;
    }

    try {

      await onUploadSuccess();

    } catch {

      setError(
        "Document uploaded, but the library " +
        "could not be refreshed."
      );

    } finally {

      setUploading(false);
    }
  };

  return (

    <section className="panel document-upload-panel">

      <div className="document-upload-heading">

        <div className="document-upload-icon">
          ↑
        </div>

        <div>
          <h2>Upload Document</h2>

          <p>
            Add documents to your AI knowledge base.
          </p>
        </div>

      </div>

      <form onSubmit={handleUpload}>

        <input
          ref={inputRef}
          id="document-file-input"
          type="file"
          accept={ACCEPTED_FORMATS}
          onChange={handleFileChange}
          disabled={uploading}
          aria-label="Select document to upload"
        />

        <button
          type="submit"
          disabled={uploading || !file}
        >

          {uploading && (
            <span
              className="processing-spinner"
              aria-hidden="true"
            />
          )}

          {uploading
            ? "Uploading..."
            : "Upload Document"}

        </button>

      </form>

      <div className="document-upload-hint">

        Supported formats: PDF, Word, Excel,
        PowerPoint, text, CSV, JSON, XML,
        HTML and images.

        <br />

        Maximum file size: 50 MB.

      </div>

      {file && (

        <div className="document-selected-file">

          <strong>{file.name}</strong>

          <span>
            {(file.size / 1024).toFixed(1)} KB
          </span>

        </div>

      )}

      <div className="document-ingestion-info">

        <strong>Automatic AI processing</strong>

        <div className="document-ingestion-steps">

          <span>Upload</span>
          <span aria-hidden="true">→</span>

          <span>Indexing</span>
          <span aria-hidden="true">→</span>

          <span>Embedding</span>
          <span aria-hidden="true">→</span>

          <span>Ready for AI</span>

        </div>

        <small>
          No manual indexing or embedding is required.
        </small>

      </div>

      {message && (
        <p className="success" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

    </section>

  );
}
