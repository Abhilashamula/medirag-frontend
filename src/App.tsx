
import { useState } from "react";
import DocumentsPage from "./pages/DocumentsPage";
import ChatPage from "./pages/ChatPage";

type ActivePage = "documents" | "ai-chat";

export default function App() {
  const [activePage, setActivePage] =
    useState<ActivePage>("documents");

  return (
    <div className="layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">M</div>

          <div>
            <h2>MediRAG</h2>
            <p>Medical Knowledge Assistant</p>
          </div>
        </div>

        <div className="sidebar-section-label">
          WORKSPACE
        </div>

        <nav className="sidebar-nav">
          {/* DOCUMENTS */}
          <button
            type="button"
            className={
              activePage === "documents"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage("documents")
            }
          >
            <span className="nav-icon">▤</span>
            <span>Documents</span>
          </button>

          {/* AI CHAT */}
          <button
            type="button"
            className={
              activePage === "ai-chat"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage("ai-chat")
            }
          >
            <span className="nav-icon">✦</span>
            <span>AI Chat</span>
          </button>
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="sidebar-footer">
          <div className="sidebar-status">
            <span className="status-dot" />
            AI Workspace
          </div>

          <p>MediRAG Workspace</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">
        {activePage === "documents" ? (
          <DocumentsPage />
        ) : (
          <ChatPage />
        )}
      </main>
    </div>
  );
}
