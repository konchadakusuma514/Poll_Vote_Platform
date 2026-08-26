import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import {
  PlusCircle,
  Trash2,
  Calendar,
  Sparkles,
  CheckSquare,
  Eye,
  AlertCircle,
  Wand2,
  X
} from "lucide-react";

const AI_TEMPLATES = [
  {
    category: "Technology",
    title: "Which AI model do you rely on most for daily coding & assistance?",
    desc: "Vote for the AI ecosystem that provides you the highest quality output and reliability.",
    options: ["Gemini 2.5 Pro", "Claude 3.7 Sonnet", "ChatGPT o3-mini", "DeepSeek-V3"]
  },
  {
    category: "Career & Work",
    title: "What is the most crucial skill for engineers entering the tech market in 2026?",
    desc: "Beyond syntax, where should students and new grads invest their time?",
    options: ["System Architecture & Cloud", "AI Prompt & Workflow Engineering", "Full-Stack Development", "Data Engineering & ML"]
  },
  {
    category: "Gaming",
    title: "Which gaming platform delivers the best overall experience?",
    desc: "Factoring in exclusives, graphics, community, and hardware.",
    options: ["Custom Gaming PC", "PlayStation 5 Pro", "Xbox Series X", "Nintendo Switch 2"]
  },
  {
    category: "Artificial Intelligence",
    title: "Will Autonomous AI Agents write 80%+ of commercial code by 2028?",
    desc: "Predicting the future of software development.",
    options: ["Yes, absolutely", "No, humans will remain primary", "About 50/50 collaboration", "Unsure / Need more time"]
  }
];

export const CreatePoll = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [options, setOptions] = useState(["", ""]);
  const [isMultiple, setIsMultiple] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const categories = [
    { key: "General", label: t("catGeneral") },
    { key: "Technology", label: t("catTech") },
    { key: "Artificial Intelligence", label: t("catAI") },
    { key: "Career & Work", label: t("catCareer") },
    { key: "Gaming", label: t("catGaming") },
    { key: "Entertainment", label: t("catEntertainment") },
    { key: "Education", label: t("catEducation") },
    { key: "Sports", label: t("catSports") }
  ];

  const handleApplyTemplate = (tpl) => {
    setTitle(tpl.title);
    setDescription(tpl.desc);
    setCategory(tpl.category);
    setOptions([...tpl.options]);
    setAiModalOpen(false);
  };

  const handleAddOption = () => {
    if (options.length < 10) setOptions([...options, ""]);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const setExpiryPreset = (hours) => {
    const date = new Date(Date.now() + hours * 60 * 60 * 1000);
    const localIso = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setExpiresAt(localIso);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a question for your poll.");
      return;
    }

    const cleanOptions = options.map((opt) => opt.trim()).filter((opt) => opt.length > 0);
    if (cleanOptions.length < 2) {
      setError("Please provide at least 2 non-empty options.");
      return;
    }

    setLoading(true);
    try {
      const data = await api.createPoll({
        title,
        description,
        category,
        options: cleanOptions,
        isMultiple,
        isPrivate,
        accessCode: isPrivate ? accessCode : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null
      });
      navigate(`/poll/${data.poll.id}`);
    } catch (err) {
      setError(err.message || "Failed to create poll.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            <PlusCircle className="w-4 h-4" /> {t("createPoll")}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{t("createHeading")}</h1>
          <p className="text-xs sm:text-sm text-slate-500">{t("createSubtitle")}</p>
        </div>

        {/* AI Generator Button */}
        <button
          type="button"
          onClick={() => setAiModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:scale-105 transition-all"
        >
          <Wand2 className="w-4 h-4" />
          <span>✨ AI Suggest Ideas</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="app-card p-5 sm:p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{t("pollDetailsStep")}</h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("questionLabel")} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={t("questionPlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("descLabel")}
              </label>
              <textarea
                rows={2}
                placeholder={t("descPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t("categoryLabel")}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Options */}
          <div className="app-card p-5 sm:p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t("optionsStep")} ({options.length}/10)
              </h2>
              <span className="text-[11px] text-slate-400">{t("minOptionsHint")}</span>
            </div>

            <div className="space-y-2.5">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-center text-xs font-bold text-slate-400">#{idx + 1}</span>
                  <input
                    type="text"
                    required
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    maxLength={100}
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-600"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 10 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="w-full py-2.5 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t("addOption")}</span>
              </button>
            )}
          </div>

          {/* Settings */}
          <div className="app-card p-5 sm:p-6 rounded-2xl space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{t("settingsStep")}</h2>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <CheckSquare className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{t("multiChoice")}</p>
                  <p className="text-[11px] text-slate-500">{t("multiChoiceDesc")}</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isMultiple}
                onChange={(e) => setIsMultiple(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{t("expiryTitle")}</p>
                  <p className="text-[11px] text-slate-500">{t("expiryDesc")}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button type="button" onClick={() => setExpiryPreset(1)} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">+1h</button>
                <button type="button" onClick={() => setExpiryPreset(24)} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">+1d</button>
                <button type="button" onClick={() => setExpiryPreset(72)} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">+3d</button>
                <button type="button" onClick={() => setExpiryPreset(168)} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">+1w</button>
              </div>

              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Sparkles className="w-5 h-5" /><span>{t("publishBtn")}</span></>}
          </button>
        </form>

        {/* Live Preview */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Eye className="w-4 h-4 text-indigo-500" />
            <span>Live Preview</span>
          </div>

          <div className="app-card rounded-2xl p-5 shadow-lg space-y-4 sticky top-24">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              {category}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{title.trim() || "Your poll question will appear here..."}</h3>
            {description.trim() && <p className="text-xs text-slate-500">{description}</p>}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {options.map((opt, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-400"></div>
                  <span className="truncate">{opt.trim() || `Option ${idx + 1}`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Wand2 className="w-5 h-5" />
                <span>AI Poll Idea Inspirations</span>
              </div>
              <button onClick={() => setAiModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">Pick any curated template below to instantly load its question and options:</p>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {AI_TEMPLATES.map((tpl, idx) => (
                <div
                  key={idx}
                  onClick={() => handleApplyTemplate(tpl)}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                      {tpl.category}
                    </span>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">Use Template →</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{tpl.title}</h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tpl.options.map((o, i) => (
                      <span key={i} className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
