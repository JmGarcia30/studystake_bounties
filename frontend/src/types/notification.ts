export type NotificationType =
  | "escrow_deposit"
  | "proof_submitted"
  | "payout_released"
  | "reputation_update"
  | "system";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkUrl?: string;
  txHash?: string;
}
