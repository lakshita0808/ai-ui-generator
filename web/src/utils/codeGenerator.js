// Converts component tree to React code string
export function treeToCode(tree, indent = 0) {
  if (!tree) return "// No UI generated yet";
  
  const spaces = "  ".repeat(indent);
  const { component, props, children } = tree;
  
  // Separate children prop from other props
  const { children: childrenProp, ...otherProps } = props || {};
  
  // Build props string (excluding children prop)
  const propsStr = Object.entries(otherProps || {})
    .map(([key, value]) => {
      if (value === null || value === undefined) return null;
      if (key === "children") return null; // Handle separately
      if (typeof value === "string") {
        // Escape quotes in strings
        const escaped = value.replace(/"/g, '\\"');
        return `${key}="${escaped}"`;
      }
      if (typeof value === "boolean") {
        return value ? key : null;
      }
      if (typeof value === "number") {
        return `${key}={${value}}`;
      }
      if (Array.isArray(value)) {
        return `${key}={${JSON.stringify(value)}}`;
      }
      if (typeof value === "object") {
        return `${key}={${JSON.stringify(value)}}`;
      }
      return `${key}={${JSON.stringify(value)}}`;
    })
    .filter(Boolean)
    .join(" ");
  
  const propsPart = propsStr ? ` ${propsStr}` : "";
  
  // Handle tree children (nested components)
  if (children && children.length > 0) {
    const childrenCode = children
      .map(child => treeToCode(child, indent + 1))
      .join("\n");
    
    return `${spaces}<${component}${propsPart}>\n${childrenCode}\n${spaces}</${component}>`;
  }
  
  // Handle children prop (text content)
  if (childrenProp && typeof childrenProp === "string") {
    return `${spaces}<${component}${propsPart}>${childrenProp}</${component}>`;
  }
  
  // Self-closing if no children
  return `${spaces}<${component}${propsPart} />`;
}
