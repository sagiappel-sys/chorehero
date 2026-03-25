import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { members, chores } = useApp();

  const sorted = [...members].sort((a, b) => b.weeklyScore - a.weeklyScore);
  const topScore = sorted[0]?.weeklyScore || 0;

  return (
    <div className="space-y-5">
      <h1 className="font-bangers text-3xl tracking-wider text-purple-300">🏆 Leaderboard</h1>

      <div className="card text-center py-1">
        <p className="text-xs text-white/40 mb-0.5">This week's standings</p>
      </div>

      <div className="space-y-3">
        {sorted.map((member, index) => {
          const isMe = member._id === user?._id;
          const pct = topScore > 0 ? (member.weeklyScore / topScore) * 100 : 0;

          return (
            <div
              key={member._id}
              className={`card flex items-center gap-3 ${isMe ? "border-purple-500/50 bg-purple-900/10" : ""}`}
            >
              <div className="text-2xl w-8 text-center">
                {index < 3 ? MEDALS[index] : <span className="text-white/40 text-base">#{index + 1}</span>}
              </div>
              <span className="text-2xl">{member.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold truncate">{member.name}</span>
                  {isMe && <span className="text-xs text-purple-400 font-medium">(you)</span>}
                </div>
                {/* Progress bar */}
                <div className="mt-1.5 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: index === 0
                        ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                        : "linear-gradient(90deg, #7c3aed, #a855f7)",
                    }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-purple-300">{member.weeklyScore}</div>
                <div className="text-xs text-white/40">pts</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* All-time stats */}
      {sorted.some((m) => m.totalScore > 0) && (
        <div>
          <h2 className="font-semibold text-white/50 text-sm mb-2">🌟 All-Time Scores</h2>
          <div className="space-y-2">
            {[...members]
              .sort((a, b) => b.totalScore - a.totalScore)
              .map((member) => (
                <div key={member._id} className="card flex items-center gap-3 py-2.5">
                  <span className="text-xl">{member.emoji}</span>
                  <span className="flex-1 font-medium text-sm">{member.name}</span>
                  <span className="text-white/60 text-sm font-semibold">{member.totalScore} pts</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
