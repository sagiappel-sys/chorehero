import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { householdsAPI, authAPI } from "../services/api";
import toast from "react-hot-toast";

const EMOJIS = ["😊","🦸","🧙","🦊","🐼","🦁","🐯","🦋","🌟","🔥","⚡","🎯"];

export default function InvitePage() {
  const { code } = useParams();
  const { user, register, login, loginWithName, updateUser } = useAuth();
  const navigate = useNavigate();

  const [household, setHousehold] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState("register"); // "register" | "signin"
  const [signinMode, setSigninMode] = useState("email"); // "email" | "name"
  const [submitting, setSubmitting] = useState(false);

  // Register form
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "", emoji: "😊" });

  // Email sign-in form
  const [emailForm, setEmailForm] = useState({ email: "", password: "" });

  // Name sign-in (kid mode)
  const [selectedMember, setSelectedMember] = useState(null);
  const [kidPassword, setKidPassword] = useState("");

  // Fetch household info from invite code
  useEffect(() => {
    householdsAPI.getByInvite(code)
      .then((res) => setHousehold(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setPageLoading(false));
  }, [code]);

  // If already logged in, handle auto-join or redirect
  useEffect(() => {
    if (!user || !household) return;

    const userHouseholdId = String(user.householdId?._id || user.householdId || "");
    const householdId = String(household._id);

    if (userHouseholdId && userHouseholdId === householdId) {
      // Already in this household
      navigate("/", { replace: true });
    } else if (userHouseholdId && userHouseholdId !== householdId) {
      // In a different household
      toast.error("You're already part of another household.");
    } else {
      // Logged in but no household — auto-join
      autoJoin();
    }
  }, [user, household]);

  const autoJoin = async () => {
    try {
      const { data } = await authAPI.joinHousehold({ inviteCode: code });
      updateUser({ householdId: data._id, isAdmin: false });
      toast.success(`Joined "${household.name}"! 🎉`);
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to join household");
    }
  };

  const joinAfterAuth = async (userData) => {
    const userHouseholdId = String(userData.householdId?._id || userData.householdId || "");
    const householdId = String(household._id);

    if (userHouseholdId === householdId) {
      navigate("/", { replace: true });
      return;
    }
    if (userHouseholdId && userHouseholdId !== householdId) {
      toast.error("You're already part of another household.");
      return;
    }
    // No household yet — join
    const { data } = await authAPI.joinHousehold({ inviteCode: code });
    updateUser({ householdId: data._id, isAdmin: false });
    toast.success(`Joined "${household.name}"! 🎉`);
    navigate("/", { replace: true });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const userData = await register(regForm);
      await joinAfterAuth(userData);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const userData = await login(emailForm.email, emailForm.password);
      await joinAfterAuth(userData);
    } catch (err) {
      toast.error(err.response?.data?.message || "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNameSignIn = async (e) => {
    e.preventDefault();
    if (!selectedMember) return toast.error("Please select your name");
    setSubmitting(true);
    try {
      const userData = await loginWithName(selectedMember.name, code, kidPassword);
      toast.success(`Welcome back, ${userData.name}! 👋`);
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-purple-400">
        Loading…
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">🔗</div>
        <h2 className="text-xl font-bold mb-2">Invite link not found</h2>
        <p className="text-white/50 text-sm">This invite link may be invalid or expired.</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🏠</div>
          <h1 className="font-bangers text-3xl tracking-wider text-purple-400">You're invited!</h1>
          <p className="text-white/70 mt-1">
            Join <span className="font-semibold text-white">{household.name}</span>
          </p>
          <p className="text-white/30 text-xs mt-1">{household.memberCount} member{household.memberCount !== 1 ? "s" : ""} already inside</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-white/5 p-1 mb-5 gap-1">
          {["register", "signin"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? "bg-purple-600 text-white" : "text-white/50 hover:text-white/70"
              }`}
            >
              {t === "register" ? "New here" : "Sign In"}
            </button>
          ))}
        </div>

        {/* Register tab */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Emoji picker */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white/70">Choose your avatar</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setRegForm((p) => ({ ...p, emoji: em }))}
                    className={`text-2xl w-10 h-10 rounded-xl transition-all ${
                      regForm.emoji === em
                        ? "bg-purple-600 scale-110 ring-2 ring-purple-400"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/70">Name</label>
              <input
                className="input"
                placeholder="Your name"
                value={regForm.name}
                onChange={(e) => setRegForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/70">
                Email <span className="text-white/30 font-normal">(optional)</span>
              </label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={regForm.email}
                onChange={(e) => setRegForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/70">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Min. 6 characters"
                value={regForm.password}
                onChange={(e) => setRegForm((p) => ({ ...p, password: e.target.value }))}
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 disabled:opacity-60"
            >
              {submitting ? "Joining…" : `Join ${household.name} 🏠`}
            </button>
          </form>
        )}

        {/* Sign In tab */}
        {tab === "signin" && (
          <div className="space-y-4">
            {/* Mode toggle */}
            <div className="flex rounded-xl bg-white/5 p-1 gap-1">
              <button
                onClick={() => setSigninMode("email")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  signinMode === "email" ? "bg-white/15 text-white" : "text-white/40"
                }`}
              >
                Email login
              </button>
              <button
                onClick={() => setSigninMode("name")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  signinMode === "name" ? "bg-white/15 text-white" : "text-white/40"
                }`}
              >
                Pick my name (kids)
              </button>
            </div>

            {signinMode === "email" ? (
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-white/70">Email</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={emailForm.email}
                    onChange={(e) => setEmailForm((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-white/70">Password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    value={emailForm.password}
                    onChange={(e) => setEmailForm((p) => ({ ...p, password: e.target.value }))}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-3 disabled:opacity-60"
                >
                  {submitting ? "Signing in…" : "Sign In"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleNameSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">Who are you?</label>
                  {household.members.length === 0 ? (
                    <p className="text-white/30 text-sm text-center py-4">No members yet</p>
                  ) : (
                    <div className="space-y-2">
                      {household.members.map((m) => (
                        <button
                          key={m._id}
                          type="button"
                          onClick={() => setSelectedMember(m)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            selectedMember?._id === m._id
                              ? "bg-purple-600/40 ring-2 ring-purple-500"
                              : "bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          <span className="text-2xl">{m.emoji}</span>
                          <span className="font-medium">{m.name}</span>
                          {selectedMember?._id === m._id && (
                            <span className="ml-auto text-purple-400">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedMember && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-white/70">
                      Password for {selectedMember.name}
                    </label>
                    <input
                      type="password"
                      className="input"
                      placeholder="••••••••"
                      value={kidPassword}
                      onChange={(e) => setKidPassword(e.target.value)}
                      required
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting || !selectedMember}
                  className="btn-primary w-full py-3 disabled:opacity-60"
                >
                  {submitting ? "Signing in…" : "Sign In"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
