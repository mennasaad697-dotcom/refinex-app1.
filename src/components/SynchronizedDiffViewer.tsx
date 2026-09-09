import React, { useState, useRef, useEffect } from "react";
import { Layers, Lock, Unlock, Columns, AlignJustify } from "lucide-react";

interface Props {
  originalText: string;
  cleanedText: string;
}

export const SynchronizedDiffViewer: React.FC<Props> = ({ originalText, cleanedText }) => {
  const [syncScroll, setSyncScroll] = useState(true);
  const [viewMode, setViewMode] = useState<"split" | "inline">("split");

  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<"left" | "right" | null>(null);

  // Synchronized scroll listener
  const handleLeftScroll = () => {
    if (!syncScroll || isScrollingRef.current === "right") return;
    if (leftPaneRef.current && rightPaneRef.current) {
      isScrollingRef.current = "left";
      const percentage = leftPaneRef.current.scrollTop / (leftPaneRef.current.scrollHeight - leftPaneRef.current.clientHeight || 1);
      rightPaneRef.current.scrollTop = percentage * (rightPaneRef.current.scrollHeight - rightPaneRef.current.clientHeight);
      setTimeout(() => {
        isScrollingRef.current = null;
      }, 50);
    }
  };

  const handleRightScroll = () => {
    if (!syncScroll || isScrollingRef.current === "left") return;
    if (leftPaneRef.current && rightPaneRef.current) {
      isScrollingRef.current = "right";
      const percentage = rightPaneRef.current.scrollTop / (rightPaneRef.current.scrollHeight - rightPaneRef.current.clientHeight || 1);
      leftPaneRef.current.scrollTop = percentage * (leftPaneRef.current.scrollHeight - leftPaneRef.current.clientHeight);
      setTimeout(() => {
        isScrollingRef.current = null;
      }, 50);
    }
  };

  const origWords = originalText ? originalText.trim().split(/\s+/).length : 0;
  const cleanWords = cleanedText ? cleanedText.trim().split(/\s+/).length : 0;
  const wordDiff = cleanWords - origWords;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              شاشة المقارنة المتزامنة الفورية (Synchronized Diff View)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              مقارنة دقيقة كلمة بكلمة مع تباين الألوان وتزامن التمرير
            </p>
          </div>
        </div>

        {/* View & Sync Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Synchronized scroll button */}
          <button
            type="button"
            onClick={() => setSyncScroll(!syncScroll)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              syncScroll
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
            title="تفعيل أو تعطيل التمرير المتزامن بين الشاشتين"
          >
            {syncScroll ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            {syncScroll ? "التمرير مقترن (متزامن)" : "التمرير منفصل"}
          </button>

          {/* View Mode */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "split"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
              title="عرض جنباً إلى جنب"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("inline")}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "inline"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
              title="عرض متعاقب"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Difference Stats Counter */}
      <div className="flex items-center gap-3 text-xs bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
        <span className="font-bold text-slate-700 dark:text-slate-300">مؤشرات التغيير:</span>
        <span className="text-rose-600 dark:text-rose-400 font-mono font-bold">
          الأصل: {origWords} كلمة
        </span>
        <span>➔</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
          المنظف: {cleanWords} كلمة
        </span>
        <span className="text-slate-400">•</span>
        <span className="font-medium text-slate-600 dark:text-slate-400">
          فارق الكلمات: <strong className={wordDiff >= 0 ? "text-blue-600" : "text-amber-600"}>{wordDiff > 0 ? `+${wordDiff}` : wordDiff}</strong>
        </span>
      </div>

      {/* Panes */}
      {viewMode === "split" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left / Original */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-rose-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                النص الأصلي (بصمات AI وديباجات محاماة)
              </label>
              <span className="text-slate-400 text-[11px] font-mono">{originalText.length} حرف</span>
            </div>
            <div
              ref={leftPaneRef}
              onScroll={handleLeftScroll}
              className="w-full p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 text-sm font-sans max-h-[500px] overflow-y-auto leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200"
            >
              {originalText || "الرجاء إدخال نص في المختبر الحي أولاً..."}
            </div>
          </div>

          {/* Right / Cleaned */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-emerald-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                النص المنظف والمدقق (نبرة بشرية طبيعية)
              </label>
              <span className="text-slate-400 text-[11px] font-mono">{cleanedText.length} حرف</span>
            </div>
            <div
              ref={rightPaneRef}
              onScroll={handleRightScroll}
              className="w-full p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 text-sm font-sans max-h-[500px] overflow-y-auto leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200"
            >
              {cleanedText || "ستظهر النتيجة المنظفة هنا بعد بدء المعالجة..."}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
            <div className="text-xs font-bold text-rose-600 mb-2">النص الأصلي:</div>
            {originalText}
          </div>
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
            <div className="text-xs font-bold text-emerald-600 mb-2">النص المنظف:</div>
            {cleanedText}
          </div>
        </div>
      )}
    </div>
  );
};
