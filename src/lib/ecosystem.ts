import { supabase } from "@/lib/supabase";

export type EcosystemPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type PublishEcosystemEventInput = {
  flowId?: string;
  sourceApp: string;
  targetApp?: string;
  targetApps?: string[];
  eventType: string;
  entityType: string;
  entityId?: string;
  customerName?: string;
  customerEmail?: string;
  title: string;
  description?: string;
  payload?: Record<string, unknown>;
  notificationTitle?: string;
  notificationMessage?: string;
  priority?: EcosystemPriority;
  actionLabel?: string;
  actionUrl?: string;
};

function createFlowId(input: PublishEcosystemEventInput) {
  if (input.flowId) return input.flowId;
  const email = input.customerEmail?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return email ? `flow-${email}` : `flow-${crypto.randomUUID()}`;
}

export async function publishEcosystemEvent(input: PublishEcosystemEventInput) {
  const flowId = createFlowId(input);
  const targetApps = input.targetApps?.length ? input.targetApps : input.targetApp ? [input.targetApp] : [];

  const { data: event, error } = await supabase
    .from("EcosystemEvent")
    .insert({
      id: crypto.randomUUID(),
      flowId,
      sourceApp: input.sourceApp,
      targetApp: targetApps[0] ?? input.targetApp ?? null,
      eventType: input.eventType,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      customerName: input.customerName ?? null,
      customerEmail: input.customerEmail ?? null,
      title: input.title,
      description: input.description ?? null,
      payload: input.payload ?? null,
      status: "NEW",
    })
    .select()
    .single();

  if (error || !event) return null;

  if (targetApps.length > 0) {
    await supabase.from("EcosystemNotification").insert(
      targetApps.map((appKey) => ({
        id: crypto.randomUUID(),
        appKey,
        eventId: event.id,
        title: input.notificationTitle ?? input.title,
        message: input.notificationMessage ?? input.description ?? input.title,
        priority: input.priority ?? "NORMAL",
        isRead: false,
        actionLabel: input.actionLabel ?? null,
        actionUrl: input.actionUrl ?? null,
      })),
    );
  }

  return event;
}

export async function getIncomingEcosystemNotifications(appKey: string, take = 6) {
  const { data } = await supabase
    .from("EcosystemNotification")
    .select("id, appKey, eventId, title, message, priority, isRead, actionLabel, actionUrl, createdAt")
    .eq("appKey", appKey)
    .order("createdAt", { ascending: false })
    .limit(take);

  return data ?? [];
}

export async function getIncomingEcosystemEvents(appKey: string, eventType?: string, take = 10) {
  let query = supabase
    .from("EcosystemEvent")
    .select("id, flowId, sourceApp, targetApp, eventType, entityType, entityId, customerName, customerEmail, title, description, payload, status, createdAt")
    .eq("targetApp", appKey)
    .order("createdAt", { ascending: false })
    .limit(take);

  if (eventType) {
    query = query.eq("eventType", eventType);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getRecentEcosystemEvents(take = 20) {
  const { data } = await supabase
    .from("EcosystemEvent")
    .select("id, flowId, sourceApp, targetApp, eventType, entityType, entityId, customerName, customerEmail, title, description, status, createdAt")
    .order("createdAt", { ascending: false })
    .limit(take);

  return data ?? [];
}
