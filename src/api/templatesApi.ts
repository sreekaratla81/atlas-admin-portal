/**
 * Message templates API. Uses Atlas API /api/message-templates.
 * Tenant is sent via X-Tenant-Slug (api interceptor).
 */

import { api, asArray } from "@/lib/api";
import type {
  MessageTemplate,
  MessageTemplateCreateUpdate,
  ScheduleRule,
} from "@/types/messaging";
import { parseVariablesFromBody } from "@/types/messaging";

const BASE = "/api/message-templates";

export interface GetTemplatesParams {
  eventType?: string;
  channel?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

/** Map API response to our MessageTemplate (add name, variablesUsed). */
function toTemplate(raw: Record<string, unknown>): MessageTemplate {
  const body = String(raw.body ?? "");
  return {
    id: Number(raw.id),
    tenantId: Number(raw.tenantId),
    name: raw.templateKey != null ? String(raw.templateKey) : undefined,
    templateKey: raw.templateKey != null ? String(raw.templateKey) : null,
    eventType: String(raw.eventType ?? ""),
    channel: String(raw.channel ?? "SMS") as MessageTemplate["channel"],
    body,
    subject:
      raw.subject != null && raw.subject !== ""
        ? String(raw.subject)
        : null,
    variablesUsed: parseVariablesFromBody(body),
    isActive: Boolean(raw.isActive),
    scopeType: String(raw.scopeType ?? "Global"),
    scopeId: raw.scopeId != null ? Number(raw.scopeId) : null,
    language: String(raw.language ?? "en"),
    templateVersion: Number(raw.templateVersion ?? 1),
    createdAtUtc: String(raw.createdAtUtc ?? ""),
    updatedAtUtc: String(raw.updatedAtUtc ?? ""),
  };
}

/** Map our create/update shape to API DTO. */
function toApiDto(
  dto: MessageTemplateCreateUpdate & { name?: string }
): Record<string, unknown> {
  return {
    templateKey: dto.templateKey ?? dto.name ?? null,
    eventType: dto.eventType,
    channel: dto.channel,
    scopeType: dto.scopeType,
    scopeId: dto.scopeId ?? null,
    language: dto.language,
    templateVersion: dto.templateVersion ?? 1,
    isActive: dto.isActive ?? true,
    subject: dto.subject ?? null,
    body: dto.body,
  };
}

export async function getTemplates(
  params?: GetTemplatesParams
): Promise<MessageTemplate[]> {
  const { data } = await api.get(BASE, { params: params ?? {} });
  const list = Array.isArray(data) ? data : asArray(data, "templates");
  return list.map((item: unknown) => toTemplate(item as Record<string, unknown>));
}

export async function getTemplate(id: number): Promise<MessageTemplate | null> {
  try {
    const { data } = await api.get(`${BASE}/${id}`);
    return toTemplate(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function createTemplate(
  payload: MessageTemplateCreateUpdate & { name?: string }
): Promise<MessageTemplate> {
  const { data } = await api.post(BASE, toApiDto(payload));
  return toTemplate(data as Record<string, unknown>);
}

export async function updateTemplate(
  id: number,
  payload: MessageTemplateCreateUpdate & { name?: string }
): Promise<MessageTemplate> {
  const { data } = await api.put(`${BASE}/${id}`, toApiDto(payload));
  return toTemplate(data as Record<string, unknown>);
}

export async function deleteTemplate(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}

/** Optional: update schedule rule (if API supports PUT .../schedule). */
export async function updateTemplateSchedule(
  id: number,
  rule: ScheduleRule
): Promise<void> {
  await api.put(`${BASE}/${id}/schedule`, rule);
}
