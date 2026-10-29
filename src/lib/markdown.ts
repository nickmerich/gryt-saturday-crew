/**
 * Tiny markdown renderer for the runner articles in src/content/articles.
 * Supports: ## / ### headings, paragraphs, - and 1. lists, pipe tables,
 * **bold**, *italic*, `code`, and [links](url). Output is escaped HTML.
 */

export type Frontmatter = Record<string, string>;

export function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  const data: Frontmatter = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].replace(/\s+#.*$/, "").trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1).replace(/\\"/g, '"');
    }
    data[kv[1]] = v;
  }
  return { data, body: m[2] };
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function slugifyHeading(s: string) {
  return s
    .toLowerCase()
    .replace(/[*_`[\]()]/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function inline(src: string): string {
  // Pull out links first so their URLs are not touched by emphasis rules.
  const links: string[] = [];
  let s = src.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, href: string) => {
    const safe = /^(https?:\/\/|\/|#|mailto:)/i.test(href) ? href : "#";
    const external = /^https?:\/\//i.test(safe) && !/^https?:\/\/(www\.)?grytrunclub\.com/i.test(safe);
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
    links.push(`<a href="${esc(safe)}"${attrs}>${emph(esc(text))}</a>`);
    return `\u0000${links.length - 1}\u0000`;
  });
  s = emph(esc(s));
  return s.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => links[Number(i)]);
}

function emph(s: string) {
  return s
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*\w])\*([^*\n]+)\*(?!\w)/g, "$1<em>$2</em>");
}

function cells(row: string) {
  return row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

export type Heading = { id: string; text: string; level: 2 | 3 };

export function renderMarkdown(md: string): { html: string; headings: Heading[]; words: number } {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  const headings: Heading[] = [];
  const used = new Set<string>();
  let para: string[] = [];
  let i = 0;

  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
    para = [];
  };

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    if (!t) {
      flush();
      i++;
      continue;
    }

    const h = t.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flush();
      const level = h[1].length <= 2 ? 2 : 3;
      const text = h[2].replace(/\s*#+\s*$/, "");
      let id = slugifyHeading(text) || `section-${headings.length + 1}`;
      while (used.has(id)) id += "-2";
      used.add(id);
      headings.push({ id, text: text.replace(/\*\*/g, ""), level: level as 2 | 3 });
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    if (/^\|.*\|$/.test(t) && i + 1 < lines.length && /^\|?\s*:?-{2,}/.test(lines[i + 1].trim())) {
      flush();
      const head = cells(t);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) {
        rows.push(cells(lines[i]));
        i++;
      }
      out.push(
        `<div class="md-table"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${rows
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table></div>`,
      );
      continue;
    }

    const ul = t.match(/^[-*+]\s+(.*)$/);
    const ol = t.match(/^\d+[.)]\s+(.*)$/);
    if (ul || ol) {
      flush();
      const tag = ul ? "ul" : "ol";
      const re = ul ? /^[-*+]\s+(.*)$/ : /^\d+[.)]\s+(.*)$/;
      const items: string[] = [];
      while (i < lines.length) {
        const lt = lines[i].trim();
        const m = lt.match(re);
        if (m) {
          items.push(m[1]);
          i++;
        } else if (lt && /^\s{2,}/.test(lines[i]) && items.length) {
          items[items.length - 1] += " " + lt.replace(/^[-*+]\s+/, "");
          i++;
        } else break;
      }
      out.push(`<${tag}>${items.map((x) => `<li>${inline(x)}</li>`).join("")}</${tag}>`);
      continue;
    }

    if (t.startsWith(">")) {
      flush();
      const q: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        q.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      out.push(`<blockquote><p>${inline(q.join(" "))}</p></blockquote>`);
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(t)) {
      flush();
      out.push("<hr />");
      i++;
      continue;
    }

    para.push(t);
    i++;
  }
  flush();

  const words = md.replace(/[#*|\-[\]()]/g, " ").split(/\s+/).filter(Boolean).length;
  return { html: out.join("\n"), headings, words };
}
