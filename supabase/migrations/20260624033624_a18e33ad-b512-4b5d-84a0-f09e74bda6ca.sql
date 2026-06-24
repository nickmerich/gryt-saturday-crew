ALTER TABLE public.rsvps
  ADD COLUMN IF NOT EXISTS notion_synced BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notion_member_page_id TEXT,
  ADD COLUMN IF NOT EXISTS notion_attendance_page_id TEXT,
  ADD COLUMN IF NOT EXISTS notion_last_error TEXT,
  ADD COLUMN IF NOT EXISTS notion_synced_at TIMESTAMPTZ;