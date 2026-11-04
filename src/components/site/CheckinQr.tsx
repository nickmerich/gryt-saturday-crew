import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { supabase } from '@/integrations/supabase/client'

type CodeResponse = {
  code: string
  rotatesAt: string
  eventDate: string
  runNumber: number
  openToday: boolean
}

/**
 * The rotating check-in QR an organiser holds up at the trailhead. The code
 * changes every 30 seconds, so a photo of it is useless minutes later and
 * nobody can mark themselves present from home.
 */
export function CheckinQr() {
  const [png, setPng] = useState<string | null>(null)
  const [info, setInfo] = useState<CodeResponse | null>(null)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    let timer: ReturnType<typeof setTimeout>

    async function tick() {
      try {
        const { data } = await supabase.auth.getSession()
        if (!data.session) throw new Error('Sign in to continue.')
        const response = await fetch('/api/admin/checkin-code', {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        })
        const body = (await response.json()) as CodeResponse & { error?: string }
        if (!response.ok) throw new Error(body.error || 'Could not load the code.')
        if (!alive.current) return
        const url = `${window.location.origin}/checkin?c=${body.code}`
        setPng(
          await QRCode.toDataURL(url, {
            width: 640,
            margin: 1,
            color: { dark: '#000000', light: '#FFFFFF' },
          }),
        )
        setInfo(body)
        setError('')
        const wait = Math.max(2000, new Date(body.rotatesAt).getTime() - Date.now() + 250)
        timer = setTimeout(tick, wait)
      } catch (err) {
        if (!alive.current) return
        setError(err instanceof Error ? err.message : 'Could not load the code.')
        timer = setTimeout(tick, 5000)
      }
    }

    if (open) void tick()
    return () => {
      alive.current = false
      clearTimeout(timer)
    }
  }, [open])

  return (
    <div className="px-5 sm:px-12 py-5 border-b border-foreground/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`px-4 py-3 text-xs uppercase tracking-wider border ${
          open ? 'bg-blue text-ink border-blue' : 'border-foreground/20 text-foreground'
        }`}
      >
        {open ? 'Hide scan code' : 'Show scan code'}
      </button>

      {open && (
        <div className="mt-4 flex flex-col items-center">
          <div className="bg-white p-3">
            {png ? (
              <img src={png} alt="Check-in QR code" className="w-[260px] h-[260px]" />
            ) : (
              <div className="w-[260px] h-[260px] grid place-items-center text-xs text-ink">
                Loading…
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground text-center max-w-xs">
            Hold this up at the trailhead. The code changes every 30 seconds, so it only works for
            people standing here.
          </p>
          {info && !info.openToday && (
            <p className="mt-2 text-xs text-amber-200 text-center">
              Today is not a run day, so scans will be turned away.
            </p>
          )}
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  )
}
