import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import {
  Vote,
  PlusCircle,
  Compass,
  LayoutDashboard,
  LogIn,
  UserPlus,
  LogOut,
  Sun,
  Moon,
  Globe,
  Menu,
  X
} from "lucide-react";

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { lang, changeLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-white dark:to-indigo-300 bg-clip-text text-transparent">
                {t("brandName")}
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400 -mt-1">
                {t("tagline")}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/explore"
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              <Compass className="w-4 h-4 text-indigo-500" />
              <span>{t("navExplore")}</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/create"
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-500" />
                  <span>{t("navCreate")}</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-sky-500" />
                  <span>{t("navDashboard")}</span>
                </Link>
              </>
            )}
          </nav>

          {/* Controls: Language Selector + Theme Toggle + Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Dropdown */}
            <div className="relative flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <select
                value={lang}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="en" className="dark:bg-slate-900">English</option>
                <option value="hi" className="dark:bg-slate-900">हिंदी (Hindi)</option>
                <option value="te" className="dark:bg-slate-900">తెలుగు (Telugu)</option>
                <option value="ta" className="dark:bg-slate-900">தமிழ் (Tamil)</option>
                <option value="es" className="dark:bg-slate-900">Español</option>
              </select>
            </div>

            {/* Theme Toggle (Light / Dark Mode) */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:scale-105 border border-slate-200 dark:border-slate-700 transition-all"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2.5">
                <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 py-1.5 px-3 rounded-full">
                  <img
                    src={user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=User"}
                    alt={user?.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 rounded-lg transition-colors"
                >
                  {t("navLogin")}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all"
                >
                  {t("navRegister")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500">Language:</span>
            <select
              value={lang}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded p-1"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="es">Español</option>
            </select>
          </div>

          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-semibold"
          >
            <Compass className="w-5 h-5 text-indigo-500" />
            <span>{t("navExplore")}</span>
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/create"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-semibold"
              >
                <PlusCircle className="w-5 h-5 text-emerald-500" />
                <span>{t("navCreate")}</span>
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-semibold"
              >
                <LayoutDashboard className="w-5 h-5 text-sky-500" />
                <span>{t("navDashboard")}</span>
              </Link>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-rose-500"
              >
                {t("navLogout")}
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold"
              >
                {t("navLogin")}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold"
              >
                {t("navRegister")}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
