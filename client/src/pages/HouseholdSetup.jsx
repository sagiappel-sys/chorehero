import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

export default function HouseholdSetup() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // "create" | "join"
  const [householdName, setHouseholdName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.createHousehold({ householdName });
      updateUser({ householdId: data._id, isAdmin: true });
      toast.success(`"${data.name}" created! Invite code: ${data.inviteCode} 🏠`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create household");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.joinHousehold({ inviteCode });
      updateUser({ householdId: data._id, isAdmin: false });
      toast.success(`Joined "${data.name}"! 🎉`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid invite code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{user?.emoji || "😊"}</div>
          <h2 className="text-xl font-bold">Hi, {user?.name}!</h2>
          <p className="text-white/50 text-sm mt-1">Set up your household to get started</p>
        </div>

        {!mode ? (
          <div className="space-y-3">
            <button
              onClick={() => setMode("create")}
              className="w-full card text-left hover:border-purple-500/50 transition-colors cursor-pointer"
            >
              <div className="text-2xl mb-1">🏠</div>
              <div className="font-semibold">Create a household</div>
              <div className="text-sm text-white/50 mt-0.5">Start fresh and invite your housemates</div>
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full card text-left hover:border-purple-500/50 transition-colors cursor-pointer"
            >
              <div className="text-2xl mb-1">🔑</div>
              <div className="font-semibold">Join a household</div>
              <div className="text-sm text-white/50 mt-0.5">Enter an invite code from your housemate</div>
            </button>
          </div>
        ) : mode === "create" ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <button type="button" onClick={() => setMode(null)} className="text-white/40 text-sm flex items-center gap-1">
              ← Back
            </button>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/70">Household name</label>
              <input
                className="input"
                placeholder="e.g. The Smith House"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
              {loading ? "Creating…" : "Create Household 🏠"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <button type="button" onClick={() => setMode(null)} className="text-white/40 text-sm">← Back</button>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/70">Invite code</label>
              <input
                className="input uppercase tracking-widest text-center text-lg font-bold"
                placeholder="A3F7B2C1"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={8}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
              {loading ? "Joining…" : "Join Household 🔑"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
