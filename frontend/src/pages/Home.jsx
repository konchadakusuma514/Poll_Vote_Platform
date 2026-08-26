import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useSocket } from "../context/SocketContext";
import { useLanguage } from "../context/LanguageContext";
import { PollCard } from "../components/PollCard";
import { playVoteSound } from "../services/sound";
import confetti from "canvas-confetti";
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  PlusCircle,
  BarChart2,
  Activity,
  Tv,
  QrCode,
  Download,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Layers
} from "lucide-react";

export const Home = () => {
  const { t } = useLanguage();
  const [featuredPolls, setFeaturedPolls] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalPolls: 0, totalVotes: 0, activePolls: 0, recentActivities: [] });
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  // Interactive Hero Demo Poll State
  const [demoSelected, setDemoSelected] = useState(null);
  const [demoVotes, setDemoVotes] = useState({ 0: 642, 1: 428, 2: 260 });
  const [openFaq, setOpenFaq] = useState(null);

  const demoOptions = [
    { text: "⚡ AI-Powered Automation & Copilots", key: 0 },
    { text: "🚀 Real-Time Speed & Fluid UI", key: 1 },
    { text: "🛡️ Enterprise Security & Privacy", key: 2 }
  ];

  const demoTotal = Object.values(demoVotes).reduce((a, b) => a + b, 0);

  const handleDemoVote = (key) => {
    if (demoSelected !== null) return;
    setDemoSelected(key);
    setDemoVotes((prev) => ({ ...prev, [key]: prev[key] + 1 }));
    playVoteSound();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
  };

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

  const faqs = [
    {
      q: "How does PollPulse guarantee zero duplicate voting?",
      a: "PollPulse enforces strict composite database constraints on (poll_id, user_id, option_id). Once a user casts a ballot, any subsequent attempt is automatically rejected at the database engine level."
    },
    {
      q: "How does Live Projector / Presenter Mode work for conferences and classrooms?",
      a: "Every poll has a dedicated full-screen projector view (/poll/:id/present). It features a giant, high-contrast QR code that audience members scan on their mobile devices to vote instantly in real time."
    },
    {
      q: "Can I export my poll results for presentations and spreadsheets?",
      a: "Yes! With one click you can download a full CSV spreadsheet breakdown with vote counts and precise percentages, or copy embed codes to paste into websites and Notion."
    },
    {
      q: "Are private password-protected polls supported?",
      a: "Yes! When creating a poll, you can mark it as private and set an access passcode. Only voters with the passcode can unlock and view the poll."
    }
  ];

  return (
    <div className="space-y-20 pb-20 animate-fade-in">
      
      {/* Hero Section: Modern 2-Column Showcase */}
      <section className="pt-8 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-500/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t("heroBadge")}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] heading-font">
              {t("heroTitle1")} <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {t("heroTitle2")}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              {t("heroDesc")}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/create"
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-xl shadow-blue-600/25 hover:scale-105 transition-all"
              >
                <PlusCircle className="w-5 h-5" />
                <span>{t("createPoll")}</span>
              </Link>
              <Link
                to="/explore"
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
              >
                <span>{t("explorePolls")}</span>
                <ArrowRight className="w-4 h-4 text-blue-500" />
              </Link>
            </div>

            {/* Highlight Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-4 text-xs font-semibold text-slate-500 border-t border-slate-200/80 dark:border-slate-800/80">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Zero Duplicate Voting
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Zap className="w-4 h-4 text-amber-500" /> Live WebSocket Sync
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Tv className="w-4 h-4 text-purple-500" /> Fullscreen Presenter Mode
              </span>
            </div>
          </div>

          {/* Right Column: Live Interactive Demo Poll Widget */}
          <div className="lg:col-span-5">
            <div className="app-card rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 border-blue-200/60 dark:border-blue-900/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500" />
              
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-500/20">
                  ⚡ Interactive Live Demo
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  {demoTotal} votes
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white heading-font">
                  What is the #1 superpower in your tech stack for 2026?
                </h3>
                <p className="text-xs text-slate-500 mt-1">Click an option below to test the live vote animation:</p>
              </div>

              <div className="space-y-2.5 pt-1">
                {demoOptions.map((opt) => {
                  const count = demoVotes[opt.key];
                  const pct = Math.round((count / demoTotal) * 100);
                  const isSelected = demoSelected === opt.key;

                  return (
                    <div
                      key={opt.key}
                      onClick={() => handleDemoVote(opt.key)}
                      className={`relative overflow-hidden rounded-2xl p-3.5 transition-all border cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-950/50 border-blue-600 shadow-md"
                          : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-blue-400"
                      }`}
                    >
                      <div
                        className={`absolute top-0 bottom-0 left-0 transition-all duration-700 opacity-20 ${
                          isSelected ? "bg-blue-600" : "bg-slate-400 dark:bg-slate-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "bg-blue-600 text-white border-blue-600" : "border-slate-400"}`}>
                            {isSelected && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{opt.text}</span>
                        </div>
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-center text-slate-400 font-medium pt-1">
                {demoSelected !== null ? "✨ Vote recorded! Live synchronization verified." : "👉 Tap any choice to cast your sample vote"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stat Metrics Grid */}
      <section className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4 app-card rounded-3xl shadow-xl">
        <div className="p-4 text-center border-r border-slate-100 dark:border-slate-800/80 last:border-none">
          <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight heading-font">{stats.totalPolls}</p>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{t("totalPolls")}</p>
        </div>
        <div className="p-4 text-center border-r border-slate-100 dark:border-slate-800/80 last:border-none">
          <p className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tight heading-font">{stats.totalVotes}</p>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{t("votesCast")}</p>
        </div>
        <div className="p-4 text-center border-r border-slate-100 dark:border-slate-800/80 last:border-none">
          <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight heading-font">{stats.activePolls}</p>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{t("activeNow")}</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400 tracking-tight heading-font">{stats.totalUsers}</p>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{t("registeredUsers")}</p>
        </div>
      </section>

      {/* Live Recent Voter Activity Ticker */}
      {stats.recentActivities && stats.recentActivities.length > 0 && (
        <div className="max-w-5xl mx-auto app-card p-4 rounded-2xl flex items-center gap-4 overflow-hidden shadow-md">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-black flex-shrink-0 border border-emerald-200/60 dark:border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <Activity className="w-4 h-4" />
            <span>LIVE FEED:</span>
          </div>
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
            {stats.recentActivities.map((act) => (
              <Link
                key={act.id}
                to={`/poll/${act.pollId}`}
                className="inline-flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                <img src={act.userAvatar} alt="" className="w-5 h-5 rounded-full ring-1 ring-slate-200 dark:ring-slate-700" />
                <span className="font-bold text-slate-900 dark:text-slate-100">{act.userName}</span>
                <span className="text-slate-400">voted on</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 underline truncate max-w-[200px]">
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
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/20 shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight heading-font">{t("trendingPolls")}</h2>
              <p className="text-xs text-slate-500">{t("trendingDesc")}</p>
            </div>
          </div>

          <Link
            to="/explore"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>{t("viewAll")}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="app-card h-56 rounded-3xl animate-pulse bg-slate-100 dark:bg-slate-800/50"></div>
            ))}
          </div>
        ) : featuredPolls.length === 0 ? (
          <div className="app-card rounded-3xl p-12 text-center">
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

      {/* Feature Showcase Grid */}
      <section className="pt-12 border-t border-slate-200/80 dark:border-slate-800/80 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight heading-font">{t("whyChoose")}</h2>
          <p className="text-sm text-slate-500">{t("whyDesc")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="app-card p-6 rounded-3xl space-y-3 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t("antiDupTitle")}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t("antiDupDesc")}</p>
          </div>

          <div className="app-card p-6 rounded-3xl space-y-3 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t("liveUpdatesTitle")}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t("liveUpdatesDesc")}</p>
          </div>

          <div className="app-card p-6 rounded-3xl space-y-3 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center border border-pink-200/60 dark:border-pink-500/20">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t("chartsTitle")}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t("chartsDesc")}</p>
          </div>

          <div className="app-card p-6 rounded-3xl space-y-3 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-500/20">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Live Projector Mode</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Present polls full-screen with giant QR codes for conferences & classrooms.</p>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section className="max-w-4xl mx-auto space-y-6 pt-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white heading-font">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-slate-500">Everything you need to know about creating and managing polls</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="app-card rounded-2xl p-4 sm:p-5 cursor-pointer space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
              {openFaq === idx && (
                <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Launch Banner */}
      <section className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl space-y-6 relative overflow-hidden">
        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-black heading-font tracking-tight">
            Ready to collect fast, verifiable opinions?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Launch your poll with custom multiple options, instant QR code sharing, and live animated charts in under 30 seconds.
          </p>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-black text-sm shadow-xl hover:scale-105 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create Your First Poll Now</span>
        </Link>
      </section>
    </div>
  );
};
