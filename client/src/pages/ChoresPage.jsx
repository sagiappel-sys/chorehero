import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";

const EMOJIS = ["🧹","🍽️","🪣","🧺","🛒","🪴","🐾","🔧","🚗","🗑️","🧴","🪟","🛁","💡","📦"];
const DIFFICULTIES = ["easy", "medium", "hard"];
const FREQUENCIES = ["daily", "weekly", "monthly", "once"];

function ChoreForm({ initial = {}, members = [], onSubmit, onClose, title }) {
  const [form, setForm] = useState({
    title: initial.title || "",
    emoji: initial.emoji || "🧹",
    difficulty: initial.difficulty || "medium",
    frequency: initial.frequency || "weekly",
    assignedTo: initial.assignedTo?._id || initial.assignedTo || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-full max-w-md card rounded-b-none rounded-t-3xl p-6 space-y-4"
           style={{ maxHeight: "90dvh", overflowY: "auto" }}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-white/40 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emoji */}
          <div>
            <label className="block text-xs font-medium mb-2 text-white/60">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map((em) => (
                <button key={em} type="button"
                  onClick={() => setForm((p) => ({ ...p, emoji: em }))}
                  className={`text-xl w-9 h-9 rounded-lg transition-all ${
                    form.emoji === em ? "bg-purple-600 ring-2 ring-purple-400 scale-110" : "bg-white/5 hover:bg-white/10"
                  }`}
                >{em}</button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-white/60">Task name</label>
            <input className="input" placeholder="e.g. Vacuum the living room"
              value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-white/60">Difficulty</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button key={d} type="button"
                  onClick={() => setForm((p) => ({ ...p, difficulty: d }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                    form.difficulty === d ? "bg-purple-600" : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {d === "easy" ? "🟢" : d === "medium" ? "🟡" : "🔴"} {d}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-white/60">Frequency</label>
            <select className="input" value={form.frequency}
              onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))}>
              {FREQUENCIES.map((f) => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
            </select>
          </div>

          {/* Assign to */}
          {members.length > 0 && (
            <div>
              <label className="block text-xs font-medium mb-1.5 text-white/60">Assign to</label>
              <select className="input" value={form.assignedTo}
                onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))}>
                <option value="">Anyone</option>
                {members.map((m) => <option key={m._id} value={m._id}>{m.emoji} {m.name}</option>)}
              </select>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
            {loading ? "Saving…" : title}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ChoresPage() {
  const { user } = useAuth();
  const { chores, members, addChore, editChore, removeChore, completeChore } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editingChore, setEditingChore] = useState(null);

  const pending   = chores.filter((c) => !c.isCompleted);
  const completed = chores.filter((c) =>  c.isCompleted);

  const handleAdd = async (form) => {
    try {
      await addChore(form);
      toast.success("Chore added! 📋");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add chore");
      throw err;
    }
  };

  const handleEdit = async (form) => {
    try {
      await editChore(editingChore._id, form);
      toast.success("Chore updated ✏️");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update chore");
      throw err;
    }
  };

  const handleDelete = async (chore) => {
    if (!confirm(`Delete "${chore.title}"?`)) return;
    try {
      await removeChore(chore._id);
      toast.success("Chore deleted 🗑️");
    } catch (err) {
      toast.error("Failed to delete chore");
    }
  };

  const handleComplete = async (id) => {
    try {
      const { pointsEarned } = await completeChore(id);
      toast.success(`+${pointsEarned} pts! Great work! 🎉`);
    } catch (err) {
      toast.error("Failed to mark as done");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-bangers text-3xl tracking-wider text-purple-300">📋 Chores</h1>
        {user?.isAdmin && (
          <button onClick={() => setShowAdd(true)} className="btn-primary px-4 py-2 text-sm">
            + Add Chore
          </button>
        )}
      </div>

      {/* Pending */}
      {pending.length === 0 ? (
        <div className="card text-center py-8">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-white/60">All chores done!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pending.map((chore) => (
            <div key={chore._id} className="card flex items-start gap-3">
              <span className="text-2xl mt-0.5">{chore.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{chore.title}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`badge-${chore.difficulty}`}>{chore.difficulty}</span>
                  <span className="text-xs text-white/40">{chore.points} pts</span>
                  <span className="text-xs text-white/40 capitalize">{chore.frequency}</span>
                  {chore.assignedTo && (
                    <span className="text-xs text-purple-400">{chore.assignedTo.emoji} {chore.assignedTo.name}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {user?.isAdmin && (
                  <>
                    <button onClick={() => setEditingChore(chore)}
                      className="text-white/40 hover:text-yellow-400 transition-colors text-base">✏️</button>
                    <button onClick={() => handleDelete(chore)}
                      className="text-white/40 hover:text-red-400 transition-colors text-base">🗑️</button>
                  </>
                )}
                <button onClick={() => handleComplete(chore._id)}
                  className="btn-primary text-xs px-3 py-1.5 ml-1">
                  Done ✓
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h2 className="font-semibold text-white/50 text-sm mb-2">✅ Completed ({completed.length})</h2>
          <div className="space-y-2">
            {completed.slice(0, 5).map((chore) => (
              <div key={chore._id} className="card flex items-center gap-3 opacity-50">
                <span className="text-xl">{chore.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm line-through truncate">{chore.title}</div>
                  {chore.completedBy && (
                    <span className="text-xs text-white/40">by {chore.completedBy.emoji} {chore.completedBy.name}</span>
                  )}
                </div>
                <span className="text-xs text-green-400 shrink-0">+{chore.points}pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <ChoreForm title="Add Chore" members={members} onSubmit={handleAdd} onClose={() => setShowAdd(false)} />
      )}
      {editingChore && (
        <ChoreForm title="Edit Chore" initial={editingChore} members={members}
          onSubmit={handleEdit} onClose={() => setEditingChore(null)} />
      )}
    </div>
  );
}
