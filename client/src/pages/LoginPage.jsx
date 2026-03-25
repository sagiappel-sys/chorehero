import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}! 👋`);
      navigate(user.householdId ? "/" : "/setup");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-2">🏆</div>
          <h1 className="font-bangers text-4xl tracking-wider text-purple-400">ChoreHero</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            Gamify your household chores
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/70">Email</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/70">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-white/50">
          No account?{" "}
          <Link to="/register" className="text-purple-400 font-semibold hover:text-purple-300">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
