// Component whitelist for validation - MUST match ComponentLibrary.jsx
const ALLOWED_COMPONENTS = [
  "Button", "Card", "Input", "Table", "Modal", "Sidebar", "Navbar", "Chart"
];

// Safety: Validate component names
function validateComponent(componentName) {
  if (!ALLOWED_COMPONENTS.includes(componentName)) {
    throw new Error(`Invalid component: ${componentName}. Allowed: ${ALLOWED_COMPONENTS.join(", ")}`);
  }
  return true;
}

// Safety: Basic prompt injection protection
function sanitizeInput(text) {
  if (!text || typeof text !== "string") return "";
  // Remove potential prompt injection patterns
  return text
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/<script[\s\S]*?<\/script>/gi, "") // Remove script tags
    .substring(0, 1000); // Limit length
}

/**
 * 1️⃣ PLANNER: Interprets user intent and creates a structured plan
 */
async function planner(userText, currentTree) {
  const sanitized = sanitizeInput(userText);
  const lower = sanitized.toLowerCase();
  
  // Determine if this is a new UI or modification
  const isModification = currentTree && (
    lower.includes("add") || 
    lower.includes("modify") || 
    lower.includes("change") || 
    lower.includes("update") ||
    lower.includes("remove") ||
    lower.includes("make") ||
    lower.includes("more") ||
    lower.includes("less")
  );

  if (isModification) {
    // Incremental edit mode
    return {
      type: "patch",
      intent: sanitized,
      currentTree: currentTree,
      actions: inferModificationActions(sanitized, currentTree)
    };
  }

  // New UI generation
  return {
    type: "new",
    intent: sanitized,
    layout: inferLayout(sanitized),
    components: inferComponents(sanitized)
  };
}

/**
 * Infer layout structure from user intent
 */
function inferLayout(userText) {
  const lower = userText.toLowerCase();
  
  if (lower.includes("dashboard")) {
    return { type: "dashboard", hasNavbar: true, hasSidebar: true };
  }
  if (lower.includes("modal") || lower.includes("dialog")) {
    return { type: "modal", hasModal: true };
  }
  if (lower.includes("form")) {
    return { type: "form", hasCard: true };
  }
  if (lower.includes("table") || lower.includes("list")) {
    return { type: "table", hasTable: true };
  }
  
  return { type: "default", hasCard: true };
}

/**
 * Infer which components to use from user intent
 */
function inferComponents(userText) {
  const lower = userText.toLowerCase();
  const components = [];
  
  if (lower.includes("button") || lower.includes("click")) {
    components.push({ name: "Button", props: { children: extractButtonText(userText) || "Click Me" } });
  }
  if (lower.includes("card") || lower.includes("container")) {
    components.push({ name: "Card", props: { title: extractTitle(userText), subtitle: extractSubtitle(userText) } });
  }
  if (lower.includes("input") || lower.includes("field") || lower.includes("form")) {
    components.push({ name: "Input", props: { placeholder: "Enter text..." } });
  }
  if (lower.includes("table") || lower.includes("data") || lower.includes("list")) {
    const tableData = extractTableData(userText);
    components.push({ 
      name: "Table", 
      props: { 
        headers: tableData.headers || ["Name", "Value", "Status"], 
        rows: tableData.rows || [
          ["Item 1", "Value 1", "Active"],
          ["Item 2", "Value 2", "Pending"],
          ["Item 3", "Value 3", "Completed"]
        ]
      } 
    });
  }
  if (lower.includes("modal") || lower.includes("dialog") || lower.includes("popup") || lower.includes("settings")) {
    const modalTitle = extractModalTitle(userText);
    const modalId = `modal-${Date.now()}`;
    components.push({ 
      name: "Modal", 
      props: { 
        id: modalId,
        title: modalTitle || "Modal Title", 
        isOpen: false 
      } 
    });
    // If modal is mentioned, also add a button to open it
    if (!lower.includes("button")) {
      components.push({ 
        name: "Button", 
        props: { 
          children: "Open " + (modalTitle || "Modal"),
          opensModal: modalId
        } 
      });
    }
  }
  if (lower.includes("sidebar") || lower.includes("side panel")) {
    components.push({ name: "Sidebar", props: {} });
  }
  if (lower.includes("navbar") || lower.includes("navigation") || lower.includes("nav")) {
    components.push({ name: "Navbar", props: { title: "App", links: [] } });
  }
  if (lower.includes("chart") || lower.includes("graph") || lower.includes("visualization")) {
    components.push({ name: "Chart", props: { type: "bar", data: [10, 20, 30], labels: ["A", "B", "C"] } });
  }
  
  return components.length > 0 ? components : [{ name: "Card", props: { title: "UI", subtitle: userText } }];
}

/**
 * Infer modification actions from user intent
 */
function inferModificationActions(userText, currentTree) {
  const lower = userText.toLowerCase();
  const actions = [];
  
  if (lower.includes("add")) {
    const components = inferComponents(userText);
    components.forEach(comp => {
      actions.push({ type: "add", component: comp, target: "root" });
    });
  }
  
  if (lower.includes("remove") || lower.includes("delete")) {
    // Simple: remove last child if exists
    if (currentTree.children && currentTree.children.length > 0) {
      actions.push({ type: "remove", target: "last" });
    }
  }
  
  if (lower.includes("minimal") || lower.includes("simpler")) {
    actions.push({ type: "simplify" });
  }
  
  return actions;
}

function extractButtonText(text) {
  const match = text.match(/button.*?["']([^"']+)["']/i) || text.match(/button.*?(\w+)/i);
  return match ? match[1] : null;
}

function extractTitle(text) {
  const match = text.match(/title.*?["']([^"']+)["']/i) || text.match(/called.*?["']([^"']+)["']/i);
  return match ? match[1] : "UI Component";
}

function extractSubtitle(text) {
  return text.length > 100 ? text.substring(0, 100) + "..." : text;
}

function extractTableData(text) {
  const lower = text.toLowerCase();
  const headers = [];
  const rows = [];
  
  // Try to extract table structure
  if (lower.includes("user") || lower.includes("users")) {
    return {
      headers: ["Name", "Email", "Role"],
      rows: [
        ["John Doe", "john@example.com", "Admin"],
        ["Jane Smith", "jane@example.com", "User"],
        ["Bob Johnson", "bob@example.com", "User"]
      ]
    };
  }
  
  if (lower.includes("product") || lower.includes("products")) {
    return {
      headers: ["Product", "Price", "Stock"],
      rows: [
        ["Widget A", "$10.00", "50"],
        ["Widget B", "$15.00", "30"],
        ["Widget C", "$20.00", "20"]
      ]
    };
  }
  
  return null; // Will use defaults
}

function extractModalTitle(text) {
  const match = text.match(/(?:modal|dialog|popup|settings).*?["']([^"']+)["']/i) || 
                text.match(/(?:modal|dialog|popup|settings).*?called.*?["']([^"']+)["']/i) ||
                text.match(/settings.*?modal/i);
  if (match) return match[1];
  if (text.toLowerCase().includes("settings")) return "Settings";
  return null;
}

/**
 * 2️⃣ GENERATOR: Converts plan into UI code tree
 */
async function generator(plan, currentTree) {
  try {
    if (plan.type === "new") {
      return generateNewTree(plan);
    }
    
    if (plan.type === "patch") {
      return generatePatchedTree(plan, currentTree);
    }
    
    throw new Error("Invalid plan type");
  } catch (error) {
    console.error("Generator error:", error);
    throw error;
  }
}

function generateNewTree(plan) {
  const root = {
    component: "Card",
    props: { title: "UI", subtitle: plan.intent },
    children: []
  };
  
  // Add Navbar if needed
  if (plan.layout.hasNavbar) {
    root.children.push({
      component: "Navbar",
      props: { title: "App", links: [] },
      children: []
    });
  }
  
  // Add Sidebar if needed
  if (plan.layout.hasSidebar) {
    root.children.push({
      component: "Sidebar",
      props: {},
      children: []
    });
  }
  
  // Add requested components
  plan.components.forEach(comp => {
    validateComponent(comp.name);
    root.children.push({
      component: comp.name,
      props: comp.props || {},
      children: []
    });
  });
  
  return root;
}

function generatePatchedTree(plan, currentTree) {
  if (!currentTree) {
    throw new Error("Cannot patch: no existing tree");
  }
  
  // Deep clone to avoid mutation
  const newTree = JSON.parse(JSON.stringify(currentTree));
  
  plan.actions.forEach(action => {
    if (action.type === "add") {
      validateComponent(action.component.name);
      if (!newTree.children) {
        newTree.children = [];
      }
      newTree.children.push({
        component: action.component.name,
        props: action.component.props || {},
        children: []
      });
    }
    
    if (action.type === "remove" && newTree.children && newTree.children.length > 0) {
      newTree.children.pop();
    }
    
    if (action.type === "simplify") {
      // Keep only first 2 children
      if (newTree.children && newTree.children.length > 2) {
        newTree.children = newTree.children.slice(0, 2);
      }
    }
  });
  
  return newTree;
}

/**
 * 3️⃣ EXPLAINER: Explains AI decisions in plain English
 */
async function explainer(plan, generatedTree, userText) {
  if (plan.type === "new") {
    const componentNames = plan.components.map(c => c.name).join(", ");
    return `Created a new UI with ${componentNames} based on your request: "${userText}". The layout uses a ${plan.layout.type} structure.`;
  }
  
  if (plan.type === "patch") {
    const actionDescriptions = plan.actions.map(a => {
      if (a.type === "add") return `added ${a.component.name}`;
      if (a.type === "remove") return "removed last component";
      if (a.type === "simplify") return "simplified the layout";
      return a.type;
    }).join(", ");
    
    return `Modified the existing UI: ${actionDescriptions}. Your request: "${userText}"`;
  }
  
  return "UI generated successfully.";
}

module.exports = {
  planner,
  generator,
  explainer,
  validateComponent,
  sanitizeInput
};
