import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { api } from "../services/api";
import { useSocket } from "../context/SocketContext";
import { PollCharts } from "../components/PollCharts";
import { CountdownTimer } from "../components/CountdownTimer";
import { playVoteSound } from "../services/sound";
import { Maximize, Minimize, Users, ArrowLeft, QrCode } from "lucide-react";

export const PresentationMode = () => {
  const { id } = useParams();
  const { socket } = useSocket();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      const data = await api.getPollById(id);
      setPoll(data.poll);
    } catch (e) {
      console.error(e);
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
        setPoll((prev) => prev ? { ...prev, totalVotes: data.poll.totalVotes, options: data.poll.options } : null);
      }
    });
    return () => {
      socket.emit("leave_poll", id);
      socket.off("vote_update");
    };
  }, [socket, id]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading || !poll) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/poll/${poll.id}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] via-slate-900 to-[#1e1b4b] text-white p-6 sm:p-10 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link
          to={`/poll/${poll.id}`}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Presenter Mode
        </Link>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {poll.category}
          </span>
          <CountdownTimer expiresAt={poll.expiresAt} isClosed={poll.isClosed} />
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center py-6">
        <div className="lg:col-span-8 space-y-6">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
              {poll.title}
            </h1>
            {poll.description && (
              <p className="text-sm sm:text-base text-slate-400 mt-3">{poll.description}</p>
            )}
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-2xl">
            <PollCharts options={poll.options} totalVotes={poll.totalVotes} />
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col items-center justify-center">
          <div className="bg-white p-6 rounded-3xl shadow-2xl text-center max-w-[280px] w-full transform hover:scale-105 transition-transform duration-300">
            <QRCodeSVG value={shareUrl} size={220} level="H" className="mx-auto" />
            <div className="mt-4 space-y-1 text-slate-900">
              <p className="text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1">
                <QrCode className="w-4 h-4 text-indigo-600" /> Scan to Vote
              </p>
              <p className="text-[11px] text-slate-500 truncate">{shareUrl.replace(/https?:\/\//, "")}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 py-2 px-4 rounded-2xl">
            <Users className="w-5 h-5 text-indigo-400" />
            <span className="text-lg font-black text-white">{poll.totalVotes}</span>
            <span className="text-xs text-indigo-300 font-semibold">Total Votes Received</span>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 border-t border-slate-800/80 pt-4 flex items-center justify-between">
        <span>PollPulse Live Presenter Screen</span>
        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Live Sync Active
        </span>
      </div>
    </div>
  );
};
