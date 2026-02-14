import React, { useState, useEffect } from "react";
import ChatPane from "./components/ChatPane";
import PreviewPane from "./components/PreviewPane";
import CodeEditor from "./components/CodeEditor";
import VersionTimeline from "./components/VersionTimeline";
import { treeToCode } from "./utils/codeGenerator";

export default function App() {
  const [tree, setTree] = useState(null);
  const [code, setCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [versions, setVersions] = useState([]);
  const [currentVersionId, setCurrentVersionId] = useState(null);

  // Update code when tree changes
  useEffect(() => {
    if (tree) {
      setCode(treeToCode(tree));
    }
  }, [tree]);

  const handleVersionSelect = (version) => {
    setTree(version.tree);
    setCurrentVersionId(version.id);
  };

  return (
    <div className="app">
      <div className="left">
        <ChatPane 
          setTree={setTree} 
          setExplanation={setExplanation} 
          setVersions={setVersions}
          setCurrentVersionId={setCurrentVersionId}
        />
        <VersionTimeline 
          versions={versions} 
          onSelect={handleVersionSelect}
          currentVersionId={currentVersionId}
        />
      </div>

      <div className="right">
        <CodeEditor code={code} setCode={setCode} />
        <PreviewPane tree={tree} />
        {explanation && <div className="explanation">{explanation}</div>}
      </div>
    </div>
  );
}
