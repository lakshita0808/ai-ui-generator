import React from "react";

export default function CodeEditor({ code, setCode }) {
  return (
    <div className="code-editor-container">
      <div className="code-editor-header">Generated Code (Editable)</div>
      <textarea
        className="code-editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Generated React code will appear here..."
        spellCheck={false}
      />
    </div>
  );
}
