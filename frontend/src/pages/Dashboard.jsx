import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { PollCard } from "../components/PollCard";
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  CheckCircle2,
  BarChart3
} from "lucide-react";

export const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [createdPolls, setCreatedPolls] = useState([]);
  const [votedPolls, setVotedPolls] = useState([]);
  const [activeTab, setActiveTab] = useState("created");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [createdData, votedData] = await Promise.all([
          api.getUserCreatedPolls(),
          api.getUserVotedPolls()
        ]);
        setCreatedPolls(createdData.polls);
        setVotedPolls(votedData.polls);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalVotesReceived = createdPolls.reduce((sum, p) => sum + p.totalVotes, 0);

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Profile Header */}
      <div className="app-card p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=User"}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl ring-2 ring-indigo-500/40 bg-slate-100 dark:bg-slate-800"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{user?.name}</h1>
              {user?.role === "ADMIN" && (
                <span className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <Link
          to="/create"
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t("createPoll")}</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="app-card p-5 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{createdPolls.length}</p>
            <p className="text-xs font-semibold text-slate-500">{t("totalPolls")}</p>
          </div>
        </div>

        <div className="app-card p-5 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalVotesReceived}</p>
            <p className="text-xs font-semibold text-slate-500">{t("totalVotesReceived")}</p>
          </div>
        </div>

        <div className="app-card p-5 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{votedPolls.length}</p>
            <p className="text-xs font-semibold text-slate-500">{t("participatedIn")}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab("created")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === "created"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
          }`}
        >
          {t("myPolls")} ({createdPolls.length})
        </button>
        <button
          onClick={() => setActiveTab("voted")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === "voted"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
          }`}
        >
          {t("votedPolls")} ({votedPolls.length})
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="app-card h-52 rounded-2xl animate-pulse bg-slate-100 dark:bg-slate-800"></div>
          ))}
        </div>
      ) : activeTab === "created" ? (
        createdPolls.length === 0 ? (
          <div className="app-card rounded-2xl p-12 text-center space-y-3">
            <p className="text-sm font-bold text-slate-500">You haven't created any polls yet.</p>
            <Link to="/create" className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:underline">
              <PlusCircle className="w-4 h-4" /> Create your first poll
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {createdPolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )
      ) : votedPolls.length === 0 ? (
        <div className="app-card rounded-2xl p-12 text-center space-y-3">
          <p className="text-sm font-bold text-slate-500">You haven't voted on any polls yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {votedPolls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
};
