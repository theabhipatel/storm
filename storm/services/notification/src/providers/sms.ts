import twilio from "twilio";
import type { Logger } from "@storm/logger";

import type { Config } from "../config.js";

export interface SendSmsInput {
  to: string;
  body: string;
}

export interface SmsProvider {
  send(input: SendSmsInput): Promise<unknown>;
}

// When Twilio creds are missing we log the OTP instead of sending it. This keeps
// local dev usable without exposing real keys and matches the design's
// "stub-if-no-creds" behavior.
export function createSmsProvider(config: Config, logger: Logger): SmsProvider {
  const hasCreds = Boolean(
    config.twilioAccountSid && config.twilioAuthToken && config.twilioFromNumber,
  );
  if (!hasCreds) {
    logger.warn("twilio_creds_missing_running_in_stub_mode");
    return {
      async send({ to, body }) {
        logger.info({ to, body }, "sms_stub_send");
        return { messageId: "stub" };
      },
    };
  }
  const client = twilio(config.twilioAccountSid!, config.twilioAuthToken!);
  return {
    async send({ to, body }) {
      const message = await client.messages.create({
        to,
        from: config.twilioFromNumber!,
        body,
      });
      return { messageId: message.sid, status: message.status };
    },
  };
}
