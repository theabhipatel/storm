import Handlebars from "handlebars";

import type { Collection } from "mongodb";
import type { TemplateRow } from "../infra/mongo.js";
import { TEMPLATE_SEED } from "./seed.js";

export async function ensureTemplatesSeeded(
  collection: Collection<TemplateRow>,
): Promise<void> {
  const now = new Date();
  for (const t of TEMPLATE_SEED) {
    await collection.updateOne(
      { _id: t._id },
      { $set: { ...t }, $setOnInsert: { createdAt: now } },
      { upsert: true },
    );
  }
}

export interface RenderedEmail {
  subject: string;
  html?: string;
  text?: string;
}

export interface RenderedSms {
  body: string;
}

export async function renderEmail(
  collection: Collection<TemplateRow>,
  templateId: string,
  vars: Record<string, unknown>,
): Promise<RenderedEmail> {
  const tpl = await collection.findOne({ _id: templateId });
  if (!tpl) throw new Error(`template_not_found:${templateId}`);
  if (tpl.channel !== "email") throw new Error(`template_channel_mismatch:${templateId}`);
  return {
    subject: Handlebars.compile(tpl.subject ?? "")(vars),
    ...(tpl.htmlBody ? { html: Handlebars.compile(tpl.htmlBody)(vars) } : {}),
    ...(tpl.textBody ? { text: Handlebars.compile(tpl.textBody)(vars) } : {}),
  };
}

export async function renderSms(
  collection: Collection<TemplateRow>,
  templateId: string,
  vars: Record<string, unknown>,
): Promise<RenderedSms> {
  const tpl = await collection.findOne({ _id: templateId });
  if (!tpl) throw new Error(`template_not_found:${templateId}`);
  if (tpl.channel !== "sms") throw new Error(`template_channel_mismatch:${templateId}`);
  return { body: Handlebars.compile(tpl.smsBody ?? "")(vars) };
}
