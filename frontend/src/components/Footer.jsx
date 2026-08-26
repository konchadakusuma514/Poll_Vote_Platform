import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { Vote, Heart, ShieldCheck, Zap, Sparkles } from "lucide-react";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Vote className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{t("brandName")}</p>
              <p className="text-xs text-slate-500">{t("tagline")}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> {t("antiDupTitle")}
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" /> {t("liveUpdatesTitle")}
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" /> {t("qrTitle")}
            </span>
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" /> by Kusuma
          </p>
        </div>
      </div>
    </footer>
  );
};
