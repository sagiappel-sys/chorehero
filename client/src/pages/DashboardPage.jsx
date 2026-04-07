import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { householdsAPI } from "../services/api";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { chores, members, notifications, household, completeChore, fetchAll } = useApp();
  const [showActivity, setShowActivity] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [adminLoading, setAdminLoading] = useState(null); // userId being updated

  // Stats
  const myChores = chores.filter((c) => !c.isCompleted && c.assignedTo?._id === user?._id);
  const completedThisWeek = chores.filter(
    (c) => c.isCompleted && c.completedBy?._id === user?._id
  ).length;

  // Hero (highest weekly scorer)
  const sorted = [...members].sort((a, b) => b.weeklyScore - a.weeklyScore);
  const hero = sorted[0]?.weeklyScore > 0 ? sorted[0] : null;

  // My rank
  const myRank = sorted.findIndex((m) => m._id === user?._id) + 1;
  const rankLabel = myRank === 1 ? "🥇" : myRank === 2 ? "🥈" : myRank === 3 ? "🥉" : myRank > 0 ? `#${myRank}` : "–";

  const recentActivity = notifications.slice(0, 15);
  const unreadActivity = notifications.filter((n) => !n.readBy?.includes(user?._id)).length;

  const adminCount = members.filter((m) => m.isAdmin).length;

  // Invite link
  const inviteLink = household
    ? `${window.location.origin}/invite/${household.inviteCode}`
    : null;

  const handleCopyInvite = async () => {
    if (!inviteLink) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Join ${household.name} on ChoreHero`, url: inviteLink });
      } else {
        await navigator.clipboard.writeText(inviteLink);
        toast.success("Invite link copied! 🔗");
      }
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleAdminToggle = async (member) => {
    const action = member.isAdmin ? "demote" : "promote";

    if (action === "promote" && adminCount >= 3) {
      return toast.error("Maximum 3 admins allowed");
    }
    if (action === "demote" && member._id === user?._id && adminCount === 1) {
      return toast.error("You're the last admin — can't remove yourself");
    }

    setAdminLoading(member._id);
    try {
      await householdsAPI.updateAdmin(member._id, action);
      await fetchAll();
      toast.success(
        action === "promote"
          ? `${member.name} is now a co-admin 👑`
          : `${member.name} removed from admins`
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update admin");
    } finally {
      setAdminLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/50 text-sm">{household?.name || "Your household"}</p>
          <h1 className="font-bangers text-3xl tracking-wider text-purple-300">
            {user?.emoji} {user?.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {inviteLink && (
            <button
              onClick={handleCopyInvite}
              className="text-xs bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              🔗 Invite
            </button>
          )}
          <button onClick={logout} className="text-white/30 text-sm hover:text-white/60 transition-colors">
            Sign out
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      {hero ? (
        <div
          className="hero-banner-bg relative overflow-hidden"
          style={{ borderRadius: 18, border: "2px solid #fbbf24", padding: "14px 16px" }}
        >
          <span className="star-a" style={{ position: "absolute", top: 7, left: 10, fontSize: 15, opacity: 0.7 }}>⭐</span>
          <span className="star-b" style={{ position: "absolute", top: 6, right: 14, fontSize: 13, opacity: 0.6 }}>✨</span>
          <span className="star-c" style={{ position: "absolute", bottom: 8, left: 18, fontSize: 11, opacity: 0.5 }}>⭐</span>
          <span className="star-d" style={{ position: "absolute", bottom: 7, right: 10, fontSize: 14, opacity: 0.65 }}>✨</span>
          <div className="flex items-center justify-center gap-3 relative" style={{ zIndex: 1 }}>
            <span style={{ fontSize: 38 }}>{hero.emoji}</span>
            <div className="text-center">
              <div style={{ fontSize: 10, fontWeight: 900, color: "#3b1a07", letterSpacing: 1 }}>👑 CURRENT HERO 👑</div>
              <div className="font-bangers" style={{ fontSize: 28, color: "#1c0a03", lineHeight: 1.1 }}>{hero.name}</div>
              <div style={{ fontSize: 12, color: "#78350f" }}>{hero.weeklyScore} pts this week</div>
            </div>
            <span style={{ fontSize: 30 }}>🏆</span>
          </div>
        </div>
      ) : (
        <div className="card text-center py-3" style={{ borderStyle: "dashed", borderColor: "rgba(251,191,36,0.2)" }}>
          <span className="text-sm text-white/40">👑 Crown is unclaimed — complete chores to become the hero!</span>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "My Tasks", value: myChores.length, icon: "📋" },
          { label: "Done / Week", value: completedThisWeek, icon: "✅" },
          { label: "My Points", value: user?.weeklyScore ?? 0, icon: "⭐" },
          { label: "My Rank", value: rankLabel, icon: "🏅" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card text-center p-3">
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-lg font-bold text-purple-300">{value}</div>
            <div className="text-[10px] text-white/40 leading-tight">{label}</div>
          </div>
        ))}
      </div>

      {/* My pending chores */}
      {myChores.length > 0 && (
        <div>
          <h2 className="font-semibold text-white/70 text-sm mb-2">📌 Assigned to me</h2>
          <div className="space-y-2">
            {myChores.slice(0, 4).map((chore) => (
              <div key={chore._id} className="card flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{chore.emoji}</span>
                  <div>
                    <div className="font-medium text-sm">{chore.title}</div>
                    <span className={`badge-${chore.difficulty}`}>{chore.difficulty} · {chore.points}pts</span>
                  </div>
                </div>
                <button
                  onClick={() => completeChore(chore._id)}
                  className="btn-primary text-xs px-3 py-1.5 shrink-0"
                >
                  Done ✓
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members section */}
      <div>
        <button
          className="w-full flex items-center justify-between mb-2 text-left"
          onClick={() => setShowMembers((v) => !v)}
        >
          <span className="font-semibold text-white/70 text-sm flex items-center gap-2">
            👥 Members
            <span className="text-white/30 font-normal">({members.length})</span>
            {user?.isAdmin && (
              <span className="text-[10px] bg-purple-600/30 text-purple-300 px-1.5 py-0.5 rounded-md">
                {adminCount}/3 admins
              </span>
            )}
          </span>
          <span
            className="text-white/40 text-sm transition-transform duration-300"
            style={{ display: "inline-block", transform: showMembers ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            ▼
          </span>
        </button>

        {showMembers && (
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m._id} className="card flex items-center justify-between gap-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{m.emoji}</span>
                  <div>
                    <div className="font-medium text-sm flex items-center gap-1.5">
                      {m.name}
                      {m.isAdmin && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md">
                          👑 Admin
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/30">{m.weeklyScore} pts this week</div>
                  </div>
                </div>
                {/* Admin can promote/demote others (not themselves if last admin) */}
                {user?.isAdmin && m._id !== user?._id && (
                  <button
                    onClick={() => handleAdminToggle(m)}
                    disabled={
                      adminLoading === m._id ||
                      (!m.isAdmin && adminCount >= 3)
                    }
                    className={`text-xs px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40 ${
                      m.isAdmin
                        ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        : "bg-purple-600/30 text-purple-300 hover:bg-purple-600/50"
                    }`}
                  >
                    {adminLoading === m._id
                      ? "…"
                      : m.isAdmin
                      ? "Remove admin"
                      : "Make admin"}
                  </button>
                )}
              </div>
            ))}
            {user?.isAdmin && (
              <p className="text-xs text-white/20 text-center pt-1">
                Max 3 admins per household
              </p>
            )}
          </div>
        )}
      </div>

      {/* Recent Activity collapsible */}
      <div>
        <button
          className="w-full flex items-center justify-between mb-2 text-left"
          onClick={() => setShowActivity((v) => !v)}
        >
          <span className="font-semibold text-white/70 text-sm flex items-center gap-2">
            🔔 Recent Activity
            {unreadActivity > 0 && (
              <span className="badge bg-purple-600/60 text-purple-200">{unreadActivity} new</span>
            )}
          </span>
          <span
            className="text-white/40 text-sm transition-transform duration-300"
            style={{ display: "inline-block", transform: showActivity ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            ▼
          </span>
        </button>

        {showActivity && (
          <div className="space-y-2">
            {recentActivity.length === 0 ? (
              <p className="text-center text-white/30 text-sm py-4">No activity yet</p>
            ) : (
              recentActivity.map((n) => (
                <div key={n._id} className="card flex items-start gap-3 py-2.5">
                  <span className="text-lg shrink-0">{n.emoji}</span>
                  <div>
                    <p className="text-sm leading-snug">{n.message}</p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
