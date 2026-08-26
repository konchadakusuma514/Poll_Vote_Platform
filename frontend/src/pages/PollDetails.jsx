import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useLanguage } from "../context/LanguageContext";
import { CountdownTimer } from "../components/CountdownTimer";
import { PollCharts } from "../components/PollCharts";
import { ShareModal } from "../components/ShareModal";
import { playVoteSound } from "../services/sound";
import {
  Vote as VoteIcon,
  CheckCircle2,
  Share2,
  Users,
  MessageCircle,
  Download,
  ThumbsUp,
  ArrowLeft,
  KeyRound,
  Send,
  Tv,
  AlertCircle
} from "lucide-react";

export const PollDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const { t } = useLanguage();

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [requireCode, setRequireCode] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchPoll = async (code = "") => {
    try {
      setLoading(true);
      setError("");
      setRequireCode(false);
      const data = await api.getPollById(id, code);
      setPoll(data.poll);
      if (data.poll.userVotedOptionIds && data.poll.userVotedOptionIds.length > 0) {
        setSelectedOptions(data.poll.userVotedOptionIds);
      }
    } catch (err) {
      if (err.message.includes("Access code required")) {
        setRequireCode(true);
      } else {
        setError(err.message || "Failed to load poll details.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoll();
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit("join_poll", id);
    socket.on("vote_update", (data) => {
      if (data.pollId === id) {
        playVoteSound();
        setPoll((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            totalVotes: data.poll.totalVotes,
            options: data.poll.options
          };
        });
      }
    });
    return () => {
      socket.emit("leave_poll", id);
      socket.off("vote_update");
    };
  }, [socket, id]);

  const handleOptionSelect = (optionId) => {
    if (poll.hasVoted || poll.isClosed) return;
    if (poll.isMultiple) {
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter((id) => id !== optionId));
      } else {
        setSelectedOptions([...selectedOptions, optionId]);
      }
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVoteSubmit = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/poll/${id}` } });
      return;
    }
    if (selectedOptions.length === 0) {
      setError("Please select at least one option to vote.");
      return;
    }

    setSubmittingVote(true);
    setError("");

    try {
      const data = await api.castVote(id, selectedOptions);
      setPoll(data.poll);
      playVoteSound();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      setError(err.message || "Failed to submit vote.");
    } finally {
      setSubmittingVote(false);
    }
  };

  const handleReaction = async (emoji) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await api.reactPoll(id, emoji);
      fetchPoll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await api.postComment(id, commentText);
      setCommentText("");
      fetchPoll();
    } catch (err) {
      alert(err.message || "Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await api.likeComment(commentId);
      fetchPoll();
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    if (!poll) return;
    let csv = "Option,Vote Count,Percentage\n";
    poll.options.forEach((opt) => {
      csv += `"${opt.text}",${opt.voteCount},${opt.percentage}%\n`;
    });
    csv += `Total Votes,${poll.totalVotes},100%\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `poll_results_${poll.id}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (requireCode) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="w-14 h-14 bg-purple-50 dark:bg-purple-500/10 text-purple-600 rounded-2xl mx-auto flex items-center justify-center">
          <KeyRound className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold">Private Poll</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter passcode..."
            value={accessCodeInput}
            onChange={(e) => setAccessCodeInput(e.target.value)}
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-xs"
          />
          <button
            onClick={() => fetchPoll(accessCodeInput)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold">Poll Not Found</h2>
        <Link to="/explore" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Return to Explore
        </Link>
      </div>
    );
  }

  const showResultsOnly = poll.hasVoted || poll.isClosed;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Explore
        </Link>

        <Link
          to={`/poll/${poll.id}/present`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold hover:scale-105 transition-all shadow-sm"
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Live Projector / Presenter Mode</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="app-card p-6 sm:p-8 rounded-3xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              {poll.category}
            </span>
            {poll.isMultiple && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                Multiple Choice
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <CountdownTimer expiresAt={poll.expiresAt} isClosed={poll.isClosed} />
            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t("sharePoll")}</span>
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            {poll.title}
          </h1>
          {poll.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{poll.description}</p>
          )}
        </div>

        {/* Community Reactions */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-bold text-slate-500 mr-1">{t("reactions")}:</span>
          {["🔥", "💡", "🚀", "👏", "🤔"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                poll.userReaction === emoji
                  ? "bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 scale-105"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:scale-105"
              }`}
            >
              <span>{emoji}</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400">
                {poll.reactions?.[emoji] || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <img
              src={poll.creator?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=User"}
              alt={poll.creator?.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200">{poll.creator?.name || "Anonymous"}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              {poll.totalVotes} {t("votesCast")}
            </span>
            {showResultsOnly && (
              <button
                onClick={exportCSV}
                title={t("downloadCSV")}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-indigo-600 text-slate-600 dark:text-slate-300"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Voting Mode or Results Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={showResultsOnly ? "lg:col-span-6 space-y-4" : "lg:col-span-12 space-y-4"}>
          <div className="app-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {showResultsOnly ? t("voteDistribution") : t("castYourVote")}
              </h3>
              {poll.hasVoted && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {t("votedBanner")}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {poll.options.map((opt) => {
                const isSelected = selectedOptions.includes(opt.id);
                const isUserChoice = poll.userVotedOptionIds?.includes(opt.id);

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleOptionSelect(opt.id)}
                    className={`relative overflow-hidden rounded-2xl p-4 transition-all border ${
                      showResultsOnly
                        ? isUserChoice
                          ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500"
                          : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800"
                        : isSelected
                        ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 shadow-sm cursor-pointer"
                        : "bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-400 cursor-pointer"
                    }`}
                  >
                    {showResultsOnly && (
                      <div
                        className={`absolute top-0 bottom-0 left-0 transition-all duration-700 opacity-20 ${
                          isUserChoice ? "bg-indigo-600" : "bg-slate-400 dark:bg-slate-700"
                        }`}
                        style={{ width: `${opt.percentage}%` }}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {!showResultsOnly && (
                          <div
                            className={`w-5 h-5 flex items-center justify-center ${
                              poll.isMultiple ? "rounded" : "rounded-full"
                            } border ${isSelected ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-400"}`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                        )}
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {opt.text}
                          {isUserChoice && (
                            <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                              {t("yourChoice")}
                            </span>
                          )}
                        </span>
                      </div>

                      {showResultsOnly && (
                        <div className="text-right">
                          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{opt.percentage}%</span>
                          <span className="block text-[10px] text-slate-500">{opt.voteCount} votes</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {!showResultsOnly && (
              <button
                onClick={handleVoteSubmit}
                disabled={submittingVote || selectedOptions.length === 0}
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                {submittingVote ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <VoteIcon className="w-4 h-4" />
                    <span>{isAuthenticated ? t("submitVote") : t("logInToVote")}</span>
                  </> 
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right / Charts Side */}
        {showResultsOnly && (
          <div className="lg:col-span-6 space-y-4">
            <div className="app-card p-6 rounded-3xl">
              <PollCharts options={poll.options} totalVotes={poll.totalVotes} />
            </div>
          </div>
        )}
      </div>

      {/* Community Comments */}
      <div className="app-card p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t("discussion")}</h3>
        </div>

        <form onSubmit={handleCommentSubmit} className="flex gap-2">
          <input
            type="text"
            required
            placeholder={isAuthenticated ? t("commentPlaceholder") : "Log in to join the discussion..."}
            disabled={!isAuthenticated}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600"
          />
          <button
            type="submit"
            disabled={submittingComment || !commentText.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t("postComment")}</span>
          </button>
        </form>

        <div className="space-y-3 pt-2">
          {(!poll.comments || poll.comments.length === 0) ? (
            <p className="text-xs text-slate-500 text-center py-4">{t("noComments")}</p>
          ) : (
            poll.comments.map((c) => (
              <div key={c.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <img src={c.user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=User"} alt={c.user?.name} className="w-5 h-5 rounded-full" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{c.user?.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 pl-7">{c.text}</p>
                <div className="pl-7 flex items-center gap-3 pt-1">
                  <button
                    onClick={() => handleLikeComment(c.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{c.likes} {t("like")}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ShareModal poll={poll} isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
};
