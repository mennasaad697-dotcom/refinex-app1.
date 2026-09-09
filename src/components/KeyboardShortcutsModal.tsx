import React from "react";
import { Keyboard, Command } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "Ctrl + Enter", desc: "بدء معالجة وتنظيف النص فوراً" },
    { key: "Ctrl + Shift + P", desc: "بدء التحسين والتدقيق اللغوي والنحوي" },
    { key: "Ctrl + Shift + S", desc: "فحص وحذف العلامات والرموز المخفية فوراً" },
    { key: "Ctrl + Shift + H", desc: "فتح سجل آخر 5 نصوص معالجة (History)" },
    { key: "Ctrl + Shift + D", desc: "التبديل بين الوضع الداكن والفاتح" },
    { key: "Esc", desc: "إغلاق النوافذ المنبثقة والسجل" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">اختصارات لوحة المفاتيح السريعة</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">لتسريع وتسهيل معالجة وتدقيق النصوص</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2.5">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 text-xs"
            >
              <span className="text-slate-700 dark:text-slate-300 font-medium">{s.desc}</span>
              <kbd className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            حسناً، فهمت
          </button>
        </div>
      </div>
    </div>
  );
};
