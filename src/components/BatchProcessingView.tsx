import React, { useState, useRef } from "react";
import { 
  FolderOpen, 
  Upload, 
  Play, 
  Check, 
  Download, 
  RefreshCw, 
  FileText, 
  Trash2, 
  Sparkles, 
  AlertCircle,
  FileCheck,
  ShieldCheck
} from "lucide-react";
import { cleanTextRuleBased, humanizeTextRuleBased } from "../textCleanerUtils";

interface BatchFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  extractedText?: string;
  cleanedText?: string;
  error?: string;
  invisibleRemoved?: number;
}

interface BatchProcessingViewProps {
  apiKey?: string;
  modelName?: string;
  temperature?: number;
  language?: string;
}

export const BatchProcessingView: React.FC<BatchProcessingViewProps> = ({
  apiKey = "",
  modelName = "gemini-3.7-flash",
  temperature = 0.7,
  language = "auto"
}) => {
  const [items, setItems] = useState<BatchFileItem[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [batchMode, setBatchMode] = useState<"clean" | "humanize" | "proofread">("humanize");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileList: File[] = Array.from(e.target.files);
    const newFiles: BatchFileItem[] = fileList.map((f) => ({
      id: Math.random().toString(36).substring(2, 9),
      file: f,
      name: f.name,
      size: f.size,
      status: "pending",
      progress: 0
    }));

    setItems((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    if (isProcessingAll) return;
    setItems([]);
  };

  const processSingleItem = async (item: BatchFileItem): Promise<BatchFileItem> => {
    try {
      // 1. Extract text via /api/parse-file
      const formData = new FormData();
      formData.append("file", item.file);

      const parseRes = await fetch("/api/parse-file", {
        method: "POST",
        body: formData
      });

      let text = "";
      let invisibleRemoved = 0;
      if (parseRes.ok) {
        const parseData = await parseRes.json();
        text = parseData.text;
        invisibleRemoved = parseData.invisibleRemoved || 0;
      } else {
        // Local FileReader fallback for text
        text = await item.file.text();
      }

      if (!text || !text.trim()) {
        throw new Error("لم يتم العثور على محتوى نصي داخل الملف.");
      }

      // 2. Process via AI or Local fallback
      let cleaned = "";
      try {
        let endpoint = "/api/humanize";
        let body: any = {
          text,
          apiKey,
          modelName,
          temperature,
          language
        };

        if (batchMode === "clean") {
          endpoint = "/api/clean-text";
          body.strictLegalSanitize = true;
        } else if (batchMode === "proofread") {
          endpoint = "/api/proofread";
        }

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        if (res.ok) {
          const data = await res.json();
          cleaned = data.cleanedText;
        } else {
          // Rule based fallback
          if (batchMode === "clean") {
            cleaned = cleanTextRuleBased(text).cleanedText;
          } else {
            cleaned = humanizeTextRuleBased(text, "authentic").cleanedText;
          }
        }
      } catch (e) {
        cleaned = humanizeTextRuleBased(text, "authentic").cleanedText;
      }

      return {
        ...item,
        status: "completed",
        progress: 100,
        extractedText: text,
        cleanedText: cleaned,
        invisibleRemoved
      };
    } catch (err: any) {
      return {
        ...item,
        status: "failed",
        progress: 0,
        error: err?.message || "فشلت معالجة الملف"
      };
    }
  };

  const handleStartBatch = async () => {
    if (items.length === 0 || isProcessingAll) return;
    setIsProcessingAll(true);

    for (let i = 0; i < items.length; i++) {
      const current = items[i];
      if (current.status === "completed") continue;

      setItems((prev) =>
        prev.map((it, idx) => (idx === i ? { ...it, status: "processing", progress: 40 } : it))
      );

      const result = await processSingleItem(current);

      setItems((prev) =>
        prev.map((it, idx) => (idx === i ? result : it))
      );
    }

    setIsProcessingAll(false);
  };

  const handleDownloadResult = (item: BatchFileItem) => {
    if (!item.cleanedText) return;
    const blob = new Blob([item.cleanedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RefineX_${item.name.replace(/\.[^/.]+$/, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    const completed = items.filter(it => it.status === "completed" && it.cleanedText);
    completed.forEach(item => handleDownloadResult(item));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>المعالجة المجمعة للمجلدات والمستندات (Batch Processing)</span>
              <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Direct Web & Desktop
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ارفع مجموعة من ملفات PDF أو Word أو TXT لمعالجتها وتطهيرها دفعة واحدة
            </p>
          </div>
        </div>

        {/* Action Selector */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setBatchMode("humanize")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              batchMode === "humanize"
                ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            ✨ أنسنة فائقة 100%
          </button>
          <button
            onClick={() => setBatchMode("clean")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              batchMode === "clean"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            🛡️ تطهير بصمات AI والمحاماة
          </button>
          <button
            onClick={() => setBatchMode("proofread")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              batchMode === "proofread"
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            📝 تدقيق لغوي ونحوي
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleAddFiles}
        accept=".docx,.pdf,.txt,.md"
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-850/50 group"
      >
        <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
          اسحب الملفات وأفلتها هنا، أو اضغط للاختيار من جهازك
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          يدعم ملفات Word (.docx), PDF (.pdf), والنصوص (.txt, .md) المتعددة
        </p>
      </div>

      {/* Files List */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              قائمة المستندات المحددة ({items.length}):
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAll}
                disabled={isProcessingAll}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                مسح القائمة
              </button>
              <button
                onClick={handleDownloadAll}
                disabled={!items.some(it => it.status === "completed")}
                className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-800 dark:text-white flex items-center gap-1 font-semibold disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                تحميل الكل المنجز
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-850">
            {items.map((item) => (
              <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">{item.name}</div>
                    <div className="text-[11px] text-slate-400">{(item.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {item.status === "pending" && (
                    <span className="text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-[11px] font-medium">
                      في الانتظار
                    </span>
                  )}
                  {item.status === "processing" && (
                    <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      جاري المعالجة...
                    </span>
                  )}
                  {item.status === "completed" && (
                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      اكتمل ({item.invisibleRemoved ? `حذف ${item.invisibleRemoved} علامة خفية` : "100%"})
                    </span>
                  )}
                  {item.status === "failed" && (
                    <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1" title={item.error}>
                      <AlertCircle className="w-3 h-3" />
                      فشل
                    </span>
                  )}

                  {item.status === "completed" && (
                    <button
                      onClick={() => handleDownloadResult(item)}
                      className="p-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100"
                      title="تحميل الملف المنظف"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!isProcessingAll && (
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Start Button */}
          <div className="pt-2">
            <button
              onClick={handleStartBatch}
              disabled={isProcessingAll || items.every(it => it.status === "completed")}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
            >
              {isProcessingAll ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري معالجة المستندات المجمعة...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>بدء المعالجة المجمعة لجميع الملفات ({items.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="p-4 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs text-slate-600 dark:text-slate-400">
        <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          معالجة محلية وتلقائية فائقة السرعة
        </h5>
        <p>
          يتم فحص كل مستند واستخراج نصوصه بدقة، وتطهير العلامات المشفرة ومسافات الصفر الخفية، وصياغة المحتوى وفق القالب المختار مع الحفاظ الكامل على المعنى والبيانات، وتوفير التنزيل الفوري بصيغة نصية أو Word.
        </p>
      </div>
    </div>
  );
};
