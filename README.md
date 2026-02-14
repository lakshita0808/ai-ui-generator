# AI UI Generator

An AI-powered agent that converts natural language UI intent → working UI code + live preview, using a fixed, deterministic component library.

## Live Deployment

Frontend:  
https://ai-ui-generator-git-main-lakshita-jawandhiyas-projects.vercel.app/

Backend:  
https://ai-ui-generator-api.onrender.com

## Overview

This application implements a Claude Code-style UI generator with the following key features:

- Deterministic Component System: All UIs use the exact same fixed component library
- Multi-Step AI Agent: Planner → Generator → Explainer architecture
- Iterative Editing: Modify existing UIs incrementally without full regeneration
- Live Preview: See generated UIs render in real-time
- Version History: Roll back to previous versions
- Code Editor: View and edit generated React code

## Architecture

### System Design

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐
│   Server    │
│  (Express)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│   AI Agent Pipeline     │
│                         │
│  1. Planner             │
│  2. Generator           │
│  3. Explainer           │
└─────────────────────────┘
```

### Frontend Structure

- Left Panel: Chat interface for user input + version timeline
- Right Panel:
  - Code editor (top) - shows generated React code
  - Live preview (middle) - renders the UI
  - Explanation (bottom) - AI decision rationale

### Backend Structure

- Server (`server/server.js`): Express server with CORS
- Routes (`server/routes/generate.js`): API endpoints for generation
- Agent (`server/lib/llm.js`): Core agent logic (Planner, Generator, Explainer)

## Agent Design

### 1. Planner

Purpose: Interprets user intent and creates a structured plan

Input:
- User text (natural language)
- Current UI tree (if modifying)

Output: Structured plan object

```javascript
{
  type: "new" | "patch",
  intent: "sanitized user text",
  layout: { type: "dashboard", hasNavbar: true, ... },
  components: [{ name: "Button", props: {...} }],
  actions: [{ type: "add", component: {...} }]
}
```

Logic:
- Detects if request is modification vs new UI
- Infers layout structure (dashboard, form, table, etc.)
- Identifies required components from keywords
- For modifications, determines specific actions (add, remove, simplify)

### 2. Generator

Purpose: Converts plan into valid UI component tree

Input: Plan object, current tree (optional)

Output: Component tree structure

```javascript
{
  component: "Card",
  props: { title: "...", subtitle: "..." },
  children: [...]
}
```

Logic:
- For new UIs: Creates root structure and adds requested components
- For patches: Deep clones current tree and applies modifications incrementally
- Validates all components against whitelist
- Ensures tree structure is valid

### 3. Explainer

Purpose: Explains AI decisions in plain English

Input: Plan, generated tree, original user text

Output: Human-readable explanation string

Logic:
- Describes which components were selected and why
- Explains layout choices
- For modifications, lists what changed

## Component Library

### Fixed Components (Never Change)

All components are defined in `web/src/components/ComponentLibrary.jsx` with fixed styling in `web/src/styles/component-library.css`.

Available Components:

1. Button - `{ children, onClick, variant, disabled }`
2. Card - `{ title, subtitle, children }`
3. Input - `{ placeholder, type, value, onChange, label }`
4. Table - `{ headers, rows }`
5. Modal - `{ isOpen, onClose, title, children }`
6. Sidebar - `{ children, position }`
7. Navbar - `{ title, links }`
8. Chart - `{ type, data, labels }` (mocked visualization)

Constraints:
- AI can only: select components, compose layouts, set props, provide content
- AI cannot: create new components, modify component styles, use inline styles, generate arbitrary CSS

## Safety & Validation

### Component Whitelist Enforcement

- All component names validated against `ALLOWED_COMPONENTS` array
- Invalid components rejected with clear error messages
- Validation happens recursively on entire tree

### Prompt Injection Protection

- Input sanitization: removes code blocks, script tags
- Length limiting: max 1000 characters
- Type checking: ensures userText is string

### Error Handling

- Try-catch blocks around all agent steps
- Validation errors return 400 status
- Server errors return 500 with details (dev mode only)
- Frontend displays errors in chat interface

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- (Optional) API key for external LLM if you want to enhance with real LLM calls

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd ai-ui-generator
   ```

2. Install root dependencies
   ```bash
   npm install
   ```

3. Install web dependencies
   ```bash
   cd web
   npm install
   cd ..
   ```

### Running Locally

Development mode (runs both server and web):

```bash
npm run dev
```

Or run separately:

```bash
# Terminal 1: Server
npm run server

# Terminal 2: Web
npm run web
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Environment Variables

Create a `.env` file in the root directory (optional):

```
NODE_ENV=development
PORT=5000
```

## Deployment

### Frontend (Vite)

Deployed at:
https://ai-ui-generator-git-main-lakshita-jawandhiyas-projects.vercel.app/

Can be deployed to:
- Vercel
- Netlify
- Render (static site)

### Backend (Express)

Deployed at:
https://ai-ui-generator-api.onrender.com

Can be deployed to:
- Render
- Fly.io
- Railway

Note: API URL is configured in `ChatPane.jsx` using environment variable.

## Usage Examples

Example 1:
User: "Create a dashboard with a navbar and sidebar"  
AI: Creates new UI with Navbar and Sidebar components

Example 2:
User: "Add a table with user data"  
AI: Adds Table component to existing UI

Example 3:
User: "Make this more minimal and add a settings modal"  
AI: Simplifies layout and adds Modal component

## Iteration & Edit Awareness

The system supports incremental edits:

1. Detection: Planner detects modification keywords ("add", "modify", "make", etc.)
2. Preservation: Generator deep clones existing tree before modifications
3. Incremental Changes: Only applies requested changes, preserves rest
4. Explanation: Explainer describes what changed, not full regeneration

## Version History

- Each generation creates a new version
- Versions stored in-memory (server restart clears history)
- Users can roll back to any previous version
- Version timeline shows explanation preview

## Known Limitations

1. No Real LLM Integration
2. In-Memory Storage
3. Basic Component Props
4. No Code Execution
5. Simple Chart

## What I'd Improve With More Time

1. Real LLM Integration
2. Persistent Storage
3. Enhanced Code Editor
4. Better Component Library
5. Advanced Features
6. UI/UX Improvements

## Technical Stack

- Frontend: React 18, Vite
- Backend: Node.js, Express
- Styling: CSS
- Architecture: Multi-step agent pipeline