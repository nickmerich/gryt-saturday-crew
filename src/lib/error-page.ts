export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Something went wrong</title>
    <style>
      html, body { margin: 0; padding: 0; height: 100%; background: #0a0a0a; color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .wrap { min-height: 100%; display: flex; align-items: center; justify-content: center; padding: 24px; }
      .card { max-width: 480px; text-align: center; }
      h1 { font-size: 20px; margin: 0 0 8px; }
      p { font-size: 14px; color: #a3a3a3; margin: 0 0 24px; }
      .actions { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
      button, a { font: inherit; font-size: 14px; padding: 8px 16px; border-radius: 6px; cursor: pointer; text-decoration: none; border: 1px solid #262626; }
      .primary { background: #fafafa; color: #0a0a0a; border-color: #fafafa; }
      .secondary { background: transparent; color: #fafafa; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <h1>This page didn't load</h1>
        <p>Something went wrong on our end. You can try refreshing or head back home.</p>
        <div class="actions">
          <button class="primary" onclick="location.reload()">Try again</button>
          <a class="secondary" href="/">Go home</a>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
