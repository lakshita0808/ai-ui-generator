const express = require("express");
const { planner, generator, explainer, validateComponent, sanitizeInput } = require("../lib/llm");

const router = express.Router();

let versions = [];
let currentId = 0;

// Validate tree structure recursively
function validateTree(tree) {
  if (!tree || !tree.component) {
    throw new Error("Invalid tree: missing component");
  }
  
  validateComponent(tree.component);
  
  if (tree.children) {
    tree.children.forEach(child => validateTree(child));
  }
  
  return true;
}

router.post("/", async (req, res) => {
  try {
    const { userText } = req.body;

    if (!userText || typeof userText !== "string") {
      return res.status(400).json({ error: "userText is required" });
    }

    const lastVersion = versions[versions.length - 1];
    const currentTree = lastVersion ? lastVersion.tree : null;

    // 1️⃣ Planner: Interpret user intent
    const plan = await planner(userText, currentTree);

    // 2️⃣ Generator: Convert plan to UI tree
    const newTree = await generator(plan, currentTree);

    // Validate generated tree
    validateTree(newTree);

    // 3️⃣ Explainer: Generate explanation
    const explanation = await explainer(plan, newTree, userText);

    const version = {
      id: currentId++,
      tree: newTree,
      explanation,
      timestamp: new Date().toISOString(),
      userText: sanitizeInput(userText)
    };

    versions.push(version);

    res.json(version);
  } catch (error) {
    console.error("Generation error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate UI",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

router.get("/versions", (req, res) => {
  res.json(versions);
});

router.get("/versions/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const version = versions.find(v => v.id === id);
  
  if (!version) {
    return res.status(404).json({ error: "Version not found" });
  }
  
  res.json(version);
});

module.exports = router;
