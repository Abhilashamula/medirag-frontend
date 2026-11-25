
import type {
  DocumentProcessingStatus,
} from "../types/document";

type Props = {
  status?: DocumentProcessingStatus | null;
};

const statusConfig = {
  QUEUED: {
    label: "Queued",
    description: "Waiting for processing",
    className: "queued",
    icon: "◷",
  },

  INDEXING: {
    label: "Indexing",
    description: "Extracting content and creating chunks",
    className: "indexing",
    icon: "",
  },

  EMBEDDING: {
    label: "Embedding",
    description: "Generating vector embeddings",
    className: "embedding",
    icon: "",
  },

  READY: {
    label: "Ready",
    description: "Available for AI retrieval",
    className: "ready",
    icon: "✓",
  },

  FAILED: {
    label: "Failed",
    description: "Document processing failed",
    className: "failed",
    icon: "!",
  },
} as const;

export default function DocumentProcessingBadge({
  status,
}: Props) {

  const config = status
    ? statusConfig[status]
    : undefined;

  if (!config) {
    return (
      <span className="processing-badge processing-unknown">
        Unknown
      </span>
    );
  }

  const isProcessing =
    status === "INDEXING" ||
    status === "EMBEDDING";

  return (
    <span
      className={
        `processing-badge processing-${config.className}`
      }
      title={config.description}
    >
      {isProcessing ? (
        <span
          className="processing-spinner"
          aria-hidden="true"
        />
      ) : (
        <span aria-hidden="true">
          {config.icon}
        </span>
      )}

      {config.label}
    </span>
  );
}
