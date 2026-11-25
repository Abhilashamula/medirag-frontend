
import { useEffect, useRef, useState } from "react";
import {
  sendChatMessage,
  type ChatMode,
  type ChatSource,
} from "../services/chatService";
import "./ChatPage.css";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  mode: ChatMode;
  error?: boolean;
};

const suggestions = [
  "Summarize the uploaded laboratory report",
  "What test results are available?",
  "Which values need verification?",
  "What information is missing from the report?",
];

export default function ChatPage() {
  const [mode, setMode] = useState<ChatMode>("documents");
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(text = question) {
    const value = text.trim();

    if (!value || loading || value.length > 4000) {
      return;
    }

    const currentMode = mode;

    const userMessage: Message = {
      id: nextId.current++,
      role: "user",
      content: value,
      mode: currentMode,
    };

    setMessages((previous) => [...previous, userMessage]);
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
            "Unable to get a response. Please check " +
            "that Spring Boot and Ollama are running.",
          mode: currentMode,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="medirag-chat">
      <header className="medirag-chat-header">
        <div>
          <h1>AI Medical Assistant</h1>
          <p>
            Powered by local Ollama and PostgreSQL
          </p>
        </div>

        <span className="medirag-chat-status">
          ● Local AI
        </span>
      </header>

      <div className="medirag-chat-mode">
        <button
          className={
            mode === "documents" ? "active" : ""
          }
          onClick={() => setMode("documents")}
          type="button"
        >
          📚 Ask Documents
        </button>

        <button
          className={
            mode === "general" ? "active" : ""
          }
          onClick={() => setMode("general")}
          type="button"
        >
          ✨ General AI
        </button>
      </div>

      <div className="medirag-chat-messages">
        {messages.length === 0 && (
          <div className="medirag-chat-welcome">
            <div className="medirag-chat-avatar">
              ✦
            </div>

            <h2>Welcome to MediRAG</h2>

            <p>
              {mode === "documents"
                ? "Ask questions about your uploaded medical documents."
                : "Chat with your locally running AI assistant."}
            </p>

            <div className="medirag-chat-suggestions">
              {(mode === "documents"
                ? suggestions
                : [
                    "What is retrieval-augmented generation?",
                    "Explain haemoglobin in simple terms",
                    "How does semantic search work?",
                    "What can you help me with?",
                  ]
              ).map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={loading}
                  onClick={() => void sendMessage(item)}
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
              (message.role === "user"
                ? "medirag-message-user"
                : "medirag-message-assistant")
            }
          >
            <div className="medirag-message-label">
              {message.role === "user"
                ? "You"
                : "MediRAG AI"}
            </div>

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

                  {message.sources.map((source, index) => (
                    <div
                      className="medirag-chat-source"
                      key={`${message.id}-${index}`}
                    >
                      <span>📄 {source.fileName}</span>

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
                  ))}
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
                Thinking
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
        {mode === "documents" && (
          <div className="medirag-chat-warning">
            ⚠ OCR-extracted medical values and AI
            interpretations must be verified against
            the original report.
          </div>
        )}

        <div className="medirag-chat-input">
          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder={
              mode === "documents"
                ? "Ask about your uploaded documents..."
                : "Ask MediRAG anything..."
            }
            rows={2}
            maxLength={4000}
            disabled={loading}
          />

          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!question.trim() || loading}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>

        <p className="medirag-chat-footer">
          Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </div>
  );
}
