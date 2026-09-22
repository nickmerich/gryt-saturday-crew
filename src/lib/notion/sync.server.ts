// Server-only RSVP projection. Never marks a person as having attended.
import type { RunOccurrence } from "../run-occurrence";
import { normalizeContact, normalizeName } from "../attendance/schema";

const GATEWAY = "https://connector-gateway.lovable.dev/notion/v1";
export const MEMBERS_DS = "f3c86187-3e92-4d3b-8bf8-66f1cc42ae6e";
export const ATTENDANCE_DS = "fcf88884-1c65-4949-93da-c7112da180a3";

export class NotionSyncError extends Error {
  constructor(
    message: string,
    public needsReview: boolean,
  ) {
    super(message);
  }
}
type NotionPage = {
  id: string;
  properties?: { Name?: { title?: Array<{ plain_text?: string; text?: { content?: string } }> } };
};
type NotionResult = NotionPage & { results?: NotionPage[]; has_more?: boolean };

async function notionFetch(path: string, body: unknown, creates = false): Promise<NotionResult> {
  if (!process.env.LOVABLE_API_KEY || !process.env.NOTION_API_KEY)
    throw new NotionSyncError("Notion configuration missing.", false);
  let response: Response;
  try {
    response = await fetch(`${GATEWAY}${path}`, {
      method: "POST",
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": process.env.NOTION_API_KEY,
        "Notion-Version": "2025-09-03",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new NotionSyncError(
      creates
        ? "Notion write result uncertain. Verify the destination before replay."
        : "Notion query unavailable.",
      creates,
    );
  }
  if (!response.ok) {
    throw new NotionSyncError(
      `Notion request rejected (${response.status}).`,
      response.status !== 429 && (creates || response.status < 500),
    );
  }
  try {
    return (await response.json()) as NotionResult;
  } catch {
    throw new NotionSyncError(
      "Notion response unreadable; check destination before retry.",
      creates,
    );
  }
}

export interface RsvpSyncInput {
  rsvpId: string;
  name: string;
  contact: string;
  source: string | null;
  event: RunOccurrence;
  memberPageId?: string | null;
  attendancePageId?: string | null;
}
export async function syncRsvpToNotion(
  input: RsvpSyncInput,
  checkpoint: (fields: {
    notion_member_page_id?: string;
    notion_attendance_page_id?: string;
  }) => Promise<void>,
  request = notionFetch,
): Promise<{ memberPageId: string; attendancePageId: string }> {
  let memberPageId = input.memberPageId ?? null;
  const contact = normalizeContact(input.contact);
  if (!contact || contact.kind !== "email")
    throw new NotionSyncError(
      "Contact needs manual identity review. No name-only merge performed.",
      true,
    );
  if (!memberPageId) {
    const matches = await request(`/data_sources/${MEMBERS_DS}/query`, {
      filter: { property: "Email", email: { equals: contact.value } },
      page_size: 2,
    });
    if ((matches.results?.length ?? 0) > 1 || matches.has_more)
      throw new NotionSyncError("Multiple contact matches. Review identity before syncing.", true);
    const candidate = matches.results?.[0];
    if (candidate) {
      const title =
        candidate.properties?.Name?.title
          ?.map((p) => p.plain_text ?? p.text?.content ?? "")
          .join("") ?? "";
      if (normalizeName(title) !== normalizeName(input.name))
        throw new NotionSyncError(
          "Shared or changed contact/name. Review identity before merging.",
          true,
        );
      memberPageId = candidate.id;
    } else {
      const created = await request(
        "/pages",
        {
          parent: { type: "data_source_id", data_source_id: MEMBERS_DS },
          properties: {
            Name: { title: [{ text: { content: input.name } }] },
            Email: { email: contact.value },
            // Avoid assigning any attendance-derived lifecycle state at signup.
            "Outreach Status": { select: { name: "Invited" } },
            Notes: {
              rich_text: [
                {
                  text: {
                    content: `Website RSVP only; attendance unverified. GRYT capture ${input.rsvpId}`,
                  },
                },
              ],
            },
          },
        },
        true,
      );
      memberPageId = created.id;
    }
    if (!memberPageId) throw new NotionSyncError("Notion member ID missing after write.", true);
    try {
      await checkpoint({ notion_member_page_id: memberPageId });
    } catch {
      throw new NotionSyncError("Member link checkpoint failed. Verify before replay.", true);
    }
  }
  let attendancePageId = input.attendancePageId ?? null;
  if (!attendancePageId) {
    const label = `${input.name} · ${input.event.label} [GRYT:${input.rsvpId}]`;
    const existing = await request(`/data_sources/${ATTENDANCE_DS}/query`, {
      filter: { property: "Label", title: { equals: label } },
      page_size: 2,
    });
    if ((existing.results?.length ?? 0) > 1 || existing.has_more)
      throw new NotionSyncError("Duplicate projection requires review.", true);
    attendancePageId = existing.results?.[0]?.id ?? null;
    if (!attendancePageId) {
      const created = await request(
        "/pages",
        {
          parent: { type: "data_source_id", data_source_id: ATTENDANCE_DS },
          properties: {
            Label: { title: [{ text: { content: label } }] },
            Member: { relation: [{ id: memberPageId }] },
            "Attendance Status": { select: { name: "RSVP" } },
            Source: { select: { name: "Website RSVP" } },
            Location: { rich_text: [{ text: { content: input.event.location } }] },
            Route: { rich_text: [{ text: { content: input.event.route } }] },
            "Run Number": { number: input.event.number },
            "Run Date": { date: { start: input.event.localDate } },
          },
        },
        true,
      );
      attendancePageId = created.id;
    }
    if (!attendancePageId) throw new NotionSyncError("Notion RSVP ID missing after write.", true);
    try {
      await checkpoint({ notion_attendance_page_id: attendancePageId });
    } catch {
      throw new NotionSyncError("RSVP link checkpoint failed. Verify before replay.", true);
    }
  }
  return { memberPageId, attendancePageId };
}
