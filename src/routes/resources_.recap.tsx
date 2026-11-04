import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, Link2, RotateCcw, Camera, Upload } from "lucide-react";
import {
  exchangeStravaCode,
  getStravaActivities,
  getStravaConfig,
  type StravaActivity,
} from "@/lib/strava.functions";
import { uploadRecap } from "@/lib/recap-share.functions";
import { parseGarminFile, type ParsedActivity } from "@/lib/garmin-parse";
import {
  CANVAS_H,
  CANVAS_W,
  DEFAULT_TRANSFORM,
  THEMES,
  clamp,
  drawRecap,
  formatDate,
  formatDuration,
  formatPace,
  type PhotoTransform,
  type RecapForm,
  type ThemeId,
} from "@/lib/recap-render";

export const Route = createFileRoute("/resources_/recap")({
  head: () => ({
    meta: [
      { title: "Create your run recap · gryt run club" },
      {
        name: "description",
        content:
          "Turn today's run into a graphic worth sharing. Connect Strava or Garmin, pick a style, and share in under a minute.",
      },
      { property: "og:title", content: "Create your run recap · gryt run club" },
      {
        property: "og:description",
        content: "Turn today's run into a graphic worth sharing. Free from gryt run club.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://grytrunclub.com/resources/recap" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://grytrunclub.com/resources/recap" }],
  }),
  component: RecapGeneratorPage,
});

const DEFAULTS: RecapForm = {
  title: "SATURDAY RUN",
  date: formatDate(new Date()),
  location: "PITTSBURGH, PA",
  distance: "6.2",
  time: "52:18",
  pace: "8:26",
  athlete: "@yourhandle",
  note: "DO HARD THINGS TOGETHER",
  auraUser: "",
};

type Source = "strava" | "garmin" | "manual";

function RecapGeneratorPage() {
  const [form, setForm] = useState<RecapForm>(DEFAULTS);
  const [theme, setTheme] = useState<ThemeId>("classic");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoImg, setPhotoImg] = useState<HTMLImageElement | null>(null);
  const [transform, setTransform] = useState<PhotoTransform>(DEFAULT_TRANSFORM);
  const [showCrop, setShowCrop] = useState(false);
  const [source, setSource] = useState<Source | null>(null);
  const [showFileImport, setShowFileImport] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragState = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  function update<K extends keyof RecapForm>(key: K, value: RecapForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // ── Strava ─────────────────────────────────────────────────────
  const [stravaToken, setStravaToken] = useState<string | null>(null);
  const [stravaAthlete, setStravaAthlete] = useState<{
    firstName: string | null;
    username: string | null;
  } | null>(null);
  const [stravaActivities, setStravaActivities] = useState<StravaActivity[] | null>(null);
  const [stravaState, setStravaState] = useState<
    "idle" | "connecting" | "loading" | "ready" | "error"
  >("idle");
  const [stravaError, setStravaError] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const exchangeCode = useServerFn(exchangeStravaCode);
  const fetchActivities = useServerFn(getStravaActivities);
  const fetchStravaConfig = useServerFn(getStravaConfig);
  const uploadRecapFn = useServerFn(uploadRecap);

  // ── Share ──────────────────────────────────────────────────────
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareState, setShareState] = useState<"idle" | "generating" | "ready" | "error">("idle");

  const generateShareLink = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    setShareState("generating");
    try {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const dataUrl = canvas.toDataURL("image/png");
      const { url } = await uploadRecapFn({ data: { dataUrl } });
      setShareUrl(url);
      setShareState("ready");
      return url;
    } catch (e) {
      setShareState("error");
      toast.error(e instanceof Error ? e.message : "Couldn't create a link.");
      return null;
    }
  }, [uploadRecapFn]);

  async function copyLink() {
    const url = shareUrl ?? (await generateShareLink());
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy — long-press the link instead.");
    }
  }

  async function challengeFriend() {
    const url = shareUrl ?? (await generateShareLink());
    if (!url) return;
    const text = `I ran ${form.distance} mi with @grytrunclub. Your turn — post yours. ${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Challenge copied");
    } catch {
      toast.message(text);
    }
  }

  async function shareToStory() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/png"));
      if (!blob) throw new Error("no blob");
      const file = new File([blob], "gryt-recap.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({ files: [file], text: "Tag @grytrunclub" });
        return;
      }
      downloadCanvas();
      toast.message("Saved to your device", {
        description: "Open Instagram → Story → add from your camera roll.",
      });
    } catch {
      toast.error("Couldn't open sharing. Download instead.");
    }
  }

  const loadActivities = useCallback(
    async (token: string) => {
      setStravaState("loading");
      try {
        const { activities } = await fetchActivities({ data: { accessToken: token } });
        setStravaActivities(activities);
        setStravaState("ready");
        if (activities.length === 0) toast.message("No recent runs found.");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Couldn't load runs.";
        setStravaError(msg);
        setStravaState("error");
        toast.error(msg);
      }
    },
    [fetchActivities],
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const err = url.searchParams.get("error");
    const scope = url.searchParams.get("scope");
    if (err) {
      url.searchParams.delete("error");
      url.searchParams.delete("state");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      const msg =
        err === "access_denied"
          ? "Authorization was cancelled. Tap Connect Strava to try again."
          : `Strava returned an error: ${err}.`;
      setStravaError(msg);
      setStravaState("error");
      setSource("strava");
      return;
    }
    if (!code) return;
    url.searchParams.delete("code");
    url.searchParams.delete("scope");
    url.searchParams.delete("state");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    setSource("strava");
    if (scope && !/activity:read/.test(scope)) {
      const msg = "Activity access wasn't granted. Keep 'View your activities' checked on Strava.";
      setStravaError(msg);
      setStravaState("error");
      return;
    }
    setStravaState("connecting");
    (async () => {
      try {
        const result = await exchangeCode({ data: { code } });
        setStravaToken(result.accessToken);
        setStravaAthlete(result.athlete);
        await loadActivities(result.accessToken);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Couldn't connect to Strava.";
        setStravaError(msg);
        setStravaState("error");
        toast.error(msg);
      }
    })();
  }, [exchangeCode, loadActivities]);

  async function connectStrava() {
    setSource("strava");
    setStravaError(null);
    try {
      const { clientId } = await fetchStravaConfig();
      // Strava only accepts redirects on the app's Authorization Callback Domain
      // (grytrunclub.com). Preview/lovable.app origins are rejected with
      // "redirect_uri: invalid", so send those through the production domain.
      const host = window.location.hostname;
      const allowed = host === "grytrunclub.com" || host === "www.grytrunclub.com";
      const origin = allowed ? window.location.origin : "https://grytrunclub.com";
      const redirectUri = `${origin}/resources/recap`;
      const authUrl = new URL("https://www.strava.com/oauth/authorize");
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("redirect_uri", redirectUri);

      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("approval_prompt", "auto");
      authUrl.searchParams.set("scope", "read,activity:read");
      window.location.href = authUrl.toString();
    } catch {
      const msg = "Strava isn't connected yet on this site.";
      setStravaError(msg);
      setStravaState("error");
      toast.error(msg);
    }
  }

  function disconnectStrava() {
    setStravaToken(null);
    setStravaAthlete(null);
    setStravaActivities(null);
    setSelectedActivityId(null);
    setStravaState("idle");
    setStravaError(null);
  }

  function applyStravaActivity(a: StravaActivity) {
    const miles = a.distance / 1609.344;
    const distance = miles.toFixed(miles >= 10 ? 1 : 2);
    const paceSecPerMi = miles > 0 ? a.moving_time / miles : 0;
    const loc = [a.location_city, a.location_state].filter(Boolean).join(", ").toUpperCase();
    setForm((f) => ({
      ...f,
      title: (a.name || "STRAVA RUN").toUpperCase().slice(0, 32),
      date: formatDate(new Date(a.start_date_local)),
      location: loc || f.location,
      distance,
      time: formatDuration(a.moving_time),
      pace: paceSecPerMi > 0 ? formatPace(paceSecPerMi) : "",
      athlete: stravaAthlete?.username ? `@${stravaAthlete.username}` : f.athlete,
    }));
    setSelectedActivityId(a.id);
    setStatus("idle");
    setShareUrl(null);
    setShareState("idle");
    toast.success("Run loaded");
  }

  function applyParsedActivity(a: ParsedActivity) {
    const miles = a.distanceMeters / 1609.344;
    const paceSecPerMi = miles > 0 ? a.movingTimeSeconds / miles : 0;
    setForm((f) => ({
      ...f,
      title: (a.name || "GARMIN RUN").toUpperCase().slice(0, 32),
      date: formatDate(new Date(a.startDateLocal)),
      distance: miles > 0 ? miles.toFixed(miles >= 10 ? 1 : 2) : "",
      time: a.movingTimeSeconds > 0 ? formatDuration(a.movingTimeSeconds) : "",
      pace: paceSecPerMi > 0 ? formatPace(paceSecPerMi) : "",
    }));
    setSource("garmin");
    setSelectedActivityId(null);
    setStatus("idle");
    setShareUrl(null);
    setShareState("idle");
    toast.success("Run loaded");
  }

  function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("That image is too large. Try one under 8MB.");
      return;
    }
    // Some cameras hand back files with an empty or non-image MIME type
    // (HEIC on iOS, files picked from cloud drives). Read those as a data URL
    // so the browser can still decode whatever it supports.
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) {
        toast.error("Couldn't read that photo. Try a different one.");
        return;
      }
      setPhotoUrl(result);
      setTransform(DEFAULT_TRANSFORM);
      setShowCrop(true);
    };
    reader.onerror = () => toast.error("Couldn't read that photo. Try a different one.");
    reader.readAsDataURL(file);
  }

  function updateTransform(patch: Partial<PhotoTransform>) {
    setTransform((t) => ({ ...t, ...patch }));
  }

  useEffect(() => {
    if (!photoUrl) {
      setPhotoImg(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setPhotoImg(img);
    };
    img.onerror = () => {
      if (cancelled) return;
      setPhotoImg(null);
      setPhotoUrl(null);
      setShowCrop(false);
      toast.error("That image format isn't supported here.", {
        description: "HEIC photos from iPhone often fail — save it as JPEG and try again.",
      });
    };
    img.src = photoUrl;
    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [photoUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawRecap(canvas, form, photoImg, transform, theme);
  }, [form, photoImg, transform, theme]);

  function onCanvasPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!photoImg) return;
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    dragState.current = { x: e.clientX, y: e.clientY, ox: transform.offsetX, oy: transform.offsetY };
  }
  function onCanvasPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const d = dragState.current;
    const canvas = canvasRef.current;
    if (!d || !canvas) return;
    const rect = canvas.getBoundingClientRect();
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

  function downloadCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `gryt-recap-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function download() {
    if (!acceptedTerms) return;
    setStatus("saving");
    await new Promise((r) => setTimeout(r, 250));
    try {
      downloadCanvas();
      setStatus("saved");
      toast.success("Saved to your device");
    } catch {
      setStatus("idle");
      toast.error("Couldn't save. Try again.");
    }
  }

  function startOver() {
    setForm(DEFAULTS);
    setPhotoUrl(null);
    setTransform(DEFAULT_TRANSFORM);
    setShowCrop(false);
    setTheme("classic");
    setStatus("idle");
    setShareUrl(null);
    setShareState("idle");
    setSource(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const stravaConnected = stravaState === "ready" || stravaState === "loading";

  return (
    <main className="bg-background text-foreground">
      <SiteNav />

      <section className="px-5 sm:px-10 lg:px-20 pt-10 pb-8 border-b border-foreground/12">
        <div className="max-w-[1240px] mx-auto">
          <p className="eyebrow text-foreground mb-3">
            <Link to="/resources" className="hover:text-foreground focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-4">
              ← Resources
            </Link>
          </p>
          <h1 className="display-condensed uppercase text-4xl sm:text-6xl lg:text-7xl leading-none tracking-normal">
            Create your run recap
          </h1>
          <p className="mt-3 text-foreground/85 text-base sm:text-lg max-w-[560px] leading-[1.5]">
            Turn today's run into a graphic worth sharing.
          </p>
          <p className="mt-3 text-sm">
            <Link to="/resources/runs" className="text-foreground underline underline-offset-4 hover:text-foreground">
              Or browse your Strava runs with pace, elevation, and splits →
            </Link>
          </p>
        </div>
      </section>

      <section className="px-5 sm:px-10 lg:px-20 py-10 md:py-14">
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] gap-10 lg:gap-14 items-start">
          {/* ── Steps ── */}
          <div className="order-2 lg:order-1 min-w-0 flex flex-col gap-10">
            {/* Step 1 */}
            <StepBlock n={1} title="Connect your run">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <SourceCard
                  label="Connect Strava"
                  hint={
                    stravaConnected
                      ? `Connected${stravaAthlete?.firstName ? ` · ${stravaAthlete.firstName}` : ""}`
                      : "Import recent runs"
                  }
                  active={source === "strava"}
                  busy={stravaState === "connecting"}
                  onClick={stravaConnected ? () => setSource("strava") : connectStrava}
                />
                <SourceCard
                  label="Connect Garmin"
                  hint="Account sync soon"
                  active={source === "garmin"}
                  onClick={() => {
                    setSource("garmin");
                    setShowFileImport(true);
                    toast.message("Garmin accounts are coming soon", {
                      description: "Import a file from Garmin Connect for now.",
                    });
                  }}
                />
                <SourceCard
                  label="Enter manually"
                  hint="Type it in"
                  active={source === "manual"}
                  onClick={() => setSource("manual")}
                />
              </div>

              <Button variant="ghost"
                type="button"
                onClick={() => setShowFileImport((v) => !v)}
                className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-foreground/80 hover:text-foreground/70 underline underline-offset-4"
              >
                <Upload aria-hidden="true" />Import activity file
              </Button>

              {showFileImport && <GarminFilePanel onParsed={applyParsedActivity} />}

              {source === "strava" && (
                <StravaRuns
                  state={stravaState}
                  error={stravaError}
                  activities={stravaActivities}
                  selectedId={selectedActivityId}
                  onConnect={connectStrava}
                  onDisconnect={disconnectStrava}
                  onRefresh={() => stravaToken && loadActivities(stravaToken)}
                  onPick={applyStravaActivity}
                />
              )}
            </StepBlock>

            {/* Step 2 */}
            <StepBlock n={2} title="Make it yours">
              <p className="mb-3 text-sm font-medium text-foreground/85">Graphic style</p>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" role="group" aria-label="Styles">
                {THEMES.map((t) => {
                  const active = theme === t.id;
                  return (
                    <Button variant="ghost"
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      aria-pressed={active}
                      className={`min-h-12 rounded-none px-3.5 py-3 text-sm font-bold uppercase tracking-normal border transition-colors ${
                        active
                          ? "border-blue bg-blue text-ink"
                          : "border-foreground/25 text-foreground/85 hover:border-blue hover:text-foreground/70"
                      }`}
                    >
                      {t.label}
                    </Button>
                  );
                })}
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <PhotoPicker
                  onChange={onPhoto}
                  hasPhoto={!!photoUrl}
                  onClear={() => {
                    setPhotoUrl(null);
                    setTransform(DEFAULT_TRANSFORM);
                    setShowCrop(false);
                  }}
                  onAdjust={() => setShowCrop((v) => !v)}
                />
                <Field
                  label="Title"
                  value={form.title}
                  onChange={(v) => update("title", v.toUpperCase())}
                  maxLength={32}
                />
                <Field
                  label="Date"
                  value={form.date}
                  onChange={(v) => update("date", v.toUpperCase())}
                  maxLength={32}
                />
                <Field
                  label="Location"
                  value={form.location}
                  onChange={(v) => update("location", v.toUpperCase())}
                  maxLength={48}
                />
              </div>

              {photoUrl && showCrop && (
                <div className="mt-5">
                  <PhotoControls
                    transform={transform}
                    onChange={updateTransform}
                    onReset={() => setTransform(DEFAULT_TRANSFORM)}
                  />
                </div>
              )}

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Distance (miles)" value={form.distance} onChange={(v) => update("distance", v)} maxLength={8} inputMode="decimal" />
                <Field label="Time (h:mm:ss)" value={form.time} onChange={(v) => update("time", v)} maxLength={10} />
                <Field label="Pace (min/mile)" value={form.pace} onChange={(v) => update("pace", v)} maxLength={8} />
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <Field
                  label="Name or handle"
                  value={form.athlete}
                  onChange={(v) => update("athlete", v)}
                  maxLength={32}
                />
                <Field
                  label="Caption"
                  value={form.note}
                  onChange={(v) => update("note", v.toUpperCase())}
                  maxLength={40}
                />
                {theme === "aura" && (
                  <Field
                    label="Aura username"
                    value={form.auraUser}
                    onChange={(v) => update("auraUser", v)}
                    maxLength={32}
                    placeholder="@aura"
                  />
                )}
              </div>
            </StepBlock>

            {/* Step 3 */}
            <StepBlock n={3} title="Share it">
              <label className="flex min-h-12 items-start gap-3 py-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-6 w-6 shrink-0 accent-blue cursor-pointer focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2"
                />
                <span className="text-sm leading-[1.55] text-foreground/75 group-hover:text-foreground transition-colors">
                  I have the right to use this photo and agree to the{" "}
                  <Link to="/terms" target="_blank" className="text-foreground underline">
                    terms
                  </Link>
                  .
                </span>
              </label>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap">
                <Button variant="ghost"
                  type="button"
                  onClick={download}
                  disabled={!acceptedTerms || status === "saving"}
                  className="min-h-12 rounded-none bg-blue px-5 text-ink hover:bg-foreground hover:text-background hover:text-ink disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Download aria-hidden="true" />{status === "saving" ? "Saving…" : "Download PNG"}
                </Button>
                <SecondaryBtn onClick={copyLink} disabled={!acceptedTerms || shareState === "generating"}>
                  <Link2 aria-hidden="true" />{shareState === "generating" ? "Working…" : "Copy link"}
                </SecondaryBtn>
                <SecondaryBtn onClick={shareToStory} disabled={!acceptedTerms}>
                  Instagram Story
                </SecondaryBtn>
                <SecondaryBtn onClick={challengeFriend} disabled={!acceptedTerms}>
                  Challenge a friend
                </SecondaryBtn>
                <GhostBtn onClick={startOver}><RotateCcw aria-hidden="true" />Start over</GhostBtn>
              </div>

              {shareState === "ready" && shareUrl && (
                <div className="mt-4 border border-blue/50 bg-blue/10 px-4 py-3 flex flex-col sm:flex-row gap-2 sm:items-center">
                  <input
                    readOnly
                    value={shareUrl}
                    onFocus={(e) => e.currentTarget.select()}
                    className="flex-1 min-w-0 bg-background/60 border border-foreground/20 text-foreground text-xs px-2.5 py-2 font-mono truncate focus:outline-none focus:border-blue"
                  />
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] border border-foreground/30 text-foreground/85 hover:border-blue hover:text-foreground/70 text-center"
                  >
                    Open
                  </a>
                </div>
              )}

              {shareState === "error" && (
                <p className="mt-3 text-sm text-foreground">Couldn't create a link. Try again.</p>
              )}

              <div className="mt-6 border-t border-foreground/20 pt-4">
                <p className="eyebrow text-foreground mb-1.5">Keep it going</p>
                <p className="text-sm text-foreground/80 leading-[1.55]">
                  Tag <span className="text-foreground font-bold">@grytrunclub</span> when you post, then
                  challenge your crew to post theirs.
                </p>
              </div>
            </StepBlock>
          </div>

          {/* ── Preview ── */}
          <div className="order-1 lg:order-2 min-w-0 w-full max-w-[280px] sm:max-w-[360px] lg:max-w-none mx-auto lg:sticky lg:top-24">
            <div className="mb-3 flex items-baseline justify-between gap-3"><p className="eyebrow text-foreground/80">Your recap</p><span className="font-mono text-xs text-foreground">1080 × 1920</span></div>
            <div className="relative bg-background border border-foreground/25 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                onPointerDown={onCanvasPointerDown}
                onPointerMove={onCanvasPointerMove}
                onPointerUp={onCanvasPointerUp}
                onPointerCancel={onCanvasPointerUp}
                className={`block w-full h-auto ${photoImg ? "cursor-move touch-none" : ""}`}
                role="img"
                aria-label={`Run recap: ${form.title}, ${form.date}, ${form.distance} miles, time ${form.time}, pace ${form.pace} per mile, ${form.athlete}`}
              />
            </div>

          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

/* ───────────────────────────  UI PIECES  ─────────────────────────── */

function StepBlock({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 mb-5 border-t border-foreground/20 pt-5">
        <span className="inline-flex h-9 w-9 items-center justify-center bg-blue text-ink text-xs font-bold">
          {n}
        </span>
        <h2 className="display-condensed uppercase text-3xl sm:text-4xl tracking-normal leading-none">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function SourceCard({
  label,
  hint,
  active,
  busy,
  onClick,
}: {
  label: string;
  hint: string;
  active: boolean;
  busy?: boolean;
  onClick: () => void;
}) {
  return (
    <Button variant="ghost"
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-auto min-h-24 flex-col items-start justify-start whitespace-normal rounded-none text-left p-4 border transition-colors ${
        active ? "border-blue bg-blue/10" : "border-foreground/18 bg-foreground/[0.03] hover:border-foreground/40"
      }`}
    >
      <span className="block h-1 w-8 mb-3 bg-blue" aria-hidden />
      <span className="block text-sm font-bold uppercase tracking-[0.1em] text-foreground">
        {busy ? "Connecting…" : label}
      </span>
      <span className="block text-xs text-foreground/80 mt-1">{hint}</span>
    </Button>
  );
}

function SecondaryBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button variant="ghost"
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-12 rounded-none px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] border border-blue text-foreground hover:bg-blue hover:text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </Button>
  );
}

function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <Button variant="ghost"
      type="button"
      onClick={onClick}
      className="min-h-12 rounded-none px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] border border-foreground/25 text-foreground/75 hover:border-blue hover:text-foreground/70 transition-colors"
    >
      {children}
    </Button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  inputMode?: "decimal" | "text";
}) {
  return (
    <label className="block min-w-0">
      <span className="block mb-2 text-sm font-medium text-foreground/85">{label}</span>
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 w-full rounded-none bg-background border border-foreground/30 text-foreground placeholder:text-muted-foreground px-3 py-3 text-base focus:outline-none focus:border-blue focus-visible:ring-2 focus-visible:ring-blue transition-colors"
      />
    </label>
  );
}

function PhotoPicker({
  onChange,
  hasPhoto,
  onClear,
  onAdjust,
}: {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  hasPhoto: boolean;
  onClear: () => void;
  onAdjust: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <span className="eyebrow text-foreground/80 block mb-1.5">Cover photo</span>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost"
          type="button"
          onClick={() => inputRef.current?.click()}
          className="min-h-12 inline-flex items-center rounded-none px-4 py-3 text-sm font-bold border border-foreground/30 text-foreground/85 hover:border-blue hover:text-foreground/70 transition-colors"
        >
          <Camera aria-hidden="true" />{hasPhoto ? "Replace photo" : "Add photo"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp"
          onChange={(e) => {
            onChange(e);
            // Clear on the next tick so the File stays readable while the
            // reader picks it up (iOS Safari drops it on a sync reset).
            setTimeout(() => {
              if (inputRef.current) inputRef.current.value = "";
            }, 0);
          }}
          className="sr-only"
          tabIndex={-1}
        />
        {hasPhoto && (
          <>
            <Button variant="ghost"
              type="button"
              onClick={onAdjust}
              className="min-h-12 rounded-none text-sm text-foreground/85 hover:text-foreground/70 underline underline-offset-4"
            >
              Adjust photo
            </Button>
            <Button variant="ghost"
              type="button"
              onClick={onClear}
              className="min-h-12 rounded-none text-sm text-foreground/85 hover:text-foreground underline underline-offset-4"
            >
              Remove photo
            </Button>
          </>
        )}
      </div>
    </div>
  );
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
    <div className="border border-foreground/15 p-4 flex flex-col gap-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <p className="eyebrow text-foreground/80">Adjust photo</p>
        <Button variant="ghost"
          type="button"
          onClick={onReset}
          className="min-h-12 rounded-none text-sm font-bold text-foreground/85 hover:text-foreground/70"
        >
          Reset photo
        </Button>
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
        label="Move left / right"
        value={transform.offsetX}
        min={-1}
        max={1}
        step={0.01}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(v) => onChange({ offsetX: v })}
      />
      <RangeControl
        label="Move up / down"
        value={transform.offsetY}
        min={-1}
        max={1}
        step={0.01}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(v) => onChange({ offsetY: v })}
      />
      <RangeControl
        label="Rotate"
        value={transform.rotation}
        min={-180}
        max={180}
        step={1}
        format={(v) => `${v > 0 ? "+" : ""}${Math.round(v)}°`}
        onChange={(v) => onChange({ rotation: v })}
      />
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
    <label className="block min-w-0">
      <span className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-medium text-foreground/85">
          {label}
        </span>
        <span className="text-sm font-mono text-foreground">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-12 w-full accent-blue cursor-pointer focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2"
      />
    </label>
  );
}

function StravaRuns({
  state,
  error,
  activities,
  selectedId,
  onConnect,
  onDisconnect,
  onRefresh,
  onPick,
}: {
  state: "idle" | "connecting" | "loading" | "ready" | "error";
  error: string | null;
  activities: StravaActivity[] | null;
  selectedId: number | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
  onPick: (a: StravaActivity) => void;
}) {
  return (
    <div className="mt-4">
      {state === "error" && error && (
        <div role="alert" className="border border-foreground/40 bg-background p-3 text-xs text-foreground/85">
          <p className="text-foreground font-medium">{error}</p>
          <Button variant="ghost"
            type="button"
            onClick={onConnect}
            className="mt-3 px-3 py-1.5 bg-blue text-ink text-[11px] font-bold uppercase tracking-[0.12em] hover:brightness-110"
          >
            Try again
          </Button>
        </div>
      )}

      {state === "loading" && <p className="text-xs text-foreground/80">Loading your runs…</p>}

      {state === "ready" && activities && activities.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="eyebrow text-foreground/80">Your runs</span>
            <div className="flex gap-4">
              <Button variant="ghost"
                type="button"
                onClick={onRefresh}
                className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground/80 hover:text-foreground/70"
              >
                Refresh
              </Button>
              <Button variant="ghost"
                type="button"
                onClick={onDisconnect}
                className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground/80 hover:text-foreground"
              >
                Disconnect
              </Button>
            </div>
          </div>
          <ul className="max-h-72 overflow-y-auto divide-y divide-foreground/10 border border-foreground/12">
            {activities.map((a) => {
              const miles = a.distance / 1609.344;
              const paceSec = miles > 0 ? a.moving_time / miles : 0;
              const active = selectedId === a.id;
              return (
                <li key={a.id}>
                  <Button variant="ghost"
                    type="button"
                    onClick={() => onPick(a)}
                    aria-pressed={active}
                    className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                      active ? "bg-blue/15" : "hover:bg-foreground/[0.04]"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{a.name}</p>
                      <p className="text-[11px] uppercase tracking-[0.1em] text-foreground/80 mt-0.5">
                        {formatDate(new Date(a.start_date_local))} · {miles.toFixed(miles >= 10 ? 1 : 2)} mi
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm text-foreground tabular-nums">{formatDuration(a.moving_time)}</p>
                      <p className="text-[11px] text-foreground/80 mt-0.5 tabular-nums">
                        {paceSec > 0 ? `${formatPace(paceSec)}/mi` : "—"}
                      </p>
                    </div>
                  </Button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {state === "ready" && activities && activities.length === 0 && (
        <p className="text-xs text-foreground/80">No runs yet. Log one, then refresh.</p>
      )}
    </div>
  );
}

function GarminFilePanel({ onParsed }: { onParsed: (a: ParsedActivity) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<"idle" | "parsing" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(f: File | null) {
    if (!f) return;
    setError(null);
    setState("parsing");
    try {
      if (f.size > 20 * 1024 * 1024) throw new Error("That file is too large.");
      const parsed = await parseGarminFile(f);
      if (parsed.distanceMeters <= 0 && parsed.movingTimeSeconds <= 0) {
        throw new Error("Couldn't read that activity file.");
      }
      setState("done");
      onParsed(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that file.");
      setState("error");
    }
  }

  return (
    <div className="mt-3 border border-foreground/15 bg-foreground/[0.03] p-4">
      <input
        ref={inputRef}
        type="file"
        accept=".fit,.tcx,.gpx,application/gpx+xml,application/vnd.garmin.tcx+xml,application/octet-stream"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        className="sr-only"
      />
      <Button variant="ghost"
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={state === "parsing"}
        className="px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] border border-foreground/30 text-foreground/85 hover:border-blue hover:text-foreground/70 transition-colors disabled:opacity-60"
      >
        {state === "parsing" ? "Reading…" : "Choose a file"}
      </Button>
      {state === "error" && error && (
        <div role="alert" className="mt-3 text-xs text-foreground/85">
          <p className="text-foreground">{error}</p>
          <p className="mt-1.5 text-foreground/80">
            In Garmin Connect: open the activity → … → Export Original (.fit) or GPX / TCX.
          </p>
        </div>
      )}
      {state === "done" && <p className="mt-3 text-xs text-foreground/80">Loaded.</p>}
    </div>
  );
}
