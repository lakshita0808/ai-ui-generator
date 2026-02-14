import React, { useState } from "react";

// Fixed component library - these components and styles must never change
// The AI can only select, compose, set props, and provide content

export const Button = ({ children, onClick, variant = "primary", disabled = false }) => (
  <button 
    className={`ryz-btn ryz-btn-${variant}`} 
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

export const Card = ({ title, subtitle, children }) => (
  <div className="ryz-card">
    {title && <h2 className="ryz-card-title">{title}</h2>}
    {subtitle && <p className="ryz-card-subtitle">{subtitle}</p>}
    {children}
  </div>
);

export const Input = ({ placeholder, type = "text", value, onChange, label }) => (
  <div className="ryz-input-wrapper">
    {label && <label className="ryz-input-label">{label}</label>}
    <input 
      className="ryz-input" 
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

export const Table = ({ headers, rows }) => (
  <table className="ryz-table">
    <thead>
      <tr>
        {headers && headers.map((header, idx) => (
          <th key={idx} className="ryz-table-header">{header}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows && rows.map((row, rowIdx) => (
        <tr key={rowIdx} className="ryz-table-row">
          {row.map((cell, cellIdx) => (
            <td key={cellIdx} className="ryz-table-cell">{cell}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="ryz-modal-overlay" onClick={onClose}>
      <div className="ryz-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ryz-modal-header">
          <h3 className="ryz-modal-title">{title}</h3>
          <button className="ryz-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="ryz-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Sidebar = ({ children, position = "left" }) => (
  <aside className={`ryz-sidebar ryz-sidebar-${position}`}>
    {children}
  </aside>
);

export const Navbar = ({ title, links = [] }) => (
  <nav className="ryz-navbar">
    <div className="ryz-navbar-brand">{title}</div>
    <div className="ryz-navbar-links">
      {links.map((link, idx) => (
        <a key={idx} href={link.href || "#"} className="ryz-navbar-link">
          {link.label}
        </a>
      ))}
    </div>
  </nav>
);

export const Chart = ({ type = "bar", data = [], labels = [] }) => {
  // Mocked chart visualization - simple bar chart representation
  const maxValue = data.length > 0 ? Math.max(...data) : 1;
  
  return (
    <div className="ryz-chart">
      <div className="ryz-chart-title">{type.toUpperCase()} Chart</div>
      <div className="ryz-chart-container">
        {data.map((value, idx) => (
          <div key={idx} className="ryz-chart-bar-wrapper">
            <div 
              className="ryz-chart-bar" 
              style={{ height: `${(value / maxValue) * 100}%` }}
              title={`${labels[idx] || `Item ${idx + 1}`}: ${value}`}
            />
            {labels[idx] && <div className="ryz-chart-label">{labels[idx]}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

// Component whitelist for validation
export const COMPONENT_WHITELIST = [
  "Button",
  "Card",
  "Input",
  "Table",
  "Modal",
  "Sidebar",
  "Navbar",
  "Chart"
];
