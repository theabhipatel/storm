"use client";

import dynamic from "next/dynamic";

import { AccountShell } from "../../../components/domain/AccountShell";

const NotificationsList = dynamic(
  () =>
    import("../../../features/notifications/NotificationsList").then(
      (m) => m.NotificationsList,
    ),
  { ssr: false },
);

export default function NotificationsPage() {
  return (
    <AccountShell title="Notifications">
      <NotificationsList />
    </AccountShell>
  );
}
