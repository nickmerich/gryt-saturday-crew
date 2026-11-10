import bearAsset from "@/assets/brand/gryt-bear-layered.svg.asset.json";
// Lossless WebP re-encode of the uploaded wordmark (src/assets/brand/gryt-wordmark-layered.png.asset.json):
// same 690x376 pixels, decoded byte-for-byte identical, 3.8 KB instead of 17.7 KB.
// `?no-inline` keeps it a hashed, long-cached file instead of a data URI repeated in every page's HTML.
import wordmarkUrl from "@/assets/img/gryt-wordmark-layered.webp?no-inline";

export function GrytBear({ className = "" }: { className?: string }) {
  return <img src={bearAsset.url} alt="GRYT Club layered bear logo" width={124} height={124} className={`gryt-brand-mark object-contain shrink-0 ${className}`} />;
}

export function GrytWordmark({ className = "" }: { className?: string }) {
  return <img src={wordmarkUrl} alt="gryt" width={690} height={376} decoding="async" className={`gryt-brand-mark object-contain shrink-0 ${className}`} />;
}

export function GrytBrand({ size = "nav" }: { size?: "nav" | "footer" }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 sm:gap-2" role="img" aria-label="GRYT Run Club">
      <img src={bearAsset.url} alt="" width={124} height={124} className={`gryt-brand-mark object-contain shrink-0 ${size === "footer" ? "h-16 w-16" : "h-8 w-8 sm:h-11 sm:w-11"}`} />
      <img src={wordmarkUrl} alt="" width={690} height={376} decoding="async" className={`gryt-brand-mark object-contain shrink-0 ${size === "footer" ? "h-auto w-32" : "h-auto w-16 sm:w-20"}`} />
    </span>
  );
}
