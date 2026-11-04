import bearAsset from "@/assets/brand/gryt-bear-layered.svg.asset.json";
import wordmarkAsset from "@/assets/brand/gryt-wordmark-layered.png.asset.json";

export function GrytBear({ className = "" }: { className?: string }) {
  return <img src={bearAsset.url} alt="GRYT Club layered bear logo" width={124} height={124} className={`object-contain shrink-0 ${className}`} />;
}

export function GrytWordmark({ className = "" }: { className?: string }) {
  return <img src={wordmarkAsset.url} alt="gryt" width={690} height={376} className={`object-contain shrink-0 ${className}`} />;
}

export function GrytBrand({ size = "nav" }: { size?: "nav" | "footer" }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 sm:gap-2" role="img" aria-label="GRYT Run Club">
      <img src={bearAsset.url} alt="" width={124} height={124} className={`object-contain shrink-0 ${size === "footer" ? "h-16 w-16" : "h-8 w-8 sm:h-11 sm:w-11"}`} />
      <img src={wordmarkAsset.url} alt="" width={690} height={376} className={`object-contain shrink-0 ${size === "footer" ? "h-auto w-32" : "h-auto w-16 sm:w-20"}`} />
    </span>
  );
}