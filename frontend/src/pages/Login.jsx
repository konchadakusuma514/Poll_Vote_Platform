import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  Vote,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Zap,
  Check,
  AlertCircle
} from "lucide-react";

const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Alex",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Sophia",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Rahul",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Emma",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Luna",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Nova",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Zeus",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Kusuma"
];

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState(location.pathname === "/register" ? "register" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 10) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9!@#$%^&*]/.test(pass)) score += 25;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        await register(name, email, password, selectedAvatar);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setMode("login");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 animate-fade-in">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Top Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Vote className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight heading-font">
            {mode === "login" ? "Welcome Back to PollPulse" : "Join the PollPulse Community"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {mode === "login"
              ? "Access your voting dashboard, live results & creator tools"
              : "Create instant polls, cast verifiable votes, and join live debates"}
          </p>
        </div>

        {/* Main Card */}
        <div className="app-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === "login"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{t("navLogin")}</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(""); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === "register"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{t("navRegister")}</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name & Avatar (Only for Register) */}
            {mode === "register" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Kusuma Konchada"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Avatar Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Choose Your Avatar Character
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {AVATAR_OPTIONS.map((av, idx) => (
                      <img
                        key={idx}
                        src={av}
                        alt="Avatar"
                        onClick={() => setSelectedAvatar(av)}
                        className={`w-10 h-10 rounded-xl cursor-pointer p-0.5 border-2 transition-all hover:scale-110 ${
                          selectedAvatar === av
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 scale-105"
                            : "border-transparent bg-slate-100 dark:bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password <span className="text-rose-500">*</span>
                </label>
                {mode === "login" && (
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter for Register */}
              {mode === "register" && password && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strength <= 25 ? "bg-rose-500 w-1/4" :
                        strength <= 50 ? "bg-amber-500 w-2/4" :
                        strength <= 75 ? "bg-blue-500 w-3/4" : "bg-emerald-500 w-full"
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Strength: {strength <= 25 ? "Weak" : strength <= 50 ? "Fair" : strength <= 75 ? "Good" : "Strong 🔥"}
                  </span>
                </div>
              )}
            </div>

            {/* Remember Me */}
            {mode === "login" && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
                  />
                  <span>Remember my session</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : mode === "login" ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Account</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create Free Account</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Instant Demo Logins</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo("alex@example.com", "password123")}
                className="py-2 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold transition-all text-center"
              >
                👑 Admin (Alex)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("sophia@example.com", "password123")}
                className="py-2 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold transition-all text-center"
              >
                🚀 Sophia
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("rahul@example.com", "password123")}
                className="py-2 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold transition-all text-center"
              >
                💡 Rahul
              </button>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>256-bit encrypted voting session & zero duplicate vote guarantee</span>
        </div>
      </div>
    </div>
  );
};

export const Register = Login;
