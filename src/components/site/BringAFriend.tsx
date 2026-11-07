import { useState } from "react";
import { track } from "@/lib/analytics";
import { inviteMessage, inviteUrl } from "@/lib/invite";

/** Generic fallback when no personal code is known. utm_source=friend keeps first-touch attribution. */
export const FRIEND_INVITE_URL = inviteUrl(null);

export function friendInviteText(dateLabel?: string, inviteCode?: string | null) {
  return inviteMessage(inviteCode, dateLabel);
}

/**
 * Shown right after an RSVP. The moment someone commits is the moment they
 * are most likely to bring someone, so make it one tap. When we know who they
 * are, the link is theirs: a friend who RSVPs through it is recorded as
 * brought by them.
 */
export function BringAFriend({ dateLabel, inviteCode }: { dateLabel?: string; inviteCode?: string | null }) {
  const [copied, setCopied] = useState(false);
  const message = friendInviteText(dateLabel, inviteCode);
  const personal = Boolean(inviteCode);
  const method = (m: string) => ({ method: m, personal });

  async function share() {
    track("friend_invite_click", method("share"));
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Run with me Saturday", text: message });
        return;
      } catch {
        /* user dismissed; fall through to copy */
      }
    }
    await copy();
  }

  async function copy() {
    track("friend_invite_click", method("copy"));
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-5 border-[1.5px] border-ink bg-[#f4f1ea] p-4">
      <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-ink/70">Bring one person</div>
      <p className="mt-1.5 text-[14px] leading-[1.5] text-ink">
        Saturday is better with someone you know. Send this to one person.
      </p>
      <p className="mt-3 select-all break-words bg-white border border-[#d8d4cb] px-3 py-2.5 text-[13px] leading-[1.5] text-ink">
        {message}
      </p>
      {personal ? (
        <p className="mt-2 text-[12px] leading-[1.5] text-ink/65">
          That link is yours. When a friend RSVPs with it, we know you brought them.
        </p>
      ) : null}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={share}
          className="text-[12px] font-bold tracking-[0.1em] uppercase py-3 bg-blue text-ink hover:bg-blue hover:text-ink transition-colors"
        >
          Send invite
        </button>
        <a
          href={`sms:?&body=${encodeURIComponent(message)}`}
          onClick={() => track("friend_invite_click", method("sms"))}
          className="text-[12px] font-bold tracking-[0.1em] uppercase py-3 border-[1.5px] border-ink text-ink text-center hover:bg-background hover:text-foreground transition-colors"
        >
          Text it
        </a>
      </div>
      <button
        type="button"
        onClick={copy}
        className="mt-2 w-full text-[12px] font-semibold text-ink/75 underline underline-offset-4"
        aria-live="polite"
      >
        {copied ? "Copied. Paste it anywhere." : "Copy message"}
      </button>
    </div>
  );
}
