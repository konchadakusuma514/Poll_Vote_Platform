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
  BarChart3,
  Bookmark,
  Edit3,
  Trophy,
  Sparkles,
  Save,
  X
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

export const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [createdPolls, setCreatedPolls] = useState([]);
  const [votedPolls, setVotedPolls] = useState([]);
  const [bookmarkedPolls, setBookmarkedPolls] = useState([]);
  const [activeTab, setActiveTab] = useState("created");
  const [loading, setLoading] = useState(true);

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editAvatar, setEditAvatar] = useState(user?.avatar || AVATAR_OPTIONS[0]);
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [createdData, votedData, bmData] = await Promise.all([
        api.getUserCreatedPolls(),
        api.getUserVotedPolls(),
        api.getUserBookmarks().catch(() => ({ polls: [] }))
      ]);
      setCreatedPolls(createdData.polls || []);
      setVotedPolls(votedData.polls || []);
      setBookmarkedPolls(bmData.polls || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalVotesReceived = createdPolls.reduce((sum, p) => sum + p.totalVotes, 0);
  const reputationPoints = createdPolls.length * 10 + totalVotesReceived * 2 + votedPolls.length * 5;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.updateProfile(editName, editAvatar);
      window.location.reload();
    } catch (err) {
      alert(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Profile Banner */}
      <div className="app-card p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex items-center space-x-5">
          <div className="relative group">
            <img
              src={user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=User"}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl ring-2 ring-blue-500/50 bg-slate-100 dark:bg-slate-800 shadow-md"
            />
            <button
              onClick={() => setIsEditingProfile(true)}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-blue-600 text-white shadow hover:scale-110 transition-transform"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight heading-font">{user?.name}</h1>
              {user?.role === "ADMIN" ? (
                <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-bold border border-blue-200 dark:border-blue-500/30">
                  ADMIN
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-500/30">
                  VERIFIED VOTER
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
            
            {/* Reputation Level Badge */}
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/20">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                {reputationPoints} Reputation Points
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditingProfile(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
          <Link
            to="/create"
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 hover:scale-105 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t("createPoll")}</span>
          </Link>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Profile Details</h3>
              <button onClick={() => setIsEditingProfile(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Avatar Style</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATAR_OPTIONS.map((av, idx) => (
                    <img
                      key={idx}
                      src={av}
                      alt="Avatar"
                      onClick={() => setEditAvatar(av)}
                      className={`w-11 h-11 rounded-xl cursor-pointer p-0.5 border-2 transition-all ${
                        editAvatar === av ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 scale-105" : "border-transparent bg-slate-100 dark:bg-slate-800"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow flex items-center justify-center gap-2"
              >
                {savingProfile ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="app-card p-5 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{createdPolls.length}</p>
            <p className="text-xs font-semibold text-slate-500">{t("totalPolls")}</p>
          </div>
        </div>

        <div className="app-card p-5 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{totalVotesReceived}</p>
            <p className="text-xs font-semibold text-slate-500">{t("totalVotesReceived")}</p>
          </div>
        </div>

        <div className="app-card p-5 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">{votedPolls.length}</p>
            <p className="text-xs font-semibold text-slate-500">{t("participatedIn")}</p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6">
        <button
          onClick={() => setActiveTab("created")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === "created"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
          }`}
        >
          {t("myPolls")} ({createdPolls.length})
        </button>
        <button
          onClick={() => setActiveTab("voted")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === "voted"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
          }`}
        >
          {t("votedPolls")} ({votedPolls.length})
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
            activeTab === "saved"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Bookmarks ({bookmarkedPolls.length})</span>
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
            <Link to="/create" className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline">
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
      ) : activeTab === "voted" ? (
        votedPolls.length === 0 ? (
          <div className="app-card rounded-2xl p-12 text-center space-y-3">
            <p className="text-sm font-bold text-slate-500">You haven't voted on any polls yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {votedPolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )
      ) : (
        bookmarkedPolls.length === 0 ? (
          <div className="app-card rounded-2xl p-12 text-center space-y-3">
            <p className="text-sm font-bold text-slate-500">You don't have any saved bookmarks.</p>
            <Link to="/explore" className="text-xs text-blue-600 font-bold hover:underline">
              Explore trending polls to bookmark
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedPolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )
      )}
    </div>
  );
};
