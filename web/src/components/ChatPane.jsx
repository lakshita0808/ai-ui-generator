import React, { useState } from "react";

export default function ChatPane({ setTree, setExplanation, setVersions, setCurrentVersionId }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput("");
    setLoading(true);
    setError(null);
    
    // Add user message to chat
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userText: userMessage })
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      setTree(data.tree);
      setExplanation(data.explanation);
      setCurrentVersionId(data.id);

      // Add AI response to chat
      setMessages([...newMessages, { 
        role: "ai", 
        content: data.explanation || "UI generated successfully" 
      }]);

      // Fetch updated versions
      const versionsRes = await fetch(`${apiUrl}/generate/versions`);
      const versionsData = await versionsRes.json();
      setVersions(versionsData);
    } catch (err) {
      setError(err.message || "Failed to generate UI");
      setMessages([...newMessages, { 
        role: "ai", 
        content: `Error: ${err.message}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      generate();
    }
  };

  return (
    <div className="chat-container">
      <h3 style={{ marginTop: 0 }}>AI Chat</h3>
      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ color: "#666", fontSize: "14px", padding: "20px", textAlign: "center" }}>
            Describe a UI in plain English to get started.
            <br />
            <br />
            Examples:
            <br />
            • "Create a dashboard with a navbar and sidebar"
            <br />
            • "Add a table with user data"
            <br />
            • "Make this more minimal and add a settings modal"
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.role}`}>
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.content}
          </div>
        ))}
        {loading && <div className="loading">Generating UI...</div>}
        {error && <div className="error">{error}</div>}
      </div>
      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Describe the UI you want to create or modify..."
          disabled={loading}
        />
        <button 
          className="chat-button" 
          onClick={generate}
          disabled={loading || !input.trim()}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>
    </div>
  );
}

