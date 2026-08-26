import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { CountdownTimer } from "./CountdownTimer";
import { ShareModal } from "./ShareModal";
import { Users, Share2, ArrowRight, Tag } from "lucide-react";

export const PollCard = ({ poll }) => {
  const { t } = useLanguage();
  const [shareOpen, setShareOpen] = useState(false);

  const sortedOptions = [...poll.options].sort((a, b) => b.voteCount - a.voteCount);
  const leadingOption = sortedOptions[0];

  return (
    <>
      <div className="group relative app-card rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 hover:border-indigo-500/50">
        <div>
          {/* Header Badges */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              <Tag className="w-3 h-3" />
              {poll.category}
            </span>
            <CountdownTimer expiresAt={poll.expiresAt} isClosed={poll.isClosed} />
          </div>

          {/* Title */}
          <Link to={`/poll/${poll.id}`} className="block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 mb-2">
              {poll.title}
            </h3>
          </Link>

          {/* Description */}
          {poll.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
              {poll.description}
            </p>
          )}

          {/* Leading Option Snippet */}
          {poll.totalVotes > 0 && leadingOption && (
            <div className="my-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <div className="flex justify-between items-center text-[11px] mb-1.5 font-semibold">
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[170px]">👑 {leadingOption.text}</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{leadingOption.percentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  style={{ width: `${leadingOption.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={poll.creator?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=Creator"}
              alt={poll.creator?.name || "Creator"}
              className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700"
            />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate max-w-[90px]">
              {poll.creator?.name || "Anonymous"}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              {poll.totalVotes}
            </span>

            <button
              onClick={() => setShareOpen(true)}
              title="Share"
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <Link
              to={`/poll/${poll.id}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors"
            >
              <span>{poll.hasVoted ? t("voteDistribution") : t("castYourVote")}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      <ShareModal poll={poll} isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
};
