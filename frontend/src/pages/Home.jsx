import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useSocket } from "../context/SocketContext";
import { useLanguage } from "../context/LanguageContext";
import { PollCard } from "../components/PollCard";
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  QrCode,
  ArrowRight,
  PlusCircle,
  BarChart2,
  Activity,
  Tv
} from "lucide-react";

export const Home = () => {
  const { t } = useLanguage();
  const [featuredPolls, setFeaturedPolls] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalPolls: 0, totalVotes: 0, activePolls: 0, recentActivities: [] });
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pollsData, statsData] = await Promise.all([
          api.getPolls({ sort: "votes" }),
          api.getPlatformStats()
        ]);
        setFeaturedPolls(pollsData.polls.slice(0, 6));
        setStats(statsData);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("poll_activity", ({ pollId, totalVotes }) => {
      setFeaturedPolls((prev) =>
        prev.map((p) => (p.id === pollId ? { ...p, totalVotes } : p))
      );
      setStats((prev) => ({ ...prev, totalVotes: prev.totalVotes + 1 }));
    });
    return () => {
      socket.off("poll_activity");
    };
  }, [socket]);

  return (
    <div className="space-y-16 pb-12 animate-fade-in">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 overflow-hidden text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t("heroBadge")}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          {t("heroTitle1")} <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            {t("heroTitle2")}
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t("heroDesc")}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/create"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t("createPoll")}</span>
          </Link>
          <Link
            to="/explore"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
          >
            <span>{t("explorePolls")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Platform Stats Grid */}
        <div className="mt-12 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4 app-card rounded-2xl">
          <div className="p-3 text-center border-r border-slate-200 dark:border-slate-800 last:border-none">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{stats.totalPolls}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">{t("totalPolls")}</p>
          </div>
          <div className="p-3 text-center border-r border-slate-200 dark:border-slate-800 last:border-none">
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats.totalVotes}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">{t("votesCast")}</p>
          </div>
          <div className="p-3 text-center border-r border-slate-200 dark:border-slate-800 last:border-none">
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.activePolls}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">{t("activeNow")}</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">{stats.totalUsers}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">{t("registeredUsers")}</p>
          </div>
        </div>
      </section>

      {/* Live Recent Voter Activity Ticker */}
      {stats.recentActivities && stats.recentActivities.length > 0 && (
        <div className="max-w-5xl mx-auto app-card p-4 rounded-2xl flex items-center gap-4 overflow-hidden">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Activity className="w-4 h-4" />
            <span>LIVE FEED:</span>
          </div>
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
            {stats.recentActivities.map((act) => (
              <Link
                key={act.id}
                to={`/poll/${act.pollId}`}
                className="inline-flex items-center gap-2 hover:text-indigo-600 transition-colors"
              >
                <img src={act.userAvatar} alt="" className="w-4 h-4 rounded-full" />
                <span className="font-bold text-slate-800 dark:text-slate-100">{act.userName}</span>
                <span className="text-slate-400">voted on</span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400 underline truncate max-w-[180px]">
                  {act.pollTitle}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured / Trending Polls */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("trendingPolls")}</h2>
              <p className="text-xs text-slate-500">{t("trendingDesc")}</p>
            </div>
          </div>

          <Link
            to="/explore"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>{t("viewAll")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="app-card h-52 rounded-2xl animate-pulse bg-slate-100 dark:bg-slate-800"></div>
            ))}
          </div>
        ) : featuredPolls.length === 0 ? (
          <div className="app-card rounded-2xl p-12 text-center">
            <p className="text-slate-500 text-sm">{t("noPollsFound")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Section */}
      <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t("whyChoose")}</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">{t("whyDesc")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="app-card p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t("antiDupTitle")}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t("antiDupDesc")}</p>
          </div>

          <div className="app-card p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t("liveUpdatesTitle")}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t("liveUpdatesDesc")}</p>
          </div>

          <div className="app-card p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-3">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t("chartsTitle")}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t("chartsDesc")}</p>
          </div>

          <div className="app-card p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <Tv className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Live Projector Mode</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Present polls full-screen with giant QR codes for conferences & classrooms.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
