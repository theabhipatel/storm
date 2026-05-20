import nodemailer, { type Transporter } from "nodemailer";

import type { Config } from "../config.js";

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
}

export interface EmailProvider {
  send(input: SendEmailInput): Promise<unknown>;
}

export function createEmailProvider(config: Config): EmailProvider {
  let cached: Transporter | undefined;

  function transporter(): Transporter {
    if (cached) return cached;
    if (config.emailProvider === "mailhog") {
      cached = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: false,
        ignoreTLS: true,
      });
    } else {
      cached = nodemailer.createTransport({
        host: `email-smtp.${config.awsRegion}.amazonaws.com`,
        port: 587,
        secure: false,
      });
    }
    return cached;
  }

  return {
    async send(input) {
      const info = await transporter().sendMail({
        from: config.emailFrom,
        to: input.to,
        subject: input.subject,
        ...(input.html ? { html: input.html } : {}),
        ...(input.text ? { text: input.text } : {}),
        ...(input.attachments && input.attachments.length
          ? {
              attachments: input.attachments.map((a) => ({
                filename: a.filename,
                content: a.content,
                ...(a.contentType ? { contentType: a.contentType } : {}),
              })),
            }
          : {}),
      });
      return { messageId: info.messageId };
    },
  };
}
