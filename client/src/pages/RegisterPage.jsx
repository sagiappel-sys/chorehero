import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const EMOJIS = ["😊","🦸","🧙","🦊","🐼","🦁","🐯","🦋","🌟","🔥","⚡","🎯"];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", emoji: "😊" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created! Now set up your household 🏠");
      navigate("/setup");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-2">🏆</div>
          <h1 className="font-bangers text-4xl tracking-wider text-purple-400">ChoreHero</h1>
          <p className="text-sm mt-1 text-white/50">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emoji picker */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white/70">Choose your avatar</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, emoji: em }))}
                  className={`text-2xl w-10 h-10 rounded-xl transition-all ${
                    form.emoji === em
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
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/70">
              Email <span className="text-white/30 font-normal">(optional — not needed for kids)</span>
            </label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/70">Password</label>
            <input
              type="password"
              className="input"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-white/50">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 font-semibold hover:text-purple-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
