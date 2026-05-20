import {
  OrderEventTypes,
  OrderConfirmedPayload,
  OrderFailedPayload,
  OrderStatusChangedPayload,
  OrderCancelledPayload,
} from "@storm/contracts";

import { renderEmail, renderSms } from "../templates/render.js";
import { generateInvoicePdf, type InvoiceLineItem } from "../services/invoicePdf.js";
import type { EventHandler, HandlerDeps, HandledEnvelope } from "./identity.js";

const STATUS_TEMPLATE_MAP: Record<string, { email: string; sms: string } | undefined> = {
  processing: {
    email: "order-status-processing",
    sms: "order-status-processing-sms",
  },
  shipped: {
    email: "order-status-shipped",
    sms: "order-status-shipped-sms",
  },
  delivered: {
    email: "order-status-delivered",
    sms: "order-status-delivered-sms",
  },
};

const PAYMENT_METHOD_LABEL = "Razorpay";

export const orderEventHandlers: Record<string, EventHandler> = {
  [OrderEventTypes.Confirmed]: async (env, deps) => {
    const payload = OrderConfirmedPayload.parse(env.payload);
    const customerName = payload.customerName ?? "Customer";
    const customerEmail = payload.customerEmail;
    if (!customerEmail) {
      deps.logger.warn(
        { orderId: payload.orderId },
        "order_confirmed_skipped_missing_email",
      );
      return;
    }

    const totalRupees = formatRupees(payload.totalPaise);
    const itemsCount = payload.items.reduce((acc, i) => acc + i.qty, 0);
    const paidAtIst = formatIst(payload.paidAt);
    const orderShort = payload.orderId.slice(0, 8);

    const addressFromPayload =
      payload.address ??
      ({
        fullName: customerName,
        phone: "",
        line1: "",
        city: "",
        state: "",
        pincode: "",
        country: "IN",
      } as NonNullable<typeof payload.address>);

    const pdf = await generateInvoicePdf({
      orderId: payload.orderId,
      paidAtIso: payload.paidAt,
      customerName,
      customerEmail,
      address: {
        fullName: addressFromPayload.fullName,
        phone: addressFromPayload.phone,
        line1: addressFromPayload.line1,
        line2: addressFromPayload.line2 ?? null,
        city: addressFromPayload.city,
        state: addressFromPayload.state,
        pincode: addressFromPayload.pincode,
        country: addressFromPayload.country ?? "IN",
      },
      items: buildInvoiceItems(payload),
      subtotalPaise: payload.subtotalPaise ?? payload.totalPaise,
      shippingFeePaise: payload.shippingFeePaise ?? 0,
      totalPaise: payload.totalPaise,
      currency: payload.currency,
      paymentMethod: PAYMENT_METHOD_LABEL,
      brand: {
        companyName: deps.config.invoiceCompanyName,
        tagline: deps.config.invoiceCompanyTagline,
      },
    });

    await deps.invoiceStore.save(payload.orderId, pdf);

    const tpl = await renderEmail(deps.mongo.templates, "order-confirmed", {
      orderId: payload.orderId,
      customerName,
      itemsCount,
      totalRupees,
      paidAtIst,
    });
    const emailResult = await deps.email.send({
      to: customerEmail,
      ...tpl,
      attachments: [
        {
          filename: `invoice-${orderShort}.pdf`,
          content: pdf,
          contentType: "application/pdf",
        },
      ],
    });
    await logSend(deps, env, payload.userId, "email", "order-confirmed", {
      orderId: payload.orderId,
      totalPaise: payload.totalPaise,
    }, emailResult);

    // SMS only if we have a phone — taken from address snapshot.
    if (addressFromPayload.phone) {
      const sms = await renderSms(deps.mongo.templates, "order-confirmed-sms", {
        orderShort,
        totalRupees,
      });
      const to = formatPhone(addressFromPayload.phone);
      await deps.sms
        .send({ to, body: sms.body })
        .catch((err: unknown) => {
          deps.logger.warn({ err, orderId: payload.orderId }, "order_confirmed_sms_failed");
        });
    }
  },

  [OrderEventTypes.StatusChanged]: async (env, deps) => {
    const payload = OrderStatusChangedPayload.parse(env.payload);
    const tplIds = STATUS_TEMPLATE_MAP[payload.toStatus];
    if (!tplIds) {
      deps.logger.debug(
        { orderId: payload.orderId, toStatus: payload.toStatus },
        "order_status_no_template",
      );
      return;
    }
    const customerName = payload.customerName ?? "Customer";
    const orderShort = payload.orderId.slice(0, 8);

    if (payload.customerEmail) {
      const tpl = await renderEmail(deps.mongo.templates, tplIds.email, {
        orderId: payload.orderId,
        customerName,
      });
      const emailResult = await deps.email.send({ to: payload.customerEmail, ...tpl });
      await logSend(
        deps,
        env,
        payload.userId,
        "email",
        tplIds.email,
        { orderId: payload.orderId, toStatus: payload.toStatus },
        emailResult,
      );
    } else {
      deps.logger.warn(
        { orderId: payload.orderId },
        "order_status_skipped_missing_email",
      );
    }

    if (payload.phone) {
      const sms = await renderSms(deps.mongo.templates, tplIds.sms, { orderShort });
      const to = formatPhone(payload.phone);
      const smsResult = await deps.sms
        .send({ to, body: sms.body })
        .catch((err: unknown) => {
          deps.logger.warn({ err, orderId: payload.orderId }, "order_status_sms_failed");
          return undefined;
        });
      if (smsResult) {
        await logSend(
          deps,
          env,
          payload.userId,
          "sms",
          tplIds.sms,
          { orderId: payload.orderId, toStatus: payload.toStatus },
          smsResult,
        );
      }
    }
  },

  [OrderEventTypes.Cancelled]: async (env, deps) => {
    const payload = OrderCancelledPayload.parse(env.payload);
    if (payload.cancelledBy === "system") {
      deps.logger.debug({ orderId: payload.orderId }, "order_cancelled_system_no_notify");
      return;
    }
    const customerName = payload.customerName ?? "Customer";
    const orderShort = payload.orderId.slice(0, 8);
    const emailTpl =
      payload.cancelledBy === "admin"
        ? "order-cancelled-by-admin"
        : "order-cancelled-by-customer";
    const smsTpl =
      payload.cancelledBy === "admin"
        ? "order-cancelled-by-admin-sms"
        : "order-cancelled-by-customer-sms";

    if (payload.customerEmail) {
      const tpl = await renderEmail(deps.mongo.templates, emailTpl, {
        orderId: payload.orderId,
        customerName,
        reason: payload.reason ?? "",
      });
      const emailResult = await deps.email.send({ to: payload.customerEmail, ...tpl });
      await logSend(
        deps,
        env,
        payload.userId,
        "email",
        emailTpl,
        {
          orderId: payload.orderId,
          cancelledBy: payload.cancelledBy,
          reason: payload.reason ?? null,
        },
        emailResult,
      );
    } else {
      deps.logger.warn(
        { orderId: payload.orderId },
        "order_cancelled_skipped_missing_email",
      );
    }

    if (payload.phone) {
      const sms = await renderSms(deps.mongo.templates, smsTpl, { orderShort });
      const to = formatPhone(payload.phone);
      const smsResult = await deps.sms
        .send({ to, body: sms.body })
        .catch((err: unknown) => {
          deps.logger.warn({ err, orderId: payload.orderId }, "order_cancelled_sms_failed");
          return undefined;
        });
      if (smsResult) {
        await logSend(
          deps,
          env,
          payload.userId,
          "sms",
          smsTpl,
          { orderId: payload.orderId, cancelledBy: payload.cancelledBy },
          smsResult,
        );
      }
    }
  },

  [OrderEventTypes.Failed]: async (env, deps) => {
    const payload = OrderFailedPayload.parse(env.payload);
    // The Order.Failed payload deliberately stays slim. For Stage 1 we just log
    // the notification intent; surfacing failure to the customer happens via UI.
    deps.logger.info(
      { orderId: payload.orderId, reason: payload.reason },
      "order_failed_notified",
    );
    await deps.mongo.logs.updateOne(
      { eventId: env.eventId },
      {
        $set: {
          eventId: env.eventId,
          userId: payload.userId,
          channel: "email",
          templateId: "order-failed",
          templateVersion: 1,
          payload: { orderId: payload.orderId, reason: payload.reason },
          status: "failed",
          errorMessage: "no_contact_in_payload",
          failedAt: new Date(),
        },
        $inc: { attempts: 1 },
      },
      { upsert: true },
    );
  },
};

function buildInvoiceItems(payload: ReturnType<typeof OrderConfirmedPayload.parse>): InvoiceLineItem[] {
  return payload.items.map((it) => ({
    name: it.sku,
    sku: it.sku,
    qty: it.qty,
    unitPricePaise: it.pricePaise,
    lineTotalPaise: it.pricePaise * it.qty,
  }));
}

function formatRupees(paise: number): string {
  return (paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatIst(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function formatPhone(raw: string): string {
  if (raw.startsWith("+")) return raw;
  if (/^[6-9]\d{9}$/.test(raw)) return `+91${raw}`;
  return raw;
}

async function logSend(
  deps: HandlerDeps,
  env: HandledEnvelope,
  userId: string,
  channel: "email" | "sms",
  templateId: string,
  payload: Record<string, unknown>,
  providerResponse: unknown,
): Promise<void> {
  await deps.mongo.logs.updateOne(
    { eventId: `${env.eventId}:${channel}:${templateId}` },
    {
      $set: {
        eventId: env.eventId,
        userId,
        channel,
        templateId,
        templateVersion: 1,
        payload,
        status: "sent",
        providerResponse,
        sentAt: new Date(),
      },
      $inc: { attempts: 1 },
    },
    { upsert: true },
  );
}
