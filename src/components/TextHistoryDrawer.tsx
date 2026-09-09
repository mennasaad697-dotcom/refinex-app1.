import React from "react";
import { TextHistoryItem } from "../types";
import { History, RotateCcw, Trash2, CheckCheck, Sparkles, Clock, FileText, Wand2, Terminal } from "lucide-react";

interface Props {
  history: TextHistoryItem[];
  onRestore: (item: TextHistoryItem) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const TextHistoryDrawer: React.FC<Props> = ({
  history,
  onRestore,
  onClear,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const renderBadge = (type: string, stats?: any) => {
    switch (type) {
      case "humanize":
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 bg-purple-100 text-purple-800 border border-purple-200">
            <Wand2 className="w-3 h-3 text-purple-600" />
            تحويل بشري 100%
          </span>
        );
      case "custom_command":
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-200">
            <Terminal className="w-3 h-3 text-amber-700" />
            أمر ذكي مخصص
          </span>
        );
      case "proofread":
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCheck className="w-3 h-3 text-emerald-600" />
            تحسين وتدقيق لغوي
          </span>
        );
      case "clean":
      default:
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 bg-blue-100 text-blue-800 border border-blue-200">
            <Sparkles className="w-3 h-3 text-blue-600" />
            تنظيف وبصمات AI
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-r border-slate-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">سجل المعالجات السابقة</h2>
              <p className="text-xs text-slate-500">آخر 5 عمليات تمت معالجتها</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
            title="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30 stroke-1" />
              <p className="text-sm font-medium text-slate-600">السجل فارغ حالياً</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                أي نص تقوم بتحويله لأسلوب بشري أو تنفيذه بأمر ذكي أو تنظيفه سيُحفظ تلقائياً هنا لتتمكن من استرجاعه بضغطة زر واحدة.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    {renderBadge(item.type, item.stats)}
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {item.dateStr}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed">
                    {item.title}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-400" />
                      {item.inputWordCount} كلمة
                    </span>
                    <span>•</span>
                    <span>
                      {item.inputText.length} حرف ➔ {item.outputText.length} حرف
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onRestore(item);
                    onClose();
                  }}
                  className="w-full mt-1 py-1.5 px-3 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  استرجاع هذا النص بضغطة زر
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              محفوظ {history.length} من أصل 5 نصوص
            </span>
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 p-1 hover:bg-rose-50 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
              مسح السجل بالكامل
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
