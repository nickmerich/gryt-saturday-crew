-- Funnel fix: track Notion roster sync status on waiver signatures,
-- mirroring the columns that already exist on rsvps.
alter table public.waiver_signatures
  add column if not exists notion_synced boolean not null default false,
  add column if not exists notion_member_page_id text,
  add column if not exists notion_synced_at timestamptz,
  add column if not exists notion_last_error text;

create index if not exists waiver_signatures_notion_synced_idx
  on public.waiver_signatures (notion_synced);
