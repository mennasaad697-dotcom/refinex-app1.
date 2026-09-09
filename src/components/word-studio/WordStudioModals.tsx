import React, { useState } from "react";
import {
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Hash,
  Search,
  Sparkles,
  BookOpen,
  CheckCheck,
  Scale,
  X,
  Upload,
  Layers,
  HelpCircle,
  FileCheck
} from "lucide-react";
import { MATH_SYMBOLS } from "./fontOptions";

interface WordStudioModalsProps {
  // Table Modal
  showTableModal: boolean;
  setShowTableModal: (show: boolean) => void;
  onInsertTable: (rows: number, cols: number, hasHeader: boolean, style: "classic" | "striped" | "modern" | "academic") => void;

  // Link Modal
  showLinkModal: boolean;
  setShowLinkModal: (show: boolean) => void;
  onInsertLink: (url: string, text: string) => void;

  // Image Modal
  showImageModal: boolean;
  setShowImageModal: (show: boolean) => void;
  onInsertImage: (url: string, caption: string, width: string) => void;

  // Math Symbols Modal
  showMathModal: boolean;
  setShowMathModal: (show: boolean) => void;
  onInsertSymbol: (symbol: string) => void;

  // Citation Modal
  showCitationModal: boolean;
  setShowCitationModal: (show: boolean) => void;
  onInsertCitation: (style: string, author: string, title: string, year: string, publisher: string, url: string) => void;

  // Footnote Modal
  showFootnoteModal: boolean;
  setShowFootnoteModal: (show: boolean) => void;
  onInsertFootnote: (text: string) => void;

  // Callout Box Modal
  showCalloutModal: boolean;
  setShowCalloutModal: (show: boolean) => void;
  onInsertCallout: (type: "info" | "warning" | "success" | "quote" | "academic", title: string, text: string) => void;

  // Find & Replace Modal
  showFindReplaceModal: boolean;
  setShowFindReplaceModal: (show: boolean) => void;
  onSearch: (query: string, matchCase: boolean) => void;
  onReplaceAll: (query: string, replace: string, matchCase: boolean) => void;
  matchCount: number | null;

  // In-Place AI Modal
  showAiModal: boolean;
  setShowAiModal: (show: boolean) => void;
  selectedTextForAi: string;
  modelName: string;
  onExecuteAi: (mode: string, customPrompt: string) => void;
  isAiLoading: boolean;
  aiStatusMessage: string;
}

export const WordStudioModals: React.FC<WordStudioModalsProps> = ({
  showTableModal,
  setShowTableModal,
  onInsertTable,
  showLinkModal,
  setShowLinkModal,
  onInsertLink,
  showImageModal,
  setShowImageModal,
  onInsertImage,
  showMathModal,
  setShowMathModal,
  onInsertSymbol,
  showCitationModal,
  setShowCitationModal,
  onInsertCitation,
  showFootnoteModal,
  setShowFootnoteModal,
  onInsertFootnote,
  showCalloutModal,
  setShowCalloutModal,
  onInsertCallout,
  showFindReplaceModal,
  setShowFindReplaceModal,
  onSearch,
  onReplaceAll,
  matchCount,
  showAiModal,
  setShowAiModal,
  selectedTextForAi,
  modelName,
  onExecuteAi,
  isAiLoading,
  aiStatusMessage
}) => {
  // Table state
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableHasHeader, setTableHasHeader] = useState(true);
  const [tableStyle, setTableStyle] = useState<"classic" | "striped" | "modern" | "academic">("classic");

  // Link state
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");

  // Image state
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageWidth, setImageWidth] = useState("80%");

  // Citation state
  const [citationStyle, setCitationStyle] = useState("apa");
  const [citeAuthor, setCiteAuthor] = useState("");
  const [citeTitle, setCiteTitle] = useState("");
  const [citeYear, setCiteYear] = useState(new Date().getFullYear().toString());
  const [citePublisher, setCitePublisher] = useState("");
  const [citeUrl, setCiteUrl] = useState("");

  // Footnote state
  const [footnoteContent, setFootnoteContent] = useState("");

  // Callout state
  const [calloutType, setCalloutType] = useState<"info" | "warning" | "success" | "quote" | "academic">("info");
  const [calloutTitle, setCalloutTitle] = useState("ملاحظة هامة");
  const [calloutText, setCalloutText] = useState("");

  // Find & replace state
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [matchCase, setMatchCase] = useState(false);

  // AI state
  const [aiMode, setAiMode] = useState<string>("humanize");
  const [customAiPrompt, setCustomAiPrompt] = useState("");

  return (
    <>
      {/* 1. Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-blue-600" />
                <span>إدراج جدول منسق ومخصص</span>
              </h3>
              <button onClick={() => setShowTableModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">عدد الصفوف:</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={tableRows}
                  onChange={(e) => setTableRows(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">عدد الأعمدة:</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tableCols}
                  onChange={(e) => setTableCols(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold"
                />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-slate-600 dark:text-slate-400">تصميم وتنسيق الجدول:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTableStyle("classic")}
                  className={`p-2 rounded-lg border text-right ${tableStyle === "classic" ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 font-bold" : "border-slate-200"}`}
                >
                  كلاسيكي (حدود كاملة)
                </button>
                <button
                  type="button"
                  onClick={() => setTableStyle("striped")}
                  className={`p-2 rounded-lg border text-right ${tableStyle === "striped" ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 font-bold" : "border-slate-200"}`}
                >
                  صفوف متبادلة (Striped)
                </button>
                <button
                  type="button"
                  onClick={() => setTableStyle("academic")}
                  className={`p-2 rounded-lg border text-right ${tableStyle === "academic" ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 font-bold" : "border-slate-200"}`}
                >
                  أكاديمي APA (حدود علوية وسفلية)
                </button>
                <button
                  type="button"
                  onClick={() => setTableStyle("modern")}
                  className={`p-2 rounded-lg border text-right ${tableStyle === "modern" ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 font-bold" : "border-slate-200"}`}
                >
                  عصري ملون (Modern Blue)
                </button>
              </div>

              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tableHasHeader}
                  onChange={(e) => setTableHasHeader(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">تضمين صف رأس مضلل للعناوين</span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onInsertTable(tableRows, tableCols, tableHasHeader, tableStyle);
                  setShowTableModal(false);
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all"
              >
                إدراج الجدول بالمستند
              </button>
              <button
                onClick={() => setShowTableModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-blue-600" />
                <span>إدراج رابط تشعبي (Hyperlink)</span>
              </h3>
              <button onClick={() => setShowLinkModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">نص الرابط المعروض:</label>
                <input
                  type="text"
                  placeholder="مثال: زيارة الموقع الرسمي للمرجع..."
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">عنوان الرابط الإلكتروني (URL):</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs ltr font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (linkUrl.trim()) {
                    onInsertLink(linkUrl.trim(), linkText.trim() || linkUrl.trim());
                    setShowLinkModal(false);
                    setLinkUrl("https://");
                    setLinkText("");
                  }
                }}
                disabled={!linkUrl.trim()}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all"
              >
                إدراج الرابط
              </button>
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span>إدراج صورة توضيحية / شكل</span>
              </h3>
              <button onClick={() => setShowImageModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">رابط الصورة (URL):</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs ltr font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">نص الشرح التوضيحي (Caption / Figure):</label>
                <input
                  type="text"
                  placeholder="شكل رقم (1): الهيكل التنظيمي..."
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">عرض الصورة:</label>
                <select
                  value={imageWidth}
                  onChange={(e) => setImageWidth(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-semibold"
                >
                  <option value="50%">صغيرة (50% من عرض الصفحة)</option>
                  <option value="80%">متوسطة (80% من عرض الصفحة)</option>
                  <option value="100%">كاملة (100% عرض الصفحة)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (imageUrl.trim()) {
                    onInsertImage(imageUrl.trim(), imageCaption.trim(), imageWidth);
                    setShowImageModal(false);
                    setImageUrl("");
                    setImageCaption("");
                  }
                }}
                disabled={!imageUrl.trim()}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all"
              >
                إدراج الصورة
              </button>
              <button
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Math & Greek Symbols Modal */}
      {showMathModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-blue-600 font-serif font-black text-base">∑ π</span>
                <span>لوحة الرموز والمعادلات الرياضية والعلمية</span>
              </h3>
              <button onClick={() => setShowMathModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">انقر على أي رمز لإدراجه مباشرة في موضع المؤشر بالمستند:</p>

            <div className="grid grid-cols-10 gap-1.5 max-h-64 overflow-y-auto p-1">
              {MATH_SYMBOLS.map((sym, idx) => (
                <button
                  key={idx}
                  onClick={() => onInsertSymbol(sym)}
                  className="h-10 bg-slate-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-slate-800 dark:text-slate-100 rounded-lg text-lg font-serif font-bold transition-all flex items-center justify-center border border-slate-200 dark:border-slate-700"
                  title={`إدراج ${sym}`}
                >
                  {sym}
                </button>
              ))}
            </div>

            <div className="pt-2 text-left">
              <button
                onClick={() => setShowMathModal(false)}
                className="px-5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Citation Modal */}
      {showCitationModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Quote className="w-4 h-4 text-indigo-600" />
                <span>منشئ التوثيق الأكاديمي والمراجع (Citation Builder)</span>
              </h3>
              <button onClick={() => setShowCitationModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">أسلوب التوثيق الأكاديمي:</label>
                <select
                  value={citationStyle}
                  onChange={(e) => setCitationStyle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold text-xs text-indigo-700 dark:text-indigo-400"
                >
                  <option value="apa">APA 7th Edition (العلوم الإنسانية والاجتماعية)</option>
                  <option value="mla">MLA 9th Edition (اللغات والآداب)</option>
                  <option value="ieee">IEEE Style (الهندسة وعلوم الحاسب والتكنولوجيا)</option>
                  <option value="chicago">Chicago 17th Edition (التاريخ والعلوم السياسية)</option>
                  <option value="harvard">Harvard Referencing Style (الجامعات الدولية)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">المؤلف / الباحث:</label>
                  <input
                    type="text"
                    placeholder="مثال: د. أحمد السعيد"
                    value={citeAuthor}
                    onChange={(e) => setCiteAuthor(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">سنة النشر:</label>
                  <input
                    type="text"
                    placeholder="2024"
                    value={citeYear}
                    onChange={(e) => setCiteYear(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">عنوان الكتاب / البحث:</label>
                <input
                  type="text"
                  placeholder="مناهج البحث العلمي المعاصر..."
                  value={citeTitle}
                  onChange={(e) => setCiteTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">دار النشر / المجلة:</label>
                  <input
                    type="text"
                    placeholder="دار الفكر العربي"
                    value={citePublisher}
                    onChange={(e) => setCitePublisher(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">رابط DOI / URL (اختياري):</label>
                  <input
                    type="text"
                    placeholder="https://doi.org/..."
                    value={citeUrl}
                    onChange={(e) => setCiteUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 ltr"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (citeTitle.trim()) {
                    onInsertCitation(citationStyle, citeAuthor.trim(), citeTitle.trim(), citeYear.trim(), citePublisher.trim(), citeUrl.trim());
                    setShowCitationModal(false);
                    setCiteAuthor("");
                    setCiteTitle("");
                    setCitePublisher("");
                  }
                }}
                disabled={!citeTitle.trim()}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all"
              >
                إدراج التوثيق بالمستند
              </button>
              <button
                onClick={() => setShowCitationModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Footnote Modal */}
      {showFootnoteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-purple-600" />
                <span>إدراج هامش سفلي مرقم (Footnote)</span>
              </h3>
              <button onClick={() => setShowFootnoteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-slate-600 dark:text-slate-400 font-medium">نص الهامش أو المرجع التوضيحي:</label>
              <textarea
                value={footnoteContent}
                onChange={(e) => setFootnoteContent(e.target.value)}
                placeholder="مثال: انظر: د. المنصور، أصول البحث العلمي، ص 104."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs h-24 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (footnoteContent.trim()) {
                    onInsertFootnote(footnoteContent.trim());
                    setShowFootnoteModal(false);
                    setFootnoteContent("");
                  }
                }}
                disabled={!footnoteContent.trim()}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all"
              >
                إدراج الهامش التلقائي
              </button>
              <button
                onClick={() => setShowFootnoteModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Callout Box Modal */}
      {showCalloutModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>إدراج مربع بارز / تنبيه توضيحي (Callout Box)</span>
              </h3>
              <button onClick={() => setShowCalloutModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">نوع المربع والتنسيق:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setCalloutType("info"); setCalloutTitle("معلومة هامة"); }}
                    className={`p-2 rounded-lg border text-right ${calloutType === "info" ? "border-blue-600 bg-blue-50 text-blue-700 font-bold" : "border-slate-200"}`}
                  >
                    💡 معلومة (Blue Info)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCalloutType("warning"); setCalloutTitle("تنبيه وتحذير"); }}
                    className={`p-2 rounded-lg border text-right ${calloutType === "warning" ? "border-amber-600 bg-amber-50 text-amber-700 font-bold" : "border-slate-200"}`}
                  >
                    ⚠️ تحذير (Amber Warning)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCalloutType("success"); setCalloutTitle("خلاصة ونتيجة"); }}
                    className={`p-2 rounded-lg border text-right ${calloutType === "success" ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-bold" : "border-slate-200"}`}
                  >
                    ✅ نتيجة (Green Success)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCalloutType("quote"); setCalloutTitle("اقتباس بارز"); }}
                    className={`p-2 rounded-lg border text-right ${calloutType === "quote" ? "border-purple-600 bg-purple-50 text-purple-700 font-bold" : "border-slate-200"}`}
                  >
                    💬 اقتباس (Quote Callout)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">عنوان المربع:</label>
                <input
                  type="text"
                  value={calloutTitle}
                  onChange={(e) => setCalloutTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">محتوى النص:</label>
                <textarea
                  value={calloutText}
                  onChange={(e) => setCalloutText(e.target.value)}
                  placeholder="اكتب المحتوى البارز هنا..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (calloutText.trim()) {
                    onInsertCallout(calloutType, calloutTitle.trim(), calloutText.trim());
                    setShowCalloutModal(false);
                    setCalloutText("");
                  }
                }}
                disabled={!calloutText.trim()}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all"
              >
                إدراج المربع
              </button>
              <button
                onClick={() => setShowCalloutModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Find & Replace Modal */}
      {showFindReplaceModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <span>البحث والاستبدال المتقدم في المستند</span>
              </h3>
              <button onClick={() => setShowFindReplaceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">البحث عن:</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="الكلمة أو العبارة المراد البحث عنها..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                  />
                  <button
                    onClick={() => onSearch(searchQuery, matchCase)}
                    className="px-3 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                  >
                    بحث
                  </button>
                </div>
                {matchCount !== null && (
                  <div className="mt-1 text-[11px] text-blue-600 font-bold">
                    تم العثور على {matchCount} مطابقة في المستند.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">استبدال بـ:</label>
                <input
                  type="text"
                  placeholder="الكلمة البديلة..."
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={matchCase}
                  onChange={(e) => setMatchCase(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">مطابقة حالة الأحرف (Case Sensitive)</span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onReplaceAll(searchQuery, replaceQuery, matchCase)}
                disabled={!searchQuery.trim()}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all"
              >
                استبدال الكل في كامل المستند
              </button>
              <button
                onClick={() => setShowFindReplaceModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. In-Place AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
                <span>المعالج الذكي في مكانه (In-Place AI Assistant)</span>
              </h3>
              <span className="text-[11px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
                {modelName}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              اختر العملية المراد تطبيقها على {selectedTextForAi ? "النص المحدد" : "كامل المستند"} واستبداله فوراً في موقعه:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAiMode("humanize")}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-right transition-all flex items-center gap-2 ${
                  aiMode === "humanize"
                    ? "border-purple-600 bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="font-bold">أنسنة فائقة 100%</div>
                  <div className="text-[10px] text-slate-500">تجاوز كواشف AI</div>
                </div>
              </button>

              <button
                onClick={() => setAiMode("proofread")}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-right transition-all flex items-center gap-2 ${
                  aiMode === "proofread"
                    ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-bold">تدقيق لغوي ونحوي</div>
                  <div className="text-[10px] text-slate-500">إملاء وترقيم دقيق</div>
                </div>
              </button>

              <button
                onClick={() => setAiMode("academic")}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-right transition-all flex items-center gap-2 ${
                  aiMode === "academic"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-bold">صياغة أكاديمية</div>
                  <div className="text-[10px] text-slate-500">أسلوب علمي رصين</div>
                </div>
              </button>

              <button
                onClick={() => setAiMode("clean")}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-right transition-all flex items-center gap-2 ${
                  aiMode === "clean"
                    ? "border-amber-600 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                <Scale className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="font-bold">تطهير لغة المحاماة</div>
                  <div className="text-[10px] text-slate-500">إزالة الحشو والتحفظ</div>
                </div>
              </button>

              <button
                onClick={() => setAiMode("summarize")}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-right transition-all flex items-center gap-2 col-span-2 ${
                  aiMode === "summarize"
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <div>
                  <div className="font-bold">تلخيص تنفيذي مكثف</div>
                  <div className="text-[10px] text-slate-500">إيجاز ذكي يحفظ النقاط والمراجع الجوهرية</div>
                </div>
              </button>
            </div>

            {aiMode === "custom" && (
              <div className="space-y-1 text-xs">
                <label className="block text-slate-600 dark:text-slate-400 font-medium">أمر التعديل المخصص:</label>
                <input
                  type="text"
                  placeholder="مثال: أعد الصياغة بأسلوب صحفي جذاب مع عناوين فرعية..."
                  value={customAiPrompt}
                  onChange={(e) => setCustomAiPrompt(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                />
              </div>
            )}

            {isAiLoading && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 text-purple-900 dark:text-purple-200 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin shrink-0" />
                <span>{aiStatusMessage || "جاري المعالجة بالذكاء الاصطناعي واستبدال النص..."}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onExecuteAi(aiMode, customAiPrompt)}
                disabled={isAiLoading}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl text-xs transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>تطبيق واستبدال في مكانه بالمستند</span>
              </button>
              <button
                onClick={() => setShowAiModal(false)}
                disabled={isAiLoading}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
