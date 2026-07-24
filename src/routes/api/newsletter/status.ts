import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const querySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

type StatusResult = {
  ok: true;
  found: boolean;
  status: "active" | "pending" | "inactive" | "unknown" | "none";
  verified: boolean;
  createdAt: string | null;
};

export const Route = createFileRoute("/api/newsletter/status")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        const apiKey = process.env.BEEHIIV_API_KEY;
        const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
        if (!apiKey || !publicationId) {
          return Response.json(
            { ok: false, error: "Newsletter is not configured" },
            { status: 500, headers: CORS },
          );
        }

        const url = new URL(request.url);
        const parsed = querySchema.safeParse({ email: url.searchParams.get("email") });
        if (!parsed.success) {
          return Response.json(
            { ok: false, error: "Enter a valid email address" },
            { status: 400, headers: CORS },
          );
        }

        const { email } = parsed.data;
        const res = await fetch(
          `https://api.beehiiv.com/v2/publications/${encodeURIComponent(publicationId)}/subscriptions/by_email/${encodeURIComponent(email)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (res.status === 404) {
          const body: StatusResult = {
            ok: true,
            found: false,
            status: "none",
            verified: false,
            createdAt: null,
          };
          return Response.json(body, { status: 200, headers: CORS });
        }

        if (!res.ok) {
          const text = await res.text();
          console.error(`Beehiiv status failed [${res.status}]: ${text}`);
          return Response.json(
            { ok: false, error: "Could not check status right now" },
            { status: 502, headers: CORS },
          );
        }

        const json = (await res.json()) as {
          data?: {
            status?: string;
            created?: number | string | null;
          };
        };
        const rawStatus = (json.data?.status ?? "unknown").toLowerCase();
        const status: StatusResult["status"] =
          rawStatus === "active"
            ? "active"
            : rawStatus === "pending" || rawStatus === "validating"
              ? "pending"
              : rawStatus === "inactive" || rawStatus === "unsubscribed"
                ? "inactive"
                : "unknown";

        let createdAt: string | null = null;
        const created = json.data?.created;
        if (typeof created === "number") {
          createdAt = new Date(created * 1000).toISOString();
        } else if (typeof created === "string" && created) {
          const d = new Date(created);
          if (!isNaN(d.getTime())) createdAt = d.toISOString();
        }

        const body: StatusResult = {
          ok: true,
          found: true,
          status,
          verified: status === "active",
          createdAt,
        };
        return Response.json(body, { status: 200, headers: CORS });
      },
    },
  },
});
