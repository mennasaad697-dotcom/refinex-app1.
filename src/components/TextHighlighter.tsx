import React, { useState, useMemo } from "react";
import { AI_COMMON_MARKERS, LEGAL_ADVOCACY_MARKERS } from "../textCleanerUtils";
import { Sparkles, Scale, EyeOff, AlertTriangle, Check, RefreshCw } from "lucide-react";

interface Props {
  text: string;
  onReplaceWord?: (oldWord: string, newWord: string) => void;
}

export const TextHighlighter: React.FC<Props> = ({ text, onReplaceWord }) => {
  const [activeIssue, setActiveIssue] = useState<{
    word: string;
    type: "ai" | "legal" | "invisible";
    reason: string;
    suggestion: string;
  } | null>(null);

  // Scan and highlight segments
  const highlightedTokens = useMemo(() => {
    if (!text || !text.trim()) return [];

    // Combine regex of AI and Legal markers
    const aiPatterns = AI_COMMON_MARKERS.slice(0, 35);
    const legalPatterns = LEGAL_ADVOCACY_MARKERS.slice(0, 25);

    // Escape regex
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const allPatterns = [
      ...aiPatterns.map(p => ({ pattern: p, type: "ai" as const })),
      ...legalPatterns.map(p => ({ pattern: p, type: "legal" as const }))
    ];

    const sortedPatterns = allPatterns.sort((a, b) => b.pattern.length - a.pattern.length);
    const combinedRegex = new RegExp(`(${sortedPatterns.map(p => escapeRegex(p.pattern)).join("|")})`, "gi");

    const parts = text.split(combinedRegex);

    return parts.map((part, index) => {
      const matched = sortedPatterns.find(p => p.pattern.toLowerCase() === part.toLowerCase());
      if (matched) {
        return {
          id: index,
          text: part,
          isMatch: true,
          type: matched.type,
          suggestion: matched.type === "ai" ? "صياغة بشرية مباشرة" : "تعبير مبسط بدون ديباجة"
        };
      }
      return {
        id: index,
        text: part,
        isMatch: false,
        type: null,
        suggestion: ""
      };
    });
  }, [text]);

  if (!text.trim()) {
    return (
      <div className="text-center py-8 text-xs text-slate-400">
        أدخل أو الصق نصاً ليتم تظليل بصمات الذكاء الاصطناعي وعبارات المحاماة تفاعلياً.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Legend & Stats */}
      <div className="flex flex-wrap items-center gap-2 text-xs pb-2 border-b border-slate-200 dark:border-slate-700">
        <span className="text-slate-500 dark:text-slate-400 font-bold">دليل التظليل الحي:</span>
        <span className="flex items-center gap-1 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-md font-semibold">
          <Sparkles className="w-3 h-3 text-rose-500" />
          بصمات AI
        </span>
        <span className="flex items-center gap-1 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md font-semibold">
          <Scale className="w-3 h-3 text-amber-600" />
          ديباجات محاماة
        </span>
        <span className="text-[11px] text-slate-400 mr-auto">انقر على أي عبارة مضللة لمعاينة سبب الاعتراض</span>
      </div>

      {/* Selected Token Tooltip popup */}
      {activeIssue && (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 block">
              {activeIssue.type === "ai" ? "🤖 بصمة ذكاء اصطناعي رنانة" : "⚖️ ديباجة محاماة وتحفظ مفرط"}
            </span>
            <strong className="text-amber-300 text-sm">"{activeIssue.word}"</strong>
            <p className="text-slate-300 text-[11px]">{activeIssue.reason}</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveIssue(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Highlighted text container */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 max-h-72 overflow-y-auto leading-loose text-sm font-sans text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
        {highlightedTokens.map((token) => {
          if (!token.isMatch) {
            return <span key={token.id}>{token.text}</span>;
          }

          const isAI = token.type === "ai";
          return (
            <mark
              key={token.id}
              onClick={() =>
                setActiveIssue({
                  word: token.text,
                  type: token.type!,
                  reason: isAI
                    ? "عبارة نمطية تتكرر في إجابات النماذج اللغوية الآلية وتكشف أصل النص."
                    : "صياغة قانونية مفرطة التحفظ تضعف قوة النص وتشتت القارئ.",
                  suggestion: token.suggestion
                })
              }
              className={`cursor-pointer px-1 py-0.5 mx-0.5 rounded-sm transition-all border font-bold ${
                isAI
                  ? "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border-rose-300 hover:bg-rose-200"
                  : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-amber-300 hover:bg-amber-200"
              }`}
              title="انقر لمعرفة سبب التظليل"
            >
              {token.text}
            </mark>
          );
        })}
      </div>
    </div>
  );
};
