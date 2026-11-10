import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { extractFaqs, parseFrontmatter } from "../src/lib/markdown";

// extractFaqs feeds the FAQPage JSON-LD on every article, so the structured
// data has to match the visible FAQ section exactly.

describe("extractFaqs", () => {
  test("reads bold questions with the answer on the next line", () => {
    const md = [
      "Intro paragraph.",
      "",
      "## FAQs",
      "",
      "**Is it free?**",
      "Yes. There's **no membership**, and [the FAQ](/faq) has more.",
      "",
      "**Can I walk?**",
      "Yes. Walking counts.",
      "",
      "A closing line that is not an answer.",
    ].join("\n");
    expect(extractFaqs(md)).toEqual([
      { q: "Is it free?", a: "Yes. There's no membership, and the FAQ has more." },
      { q: "Can I walk?", a: "Yes. Walking counts." },
    ]);
  });

  test("reads h3 questions and stops at the next h2", () => {
    const md = [
      "## Frequently Asked Questions",
      "",
      "### How far is the run?",
      "",
      "About 4 miles out and back.",
      "",
      "### Do I need to be fast?",
      "",
      "No. The run is no-drop.",
      "",
      "A closing paragraph under the last question.",
      "",
      "## Conclusion",
      "",
      "**Is this part of the FAQ?**",
      "No.",
    ].join("\n");
    expect(extractFaqs(md)).toEqual([
      { q: "How far is the run?", a: "About 4 miles out and back." },
      { q: "Do I need to be fast?", a: "No. The run is no-drop." },
    ]);
  });

  test("returns nothing when there is no FAQ section", () => {
    expect(
      extractFaqs("## Why Run\n\n**Is this a question?**\nIt is not in an FAQ section."),
    ).toEqual([]);
  });

  test("every published article yields clean question and answer pairs", () => {
    const dir = resolve(import.meta.dir, "../src/content/articles");
    const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const { body } = parseFrontmatter(readFileSync(resolve(dir, file), "utf8"));
      const faqs = extractFaqs(body);
      expect({ file, count: faqs.length >= 3 }).toEqual({ file, count: true });
      for (const { q, a } of faqs) {
        expect({ file, q, endsWithQuestionMark: q.endsWith("?") }).toEqual({
          file,
          q,
          endsWithQuestionMark: true,
        });
        // No leftover markdown, list, or table syntax in structured data.
        expect({ file, q, clean: !/\*\*|\]\(|^[-|>]/.test(a) && !/\*\*|\]\(/.test(q) }).toEqual({
          file,
          q,
          clean: true,
        });
        expect({ file, q, hasAnswer: a.length >= 20 }).toEqual({ file, q, hasAnswer: true });
      }
    }
  });
});
