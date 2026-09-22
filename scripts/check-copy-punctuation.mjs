import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Scan authored string literals and JSX text, not comments or generated code.
const root = path.resolve(import.meta.dirname, "..");
const dash = /\u2014|&mdash;|&#8212;|&#x2014;|\\u2014/gi;
const findings = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(tsx?|jsx?)$/.test(file) && !file.endsWith("routeTree.gen.ts")) {
      const source = fs.readFileSync(file, "utf8");
      if (source.slice(0, 300).includes("AUTO-GENERATED")) continue;
      const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
      const visit = (node) => {
        if (
          ts.isStringLiteral(node) ||
          ts.isNoSubstitutionTemplateLiteral(node) ||
          ts.isTemplateHead(node) ||
          ts.isTemplateMiddle(node) ||
          ts.isTemplateTail(node) ||
          ts.isJsxText(node)
        ) {
          const start = node.getStart(tree);
          const text = source.slice(start, node.end);
          if (new RegExp(dash).test(text)) {
            findings.push({
              file,
              start,
              end: node.end,
              text,
              title: ts.isPropertyAssignment(node.parent) &&
                /title/i.test(node.parent.name.getText(tree)),
              line: tree.getLineAndCharacterOfPosition(start).line + 1,
            });
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(tree);
    }
  }
}
walk(path.join(root, "src"));
for (const entry of fs.readdirSync(path.join(root, "public"))) {
  if (!/\.(txt|md|html)$/.test(entry)) continue;
  const file = path.join(root, "public", entry);
  const text = fs.readFileSync(file, "utf8");
  if (new RegExp(dash).test(text)) findings.push({ file, start: 0, end: text.length, text, line: 1 });
}

for (const item of findings) console.error(`${path.relative(root, item.file)}:${item.line}: Em dash in copy`);
console.log(`${findings.length} authored copy segments contain em dashes.`);
process.exitCode = findings.length ? 1 : 0;
