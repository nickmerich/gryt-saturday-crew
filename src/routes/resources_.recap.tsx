import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { toast } from "sonner";

export const Route = createFileRoute("/resources_/recap")({
  head: () => ({
    meta: [
      { title: "Recap Run Graphic Generator · gryt run club" },
      {
        name: "description",
        content:
          "Build your own GRYT-branded recap graphic for any run. Upload a photo, enter your splits, download a share-ready image.",
      },
      { property: "og:title", content: "Recap Run Graphic · gryt run club" },
      {
        property: "og:description",
        content:
          "Make a branded recap of your run in under a minute. Free from gryt run club.",
      },
    ],
  }),
  component: RecapGeneratorPage,
});

type FormState = {
  title: string;
  date: string;
  location: string;
  distance: string;
  time: string;
  pace: string;
  athlete: string;
  note: string;
};

const DEFAULTS: FormState = {
  title: "SATURDAY RUN",
  date: "JUN 21 · 2026",
  location: "PITTSBURGH, PA",
  distance: "6.2",
  time: "52:18",
  pace: "8:26",
  athlete: "@yourhandle",
  note: "DO HARD THINGS TOGETHER",
};

const PRESETS: Array<{ label: string; hint: string; values: FormState }> = [
  {
    label: "Saturday Long Run",
    hint: "Weekly crew miles",
    values: {
      title: "SATURDAY LONG RUN",
      date: "JUN 21 · 2026",
      location: "MONTOUR TRAIL · PGH",
      distance: "10.0",
      time: "1:24:30",
      pace: "8:27",
      athlete: "@yourhandle",
      note: "DO HARD THINGS TOGETHER",
    },
  },
  {
    label: "Race Day PR",
    hint: "Half marathon effort",
    values: {
      title: "PITTSBURGH HALF",
      date: "MAY 04 · 2026",
      location: "PITTSBURGH, PA",
      distance: "13.1",
      time: "1:42:11",
      pace: "7:48",
      athlete: "@yourhandle",
      note: "NEW PR · GRYT",
    },
  },
  {
    label: "Tuesday Tempo",
    hint: "Mid-week burner",
    values: {
      title: "TUESDAY TEMPO",
      date: "JUN 17 · 2026",
      location: "SOUTH HILLS LOOP",
      distance: "5.0",
      time: "37:45",
      pace: "7:33",
      athlete: "@yourhandle",
      note: "SHOWED UP · GRYT",
    },
  },
  {
    label: "First 5K",
    hint: "New runner win",
    values: {
      title: "FIRST 5K",
      date: "APR 12 · 2026",
      location: "PITTSBURGH, PA",
      distance: "3.1",
      time: "32:04",
      pace: "10:20",
      athlete: "@yourhandle",
      note: "DAY ONE · GRYT",
    },
  },
];

const CANVAS_W = 1080;
const CANVAS_H = 1350; // 4:5 portrait, IG-friendly

type PhotoTransform = { scale: number; offsetX: number; offsetY: number; rotation: number };
const DEFAULT_TRANSFORM: PhotoTransform = { scale: 1, offsetX: 0, offsetY: 0, rotation: 0 };

function RecapGeneratorPage() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoImg, setPhotoImg] = useState<HTMLImageElement | null>(null);
  const [transform, setTransform] = useState<PhotoTransform>(DEFAULT_TRANSFORM);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [savedFile, setSavedFile] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragState = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setActivePreset(null);
  }

  function applyPreset(p: (typeof PRESETS)[number]) {
    setForm(p.values);
    setActivePreset(p.label);
    setStatus("idle");
  }

  function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Please pick an image under 8MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    setTransform(DEFAULT_TRANSFORM);
  }

  function updateTransform(patch: Partial<PhotoTransform>) {
    setTransform((t) => ({ ...t, ...patch }));
  }

  // Load image whenever photoUrl changes
  useEffect(() => {
    if (!photoUrl) {
      setPhotoImg(null);
      return;
    }
    const img = new Image();
    img.onload = () => setPhotoImg(img);
    img.src = photoUrl;
    return () => {
      img.onload = null;
    };
  }, [photoUrl]);

  // Redraw whenever form, image, or transform changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawRecap(canvas, form, photoImg, transform);
  }, [form, photoImg, transform]);

  // Drag on canvas to reposition the photo
  function onCanvasPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!photoImg) return;
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    dragState.current = {
      x: e.clientX,
      y: e.clientY,
      ox: transform.offsetX,
      oy: transform.offsetY,
    };
  }
  function onCanvasPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const d = dragState.current;
    if (!d) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    // Normalize drag delta to canvas pixel space, then to -1..1 offset units
    const dx = ((e.clientX - d.x) / rect.width) * CANVAS_W;
    const dy = ((e.clientY - d.y) / rect.height) * CANVAS_H;
    const photoH = Math.floor(CANVAS_H * 0.68);
    updateTransform({
      offsetX: clamp(d.ox + dx / (CANVAS_W / 2), -1.5, 1.5),
      offsetY: clamp(d.oy + dy / (photoH / 2), -1.5, 1.5),
    });
  }
  function onCanvasPointerUp() {
    dragState.current = null;
  }


  // Auto-clear the "saved" confirmation
  useEffect(() => {
    if (status !== "saved") return;
    const t = setTimeout(() => setStatus("idle"), 5000);
    return () => clearTimeout(t);
  }, [status]);

  async function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!acceptedTerms) return;
    setStatus("saving");
    // Let the button state paint before we encode the PNG.
    await new Promise((r) => setTimeout(r, 350));
    try {
      const filename = `gryt-recap-${Date.now()}.png`;
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setSavedFile(filename);
      setStatus("saved");
      toast.success("Recap saved", {
        description: `${filename} · ${canvas.width}×${canvas.height} PNG`,
      });
    } catch {
      setStatus("idle");
      toast.error("Couldn't save your recap", {
        description: "Please try again.",
      });
    }
  }


  return (
    <main className="bg-ink text-paper">
      <SiteNav />

      <section className="px-6 sm:px-12 lg:px-24 pt-20 pb-10 border-b border-paper/15">
        <div className="max-w-[1180px] mx-auto">
          <p className="eyebrow text-blue mb-4">
            <Link to="/resources" className="hover:text-paper">
              ← Resources
            </Link>
          </p>
          <h1 className="display-condensed uppercase text-[clamp(44px,8vw,108px)] leading-[0.9]">
            Recap Run Graphic
          </h1>
          <p className="mt-6 text-paper/75 text-lg max-w-[640px] leading-[1.55]">
            Upload a photo, enter your splits, download a GRYT-branded recap.
            Share it anywhere. Free.
          </p>
        </div>
      </section>

      <section className="px-6 sm:px-12 lg:px-24 py-16 md:py-20">
        <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr,1.1fr] gap-10 lg:gap-16 items-start">
          {/* Form */}
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            <div>
              <p className="eyebrow text-blue mb-3">Start from an example</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Example runs">
                {PRESETS.map((p) => {
                  const active = activePreset === p.label;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p)}
                      aria-pressed={active}
                      title={p.hint}
                      className={`px-3.5 py-2 text-xs font-bold uppercase tracking-[0.14em] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ink ${
                        active
                          ? "border-blue bg-blue text-ink"
                          : "border-paper/30 text-paper/85 hover:border-blue hover:text-blue"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-paper/70">
                Tap one, then tweak. Your edits update the preview instantly.
              </p>
            </div>

            <div className="h-px bg-paper/15" aria-hidden="true" />

            <p className="eyebrow text-blue">RUN DETAILS</p>

            <PhotoPicker
              onChange={onPhoto}
              hasPhoto={!!photoUrl}
              onClear={() => {
                setPhotoUrl(null);
                setTransform(DEFAULT_TRANSFORM);
              }}
            />

            {photoUrl && (
              <PhotoControls
                transform={transform}
                onChange={updateTransform}
                onReset={() => setTransform(DEFAULT_TRANSFORM)}
              />
            )}


            <Grid2>
              <Field
                label="Title"
                value={form.title}
                onChange={(v) => update("title", v.toUpperCase())}
                maxLength={32}
                placeholder="SATURDAY RUN"
              />
              <Field
                label="Date"
                value={form.date}
                onChange={(v) => update("date", v.toUpperCase())}
                maxLength={32}
                placeholder="JUN 21 · 2026"
              />
            </Grid2>

            <Field
              label="Location"
              value={form.location}
              onChange={(v) => update("location", v.toUpperCase())}
              maxLength={48}
              placeholder="PITTSBURGH, PA"
            />

            <Grid3>
              <Field
                label="Distance (mi)"
                value={form.distance}
                onChange={(v) => update("distance", v)}
                maxLength={8}
                placeholder="6.2"
              />
              <Field
                label="Time"
                value={form.time}
                onChange={(v) => update("time", v)}
                maxLength={10}
                placeholder="52:18"
              />
              <Field
                label="Pace /mi"
                value={form.pace}
                onChange={(v) => update("pace", v)}
                maxLength={8}
                placeholder="8:26"
              />
            </Grid3>

            <Grid2>
              <Field
                label="Athlete / Handle"
                value={form.athlete}
                onChange={(v) => update("athlete", v)}
                maxLength={32}
                placeholder="@yourhandle"
              />
              <Field
                label="Footer tag"
                value={form.note}
                onChange={(v) => update("note", v.toUpperCase())}
                maxLength={40}
                placeholder="DO HARD THINGS TOGETHER"
              />
            </Grid2>

            <label className="flex items-start gap-3 pt-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
                aria-describedby="terms-desc"
              />
              <span id="terms-desc" className="text-xs leading-[1.55] text-paper/80 group-hover:text-paper transition-colors">
                I confirm I have the right to use this photo and I agree to the{" "}
                <Link to="/terms" target="_blank" className="text-blue underline hover:text-paper transition-colors">
                  GRYT terms &amp; conditions
                </Link>
                .
              </span>
            </label>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={download}
                disabled={status === "saving" || !acceptedTerms}
                aria-busy={status === "saving"}
                aria-disabled={!acceptedTerms}
                title={!acceptedTerms ? "Accept the terms to download" : undefined}
                className="btn-primary inline-flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {status === "saving" && (
                  <span
                    aria-hidden="true"
                    className="inline-block h-3.5 w-3.5 rounded-full border-2 border-current border-r-transparent animate-spin"
                  />
                )}
                {status === "saving"
                  ? "SAVING…"
                  : status === "saved"
                  ? "SAVED · DOWNLOAD AGAIN ↓"
                  : "DOWNLOAD PNG ↓"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(DEFAULTS);
                  setPhotoUrl(null);
                  setTransform(DEFAULT_TRANSFORM);
                  setActivePreset(null);
                  setStatus("idle");
                }}
                className="px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-paper/30 text-paper/85 hover:border-blue hover:text-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                Reset
              </button>
            </div>

            <div className="min-h-[64px]" aria-live="polite">
              {status === "saved" && (
                <div className="flex items-start gap-3 border border-blue/60 bg-blue/10 px-4 py-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue text-ink text-[11px] font-bold"
                  >
                    ✓
                  </span>
                  <div className="text-sm leading-[1.5]">
                    <p className="font-bold text-paper">Recap saved to your device.</p>
                    <p className="text-paper/70 text-xs mt-0.5 break-all">
                      {savedFile ?? "gryt-recap.png"} · Check your Downloads folder, then share it anywhere.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-paper/70 text-xs leading-[1.5]">
              Everything runs in your browser. Photos never upload anywhere.
              1080 × 1350px (Instagram-ready).
            </p>
          </div>

          {/* Preview */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-4 gap-3">
              <p className="eyebrow text-blue">LIVE PREVIEW</p>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-paper/70">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-blue animate-pulse" />
                Updates as you type
              </span>
            </div>
            <div className="relative bg-black border border-paper/15 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                onPointerDown={onCanvasPointerDown}
                onPointerMove={onCanvasPointerMove}
                onPointerUp={onCanvasPointerUp}
                onPointerCancel={onCanvasPointerUp}
                className={`block w-full h-auto ${photoImg ? "cursor-move touch-none" : ""}`}
                aria-label="Live preview of your recap graphic. This is exactly what will download. Drag to reposition the photo."
              />
              <div className="absolute top-3 left-3 bg-ink/85 backdrop-blur-sm border border-paper/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-paper">
                1080 × 1350 · PNG
              </div>
            </div>
            <p className="mt-3 text-xs text-paper/70 leading-[1.5]">
              What you see is what downloads — no processing step, no surprises.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

/* ───────────────────────  FORM CONTROLS  ───────────────────────── */

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{children}</div>;
}
function Grid3({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-3 gap-5">{children}</div>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-paper/55 block mb-2">{label}</span>
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-0 border-b-2 border-paper/20 text-paper placeholder:text-paper/30 pb-2 pt-1 text-base focus:outline-none focus:border-blue transition-colors"
      />
    </label>
  );
}

function PhotoPicker({
  onChange,
  hasPhoto,
  onClear,
}: {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  hasPhoto: boolean;
  onClear: () => void;
}) {
  return (
    <div>
      <span className="eyebrow text-paper/55 block mb-2">Photo</span>
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-paper/30 text-paper/85 hover:border-blue hover:text-blue cursor-pointer transition-colors">
          {hasPhoto ? "Replace photo" : "Upload photo"}
          <input
            type="file"
            accept="image/*"
            onChange={onChange}
            className="sr-only"
          />
        </label>
        {hasPhoto && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm text-paper/55 hover:text-paper underline underline-offset-2"
          >
            Remove
          </button>
        )}
        {!hasPhoto && (
          <span className="text-xs text-paper/45">
            Optional. JPG / PNG up to 8MB.
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────  CANVAS DRAW  ────────────────────────── */

function drawRecap(
  canvas: HTMLCanvasElement,
  form: FormState,
  photo: HTMLImageElement | null,
  transform: PhotoTransform = DEFAULT_TRANSFORM,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  // Background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, H);

  // Photo (covers top ~65%)
  const photoArea = { x: 0, y: 0, w: W, h: Math.floor(H * 0.68) };
  if (photo) {
    drawCover(ctx, photo, photoArea.x, photoArea.y, photoArea.w, photoArea.h, transform);
    // Darken bottom of photo for legibility
    const grad = ctx.createLinearGradient(
      0,
      photoArea.h * 0.4,
      0,
      photoArea.h,
    );
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.85)");
    ctx.fillStyle = grad;
    ctx.fillRect(photoArea.x, photoArea.y, photoArea.w, photoArea.h);
  } else {
    // Placeholder texture
    ctx.fillStyle = "#0c0c0e";
    ctx.fillRect(photoArea.x, photoArea.y, photoArea.w, photoArea.h);
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = "#89CFF0";
    ctx.lineWidth = 2;
    for (let i = -photoArea.h; i < photoArea.w; i += 28) {
      ctx.beginPath();
      ctx.moveTo(i, photoArea.h);
      ctx.lineTo(i + photoArea.h, 0);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "600 28px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("UPLOAD A PHOTO", W / 2, photoArea.h / 2);
  }

  // Diagonal blue slash motif over photo
  ctx.save();
  ctx.translate(W * 0.72, photoArea.h * 0.17);
  ctx.rotate((-12 * Math.PI) / 180);
  ctx.fillStyle = "#89CFF0";
  ctx.fillRect(-220, -8, 440, 16);
  ctx.restore();

  // Top eyebrow row
  const PAD = 56;
  ctx.fillStyle = "#89CFF0";
  ctx.font = "700 22px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  setLetterSpacing(ctx, 4);
  ctx.fillText("GRYT RUN CLUB", PAD, PAD);

  ctx.textAlign = "right";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("RECAP", W - PAD, PAD);
  resetLetterSpacing(ctx);

  // Title block overlaid on photo bottom
  const titleY = photoArea.h - 40;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 96px 'Oswald', 'Arial Narrow', Impact, sans-serif";
  drawFittedText(ctx, form.title || " ", PAD, titleY, W - PAD * 2, 96);

  // Date · location row
  ctx.fillStyle = "#89CFF0";
  ctx.font = "700 24px Inter, system-ui, sans-serif";
  setLetterSpacing(ctx, 3);
  const meta = [form.date, form.location].filter(Boolean).join("  ·  ");
  ctx.fillText(meta, PAD, titleY - 110);
  resetLetterSpacing(ctx);

  // Stats panel
  const panelY = photoArea.h;
  const panelH = H - panelY;

  // Top border accent
  ctx.fillStyle = "#89CFF0";
  ctx.fillRect(0, panelY, W, 6);

  // Stats
  const stats: Array<{ label: string; value: string }> = [
    { label: "DISTANCE", value: form.distance ? `${form.distance} MI` : "—" },
    { label: "TIME", value: form.time || "—" },
    { label: "PACE", value: form.pace ? `${form.pace}/MI` : "—" },
  ];

  const statTop = panelY + 70;
  const colW = W / 3;
  stats.forEach((s, i) => {
    const cx = colW * i + colW / 2;
    ctx.fillStyle = "#89CFF0";
    ctx.font = "700 20px Inter, system-ui, sans-serif";
    setLetterSpacing(ctx, 3);
    ctx.textAlign = "center";
    ctx.fillText(s.label, cx, statTop);
    resetLetterSpacing(ctx);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 78px 'Oswald', 'Arial Narrow', Impact, sans-serif";
    drawFittedText(ctx, s.value, cx, statTop + 90, colW - 40, 78, "center");

    // Divider
    if (i < stats.length - 1) {
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(colW * (i + 1) - 1, statTop - 10, 2, 120);
    }
  });

  // Athlete + footer tag at bottom
  const footY = H - 56;
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 22px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(form.athlete || " ", PAD, footY);

  ctx.fillStyle = "#89CFF0";
  ctx.font = "700 20px Inter, system-ui, sans-serif";
  setLetterSpacing(ctx, 3);
  ctx.textAlign = "right";
  ctx.fillText(form.note || " ", W - PAD, footY);
  resetLetterSpacing(ctx);

  // GRYT wordmark stamp (top-left of stats panel area corner)
  drawGrytMark(ctx, PAD, panelY + panelH - 130);
}

function drawCover(
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
  // Enlarged dest rect that fully covers w×h at this rotation angle
  const dw = w * cos + h * sin;
  const dh = w * sin + h * cos;

  const ir = img.width / img.height;
  const tr = dw / dh;
  // Base "cover" source rect (against rotated dest aspect), shrunk by zoom
  let sw: number, sh: number;
  if (ir > tr) {
    sh = img.height / scale;
    sw = (img.height * tr) / scale;
  } else {
    sw = img.width / scale;
    sh = (img.width / tr) / scale;
  }
  const maxOffX = (img.width - sw) / 2;
  const maxOffY = (img.height - sh) / 2;
  const sx = clamp((img.width - sw) / 2 + transform.offsetX * maxOffX, 0, img.width - sw);
  const sy = clamp((img.height - sh) / 2 + transform.offsetY * maxOffY, 0, img.height - sh);

  ctx.save();
  // Clip so rotated overflow stays inside the photo band
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.drawImage(img, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function PhotoControls({
  transform,
  onChange,
  onReset,
}: {
  transform: PhotoTransform;
  onChange: (patch: Partial<PhotoTransform>) => void;
  onReset: () => void;
}) {
  return (
    <div className="border border-paper/15 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-paper/55">PHOTO CROP</p>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] uppercase tracking-[0.12em] font-bold text-paper/60 hover:text-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          Recenter
        </button>
      </div>
      <RangeControl
        label="Zoom"
        value={transform.scale}
        min={1}
        max={3}
        step={0.01}
        format={(v) => `${v.toFixed(2)}×`}
        onChange={(v) => onChange({ scale: v })}
      />
      <RangeControl
        label="Horizontal"
        value={transform.offsetX}
        min={-1}
        max={1}
        step={0.01}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(v) => onChange({ offsetX: v })}
      />
      <RangeControl
        label="Vertical"
        value={transform.offsetY}
        min={-1}
        max={1}
        step={0.01}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(v) => onChange({ offsetY: v })}
      />
      <div>
        <RangeControl
          label="Rotation"
          value={transform.rotation}
          min={-180}
          max={180}
          step={1}
          format={(v) => `${v > 0 ? "+" : ""}${Math.round(v)}°`}
          onChange={(v) => onChange({ rotation: v })}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[
            { label: "−90°", delta: -90 },
            { label: "−1°", delta: -1 },
            { label: "0°", set: 0 },
            { label: "+1°", delta: 1 },
            { label: "+90°", delta: 90 },
          ].map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={() => {
                if ("set" in b) {
                  onChange({ rotation: b.set });
                } else {
                  const next = ((transform.rotation + b.delta + 180) % 360) - 180;
                  onChange({ rotation: next });
                }
              }}
              className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] border border-paper/25 text-paper/80 hover:border-blue hover:text-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ink transition-colors"
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-paper/55 leading-[1.5]">
        Tip: drag the preview to nudge the photo into place.
      </p>
    </div>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between mb-1.5">
        <span className="text-[11px] uppercase tracking-[0.12em] font-bold text-paper/70">
          {label}
        </span>
        <span className="text-[11px] font-mono text-blue">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-blue cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      />
    </label>
  );
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
  while (ctx.measureText(text).width > maxW && size > 24) {
    size -= 2;
    ctx.font = `700 ${size}px 'Oswald', 'Arial Narrow', Impact, sans-serif`;
  }
  ctx.fillText(text, x, y);
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, px: number) {
  // letterSpacing exists in modern canvas; fall back silently if not
  try {
    (ctx as any).letterSpacing = `${px}px`;
  } catch {
    /* noop */
  }
}
function resetLetterSpacing(ctx: CanvasRenderingContext2D) {
  try {
    (ctx as any).letterSpacing = "0px";
  } catch {
    /* noop */
  }
}

function drawGrytMark(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Layered lowercase wordmark: blue offset under white fill
  const text = "gryt";
  ctx.font = "700 92px 'Space Grotesk', system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#89CFF0";
  ctx.fillText(text, x + 4, y + 5);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(text, x, y);
}
