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
  Bookmark,
  Code,
  Copy,
  Check,
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
  const [embedOpen, setEmbedOpen] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
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
      if (err.message && err.message.includes("Access code required")) {
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
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } catch (err) {
      setError(err.message || "Failed to submit vote.");
    } finally {
      setSubmittingVote(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const res = await api.toggleBookmark(id);
      setPoll((prev) => ({ ...prev, isBookmarked: res.isBookmarked }));
    } catch (err) {
      console.error(err);
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
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
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
        <Link to="/explore" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Return to Explore
        </Link>
      </div>
    );
  }

  const showResultsOnly = poll.hasVoted || poll.isClosed;
  const embedSnippet = `<iframe src="${window.location.origin}/poll/${poll.id}" width="100%" height="450" frameborder="0"></iframe>`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Explore
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleBookmark}
            title={poll.isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
              poll.isBookmarked
                ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-rose-400"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${poll.isBookmarked ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={() => setEmbedOpen(true)}
            className="p-2 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-500 text-xs font-bold flex items-center gap-1"
          >
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">Embed</span>
          </button>

          <Link
            to={`/poll/${poll.id}/present`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold hover:scale-105 transition-all shadow-md shadow-purple-600/20"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Live Projector Mode</span>
          </Link>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="app-card p-6 sm:p-8 rounded-3xl space-y-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-500/20">
              {poll.category}
            </span>
            {poll.isMultiple && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300">
                Multiple Choice
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <CountdownTimer expiresAt={poll.expiresAt} isClosed={poll.isClosed} />
            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t("sharePoll")}</span>
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight heading-font">
            {poll.title}
          </h1>
          {poll.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">{poll.description}</p>
          )}
        </div>

        {/* Community Emoji Reactions */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-bold text-slate-400 mr-1 uppercase tracking-wider">{t("reactions")}:</span>
          {["🔥", "💡", "🚀", "👏", "🤔"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                poll.userReaction === emoji
                  ? "bg-blue-100 dark:bg-blue-900/50 border-blue-500 scale-105 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:scale-105"
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
          <div className="flex items-center space-x-2.5">
            <img
              src={poll.creator?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=User"}
              alt={poll.creator?.name}
              className="w-7 h-7 rounded-full ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <span className="font-bold text-slate-800 dark:text-slate-200">{poll.creator?.name || "Anonymous"}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <Users className="w-4 h-4 text-blue-500" />
              {poll.totalVotes} {t("votesCast")}
            </span>
            {showResultsOnly && (
              <button
                onClick={exportCSV}
                title={t("downloadCSV")}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-blue-600 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Voting Mode or Results Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={showResultsOnly ? "lg:col-span-6 space-y-4" : "lg:col-span-12 space-y-4"}>
          <div className="app-card p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {showResultsOnly ? t("voteDistribution") : t("castYourVote")}
              </h3>
              {poll.hasVoted && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-500/20">
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
                          ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500"
                          : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800"
                        : isSelected
                        ? "bg-blue-50/80 dark:bg-blue-900/20 border-blue-600 shadow-md cursor-pointer scale-[1.01]"
                        : "bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-blue-400 cursor-pointer"
                    }`}
                  >
                    {showResultsOnly && (
                      <div
                        className={`absolute top-0 bottom-0 left-0 transition-all duration-700 opacity-20 ${
                          isUserChoice ? "bg-blue-600" : "bg-slate-400 dark:bg-slate-700"
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
                            } border transition-colors ${isSelected ? "bg-blue-600 text-white border-blue-600" : "border-slate-400"}`}
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
                          <span className="text-sm font-black text-blue-600 dark:text-blue-400">{opt.percentage}%</span>
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
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                {submittingVote ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <VoteIcon className="w-5 h-5" />
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
            <div className="app-card p-6 rounded-3xl shadow-xl">
              <PollCharts options={poll.options} totalVotes={poll.totalVotes} />
            </div>
          </div>
        )}
      </div>

      {/* Community Comments */}
      <div className="app-card p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white heading-font">{t("discussion")}</h3>
        </div>

        <form onSubmit={handleCommentSubmit} className="flex gap-2">
          <input
            type="text"
            required
            placeholder={isAuthenticated ? t("commentPlaceholder") : "Log in to join the discussion..."}
            disabled={!isAuthenticated}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-600"
          />
          <button
            type="submit"
            disabled={submittingComment || !commentText.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
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
              <div key={c.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <img src={c.user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=User"} alt={c.user?.name} className="w-6 h-6 rounded-full" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{c.user?.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 pl-8 leading-relaxed">{c.text}</p>
                <div className="pl-8 flex items-center gap-3 pt-1">
                  <button
                    onClick={() => handleLikeComment(c.id)}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-blue-600"
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

      {/* Embed Modal */}
      {embedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Embed Poll Widget</h3>
            <p className="text-xs text-slate-500">Copy this HTML iframe code to embed this live poll on your website, blog, or Notion page:</p>
            <textarea
              rows={3}
              readOnly
              value={embedSnippet}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-mono"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEmbedOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(embedSnippet);
                  setCopiedEmbed(true);
                  setTimeout(() => setCopiedEmbed(false), 2000);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                {copiedEmbed ? "Copied!" : "Copy Code"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareModal poll={poll} isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
};
