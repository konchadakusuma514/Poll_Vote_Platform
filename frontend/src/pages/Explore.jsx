import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { PollCard } from "../components/PollCard";
import { Search, Filter, Compass, RefreshCw, Trophy, Crown } from "lucide-react";

export const Explore = () => {
  const { t } = useLanguage();
  const [polls, setPolls] = useState([]);
  const [stats, setStats] = useState({ leaderboard: [] });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { key: "All", label: t("catAll") },
    { key: "Technology", label: t("catTech") },
    { key: "Artificial Intelligence", label: t("catAI") },
    { key: "Career & Work", label: t("catCareer") },
    { key: "Gaming", label: t("catGaming") },
    { key: "Entertainment", label: t("catEntertainment") },
    { key: "Education", label: t("catEducation") },
    { key: "Sports", label: t("catSports") },
    { key: "General", label: t("catGeneral") }
  ];

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const [data, statsData] = await Promise.all([
        api.getPolls({
          category: selectedCategory,
          status: statusFilter,
          sort: sortBy,
          search: searchQuery
        }),
        api.getPlatformStats()
      ]);
      setPolls(data.polls);
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching explore polls:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [selectedCategory, statusFilter, sortBy]);

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
            <Compass className="w-4 h-4" /> {t("exploreTitle")}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{t("exploreTitle")}</h1>
          <p className="text-xs sm:text-sm text-slate-500">{t("exploreDesc")}</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); fetchPolls(); }} className="relative min-w-[280px]">
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </form>
      </div>

      {/* Top Pollster Creators Leaderboard Strip */}
      {stats.leaderboard && stats.leaderboard.length > 0 && (
        <div className="app-card p-4 sm:p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Top Pollsters Leaderboard</h3>
            </div>
            <span className="text-[11px] text-slate-400">Most Active Creators</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {stats.leaderboard.map((creator, i) => (
              <div key={creator.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-center space-x-2.5">
                <div className="relative">
                  <img src={creator.avatar} alt={creator.name} className="w-8 h-8 rounded-full" />
                  {i === 0 && <Crown className="w-3.5 h-3.5 text-amber-500 absolute -top-1.5 -right-1" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{creator.name}</p>
                  <p className="text-[10px] text-slate-400">{creator.polls} polls</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.key
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 app-card p-3.5 rounded-xl">
        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("filterBy")}</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs outline-none"
          >
            <option value="all">{t("allPolls")}</option>
            <option value="active">{t("activeOnly")}</option>
            <option value="closed">{t("closedExpired")}</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("sortBy")}</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs outline-none"
          >
            <option value="newest">{t("newestFirst")}</option>
            <option value="votes">{t("mostVoted")}</option>
            <option value="expiring">{t("expiringSoon")}</option>
          </select>

          <button
            onClick={fetchPolls}
            title="Refresh"
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Polls Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="app-card h-56 rounded-2xl animate-pulse bg-slate-100 dark:bg-slate-800"></div>
          ))}
        </div>
      ) : polls.length === 0 ? (
        <div className="app-card rounded-2xl p-12 text-center">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{t("noPollsFound")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
};
