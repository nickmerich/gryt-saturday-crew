import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().trim().email().max(255),
  source: z.string().trim().max(120).optional(),
  utm_source: z.string().trim().max(120).optional(),
  utm_medium: z.string().trim().max(120).optional(),
  utm_campaign: z.string().trim().max(120).optional(),
  referring_site: z.string().trim().max(500).optional(),
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

export const Route = createFileRoute("/api/newsletter/subscribe")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const apiKey = process.env.BEEHIIV_API_KEY;
        const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
        if (!apiKey || !publicationId) {
          console.error("Beehiiv credentials missing");
          return Response.json(
            { ok: false, error: "Newsletter is not configured" },
            { status: 500, headers: CORS },
          );
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json(
            { ok: false, error: "Invalid JSON" },
            { status: 400, headers: CORS },
          );
        }

        const parsed = bodySchema.safeParse(raw);
        if (!parsed.success) {
          return Response.json(
            { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
            { status: 400, headers: CORS },
          );
        }

        const { email, source, utm_source, utm_medium, utm_campaign, referring_site } =
          parsed.data;

        const res = await fetch(
          `https://api.beehiiv.com/v2/publications/${encodeURIComponent(publicationId)}/subscriptions`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              reactivate_existing: true,
              send_welcome_email: true,
              utm_source: utm_source ?? source ?? "grytrunclub.com",
              utm_medium: utm_medium ?? "website",
              utm_campaign: utm_campaign ?? "homepage_optin",
              referring_site: referring_site ?? "https://grytrunclub.com",
            }),
          },
        );

        const text = await res.text();
        if (!res.ok) {
          console.error(`Beehiiv subscribe failed [${res.status}]: ${text}`);
          return Response.json(
            { ok: false, error: "Subscription failed" },
            { status: 502, headers: CORS },
          );
        }

        return Response.json({ ok: true }, { status: 200, headers: CORS });
      },
    },
  },
});
