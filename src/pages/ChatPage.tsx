
import {
  useEffect,
  useRef,
  useState,
} from "react";

import type { KeyboardEvent } from "react";

import {
  sendChatMessage,
  type ChatMode,
  type ChatSource,
} from "../services/chatService";

import { useDocuments } from "../hooks/useDocuments";

import "../pages/ChatPage.css";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  mode: ChatMode;
  error?: boolean;
  grounded?: boolean;
};

const documentSuggestions = [
  "Summarize the uploaded documents",
  "What information is available?",
  "Which values need verification?",
  "What information is missing from the report?",
];

const generalSuggestions = [
  "What is retrieval-augmented generation?",
  "Explain haemoglobin in simple terms",
  "How does semantic search work?",
  "What can you help me with?",
];

export default function ChatPage() {

  const [mode, setMode] =
    useState<ChatMode>("documents");

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [question, setQuestion] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const {
    initialized,
    error: knowledgeError,
    readyCount,
    processingCount,
    failedCount,
    loadDocuments,
  } = useDocuments();

  const bottomRef =
    useRef<HTMLDivElement>(null);

  const nextId = useRef(1);

  const sendingRef = useRef(false);

  const documentsAvailable =
    initialized &&
    !knowledgeError &&
    readyCount > 0;

  const canSend =
    !loading &&
    (
      mode === "general" ||
      documentsAvailable
    );

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });

  }, [messages, loading]);

  function startNewChat() {

    if (sendingRef.current) return;

    setMessages([]);
    setQuestion("");
    nextId.current = 1;
  }

  async function sendMessage(
    text = question
  ) {

    const value = text.trim();

    if (
      !value ||
      !canSend ||
      sendingRef.current ||
      value.length > 4000
    ) {
      return;
    }

    const currentMode = mode;

    sendingRef.current = true;

    const userMessage: Message = {
      id: nextId.current++,
      role: "user",
      content: value,
      mode: currentMode,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setQuestion("");
    setLoading(true);

    try {

      const result = await sendChatMessage(
        value,
        currentMode
      );

      setMessages((previous) => [

        ...previous,

        {
          id: nextId.current++,
          role: "assistant",
          content: result.answer,
          sources: result.sources,
          mode: currentMode,
          grounded: result.grounded,
        },

      ]);

    } catch (error) {

      console.error("Chat error:", error);

      setMessages((previous) => [

        ...previous,

        {
          id: nextId.current++,
          role: "assistant",
          content:
            "Unable to get a response. " +
            "Please check that Spring Boot " +
            "and Ollama are running.",
          mode: currentMode,
          error: true,
        },

      ]);

    } finally {

      sendingRef.current = false;
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {

    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {

      event.preventDefault();

      void sendMessage();
    }
  }

  return (

    <div className="medirag-chat">

      <header className="medirag-chat-header">

        <div className="medirag-chat-heading">

          <div className="medirag-chat-brand-icon">
            ✦
          </div>

          <div>

            <h1>AI Medical Assistant</h1>

            <p>
              Local Ollama · PostgreSQL · RAG
            </p>

          </div>

        </div>

        <div className="medirag-chat-header-actions">

          <span className="medirag-chat-status">
            Local AI
          </span>

          <button
            type="button"
            className="secondary medirag-new-chat"
            disabled={loading}
            onClick={startNewChat}
          >
            + New Chat
          </button>

        </div>

      </header>

      <div className="medirag-knowledge-base">

        <div className="medirag-knowledge-heading">

          <strong>Knowledge Base</strong>

          <button
            type="button"
            className="secondary medirag-knowledge-refresh"
            onClick={() => void loadDocuments(true)}
            aria-label="Refresh knowledge base"
          >
            ↻
          </button>

        </div>

        {knowledgeError ? (

          <div className="medirag-knowledge-error">
            Unable to verify knowledge base status.
          </div>

        ) : !initialized ? (

          <small>
            Checking available documents...
          </small>

        ) : (

          <div className="medirag-knowledge-stats">

            <span className="medirag-kb-ready">

              <span className="medirag-kb-dot" />

              {readyCount} ready

            </span>

            <span className="medirag-kb-processing">

              {processingCount > 0 && (
                <span className="processing-spinner" />
              )}

              {processingCount} processing

            </span>

            {failedCount > 0 && (

              <span className="medirag-kb-failed">
                {failedCount} failed
              </span>

            )}

          </div>

        )}

      </div>

      <div className="medirag-chat-mode">

        <button
          className={
            mode === "documents" ? "active" : ""
          }
          onClick={() => setMode("documents")}
          type="button"
          disabled={loading}
        >
          📚 Ask Documents
        </button>

        <button
          className={
            mode === "general" ? "active" : ""
          }
          onClick={() => setMode("general")}
          type="button"
          disabled={loading}
        >
          ✨ General AI
        </button>

      </div>

      {mode === "documents" &&
        !documentsAvailable && (

        <div className="medirag-chat-notice">

          {knowledgeError

            ? "Knowledge base status is unavailable. " +
              "Refresh or check your backend connection."

            : !initialized

              ? "Checking your knowledge base..."

              : processingCount > 0

                ? "Your documents are being processed. " +
                  "You can ask document-based questions " +
                  "once a document is ready."

                : "No documents are ready for retrieval. " +
                  "Upload a document or retry failed " +
                  "processing from the Documents page."}

        </div>

      )}

      <div className="medirag-chat-messages">

        {messages.length === 0 && (

          <div className="medirag-chat-welcome">

            <div className="medirag-chat-avatar">
              ✦
            </div>

            <h2>Welcome to MediRAG</h2>

            <p>

              {mode === "documents"

                ? "Ask questions using your uploaded " +
                  "medical knowledge base."

                : "Chat with your locally running " +
                  "AI assistant."}

            </p>

            <div className="medirag-chat-suggestions">

              {(mode === "documents"
                ? documentSuggestions
                : generalSuggestions
              ).map((item) => (

                <button
                  key={item}
                  type="button"
                  disabled={!canSend}
                  onClick={() =>
                    void sendMessage(item)
                  }
                >
                  {item}
                </button>

              ))}

            </div>

          </div>

        )}

        {messages.map((message) => (

          <div
            key={message.id}
            className={
              "medirag-message " +
              (
                message.role === "user"
                  ? "medirag-message-user"
                  : "medirag-message-assistant"
              )
            }
          >

            <div className="medirag-message-label">

              {message.role === "user"
                ? "You"
                : "MediRAG AI"}

              <span className="medirag-message-mode">

                {message.mode === "documents"
                  ? "Documents"
                  : "General AI"}

              </span>

            </div>

            {message.role === "assistant" &&
              !message.error &&
              message.mode === "documents" && (

              <span
                className={
                  message.grounded
                    ? "medirag-context-found"
                    : "medirag-context-missing"
                }
              >

                {message.grounded
                  ? "Document context retrieved"
                  : "No matching document context"}

              </span>

            )}

            <div
              className={
                "medirag-message-bubble" +
                (message.error ? " error" : "")
              }
            >
              {message.content}
            </div>

            {message.sources &&
              message.sources.length > 0 && (

              <div className="medirag-chat-sources">

                <strong>Retrieved sources</strong>

                {message.sources.map(
                  (source, index) => (

                    <div
                      className="medirag-chat-source"
                      key={`${message.id}-${index}`}
                    >

                      <span>
                        📄 {source.fileName}
                      </span>

                      <small>

                        {source.pageNumber != null

                          ? `Page ${source.pageNumber}`

                          : `Chunk ${source.chunkIndex + 1}`}

                        {source.similarity != null &&

                          ` · Similarity ${(
                            source.similarity * 100
                          ).toFixed(1)}%`}

                      </small>

                    </div>

                  )
                )}

                <small className="medirag-source-disclaimer">

                  Similarity measures retrieval relevance,
                  not medical accuracy.

                </small>

              </div>

            )}

          </div>

        ))}

        {loading && (

          <div className="medirag-message medirag-message-assistant">

            <div className="medirag-message-label">
              MediRAG AI
            </div>

            <div className="medirag-message-bubble">

              <span className="medirag-chat-thinking">

                <span className="processing-spinner" />

                {mode === "documents"
                  ? "Retrieving context and generating answer"
                  : "Generating answer"}

                <span className="medirag-chat-dots">
                  ...
                </span>

              </span>

            </div>

          </div>

        )}

        <div ref={bottomRef} />

      </div>

      <div className="medirag-chat-bottom">

        <div className="medirag-chat-warning">

          ⚠ AI-generated medical information and
          OCR-extracted values must be verified
          against original sources.

        </div>

        <div className="medirag-chat-input">

          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder={
              mode === "documents"

                ? documentsAvailable

                  ? "Ask about your uploaded documents..."

                  : "Waiting for searchable documents..."

                : "Ask MediRAG anything..."
            }
            rows={2}
            maxLength={4000}
            disabled={!canSend}
            aria-label="Chat question"
          />

          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={
              !question.trim() || !canSend
            }
            aria-label="Send message"
          >
            ➤
          </button>

        </div>

        <p className="medirag-chat-footer">

          Enter to send · Shift + Enter for a new line
          {" · "}
          {question.length}/4000

        </p>

      </div>

    </div>
  );
}
