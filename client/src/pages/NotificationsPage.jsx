import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { notificationsAPI } from "../services/api";

const TYPE_ICONS = {
  chore_completed: "✅",
  chore_added:     "📋",
  chore_deleted:   "🗑️",
  member_joined:   "👋",
  general:         "🔔",
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications } = useApp();

  // Mark all as read when page is opened
  useEffect(() => {
    notificationsAPI.markAllRead().catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="font-bangers text-3xl tracking-wider text-purple-300">🔔 Activity</h1>

      {notifications.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-2">🔕</div>
          <p className="text-white/50">No activity yet</p>
          <p className="text-white/30 text-sm mt-1">Complete chores to see updates here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const isUnread = !n.readBy?.includes(user?._id);
            return (
              <div
                key={n._id}
                className={`card flex items-start gap-3 py-3 transition-colors ${
                  isUnread ? "border-purple-500/30 bg-purple-900/10" : ""
                }`}
              >
                <span className="text-xl shrink-0 mt-0.5">
                  {TYPE_ICONS[n.type] || n.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{n.message}</p>
                  <p className="text-xs text-white/30 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                {isUnread && (
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
