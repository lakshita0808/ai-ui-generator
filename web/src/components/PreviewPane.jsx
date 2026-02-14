import React, { useState } from "react";
import * as Library from "./ComponentLibrary";

export default function PreviewPane({ tree }) {
  const [modalStates, setModalStates] = useState({});

  const renderNode = (node) => {
    if (!node) return null;

    const Component = Library[node.component];

    if (!Component) {
      return <div className="error">Invalid Component: {node.component}</div>;
    }

    // Handle Modal component specially
    if (node.component === "Modal") {
      const modalId = node.props.id || `modal-${Math.random()}`;
      return (
        <Component
          {...node.props}
          isOpen={modalStates[modalId] || false}
          onClose={() => setModalStates({ ...modalStates, [modalId]: false })}
        >
          {node.children && node.children.map((child, index) => (
            <React.Fragment key={index}>
              {renderNode(child)}
            </React.Fragment>
          ))}
        </Component>
      );
    }

    // Handle Button with onClick that opens modals
    if (node.component === "Button" && node.props.opensModal) {
      const modalId = node.props.opensModal;
      return (
        <Component
          {...node.props}
          onClick={() => setModalStates({ ...modalStates, [modalId]: true })}
        >
          {node.props.children}
        </Component>
      );
    }

    return (
      <Component {...node.props}>
        {node.children && node.children.map((child, index) => (
          <React.Fragment key={index}>
            {renderNode(child)}
          </React.Fragment>
        ))}
      </Component>
    );
  };

  if (!tree) {
    return (
      <div className="preview-container">
        <div style={{ textAlign: "center", color: "#666", padding: "40px" }}>
          <p>No UI generated yet.</p>
          <p style={{ fontSize: "14px" }}>Describe a UI in the chat to see a preview here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-container">
      <div style={{ marginBottom: "16px", fontSize: "14px", fontWeight: 600, color: "#666" }}>
        Live Preview
      </div>
      {renderNode(tree)}
    </div>
  );
}

