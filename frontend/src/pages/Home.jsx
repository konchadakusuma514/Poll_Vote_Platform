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
    <div className="space-y-16 pb-16 animate-fade-in">
      {/* Hero Section */}
      <section className="relative pt-10 pb-6 overflow-hidden text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-50/90 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/20 shadow-sm mb-6 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{t("heroBadge")}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
          {t("heroTitle1")} <br />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 bg-clip-text text-transparent">
            {t("heroTitle2")}
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t("heroDesc")}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/create"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/35 transition-all hover:scale-105"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t("createPoll")}</span>
          </Link>
          <Link
            to="/explore"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-slate-300"
          >
            <span>{t("explorePolls")}</span>
            <ArrowRight className="w-4 h-4 text-indigo-500" />
          </Link>
        </div>

        {/* Platform Stat Metrics */}
        <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-3 app-card rounded-3xl backdrop-blur-xl">
          <div className="p-4 text-center border-r border-slate-100 dark:border-slate-800/80 last:border-none">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.totalPolls}</p>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">{t("totalPolls")}</p>
          </div>
          <div className="p-4 text-center border-r border-slate-100 dark:border-slate-800/80 last:border-none">
            <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{stats.totalVotes}</p>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">{t("votesCast")}</p>
          </div>
          <div className="p-4 text-center border-r border-slate-100 dark:border-slate-800/80 last:border-none">
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{stats.activePolls}</p>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">{t("activeNow")}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-3xl font-black text-violet-600 dark:text-purple-400 tracking-tight">{stats.totalUsers}</p>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">{t("registeredUsers")}</p>
          </div>
        </div>
      </section>

      {/* Live Recent Voter Activity Ticker */}
      {stats.recentActivities && stats.recentActivities.length > 0 && (
        <div className="max-w-5xl mx-auto app-card p-3.5 rounded-2xl flex items-center gap-4 overflow-hidden border-indigo-100 dark:border-indigo-950/50">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-black flex-shrink-0 border border-emerald-200/60 dark:border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>LIVE FEED:</span>
          </div>
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
            {stats.recentActivities.map((act) => (
              <Link
                key={act.id}
                to={`/poll/${act.pollId}`}
                className="inline-flex items-center gap-2 hover:text-indigo-600 transition-colors"
              >
                <img src={act.userAvatar} alt="" className="w-5 h-5 rounded-full ring-1 ring-slate-200 dark:ring-slate-700" />
                <span className="font-bold text-slate-900 dark:text-slate-100">{act.userName}</span>
                <span className="text-slate-400">voted on</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 underline truncate max-w-[200px]">
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
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-500/20 shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t("trendingPolls")}</h2>
              <p className="text-xs text-slate-500">{t("trendingDesc")}</p>
            </div>
          </div>

          <Link
            to="/explore"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>{t("viewAll")}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="app-card h-52 rounded-2xl animate-pulse bg-slate-100 dark:bg-slate-800/50"></div>
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

      {/* Feature Highlights Grid */}
      <section className="pt-10 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t("whyChoose")}</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">{t("whyDesc")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="app-card p-6 rounded-3xl space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t("antiDupTitle")}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t("antiDupDesc")}</p>
          </div>

          <div className="app-card p-6 rounded-3xl space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t("liveUpdatesTitle")}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t("liveUpdatesDesc")}</p>
          </div>

          <div className="app-card p-6 rounded-3xl space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center border border-pink-200/60 dark:border-pink-500/20">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t("chartsTitle")}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t("chartsDesc")}</p>
          </div>

          <div className="app-card p-6 rounded-3xl space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-500/20">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Projector Mode</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Present polls full-screen with giant QR codes for conferences & classrooms.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
