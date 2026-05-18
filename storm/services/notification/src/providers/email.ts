import nodemailer, { type Transporter } from "nodemailer";

import type { Config } from "../config.js";

export interface SendEmailInput {
  to: string;
  subject: string;
  html?: string;
  text?: string;
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
      // SES via SMTP — keep nodemailer transport for parity with local;
      // production wiring uses the AWS SDK directly (added in a later day).
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
      });
      return { messageId: info.messageId };
    },
  };
}
