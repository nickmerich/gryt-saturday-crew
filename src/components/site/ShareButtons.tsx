import { useEffect, useState } from "react";

type Props = {
  url: string;
  title: string;
  className?: string;
};

/** Blog post social sharing row — GRYT black / blue / bone styling. */
export function ShareButtons({ url, title, className = "" }: Props) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const e = encodeURIComponent;
  const links = [
    { label: "X", href: `https://twitter.com/intent/tweet?text=${e(title)}&url=${e(url)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}` },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`,
    },
    { label: "Reddit", href: `https://www.reddit.com/submit?url=${e(url)}&title=${e(title)}` },
    { label: "Email", href: `mailto:?subject=${e(title)}&body=${e(url)}` },
  ];

  const btn =
    "inline-flex items-center h-10 px-4 text-[11px] font-bold uppercase tracking-[0.14em] border border-foreground/25 text-foreground/80 hover:border-blue hover:text-foreground/70 transition-colors";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt("Copy this link", url);
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      /* dismissed */
    }
  };

  return (
    <div className={`mt-14 border-t border-foreground/15 pt-6 ${className}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/70 mb-3">
        Share this
      </p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className={btn}
            aria-label={`Share on ${l.label}`}
          >
            {l.label}
          </a>
        ))}
        <button type="button" onClick={copyLink} className={btn}>
          {copied ? "Link copied" : "Copy link"}
        </button>
        {canNativeShare && (
          <button type="button" onClick={nativeShare} className={btn}>
            Share…
          </button>
        )}
      </div>
      <p aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </p>
    </div>
  );
}
