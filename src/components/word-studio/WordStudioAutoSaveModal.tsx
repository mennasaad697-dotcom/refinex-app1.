import React, { useState } from "react";
import {
  Save,
  Clock,
  RotateCcw,
  Trash2,
  Check,
  X,
  History,
  CloudCheck,
  Cloud,
  FileText,
  AlertCircle,
  Download,
  Settings,
  ShieldCheck,
  Sparkles
} from "lucide-react";

export interface DocumentSnapshot {
  id: string;
  timestamp: number;
  dateFormatted: string;
  timeFormatted: string;
  title: string;
  snippet: string;
  wordCount: number;
  charCount: number;
  label: string;
  htmlContent: string;
  docHeader?: string;
  docFooter?: string;
  fontFamily?: string;
  fontSize?: string;
  lineHeight?: string;
  pageOrientation?: "portrait" | "landscape";
  pageMargins?: "normal" | "narrow" | "wide" | "moderate";
  pagePaperColor?: string;
  pageBorder?: string;
  pageWatermark?: string;
  pageColumns?: "1" | "2" | "3";
  comments?: any[];
}

interface WordStudioAutoSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: DocumentSnapshot[];
  onRestoreSnapshot: (snapshot: DocumentSnapshot) => void;
  onDeleteSnapshot: (id: string) => void;
  onClearAllSnapshots: () => void;
  onSaveManualSnapshot: (customLabel?: string) => void;
  autoSaveEnabled: boolean;
  onToggleAutoSave: (enabled: boolean) => void;
  autoSaveInterval: number; // in seconds
  onChangeAutoSaveInterval: (interval: number) => void;
  lastSavedTime: string | null;
  currentWordCount: number;
}

export const WordStudioAutoSaveModal: React.FC<WordStudioAutoSaveModalProps> = ({
  isOpen,
  onClose,
  snapshots,
  onRestoreSnapshot,
  onDeleteSnapshot,
  onClearAllSnapshots,
  onSaveManualSnapshot,
  autoSaveEnabled,
  onToggleAutoSave,
  autoSaveInterval,
  onChangeAutoSaveInterval,
  lastSavedTime,
  currentWordCount
}) => {
  const [selectedSnapshot, setSelectedSnapshot] = useState<DocumentSnapshot | null>(null);
  const [customLabel, setCustomLabel] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"history" | "settings">("history");
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const handleManualSave = () => {
    onSaveManualSnapshot(customLabel.trim() || "نسخة محفوظة يدوياً");
    setCustomLabel("");
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  مركز الحفظ التلقائي وسجل الإصدارات
                </h3>
                <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {autoSaveEnabled ? "الحفظ التلقائي نشط" : "الحفظ التلقائي معطل"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                حماية تلقائية مستمرة لمستندك، مع إمكانية التراجع واستعادة أي نسخة سابقة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab("history")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === "history"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>سجل الإصدارات والنسخ ({snapshots.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab("settings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === "settings"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>إعدادات الحفظ والتردد</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>آخر حفظ: {lastSavedTime || "منذ لحظات"}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeSubTab === "history" && (
            <div className="space-y-4">
              {/* Quick Manual Snapshot Card */}
              <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-[240px]">
                  <label className="text-xs font-bold text-blue-900 dark:text-blue-300 block mb-1">
                    إنشاء نقطة استعادة يدوية الآن:
                  </label>
                  <input
                    type="text"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="اسم النسخة (مثال: قبل تعديل المقدمة، النسخة المعتمدة...)"
                    className="w-full bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleManualSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ نسخة الآن</span>
                </button>
              </div>

              {saveSuccessNotice && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>تم إنشاء وحفظ النسخة الاحتياطية بنجاح في السجل!</span>
                </div>
              )}

              {/* Snapshots List */}
              {snapshots.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <Cloud className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    لا توجد نسخ سابقة محفوظة بعد
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                    يقوم المحرر بحفظ نسخ تلقائية دورية أثناء كتابتك وتعديلك للمستند. يمكنك أيضاً الضغط على "حفظ نسخة الآن".
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                    <span>النسخ المحفوظة ({snapshots.length} إصدار)</span>
                    {snapshots.length > 1 && (
                      <button
                        onClick={onClearAllSnapshots}
                        className="text-red-500 hover:text-red-700 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>مسح كل السجل</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {snapshots.map((snap, idx) => {
                      const isCurrent = idx === 0;
                      const isSelected = selectedSnapshot?.id === snap.id;

                      return (
                        <div
                          key={snap.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/30"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isCurrent
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {isCurrent ? <Check className="w-4 h-4" /> : `#${snapshots.length - idx}`}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                    {snap.label || "نسخة تلقائية"}
                                  </h4>
                                  {isCurrent && (
                                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                      الأحدث
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                  <span>{snap.dateFormatted} • {snap.timeFormatted}</span>
                                  <span>•</span>
                                  <span className="font-mono">{snap.wordCount.toLocaleString()} كلمة</span>
                                  <span>•</span>
                                  <span className="font-mono">{snap.charCount.toLocaleString()} حرف</span>
                                </div>
                                {snap.snippet && (
                                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-1 font-mono bg-white dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                    {snap.snippet}...
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => {
                                  if (confirm(`هل أنت متأكد من استعادة هذه النسخة (${snap.timeFormatted})؟`)) {
                                    onRestoreSnapshot(snap);
                                    onClose();
                                  }
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
                                title="استعادة هذا المستند بالكامل"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>استعادة</span>
                              </button>
                              <button
                                onClick={() => onDeleteSnapshot(snap.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                title="حذف هذه النسخة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === "settings" && (
            <div className="space-y-5">
              {/* Auto-save Toggle */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CloudCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      تفعيل الحفظ التلقائي في الخلفية (Auto-Save)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    حفظ أي تغيير في النص، التنسيقات، الهوامش، والتعليقات تلقائياً في التخزين المحلي الآمن.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={(e) => onToggleAutoSave(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Auto-save interval */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    تردد وزمن الحفظ التلقائي
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  اختر الفاصل الزمني المفضل لحفظ التعديلات تلقائياً بعد توقف الكتابة:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {[
                    { label: "فوري (1.5 ثانية)", value: 1.5 },
                    { label: "سريع (5 ثوانٍ)", value: 5 },
                    { label: "معتدل (15 ثانية)", value: 15 },
                    { label: "كل 30 ثانية", value: 30 }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onChangeAutoSaveInterval(opt.value)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        autoSaveInterval === opt.value
                          ? "border-blue-600 bg-blue-600 text-white shadow-xs"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage security notice */}
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed">
                  <span className="font-bold block mb-0.5">خصوصية وتشفير المستندات:</span>
                  يتم تخزين كافة مسوداتك وإصداراتك محلياً في متصفحك بشكل آمن وخاص تماماً دون إرسالها إلى أي خوادم خارجية غير مصرح بها.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            عدد الكلمات الحالي بالمستند: <span className="font-bold text-slate-800 dark:text-slate-200">{currentWordCount}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
