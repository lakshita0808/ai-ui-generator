import React from "react";

export default function VersionTimeline({ versions, onSelect, currentVersionId }) {
  if (versions.length === 0) {
    return (
      <div className="version-timeline">
        <h4 style={{ marginTop: 0, fontSize: "14px", fontWeight: 600 }}>Version History</h4>
        <div style={{ color: "#666", fontSize: "13px" }}>No versions yet</div>
      </div>
    );
  }

  return (
    <div className="version-timeline">
      <h4 style={{ marginTop: 0, fontSize: "14px", fontWeight: 600 }}>Version History</h4>
      {versions.slice().reverse().map(v => (
        <div
          key={v.id}
          className={`version-item ${currentVersionId === v.id ? "active" : ""}`}
          onClick={() => onSelect(v)}
        >
          <div style={{ fontWeight: currentVersionId === v.id ? 600 : 400 }}>
            Version {v.id + 1}
          </div>
          {v.explanation && (
            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              {v.explanation.substring(0, 60)}...
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

