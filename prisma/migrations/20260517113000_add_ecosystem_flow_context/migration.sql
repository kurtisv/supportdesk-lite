alter table if exists public."Ticket"
  add column if not exists "flowId" text,
  add column if not exists "sourceApp" text,
  add column if not exists "sourceEventId" text,
  add column if not exists "linkedEntityType" text,
  add column if not exists "linkedEntityId" text,
  add column if not exists "contextJson" jsonb;

create index if not exists "Ticket_flowId_idx" on public."Ticket"("flowId");
