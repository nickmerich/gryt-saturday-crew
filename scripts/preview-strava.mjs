// Isolated review server: no production DB, analytics, payments or outbound writes.
import { createServer } from "vite";
import { readFile } from "node:fs/promises";
const localEnv = await readFile(".env.local", "utf8");
for (const key of ["SUPABASE_URL", "VITE_SUPABASE_URL"]) {
  if (!localEnv.includes(`${key}=https://local-qa-disabled.invalid`)) {
    throw new Error("Isolated preview requires the documented disabled local backend.");
  }
}
process.env.STRAVA_CLIENT_ID = "";
process.env.STRAVA_CLIENT_SECRET = "";
process.env.SUPABASE_SERVICE_ROLE_KEY = "";
const server = await createServer({
  server: {
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: true,
    hmr: false,
    proxy: {
      "/__l5e/assets-v1": { target: "https://grytrunclub.com", changeOrigin: true },
    },
  },
  plugins: [
    {
      name: "isolated-strava-review",
      configureServer(vite) {
        vite.middlewares.use((req, res, next) => {
          res.setHeader(
            "Content-Security-Policy",
            [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://strava-embeds.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self' ws:",
              "frame-src https://www.strava.com https://strava-embeds.com",
              "form-action 'none'",
              "object-src 'none'",
            ].join("; "),
          );
          if (!["GET", "HEAD"].includes(req.method || "")) {
            res.writeHead(403, { "Content-Type": "application/json" });
            res.end('{"error":"Writes are disabled in this isolated review preview."}');
            return;
          }
          next();
        });
      },
    },
  ],
});
await server.listen();
server.printUrls();
