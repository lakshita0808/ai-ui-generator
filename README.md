# AI UI Generator

An AI-powered agent that converts natural language UI intent → working UI code + live preview, using a fixed, deterministic component library.

## 🎯 Overview

This application implements a Claude Code-style UI generator with the following key features:

- **Deterministic Component System**: All UIs use the exact same fixed component library
- **Multi-Step AI Agent**: Planner → Generator → Explainer architecture
- **Iterative Editing**: Modify existing UIs incrementally without full regeneration
- **Live Preview**: See generated UIs render in real-time
- **Version History**: Roll back to previous versions
- **Code Editor**: View and edit generated React code

## 🏗️ Architecture

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
│  1️⃣ Planner            │
│  2️⃣ Generator          │
│  3️⃣ Explainer          │
└─────────────────────────┘
```

### Frontend Structure

- **Left Panel**: Chat interface for user input + version timeline
- **Right Panel**: 
  - Code editor (top) - shows generated React code
  - Live preview (middle) - renders the UI
  - Explanation (bottom) - AI decision rationale

### Backend Structure

- **Server** (`server/server.js`): Express server with CORS
- **Routes** (`server/routes/generate.js`): API endpoints for generation
- **Agent** (`server/lib/llm.js`): Core agent logic (Planner, Generator, Explainer)

## 🧠 Agent Design

### 1️⃣ Planner

**Purpose**: Interprets user intent and creates a structured plan

**Input**: 
- User text (natural language)
- Current UI tree (if modifying)

**Output**: Structured plan object
```javascript
{
  type: "new" | "patch",
  intent: "sanitized user text",
  layout: { type: "dashboard", hasNavbar: true, ... },
  components: [{ name: "Button", props: {...} }],
  actions: [{ type: "add", component: {...} }] // for patches
}
```

**Logic**:
- Detects if request is modification vs new UI
- Infers layout structure (dashboard, form, table, etc.)
- Identifies required components from keywords
- For modifications, determines specific actions (add, remove, simplify)

### 2️⃣ Generator

**Purpose**: Converts plan into valid UI component tree

**Input**: Plan object, current tree (optional)

**Output**: Component tree structure
```javascript
{
  component: "Card",
  props: { title: "...", subtitle: "..." },
  children: [...]
}
```

**Logic**:
- For new UIs: Creates root structure and adds requested components
- For patches: Deep clones current tree and applies modifications incrementally
- Validates all components against whitelist
- Ensures tree structure is valid

### 3️⃣ Explainer

**Purpose**: Explains AI decisions in plain English

**Input**: Plan, generated tree, original user text

**Output**: Human-readable explanation string

**Logic**:
- Describes which components were selected and why
- Explains layout choices
- For modifications, lists what changed

## 🧱 Component Library

### Fixed Components (Never Change)

All components are defined in `web/src/components/ComponentLibrary.jsx` with fixed styling in `web/src/styles/component-library.css`.

**Available Components**:
1. **Button** - `{ children, onClick, variant, disabled }`
2. **Card** - `{ title, subtitle, children }`
3. **Input** - `{ placeholder, type, value, onChange, label }`
4. **Table** - `{ headers, rows }`
5. **Modal** - `{ isOpen, onClose, title, children }`
6. **Sidebar** - `{ children, position }`
7. **Navbar** - `{ title, links }`
8. **Chart** - `{ type, data, labels }` (mocked visualization)

**Constraints**:
- ✅ AI can only: select components, compose layouts, set props, provide content
- ❌ AI cannot: create new components, modify component styles, use inline styles, generate arbitrary CSS

## 🔒 Safety & Validation

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

## 🚀 Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- (Optional) API key for external LLM if you want to enhance with real LLM calls

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-ui-generator
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install web dependencies**
   ```bash
   cd web
   npm install
   cd ..
   ```

### Running Locally

**Development mode** (runs both server and web):
```bash
npm run dev
```

**Or run separately**:
```bash
# Terminal 1: Server
npm run server

# Terminal 2: Web
npm run web
```

The application will be available at:
- Frontend: http://localhost:5173 (Vite default)
- Backend: http://localhost:5000

### Environment Variables

Create a `.env` file in the root directory (optional):
```
NODE_ENV=development
PORT=5000
# Add LLM API keys here if integrating with external services
```

## 📦 Deployment

### Frontend (Vite)

The web app can be deployed to:
- **Vercel**: Connect GitHub repo, set build command: `cd web && npm install && npm run build`
- **Netlify**: Set build command: `cd web && npm install && npm run build`, publish directory: `web/dist`
- **Render**: Static site, build command: `cd web && npm install && npm run build`

### Backend (Express)

The server can be deployed to:
- **Render**: Node.js service, start command: `node server/server.js`
- **Fly.io**: Dockerfile or fly.toml configuration
- **Railway**: Connect repo, auto-detects Node.js

**Note**: Update the API URL in `ChatPane.jsx` to point to your deployed backend.

## 🧪 Usage Examples

### Example 1: Create New UI
```
User: "Create a dashboard with a navbar and sidebar"
AI: Creates new UI with Navbar and Sidebar components
```

### Example 2: Add Component
```
User: "Add a table with user data"
AI: Adds Table component to existing UI
```

### Example 3: Modify Existing
```
User: "Make this more minimal and add a settings modal"
AI: Simplifies layout and adds Modal component
```

## 🔄 Iteration & Edit Awareness

The system supports incremental edits:

1. **Detection**: Planner detects modification keywords ("add", "modify", "make", etc.)
2. **Preservation**: Generator deep clones existing tree before modifications
3. **Incremental Changes**: Only applies requested changes, preserves rest
4. **Explanation**: Explainer describes what changed, not full regeneration

## 📊 Version History

- Each generation creates a new version
- Versions stored in-memory (server restart clears history)
- Users can roll back to any previous version
- Version timeline shows explanation preview

## ⚠️ Known Limitations

1. **No Real LLM Integration**: Currently uses rule-based logic. To add real LLM:
   - Integrate OpenAI/Anthropic API in `server/lib/llm.js`
   - Add API key to environment variables
   - Update prompts to use LLM instead of rule-based inference

2. **In-Memory Storage**: Version history lost on server restart. For persistence:
   - Add database (SQLite, PostgreSQL, etc.)
   - Store versions in database
   - Load on server start

3. **Basic Component Props**: Some components have limited prop support. Extend:
   - Add more props to component definitions
   - Update generator to handle more prop types

4. **No Code Execution**: Code editor is display-only. To enable:
   - Add code parsing/validation
   - Implement safe code execution (sandbox)
   - Update preview when code changes

5. **Simple Chart**: Chart component uses mocked data. Enhance:
   - Integrate charting library (Chart.js, Recharts)
   - Support more chart types
   - Real data visualization

## 🎯 What I'd Improve With More Time

1. **Real LLM Integration**
   - Integrate Claude/OpenAI API
   - Better intent understanding
   - More sophisticated component selection

2. **Persistent Storage**
   - SQLite database for versions
   - User sessions
   - Export/import functionality

3. **Enhanced Code Editor**
   - Syntax highlighting
   - Code validation
   - Live code execution
   - Diff view between versions

4. **Better Component Library**
   - More components (Dropdown, Tabs, Accordion)
   - More props per component
   - Component composition patterns

5. **Advanced Features**
   - Streaming AI responses
   - Component schema validation
   - Replayable generations
   - Static analysis of AI output

6. **UI/UX Improvements**
   - Better loading states
   - Animations
   - Responsive design
   - Accessibility improvements

## 📝 Technical Stack

- **Frontend**: React 18, Vite
- **Backend**: Node.js, Express
- **Styling**: CSS (fixed component library styles)
- **Architecture**: Multi-step agent pipeline

## 📄 License

This project was created for the Ryze AI assignment.

## 📧 Contact

For questions about this implementation, please refer to the submission email.

---

**Note**: This is a time-boxed exercise (72 hours). The focus was on clarity of thought, correctness, and tradeoffs over polish.
