import React, { useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Indent,
  Outdent,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Hash,
  Search,
  Sparkles,
  BookOpen,
  Printer,
  Undo,
  Redo,
  RemoveFormatting,
  ChevronDown,
  Layers,
  Palette,
  Maximize2,
  Minimize2,
  Calendar,
  FileSpreadsheet,
  FileText,
  Clock,
  Columns,
  Highlighter,
  Type,
  Baseline
} from "lucide-react";
import { FONT_OPTIONS, FONT_SIZES, FontOption } from "./fontOptions";

interface WordStudioToolbarProps {
  activeRibbonTab: "home" | "insert" | "layout" | "references" | "tools" | "ai";
  setActiveRibbonTab: (tab: "home" | "insert" | "layout" | "references" | "tools" | "ai") => void;

  // Formatting actions
  exec: (command: string, value?: string) => void;
  fontFamily: string;
  onChangeFontFamily: (font: string) => void;
  fontSize: string;
  onChangeFontSize: (size: string) => void;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;

  // Text Color & Highlight
  textColor: string;
  onChangeTextColor: (color: string) => void;
  highlightColor: string;
  onChangeHighlightColor: (color: string) => void;

  // Paragraph & Headings
  currentBlockFormat: string;
  onChangeBlockFormat: (format: string) => void;
  lineHeight: string;
  onChangeLineHeight: (height: string) => void;

  // Text Direction
  onToggleDirection: (dir: "rtl" | "ltr") => void;

  // Page Layout Options
  pageOrientation: "portrait" | "landscape";
  setPageOrientation: (or: "portrait" | "landscape") => void;
  pageMargins: "normal" | "narrow" | "wide" | "moderate";
  setPageMargins: (m: "normal" | "narrow" | "wide" | "moderate") => void;
  pagePaperColor: string;
  setPagePaperColor: (color: string) => void;
  pageBorder: string;
  setPageBorder: (border: string) => void;
  pageWatermark: string;
  setPageWatermark: (watermark: string) => void;
  pageColumns: "1" | "2" | "3";
  setPageColumns: (cols: "1" | "2" | "3") => void;

  // Modals Triggers
  onOpenTableModal: () => void;
  onOpenLinkModal: () => void;
  onOpenImageModal: () => void;
  onOpenMathModal: () => void;
  onOpenCitationModal: () => void;
  onOpenFootnoteModal: () => void;
  onOpenCalloutModal: () => void;
  onOpenFindReplaceModal: () => void;
  onOpenAiModal: (mode?: string) => void;

  // Quick Inserters
  onInsertDateStamp: () => void;
  onInsertPageBreak: () => void;
  onInsertHorizontalRule: () => void;
  onInsertToc: () => void;
  onInsertChecklist: () => void;

  // UI state
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  isFullscreen: boolean;
  setIsFullscreen: (full: boolean) => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  onPrint: () => void;
}

export const WordStudioToolbar: React.FC<WordStudioToolbarProps> = ({
  activeRibbonTab,
  setActiveRibbonTab,
  exec,
  fontFamily,
  onChangeFontFamily,
  fontSize,
  onChangeFontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  textColor,
  onChangeTextColor,
  highlightColor,
  onChangeHighlightColor,
  currentBlockFormat,
  onChangeBlockFormat,
  lineHeight,
  onChangeLineHeight,
  onToggleDirection,
  pageOrientation,
  setPageOrientation,
  pageMargins,
  setPageMargins,
  pagePaperColor,
  setPagePaperColor,
  pageBorder,
  setPageBorder,
  pageWatermark,
  setPageWatermark,
  pageColumns,
  setPageColumns,
  onOpenTableModal,
  onOpenLinkModal,
  onOpenImageModal,
  onOpenMathModal,
  onOpenCitationModal,
  onOpenFootnoteModal,
  onOpenCalloutModal,
  onOpenFindReplaceModal,
  onOpenAiModal,
  onInsertDateStamp,
  onInsertPageBreak,
  onInsertHorizontalRule,
  onInsertToc,
  onInsertChecklist,
  zoomLevel,
  setZoomLevel,
  isFullscreen,
  setIsFullscreen,
  showSidebar,
  setShowSidebar,
  onPrint
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showLineSpacingMenu, setShowLineSpacingMenu] = useState(false);

  const HIGHLIGHT_COLORS = [
    { name: "بدون تظليل", color: "transparent" },
    { name: "أصفر ساطع", color: "#fef08a" },
    { name: "أخضر فاتح", color: "#bbf7d0" },
    { name: "أزرق سماوي", color: "#bae6fd" },
    { name: "وردي زاهي", color: "#fbcfe8" },
    { name: "برتقالي هادئ", color: "#fed7aa" },
    { name: "رمادي خفيف", color: "#e2e8f0" }
  ];

  const TEXT_COLORS = [
    { name: "أسود افتراضي", color: "#0f172a" },
    { name: "أزرق داكن", color: "#1e40af" },
    { name: "أحمر داكن", color: "#991b1b" },
    { name: "أخضر زمردي", color: "#065f46" },
    { name: "بنفسجي ملكي", color: "#6b21a8" },
    { name: "بني محروق", color: "#78350f" },
    { name: "رمادي متوسط", color: "#475569" }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 select-none">
      {/* 1. Ribbon Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-3 bg-slate-50/70 dark:bg-slate-900">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => setActiveRibbonTab("home")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeRibbonTab === "home"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            الشريط الرئيسي (Home)
          </button>
          <button
            onClick={() => setActiveRibbonTab("insert")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeRibbonTab === "insert"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            إدراج (Insert)
          </button>
          <button
            onClick={() => setActiveRibbonTab("layout")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeRibbonTab === "layout"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            تخطيط وهوامش (Layout)
          </button>
          <button
            onClick={() => setActiveRibbonTab("references")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeRibbonTab === "references"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            مراجع وتوثيق (References)
          </button>
          <button
            onClick={() => setActiveRibbonTab("tools")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeRibbonTab === "tools"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            أدوات وعرض (Tools & Review)
          </button>
          <button
            onClick={() => setActiveRibbonTab("ai")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeRibbonTab === "ai"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs"
                : "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>معالج AI الفوري</span>
          </button>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`px-2.5 py-1 text-xs rounded-lg border font-semibold flex items-center gap-1 transition-all ${
              showSidebar
                ? "bg-blue-50 dark:bg-blue-950/50 border-blue-300 text-blue-700 dark:text-blue-300"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            }`}
            title="تبديل شريط المخطط والتعليقات الجانبي"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>الشريط الجانبي</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg"
            title={isFullscreen ? "إنهاء ملء الشاشة" : "وضع التركيز والكتابة بملء الشاشة"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Ribbon Tab Content Panels */}
      <div className="p-2 min-h-[52px] flex items-center flex-wrap gap-2 text-xs">
        {/* ================= TAB 1: HOME ================= */}
        {activeRibbonTab === "home" && (
          <div className="flex items-center flex-wrap gap-1.5 w-full">
            {/* Undo / Redo / Print */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => exec("undo")}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300"
                title="تراجع (Ctrl+Z)"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => exec("redo")}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300"
                title="إعادة (Ctrl+Y)"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onPrint}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300"
                title="طباعة / تصدير PDF (Ctrl+P)"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => exec("removeFormat")}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300"
                title="مسح كافة التنسيقات (Clear Formatting)"
              >
                <RemoveFormatting className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

            {/* Font Family Selector */}
            <div className="relative">
              <select
                value={fontFamily}
                onChange={(e) => onChangeFontFamily(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-100 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
                title="نوع الخط (Font Family)"
              >
                <optgroup label="خطوط عربية احترافية">
                  {FONT_OPTIONS.filter(f => f.category === "arabic").map((f) => (
                    <option key={f.family} value={f.family}>
                      {f.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="خطوط أكاديمية ولاتينية (Serif)">
                  {FONT_OPTIONS.filter(f => f.category === "english_serif").map((f) => (
                    <option key={f.family} value={f.family}>
                      {f.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="خطوط رقمية حديثة (Sans-Serif)">
                  {FONT_OPTIONS.filter(f => f.category === "english_sans").map((f) => (
                    <option key={f.family} value={f.family}>
                      {f.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="خطوط أحادية وعلمية (Monospace)">
                  {FONT_OPTIONS.filter(f => f.category === "monospace").map((f) => (
                    <option key={f.family} value={f.family}>
                      {f.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Font Size & Steppers */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              <select
                value={fontSize}
                onChange={(e) => onChangeFontSize(e.target.value)}
                className="bg-transparent px-1.5 py-1 font-bold text-slate-800 dark:text-slate-100 text-xs focus:outline-none"
                title="حجم الخط"
              >
                {FONT_SIZES.map((sz) => (
                  <option key={sz.label} value={sz.px}>
                    {sz.label}
                  </option>
                ))}
              </select>
              <button
                onClick={onIncreaseFontSize}
                className="px-1.5 py-0.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-800 dark:text-slate-200 font-bold"
                title="تكبير الخط"
              >
                A+
              </button>
              <button
                onClick={onDecreaseFontSize}
                className="px-1.5 py-0.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-800 dark:text-slate-200 font-bold text-[10px]"
                title="تصغير الخط"
              >
                A-
              </button>
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

            {/* Typography Modifiers */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => exec("bold")}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-800 dark:text-slate-200 font-bold"
                title="غامق (Ctrl+B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => exec("italic")}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-800 dark:text-slate-200 italic"
                title="مائل (Ctrl+I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => exec("underline")}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-800 dark:text-slate-200"
                title="تسطير (Ctrl+U)"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => exec("strikeThrough")}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-800 dark:text-slate-200"
                title="يتوسطه خط (Strikethrough)"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => exec("subscript")}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-800 dark:text-slate-200 text-[10px]"
                title="منخفض (Subscript H₂O)"
              >
                <Subscript className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => exec("superscript")}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-800 dark:text-slate-200 text-[10px]"
                title="مرتفع (Superscript X²)"
              >
                <Superscript className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Colors */}
            <div className="flex items-center gap-1">
              {/* Text Color */}
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="flex items-center gap-1 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
                  title="لون الخط"
                >
                  <Baseline className="w-3.5 h-3.5" style={{ color: textColor }} />
                  <div className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: textColor }} />
                </button>
                {showColorPicker && (
                  <div className="absolute top-full mt-1 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 shadow-xl z-50 w-44 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-500 pb-1 border-b">ألوان النص الشائعة</div>
                    <div className="grid grid-cols-4 gap-1">
                      {TEXT_COLORS.map((c) => (
                        <button
                          key={c.color}
                          onClick={() => {
                            onChangeTextColor(c.color);
                            setShowColorPicker(false);
                          }}
                          className="w-7 h-7 rounded-lg border border-slate-300 flex items-center justify-center hover:scale-110 transition-transform"
                          style={{ backgroundColor: c.color }}
                          title={c.name}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => onChangeTextColor(e.target.value)}
                      className="w-full h-7 rounded cursor-pointer mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Highlight Color */}
              <div className="relative">
                <button
                  onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                  className="flex items-center gap-1 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
                  title="لون التمييز والتظليل (Highlighter)"
                >
                  <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: highlightColor === "transparent" ? "#fff" : highlightColor }} />
                </button>
                {showHighlightPicker && (
                  <div className="absolute top-full mt-1 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 shadow-xl z-50 w-40 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-500 pb-1 border-b">ألوان التظليل</div>
                    <div className="grid grid-cols-4 gap-1">
                      {HIGHLIGHT_COLORS.map((c) => (
                        <button
                          key={c.color}
                          onClick={() => {
                            onChangeHighlightColor(c.color);
                            setShowHighlightPicker(false);
                          }}
                          className="w-7 h-7 rounded-lg border border-slate-300 flex items-center justify-center hover:scale-110 transition-transform text-[9px] font-bold"
                          style={{ backgroundColor: c.color === "transparent" ? "#ffffff" : c.color }}
                          title={c.name}
                        >
                          {c.color === "transparent" ? "∅" : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

            {/* Block Format / Headings */}
            <select
              value={currentBlockFormat}
              onChange={(e) => onChangeBlockFormat(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 font-bold text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
              title="نمط الفقرة أو العنوان"
            >
              <option value="p">نص عادي (Normal Text)</option>
              <option value="h1">عنوان رئيسي 1 (Heading 1)</option>
              <option value="h2">عنوان فرعي 2 (Heading 2)</option>
              <option value="h3">عنوان قسم 3 (Heading 3)</option>
              <option value="blockquote">اقتباس منسق (Blockquote)</option>
              <option value="pre">كتلة كود برمجية (Code Block)</option>
            </select>

            {/* Alignment */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => exec("justifyRight")}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-800 dark:text-slate-200"
                title="محاذاة لليمين"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => exec("justifyCenter")}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-800 dark:text-slate-200"
                title="توسيط"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => exec("justifyLeft")}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-800 dark:text-slate-200"
                title="محاذاة لليسار"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => exec("justifyFull")}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-800 dark:text-slate-200"
                title="ضبط وضبط متكامل (Justify)"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Lists & Indent */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => exec("insertUnorderedList")}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-800 dark:text-slate-200"
                title="قائمة نقطية"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => exec("insertOrderedList")}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-800 dark:text-slate-200"
                title="قائمة رقمية"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onInsertChecklist}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-800 dark:text-slate-200"
                title="قائمة مهام تفاعلية (Checklist)"
              >
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              </button>
              <button
                onClick={() => exec("indent")}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-800 dark:text-slate-200"
                title="زيادة المسافة البادئة"
              >
                <Indent className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => exec("outdent")}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-800 dark:text-slate-200"
                title="إنقاص المسافة البادئة"
              >
                <Outdent className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Line Spacing */}
            <div className="relative">
              <button
                onClick={() => setShowLineSpacingMenu(!showLineSpacingMenu)}
                className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                title="تباعد الأسطر (Line Spacing)"
              >
                <span>تباعد: {lineHeight}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showLineSpacingMenu && (
                <div className="absolute top-full mt-1 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-xl z-50 w-36 space-y-0.5">
                  {["1.0", "1.15", "1.5", "1.8", "2.0 (مزدوج)", "2.5"].map((h) => (
                    <button
                      key={h}
                      onClick={() => {
                        onChangeLineHeight(h.split(" ")[0]);
                        setShowLineSpacingMenu(false);
                      }}
                      className="w-full text-right px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950 font-medium"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RTL / LTR Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => onToggleDirection("rtl")}
                className="px-2 py-1 text-[11px] font-bold rounded hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                title="اتجاه النص من اليمين لليسار (RTL)"
              >
                RTL ع
              </button>
              <button
                onClick={() => onToggleDirection("ltr")}
                className="px-2 py-1 text-[11px] font-bold rounded hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                title="اتجاه النص من اليسار لليمين (LTR)"
              >
                LTR En
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 2: INSERT ================= */}
        {activeRibbonTab === "insert" && (
          <div className="flex items-center flex-wrap gap-2 w-full">
            <button
              onClick={onOpenTableModal}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white flex items-center gap-1.5 transition-all"
            >
              <TableIcon className="w-4 h-4 text-blue-600" />
              <span>جدول منسق (Table)</span>
            </button>

            <button
              onClick={onOpenLinkModal}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white flex items-center gap-1.5 transition-all"
            >
              <LinkIcon className="w-4 h-4 text-indigo-600" />
              <span>رابط تشعبي (Link)</span>
            </button>

            <button
              onClick={onOpenImageModal}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white flex items-center gap-1.5 transition-all"
            >
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>صورة / شكل (Image)</span>
            </button>

            <button
              onClick={onOpenMathModal}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white flex items-center gap-1.5 transition-all"
            >
              <span className="font-serif font-black text-amber-600">∑ π</span>
              <span>رموز ومعادلات (Math)</span>
            </button>

            <button
              onClick={onOpenCalloutModal}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white flex items-center gap-1.5 transition-all"
            >
              <Layers className="w-4 h-4 text-purple-600" />
              <span>مربع تنبيه / اقتباس (Callout)</span>
            </button>

            <button
              onClick={onInsertHorizontalRule}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white flex items-center gap-1.5"
            >
              <span>— خط فاصل</span>
            </button>

            <button
              onClick={onInsertPageBreak}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-500" />
              <span>فاصل صفحات (Page Break)</span>
            </button>

            <button
              onClick={onInsertDateStamp}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>ختم التاريخ والوقت</span>
            </button>
          </div>
        )}

        {/* ================= TAB 3: LAYOUT ================= */}
        {activeRibbonTab === "layout" && (
          <div className="flex items-center flex-wrap gap-3 w-full">
            {/* Orientation */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold">الاتجاه:</span>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => setPageOrientation("portrait")}
                  className={`px-2.5 py-1 rounded text-xs font-bold ${pageOrientation === "portrait" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-xs" : "text-slate-600"}`}
                >
                  عمودي (Portrait)
                </button>
                <button
                  onClick={() => setPageOrientation("landscape")}
                  className={`px-2.5 py-1 rounded text-xs font-bold ${pageOrientation === "landscape" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-xs" : "text-slate-600"}`}
                >
                  أفقي (Landscape)
                </button>
              </div>
            </div>

            {/* Margins */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold">الهوامش:</span>
              <select
                value={pageMargins}
                onChange={(e) => setPageMargins(e.target.value as any)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 font-bold text-xs"
              >
                <option value="normal">عادية (2.54 سم - 1 بوصة)</option>
                <option value="narrow">ضيقة (1.27 سم - 0.5 بوصة)</option>
                <option value="moderate">متوسطة</option>
                <option value="wide">عريضة (ملاحظات وهوامش)</option>
              </select>
            </div>

            {/* Paper Texture & Color */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold">لون الورق:</span>
              <select
                value={pagePaperColor}
                onChange={(e) => setPagePaperColor(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 font-bold text-xs"
              >
                <option value="#ffffff">أبيض ناصع (Pure White)</option>
                <option value="#fcfbf7">عاجي دافئ (Warm Ivory)</option>
                <option value="#fef9c3">أصفر عتيق (Cream Paper)</option>
                <option value="#fef2f2">وردي هادئ (Soft Rose)</option>
                <option value="#f0fdf4">أخضر النعناع (Mint Light)</option>
                <option value="#f8fafc">رمادي مكتبي (Soft Gray)</option>
                <option value="#1e293b">داكن ليلي (Dark Slate)</option>
              </select>
            </div>

            {/* Border */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold">إطار الصفحة:</span>
              <select
                value={pageBorder}
                onChange={(e) => setPageBorder(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 font-bold text-xs"
              >
                <option value="none">بدون إطار</option>
                <option value="single">إطار بسيط 1px</option>
                <option value="double">إطار مزدوج أكاديمي</option>
                <option value="ornamental">إطار مزخرف كلاسيكي</option>
                <option value="gold">إطار ذهبي فاخر</option>
              </select>
            </div>

            {/* Watermark */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold">العلامة المائية:</span>
              <select
                value={pageWatermark}
                onChange={(e) => setPageWatermark(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 font-bold text-xs text-rose-600 font-bold"
              >
                <option value="">بدون علامة مائية</option>
                <option value="مسودة - DRAFT">مسودة (DRAFT)</option>
                <option value="سري للغاية - CONFIDENTIAL">سري للغاية (CONFIDENTIAL)</option>
                <option value="نسخة للمراجعة فقط">نسخة للمراجعة فقط</option>
                <option value="أصيل - REFUSED AI">معالج ومطهر من AI</option>
              </select>
            </div>

            {/* Columns */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold">الأعمدة:</span>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => setPageColumns("1")}
                  className={`px-2 py-1 rounded text-xs font-bold ${pageColumns === "1" ? "bg-white dark:bg-slate-700 text-blue-600" : "text-slate-600"}`}
                >
                  عمود 1
                </button>
                <button
                  onClick={() => setPageColumns("2")}
                  className={`px-2 py-1 rounded text-xs font-bold ${pageColumns === "2" ? "bg-white dark:bg-slate-700 text-blue-600" : "text-slate-600"}`}
                >
                  عمودين (صحفي)
                </button>
                <button
                  onClick={() => setPageColumns("3")}
                  className={`px-2 py-1 rounded text-xs font-bold ${pageColumns === "3" ? "bg-white dark:bg-slate-700 text-blue-600" : "text-slate-600"}`}
                >
                  3 أعمدة
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: REFERENCES & ACADEMIC ================= */}
        {activeRibbonTab === "references" && (
          <div className="flex items-center flex-wrap gap-2 w-full">
            <button
              onClick={onOpenFootnoteModal}
              className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 rounded-xl font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5"
            >
              <Hash className="w-4 h-4 text-purple-600" />
              <span>إدراج هامش سفلي مرقم [Footnote]</span>
            </button>

            <button
              onClick={onOpenCitationModal}
              className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 rounded-xl font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5"
            >
              <Quote className="w-4 h-4 text-indigo-600" />
              <span>منشئ التوثيق والمراجع (APA / MLA / IEEE)</span>
            </button>

            <button
              onClick={onInsertToc}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>إدراج فهرس المحتويات (TOC) في البداية</span>
            </button>
          </div>
        )}

        {/* ================= TAB 5: TOOLS & REVIEW ================= */}
        {activeRibbonTab === "tools" && (
          <div className="flex items-center flex-wrap gap-2 w-full">
            <button
              onClick={onOpenFindReplaceModal}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white flex items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-blue-600" />
              <span>البحث والاستبدال المتقدم (Find & Replace)</span>
            </button>

            {/* Zoom Slider */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
              <span className="text-slate-500 font-bold">التقريب:</span>
              <input
                type="range"
                min="50"
                max="200"
                step="5"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="w-24 accent-blue-600 cursor-pointer"
              />
              <span className="font-bold text-blue-600 w-10">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(100)}
                className="text-[10px] bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-700 font-semibold"
              >
                100%
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 6: AI ASSISTANT ================= */}
        {activeRibbonTab === "ai" && (
          <div className="flex items-center flex-wrap gap-2 w-full">
            <button
              onClick={() => onOpenAiModal("humanize")}
              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ أنسنة فائقة 100% للنص في مكانه</span>
            </button>

            <button
              onClick={() => onOpenAiModal("proofread")}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>📝 تدقيق لغوي ونحوي وإملائي محكم</span>
            </button>

            <button
              onClick={() => onOpenAiModal("academic")}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>🎓 تحويل لأسلوب أكاديمي رصين</span>
            </button>

            <button
              onClick={() => onOpenAiModal("clean")}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            >
              <span>🛡️ تطهير لغة المحاماة والتحفظ</span>
            </button>

            <button
              onClick={() => onOpenAiModal("summarize")}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            >
              <span>📑 تلخيص تنفيذي للمستند</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
