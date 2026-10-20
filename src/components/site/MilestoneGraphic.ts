// Draws a 1080x1350 milestone graphic on a canvas and returns a PNG data URL.
// Brand: black ground, GRYT blue, condensed display type, visible URL.

const W = 1080;
const H = 1350;

export async function renderMilestoneGraphic(opts: {
  firstName: string;
  saturdays: number;
  /** Highest milestone earned, or null to draw progress toward the next one. */
  milestone: number | null;
  next: number | null;
}): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  try {
    await Promise.all([
      document.fonts.load('700 360px "Oswald"'),
      document.fonts.load('600 48px "Space Grotesk"'),
    ]);
  } catch {
    /* fall back to system fonts */
  }
  const blue = getComputedStyle(document.documentElement).getPropertyValue("--blue").trim() || "#8ecfee";
  const display = '"Oswald", "Arial Narrow", sans-serif';
  const body = '"Space Grotesk", "Inter", system-ui, sans-serif';

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  // Frame
  ctx.strokeStyle = blue;
  ctx.lineWidth = 6;
  ctx.strokeRect(48, 48, W - 96, H - 96);

  ctx.fillStyle = blue;
  ctx.font = `600 34px ${body}`;
  ctx.textBaseline = "top";
  ctx.fillText("GRYT RUN CLUB · MILESTONE CLUB", 96, 104);

  const big = String(opts.milestone ?? opts.saturdays);
  ctx.fillStyle = "#fff";
  ctx.font = `700 ${big.length >= 3 ? 400 : 520}px ${display}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(big, 84, 720);

  ctx.font = `700 120px ${display}`;
  ctx.fillText("SATURDAYS", 96, 860);

  ctx.fillStyle = blue;
  ctx.font = `600 52px ${body}`;
  const name = opts.firstName.trim().slice(0, 24);
  const line = opts.milestone
    ? `${name} joined The ${opts.milestone} Club.`
    : `${name} is ${opts.next! - opts.saturdays} away from The ${opts.next} Club.`;
  ctx.fillText(line, 96, 960);

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = `500 40px ${body}`;
  ctx.fillText("Persistence over pace. Every walk, run,", 96, 1060);
  ctx.fillText("and sweep counts.", 96, 1112);

  ctx.fillStyle = "#fff";
  ctx.font = `600 36px ${body}`;
  ctx.fillText("Saturdays 7 AM · Peterswood Park, McMurray", 96, 1206);
  ctx.fillStyle = blue;
  ctx.fillText("grytrunclub.com/milestones", 96, 1252);

  return canvas.toDataURL("image/png");
}
