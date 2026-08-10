import { useState, useEffect } from "react";
import { X, Bell, ShieldCheck, CheckCheck, ExternalLink, Zap, Award } from "lucide-react";
import type { NotificationItem } from "../../types/notification";
import { fetchNotifications, markAllAsRead, markAsRead } from "../../services/notificationService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDrawer({ isOpen, onClose }: Props) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications().then(setNotifications);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAll = () => {
    markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSingleRead = (id: string) => {
    markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "escrow_deposit":
        return <Zap className="w-4 h-4 text-[#6C5CE7]" />;
      case "proof_submitted":
        return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
      case "reputation_update":
        return <Award className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs font-sans">
      <div className="absolute inset-0" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#6C5CE7]" />
              <h3 className="text-base font-bold text-slate-900 m-0">Notifications</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAll}
                className="text-[11px] font-semibold text-slate-500 hover:text-[#6C5CE7] flex items-center gap-1 cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto stroke-1" />
                <p className="text-xs font-medium">No new notifications</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSingleRead(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                    item.read
                      ? "bg-slate-50/60 border-slate-100 text-slate-600"
                      : "bg-purple-50/40 border-purple-100 text-slate-900 font-medium"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(item.type)}
                      <span className="text-xs font-bold">{item.title}</span>
                    </div>
                    {!item.read && <span className="w-2 h-2 rounded-full bg-[#6C5CE7]" />}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{item.message}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {item.txHash && (
                      <span className="flex items-center gap-1 text-[#6C5CE7] hover:underline">
                        <span>Ledger Tx</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            Real-time Soroban Smart Contract Event Stream
          </div>
        </div>
      </aside>
    </div>
  );
}
