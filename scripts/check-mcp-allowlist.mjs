#!/usr/bin/env node
/**
 * CI guardrail: every MCP tool under src/lib/mcp/tools/ MUST be
 *   1. registered in src/lib/mcp/index.ts,
 *   2. listed in PUBLIC_TOOL_ALLOWLIST (src/lib/mcp/public-allowlist.ts),
 *   3. documented in src/lib/mcp/PUBLIC_ACCESS.md, and
 *   4. call guardToolAccess() in its handler.
 *
 * Any new tool added without those four things fails the build so the
 * app_mcp_public_unauthenticated protections cannot silently regress.
 *
 * Run: node scripts/check-mcp-allowlist.mjs
 */
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const TOOLS_DIR = resolve(ROOT, "src/lib/mcp/tools");
const INDEX = resolve(ROOT, "src/lib/mcp/index.ts");
const ALLOWLIST = resolve(ROOT, "src/lib/mcp/public-allowlist.ts");
const DOC = resolve(ROOT, "src/lib/mcp/PUBLIC_ACCESS.md");

const errors = [];
const read = (p) => readFileSync(p, "utf8");

const toolFiles = readdirSync(TOOLS_DIR).filter((f) => f.endsWith(".ts"));
if (toolFiles.length === 0) errors.push(`No tool files found in ${TOOLS_DIR}`);

const indexSrc = read(INDEX);
const allowlistSrc = read(ALLOWLIST);
const docSrc = read(DOC);

for (const file of toolFiles) {
  const path = resolve(TOOLS_DIR, file);
  const src = read(path);

  // Extract tool name: either `name: "literal"` or `name: IDENT` where
  // IDENT is a `const IDENT = "literal"` in the same file.
  let toolName = null;
  const literal = src.match(/name:\s*["'`]([a-z0-9_\-]+)["'`]/i);
  if (literal) {
    toolName = literal[1];
  } else {
    const ident = src.match(/name:\s*([A-Za-z_][A-Za-z0-9_]*)\s*,/);
    if (ident) {
      const decl = new RegExp(
        `\\b(?:const|let|var)\\s+${ident[1]}\\s*(?::[^=]+)?=\\s*["'\`]([a-z0-9_\\-]+)["'\`]`,
        "i",
      ).exec(src);
      if (decl) toolName = decl[1];
    }
  }
  if (!toolName) {
    errors.push(`${file}: could not resolve tool name from \`name:\` field`);
    continue;
  }

  if (!/guardToolAccess\s*\(/.test(src)) {
    errors.push(`${file} (${toolName}): handler does not call guardToolAccess()`);
  }

  // Registered in the MCP entry (import + tools array).
  const importedInIndex =
    indexSrc.includes(`./tools/${file.replace(/\.ts$/, "")}`) ||
    indexSrc.includes(`./tools/${file}`);
  if (!importedInIndex) {
    errors.push(`${file} (${toolName}): not imported by src/lib/mcp/index.ts`);
  }

  // Listed in PUBLIC_TOOL_ALLOWLIST.
  if (!new RegExp(`\\b${toolName}\\b\\s*:\\s*\\{`).test(allowlistSrc)) {
    errors.push(
      `${toolName}: missing entry in PUBLIC_TOOL_ALLOWLIST ` +
        `(src/lib/mcp/public-allowlist.ts). If this tool must NOT be public, ` +
        `add it to the allowlist with fields: [] AND document the auth ` +
        `requirement in PUBLIC_ACCESS.md.`,
    );
  }

  // Mentioned in the docs checklist.
  if (!docSrc.includes(toolName)) {
    errors.push(
      `${toolName}: not documented in src/lib/mcp/PUBLIC_ACCESS.md`,
    );
  }
}

if (errors.length > 0) {
  console.error("MCP allowlist / docs check failed:\n");
  for (const e of errors) console.error(`  - ${e}`);
  console.error(
    "\nSee src/lib/mcp/PUBLIC_ACCESS.md → 'Adding a new tool' for the full checklist.",
  );
  process.exit(1);
}

console.log(`OK — ${toolFiles.length} MCP tool(s) allowlisted and documented.`);
