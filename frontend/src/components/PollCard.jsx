import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Users, Clock, CheckCircle2, Lock, ArrowUpRight, Sparkles } from "lucide-react";

export const PollCard = ({ poll }) => {
  const { t } = useLanguage();

  const isExpired = poll.isClosed || poll.isExpired;

  // Category Color Map
  const categoryColors = {
    Technology: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20",
    "Artificial Intelligence": "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20",
    "Career & Work": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
    Gaming: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
    General: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
  };

  const badgeClass = categoryColors[poll.category] || categoryColors.General;

  return (
    <Link
      to={`/poll/${poll.id}`}
      className="group app-card rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
    >
      {/* Top Accent Glow on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="space-y-3">
        {/* Category & Status Badges */}
        <div className="flex items-center justify-between gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeClass}`}>
            {poll.category}
          </span>

          <div className="flex items-center gap-1.5">
            {poll.isPrivate && (
              <span className="p-1 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Lock className="w-3 h-3" />
              </span>
            )}
            {poll.hasVoted && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> {t("votedBanner")}
              </span>
            )}
            {isExpired ? (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {t("pollClosed")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
          {poll.title}
        </h3>

        {/* Options Preview */}
        <div className="space-y-1.5 pt-1">
          {poll.options.slice(0, 2).map((opt) => (
            <div
              key={opt.id}
              className="relative overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/80 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 flex justify-between items-center"
            >
              <div
                className="absolute top-0 bottom-0 left-0 bg-indigo-100 dark:bg-indigo-950/50 transition-all duration-500 opacity-60"
                style={{ width: `${opt.percentage}%` }}
              />
              <span className="relative z-10 truncate font-medium">{opt.text}</span>
              <span className="relative z-10 text-[11px] font-black text-indigo-600 dark:text-indigo-400 ml-2">
                {opt.percentage}%
              </span>
            </div>
          ))}
          {poll.options.length > 2 && (
            <p className="text-[11px] text-slate-400 font-semibold pl-1">
              +{poll.options.length - 2} more options...
            </p>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <img
            src={poll.creator?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=User"}
            alt={poll.creator?.name}
            className="w-5 h-5 rounded-full ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
            {poll.creator?.name || "Anonymous"}
          </span>
        </div>

        <div className="flex items-center space-x-1 font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          <Users className="w-3.5 h-3.5 text-indigo-500" />
          <span>{poll.totalVotes} votes</span>
          <ArrowUpRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
