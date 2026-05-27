-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('created', 'captured', 'failed');

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "razorpay_order_id" TEXT NOT NULL,
    "razorpay_payment_id" TEXT,
    "amount_paise" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "method" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'created',
    "captured_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processed_webhook_events" (
    "razorpay_event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_webhook_events_pkey" PRIMARY KEY ("razorpay_event_id")
);

-- CreateTable
CREATE TABLE "reconciliation_reports" (
    "id" UUID NOT NULL,
    "for_date" DATE NOT NULL,
    "our_count" INTEGER NOT NULL,
    "razorpay_count" INTEGER NOT NULL,
    "matched_count" INTEGER NOT NULL,
    "missing_in_ours" JSONB NOT NULL,
    "missing_in_rzp" JSONB NOT NULL,
    "mismatches" JSONB NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reconciliation_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox" (
    "id" UUID NOT NULL,
    "aggregate_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payments_order_id_idx" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "payments_razorpay_order_id_idx" ON "payments"("razorpay_order_id");

-- CreateIndex
CREATE INDEX "payments_status_created_at_idx" ON "payments"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "reconciliation_reports_for_date_key" ON "reconciliation_reports"("for_date");

-- CreateIndex
CREATE INDEX "outbox_published_at_created_at_idx" ON "outbox"("published_at", "created_at");
