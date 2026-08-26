import React, { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";

export const CountdownTimer = ({ expiresAt, isClosed }) => {
  if (isClosed) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <AlertCircle className="w-3 h-3" /> Closed
      </span>
    );
  }

  if (!expiresAt) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
        <Clock className="w-3 h-3 text-indigo-400" /> No Expiry
      </span>
    );
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, total: diff };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  if (!timeLeft) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <AlertCircle className="w-3 h-3" /> Expired
      </span>
    );
  }

  const isUrgent = timeLeft.total < 24 * 60 * 60 * 1000; // Less than 24 hours

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        isUrgent
          ? "bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse"
          : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
      }`}
    >
      <Clock className="w-3 h-3" />
      {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
      <span>
        {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </span>
  );
};
