import type { NotificationItem, NotificationType } from "../types/notification";

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    type: "escrow_deposit",
    title: "Soroban Escrow Funded",
    message: "5.0 XLM bounty locked into contract CCEB...XI7I for Rust Soroban Contract Escrow Bugfix.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: "notif_2",
    type: "reputation_update",
    title: "Reputation Badge Unlocked",
    message: "You earned the Soroban Pioneer badge for active Stellar Testnet contract interactions.",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
  },
  {
    id: "notif_3",
    type: "system",
    title: "Welcome to StudyStake",
    message: "Your Stellar Wallet address is verified. You can now claim micro-bounties and submit proof.",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  },
];

let activeNotifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];

export async function fetchNotifications(): Promise<NotificationItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return [...activeNotifications];
}

export function addNotification(
  type: NotificationType,
  title: string,
  message: string,
  txHash?: string
): NotificationItem {
  const item: NotificationItem = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    txHash,
  };
  activeNotifications = [item, ...activeNotifications];
  return item;
}

export function markAsRead(id: string): void {
  activeNotifications = activeNotifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
}

export function markAllAsRead(): void {
  activeNotifications = activeNotifications.map((n) => ({ ...n, read: true }));
}
