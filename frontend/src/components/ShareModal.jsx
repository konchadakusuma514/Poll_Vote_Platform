import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, Share2, MessageCircle, Send } from "lucide-react";

export const ShareModal = ({ poll, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen || !poll) return null;

  const shareUrl = `${window.location.origin}/poll/${poll.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`📊 Cast your vote on "${poll.title}" at PollPulse!\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`📊 Cast your vote on "${poll.title}"! #PollPulse #Voting`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-3">
            <Share2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Share This Poll</h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{poll.title}</p>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-inner mb-5 mx-auto max-w-[200px]">
          <QRCodeSVG value={shareUrl} size={160} level="M" />
          <span className="text-[11px] font-semibold text-slate-800 mt-2">Scan to Vote on Mobile</span>
        </div>

        {/* Link Copy Box */}
        <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl p-2 mb-4">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-xs text-slate-300 px-2 outline-none select-all"
          />
          <button
            onClick={handleCopy}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={shareWhatsApp}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={shareTwitter}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/30 text-sky-400 text-xs font-semibold transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Twitter / X</span>
          </button>
        </div>
      </div>
    </div>
  );
};
