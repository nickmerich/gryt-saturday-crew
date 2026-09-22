// Canvas rendering for GRYT recap graphics.
// Pure drawing helpers — no React, no server imports.

export const CANVAS_W = 1080;
export const CANVAS_H = 1350; // 4:5 portrait

export type ThemeId = "classic" | "race" | "long" | "club" | "aura";

export type RecapForm = {
  title: string;
  date: string;
  location: string;
  distance: string;
  time: string;
  pace: string;
  athlete: string;
  note: string;
  auraUser: string;
};

export type PhotoTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
};

export const DEFAULT_TRANSFORM: PhotoTransform = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
};

export const THEMES: Array<{
  id: ThemeId;
  label: string;
  blurb: string;
  accent: string;
  kicker: string;
}> = [
  { id: "classic", label: "Classic recap", blurb: "Photo + splits", accent: "#89CFF0", kicker: "RECAP" },
  { id: "race", label: "Race result", blurb: "Result-first", accent: "#FFD166", kicker: "RACE" },
  { id: "long", label: "Long run", blurb: "Distance hero", accent: "#7CE0B4", kicker: "LONG RUN" },
  { id: "club", label: "Club day", blurb: "Crew energy", accent: "#89CFF0", kicker: "CLUB DAY" },
  { id: "aura", label: "Aura", blurb: "Effort glow", accent: "#C08BFF", kicker: "AURA" },
];

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, px: number) {
  try {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${px}px`;
  } catch {
    /* noop */
  }
}
function resetLetterSpacing(ctx: CanvasRenderingContext2D) {
  setLetterSpacing(ctx, 0);
}

function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  basePx: number,
  align: CanvasTextAlign = "left",
) {
  ctx.textAlign = align;
  let size = basePx;
  ctx.font = `700 ${size}px 'Oswald', 'Arial Narrow', Impact, sans-serif`;
  while (ctx.measureText(text).width > maxW && size > 22) {
    size -= 2;
    ctx.font = `700 ${size}px 'Oswald', 'Arial Narrow', Impact, sans-serif`;
  }
  ctx.fillText(text, x, y);
}

function drawGrytMark(ctx: CanvasRenderingContext2D, x: number, y: number, accent: string, size = 92) {
  ctx.font = `700 ${size}px 'Space Grotesk', system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = accent;
  ctx.fillText("gryt", x + 4, y + 5);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("gryt", x, y);
}

export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  transform: PhotoTransform = DEFAULT_TRANSFORM,
) {
  const scale = Math.max(0.1, transform.scale);
  const rot = (transform.rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rot));
  const sin = Math.abs(Math.sin(rot));
  const dw = w * cos + h * sin;
  const dh = w * sin + h * cos;

  const ir = img.width / img.height;
  const tr = dw / dh;
  let sw: number, sh: number;
  if (ir > tr) {
    sh = img.height / scale;
    sw = (img.height * tr) / scale;
  } else {
    sw = img.width / scale;
    sh = img.width / tr / scale;
  }
  const maxOffX = (img.width - sw) / 2;
  const maxOffY = (img.height - sh) / 2;
  const sx = clamp((img.width - sw) / 2 + transform.offsetX * maxOffX, 0, Math.max(0, img.width - sw));
  const sy = clamp((img.height - sh) / 2 + transform.offsetY * maxOffY, 0, Math.max(0, img.height - sh));

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.drawImage(img, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}

/** Effort 0..1 derived from pace (faster = hotter aura). */
export function effortFromPace(pace: string): number {
  const m = /^(\d+):(\d{1,2})$/.exec(pace.trim());
  if (!m) return 0.5;
  const sec = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  // 6:00/mi -> 1, 12:00/mi -> 0
  return clamp((720 - sec) / 360, 0, 1);
}

function auraColors(effort: number): [string, string, string] {
  if (effort > 0.66) return ["#FF5E3A", "#FF2D95", "#7A18FF"];
  if (effort > 0.33) return ["#C08BFF", "#5B8CFF", "#18C8FF"];
  return ["#7CE0B4", "#4FA8FF", "#8B5CF6"];
}

export function drawRecap(
  canvas: HTMLCanvasElement,
  form: RecapForm,
  photo: HTMLImageElement | null,
  transform: PhotoTransform = DEFAULT_TRANSFORM,
  themeId: ThemeId = "classic",
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  if (themeId === "aura") {
    drawAura(ctx, canvas, form, photo, transform);
    return;
  }
  drawStandard(ctx, canvas, form, photo, transform, themeId);
}

function drawStandard(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  form: RecapForm,
  photo: HTMLImageElement | null,
  transform: PhotoTransform,
  themeId: ThemeId,
) {
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const accent = theme.accent;
  const W = canvas.width;
  const H = canvas.height;

  const photoRatio = themeId === "race" ? 0.56 : themeId === "long" ? 0.6 : 0.68;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, H);

  const photoArea = { x: 0, y: 0, w: W, h: Math.floor(H * photoRatio) };
  if (photo) {
    drawCover(ctx, photo, photoArea.x, photoArea.y, photoArea.w, photoArea.h, transform);
    const grad = ctx.createLinearGradient(0, photoArea.h * 0.4, 0, photoArea.h);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.85)");
    ctx.fillStyle = grad;
    ctx.fillRect(photoArea.x, photoArea.y, photoArea.w, photoArea.h);
  } else {
    ctx.fillStyle = "#0c0c0e";
    ctx.fillRect(photoArea.x, photoArea.y, photoArea.w, photoArea.h);
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    for (let i = -photoArea.h; i < photoArea.w; i += 28) {
      ctx.beginPath();
      ctx.moveTo(i, photoArea.h);
      ctx.lineTo(i + photoArea.h, 0);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Diagonal slash motif
  ctx.save();
  ctx.translate(W * 0.72, photoArea.h * 0.17);
  ctx.rotate((-12 * Math.PI) / 180);
  ctx.fillStyle = accent;
  ctx.fillRect(-220, -8, 440, 16);
  ctx.restore();

  const PAD = 56;
  ctx.fillStyle = accent;
  ctx.font = "700 22px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  setLetterSpacing(ctx, 4);
  ctx.fillText("GRYT RUN CLUB", PAD, PAD);
  ctx.textAlign = "right";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(theme.kicker, W - PAD, PAD);
  resetLetterSpacing(ctx);

  const titleY = photoArea.h - 40;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#FFFFFF";
  drawFittedText(ctx, form.title || " ", PAD, titleY, W - PAD * 2, 96);

  ctx.fillStyle = accent;
  ctx.font = "700 24px Inter, system-ui, sans-serif";
  setLetterSpacing(ctx, 3);
  const meta = [form.date, form.location].filter(Boolean).join("  ·  ");
  ctx.fillText(meta, PAD, titleY - 110);
  resetLetterSpacing(ctx);

  const panelY = photoArea.h;
  const panelH = H - panelY;

  ctx.fillStyle = accent;
  ctx.fillRect(0, panelY, W, 6);

  const stats: Array<{ label: string; value: string }> = [
    { label: "DISTANCE", value: form.distance ? `${form.distance} MI` : "N/A" },
    { label: "TIME", value: form.time || "N/A" },
    { label: "PACE", value: form.pace ? `${form.pace}/MI` : "N/A" },
  ];
  // Theme-specific emphasis order
  if (themeId === "race") stats.unshift(stats.splice(1, 1)[0]);
  if (themeId === "long") stats.unshift(stats.splice(0, 1)[0]);

  const statTop = panelY + (themeId === "race" ? 90 : 70);
  const colW = W / 3;
  stats.forEach((s, i) => {
    const cx = colW * i + colW / 2;
    ctx.fillStyle = accent;
    ctx.font = "700 20px Inter, system-ui, sans-serif";
    setLetterSpacing(ctx, 3);
    ctx.textAlign = "center";
    ctx.fillText(s.label, cx, statTop);
    resetLetterSpacing(ctx);

    ctx.fillStyle = "#FFFFFF";
    drawFittedText(ctx, s.value, cx, statTop + 90, colW - 40, i === 0 && themeId !== "classic" ? 92 : 78, "center");

    if (i < stats.length - 1) {
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(colW * (i + 1) - 1, statTop - 10, 2, 120);
    }
  });

  const footY = H - 56;
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 22px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(form.athlete || " ", PAD, footY);

  ctx.fillStyle = accent;
  ctx.font = "700 20px Inter, system-ui, sans-serif";
  setLetterSpacing(ctx, 3);
  ctx.textAlign = "right";
  ctx.fillText(form.note || " ", W - PAD, footY);
  resetLetterSpacing(ctx);

  drawGrytMark(ctx, PAD, panelY + panelH - 130, accent);
}

function drawAura(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  form: RecapForm,
  photo: HTMLImageElement | null,
  transform: PhotoTransform,
) {
  const W = canvas.width;
  const H = canvas.height;
  const PAD = 72;
  const effort = effortFromPace(form.pace);
  const [c1, c2, c3] = auraColors(effort);

  ctx.fillStyle = "#050507";
  ctx.fillRect(0, 0, W, H);

  if (photo) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    drawCover(ctx, photo, 0, 0, W, H, transform);
    ctx.restore();
    ctx.fillStyle = "rgba(5,5,7,0.45)";
    ctx.fillRect(0, 0, W, H);
  }

  // Aura orbs
  const orbs: Array<[number, number, number, string]> = [
    [W * 0.5, H * 0.42, W * 0.62, c1],
    [W * 0.26, H * 0.28, W * 0.46, c2],
    [W * 0.78, H * 0.6, W * 0.5, c3],
  ];
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  orbs.forEach(([x, y, r, color]) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, hexA(color, 0.85));
    g.addColorStop(0.45, hexA(color, 0.35));
    g.addColorStop(1, hexA(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // Grain-ish vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.78);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.72)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  // Header
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 22px Inter, system-ui, sans-serif";
  setLetterSpacing(ctx, 4);
  ctx.fillText("GRYT RUN CLUB", PAD, PAD);
  ctx.textAlign = "right";
  ctx.fillStyle = hexA("#FFFFFF", 0.75);
  ctx.fillText("AURA", W - PAD, PAD);
  resetLetterSpacing(ctx);

  // Identity
  const handle = form.auraUser?.trim() || form.athlete?.trim() || "";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#FFFFFF";
  drawFittedText(ctx, (handle || " ").toUpperCase(), W / 2, H * 0.5, W - PAD * 2, 104, "center");

  ctx.fillStyle = hexA("#FFFFFF", 0.8);
  ctx.font = "700 24px Inter, system-ui, sans-serif";
  setLetterSpacing(ctx, 4);
  const sub = [form.date, form.location].filter(Boolean).join("  ·  ");
  ctx.fillText(sub.toUpperCase(), W / 2, H * 0.5 + 52);
  resetLetterSpacing(ctx);

  // Effort meter
  const barW = W - PAD * 2;
  const barY = H * 0.585;
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fillRect(PAD, barY, barW, 8);
  const fg = ctx.createLinearGradient(PAD, 0, PAD + barW, 0);
  fg.addColorStop(0, c3);
  fg.addColorStop(1, c1);
  ctx.fillStyle = fg;
  ctx.fillRect(PAD, barY, Math.max(24, barW * effort), 8);
  ctx.fillStyle = hexA("#FFFFFF", 0.75);
  ctx.font = "700 18px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  setLetterSpacing(ctx, 4);
  ctx.fillText("EFFORT", PAD, barY + 26);
  ctx.textAlign = "right";
  ctx.fillText(`${Math.round(effort * 100)}`, W - PAD, barY + 26);
  resetLetterSpacing(ctx);

  // Stats row
  const stats = [
    { label: "DISTANCE", value: form.distance ? `${form.distance} MI` : "N/A" },
    { label: "TIME", value: form.time || "N/A" },
    { label: "PACE", value: form.pace ? `${form.pace}/MI` : "N/A" },
  ];
  const rowY = H * 0.71;
  const colW = (W - PAD * 2) / 3;
  stats.forEach((s, i) => {
    const cx = PAD + colW * i + colW / 2;
    ctx.textAlign = "center";
    ctx.fillStyle = hexA("#FFFFFF", 0.7);
    ctx.font = "700 18px Inter, system-ui, sans-serif";
    setLetterSpacing(ctx, 3);
    ctx.fillText(s.label, cx, rowY);
    resetLetterSpacing(ctx);
    ctx.fillStyle = "#FFFFFF";
    drawFittedText(ctx, s.value, cx, rowY + 74, colW - 24, 68, "center");
  });

  // Footer lockup
  drawGrytMark(ctx, PAD, H - PAD, "#FFFFFF", 76);
  ctx.textAlign = "right";
  ctx.fillStyle = hexA("#FFFFFF", 0.8);
  ctx.font = "700 20px Inter, system-ui, sans-serif";
  setLetterSpacing(ctx, 3);
  ctx.fillText((form.note || "DO HARD THINGS TOGETHER").toUpperCase(), W - PAD, H - PAD - 8);
  resetLetterSpacing(ctx);
}

function hexA(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ── formatting helpers ── */

export function pad2(n: number) {
  return n.toString().padStart(2, "0");
}
export function formatDuration(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(sec)}` : `${m}:${pad2(sec)}`;
}
export function formatPace(secPerMi: number): string {
  const s = Math.max(0, Math.round(secPerMi));
  return `${Math.floor(s / 60)}:${pad2(s % 60)}`;
}
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
export function formatDate(d: Date): string {
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS[d.getMonth()]} ${pad2(d.getDate())} · ${d.getFullYear()}`;
}
