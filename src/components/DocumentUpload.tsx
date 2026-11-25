
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { documentService } from "../services/documentService";

interface Props {
  onUploadSuccess: () => void | Promise<void>;
}

export default function DocumentUpload({
  onUploadSuccess,
}: Props) {

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setFile(event.target.files?.[0] ?? null);
    setMessage("");
    setError("");
  };

  const handleUpload = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const response =
        await documentService.uploadDocument(file);

      setMessage(
        `Uploaded successfully! Document ID: ${response.id}`
      );

      setFile(null);

      const input = window.document.getElementById(
        "document-file-input"
      ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }

      await onUploadSuccess();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="panel">
      <h2>Upload Document</h2>

      <form onSubmit={handleUpload}>
        <input
          id="document-file-input"
          type="file"
          accept=".pdf,.docx,.xlsx,.pptx,.txt,.csv,.json,.html,.htm,.xml,.png,.jpg,.jpeg,.tif,.tiff"
          onChange={handleFileChange}
        />

        <button
          type="submit"
          disabled={uploading || !file}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {file && (
        <p>Selected file: {file.name}</p>
      )}

      {message && (
        <p className="success">{message}</p>
      )}

      {error && (
        <p className="error">{error}</p>
      )}
    </section>
  );
}
