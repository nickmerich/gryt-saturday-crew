export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <head>
  <HeadContent />
  <script async src={`https://www.googletagmanager.com/gtag/js?id=G-P32BTLV84G`} />
  <script>{`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-P32BTLV84G');
  `}</script>
</head>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
