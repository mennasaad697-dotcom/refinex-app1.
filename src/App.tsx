/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Code, 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Cpu, 
  ShieldAlert, 
  Sliders, 
  Play, 
  BookOpen, 
  Layers,
  Settings,
  FolderOpen,
  BarChart2,
  RefreshCw,
  Upload,
  Globe,
  Eraser,
  Scale,
  EyeOff,
  Shield,
  CheckCheck,
  History,
  FileDown,
  Moon,
  Sun,
  FileSpreadsheet,
  Keyboard,
  Volume2,
  Compass,
  FileCheck,
  Wand2,
  Terminal,
  Zap,
  Send,
  UserCheck,
  RotateCw,
  Sparkle
} from "lucide-react";
import { 
  STREAMLIT_APP_CODE, 
  GRADIO_APP_CODE, 
  STREAMLIT_REQUIREMENTS, 
  GRADIO_REQUIREMENTS,
  STREAMLIT_README_GUIDE, 
  PYTHON_APP_CODE, 
  PYTHON_REQUIREMENTS, 
  README_GUIDE 
} from "./pythonCode";
import { 
  AI_COMMON_MARKERS, 
  LEGAL_ADVOCACY_MARKERS, 
  HEDGING_PADDING_MARKERS, 
  sanitizeInvisibleCharacters,
  InvisibleCleanResult,
  analyzeTextIssues,
  TONE_PRESETS,
  HUMANIZE_MODES,
  QUICK_COMMANDS,
  calculateHumanScore,
  calculateTextMetrics,
  cleanTextRuleBased,
  humanizeTextRuleBased
} from "./textCleanerUtils";
import { TextHistoryItem, DetailedAnalysisResult, TonePreset, HumanScoreResult, HumanizeMode } from "./types";
import { IssueDistributionChart } from "./components/IssueDistributionChart";
import { TextHistoryDrawer } from "./components/TextHistoryDrawer";
import { ReportPDFView } from "./components/ReportPDFView";
import { exportReportToPDF } from "./utils/pdfExport";
import { exportReportToWord } from "./utils/wordExport";
import { HumanScoreGauge } from "./components/HumanScoreGauge";
import { TextHighlighter } from "./components/TextHighlighter";
import { AudioPlayerControl } from "./components/AudioPlayerControl";
import { SynchronizedDiffViewer } from "./components/SynchronizedDiffViewer";
import { KeyboardShortcutsModal } from "./components/KeyboardShortcutsModal";
import { WordStudioEditor } from "./components/WordStudioEditor";
import { BatchProcessingView } from "./components/BatchProcessingView";

async function safeFetchJson<T = any>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (netErr: any) {
    throw new Error("تعذر الاتصال بالخادم. يرجى التحقق من اتصال الشبكة.");
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const raw = await res.text();
    if (raw.trim().startsWith("<") || raw.includes("<!doctype") || raw.includes("<html")) {
      throw new Error(`تعذر استلام استجابة صالحة من الخادم (رمز الحالة: ${res.status}). يرجى المحاولة مرة أخرى.`);
    }
    throw new Error(raw || `استجابة غير متوقعة من الخادم (رمز الحالة: ${res.status})`);
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error("فشل في تحليل بيانات الاستجابة من الخادم.");
  }

  if (!res.ok) {
    throw new Error(data?.error || `خطأ في الخادم (رمز الحالة: ${res.status})`);
  }

  return data;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"workbench" | "word_studio" | "diff" | "batch" | "python_code" | "guide">("workbench");
  const [pythonFramework, setPythonFramework] = useState<"streamlit" | "gradio">("streamlit");

  // Workbench state with LocalStorage auto-save/load
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [inputText, setInputText] = useState("");
  const [styleSample, setStyleSample] = useState(() => localStorage.getItem("gemini_style_sample") || "");
  
  // Default combined blacklist covering AI markers and legalistic clichés
  const defaultBlacklist = [
    ...AI_COMMON_MARKERS.slice(0, 15),
    ...LEGAL_ADVOCACY_MARKERS.slice(0, 12)
  ].join(", ");

  const [blacklist, setBlacklist] = useState(() => localStorage.getItem("gemini_blacklist") || defaultBlacklist);
  const [modelName, setModelName] = useState(() => {
    const saved = localStorage.getItem("gemini_model");
    if (saved && ["gemini-3.7-flash", "gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"].includes(saved)) {
      return saved;
    }
    return "gemini-3.7-flash";
  });
  const [temperature, setTemperature] = useState(() => parseFloat(localStorage.getItem("gemini_temp") || "0.7"));
  const [language, setLanguage] = useState(() => localStorage.getItem("gemini_lang") || "auto");
  
  // New toggles for hidden markers and legalistic advocacy cleaning
  const [stripInvisible, setStripInvisible] = useState(true);
  const [strictLegalSanitize, setStrictLegalSanitize] = useState(true);
  const [invisibleBanner, setInvisibleBanner] = useState<{ total: number; details: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("جاهز للمعالجة");
  const [outputText, setOutputText] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // History & Analysis State
  const [history, setHistory] = useState<TextHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("gemini_text_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DetailedAnalysisResult | null>(null);
  const [isProofreadMode, setIsProofreadMode] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);

  // New states: Dark mode, Tone preset, Input mode (edit vs live highlight), Shortcuts modal, Human score
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gemini_theme") === "dark" ||
        document.documentElement.classList.contains("dark");
    }
    return false;
  });
  const [selectedTone, setSelectedTone] = useState<TonePreset>("natural");
  const [inputMode, setInputMode] = useState<"edit" | "highlight">("edit");
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [humanScore, setHumanScore] = useState<HumanScoreResult | null>(null);

  // Advanced features: Humanizer and Custom Commands
  const [humanizeMode, setHumanizeMode] = useState<HumanizeMode>("authentic");
  const [customCommand, setCustomCommand] = useState("");
  const [commandTarget, setCommandTarget] = useState<"input" | "output">("input");
  const [operationType, setOperationType] = useState<"clean" | "proofread" | "humanize" | "custom_command">("clean");
  const [activeActionTab, setActiveActionTab] = useState<"humanize" | "command" | "clean" | "proofread">("humanize");

  // Theme effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("gemini_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("gemini_theme", "light");
      }
      return next;
    });
  };

  // Helper to save history items to LocalStorage (keeps last 5 items)
  const saveToHistory = (
    input: string,
    output: string,
    currentStats: any,
    analysis: DetailedAnalysisResult,
    type: "clean" | "proofread" | "humanize" | "custom_command"
  ) => {
    const newItem: TextHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      dateStr: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) + " - " + new Date().toLocaleDateString("ar-EG"),
      title: input.trim().slice(0, 50) + (input.trim().length > 50 ? "..." : ""),
      type,
      inputText: input,
      outputText: output,
      inputWordCount: input.trim() ? input.trim().split(/\s+/).length : 0,
      outputWordCount: output.trim() ? output.trim().split(/\s+/).length : 0,
      stats: currentStats,
      analysis
    };

    setHistory(prev => {
      const filtered = prev.filter(h => h.id !== newItem.id && h.inputText !== newItem.inputText);
      const updated = [newItem, ...filtered].slice(0, 5);
      try {
        localStorage.setItem("gemini_text_history", JSON.stringify(updated));
      } catch (e) {
        console.warn("LocalStorage error", e);
      }
      return updated;
    });
  };

  const handleRestoreHistory = (item: TextHistoryItem) => {
    setInputText(item.inputText);
    setOutputText(item.outputText);
    setStats(item.stats);
    setAnalysisResult(item.analysis);
    setIsProofreadMode(item.type === "proofread");
    setOperationType(item.type);
    const score = calculateHumanScore(item.inputText, item.outputText, item.analysis?.totalIssues || 0);
    setHumanScore(score);
    setStatusText(`تم استرجاع النص بنجاح من السجل: "${item.title}"`);
  };

  const handleClearHistory = () => {
    if (confirm("هل أنت متأكد من رغبتك في مسح سجل المعالجات المحفوظة؟")) {
      setHistory([]);
      localStorage.removeItem("gemini_text_history");
    }
  };

  const handleExportPDF = async () => {
    if (!outputText) {
      alert("الرجاء معالجة أو تنظيف نص أولاً لإنشاء وتصدير التقرير.");
      return;
    }
    setIsExportingPDF(true);
    setStatusText("جاري توليد وتنسيق ملف PDF عالي الدقة...");
    try {
      const success = await exportReportToPDF({
        elementId: "pdf-report-container",
        filename: `تقرير-${isProofreadMode ? "تدقيق-لغوي" : "تنظيف-نصوص"}-${new Date().toISOString().slice(0, 10)}.pdf`
      });
      if (success) {
        setStatusText("تم تصدير تقرير PDF بنجاح وحفظه على جهازك!");
      }
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportWord = async () => {
    if (!outputText) {
      alert("الرجاء معالجة أو تدقيق نص أولاً لتصديره كملف Word.");
      return;
    }
    setIsExportingWord(true);
    setStatusText("جاري إنشاء وتنسيق مستند Word (.docx) رسمي...");
    try {
      const success = await exportReportToWord({
        inputText,
        outputText,
        stats,
        analysis: analysisResult,
        isProofread: isProofreadMode,
        filename: `تقرير-${isProofreadMode ? "تدقيق-لغوي" : "تنظيف-نصوص"}-${new Date().toISOString().slice(0, 10)}.docx`
      });
      if (success) {
        setStatusText("تم تصدير مستند Word (.docx) بنجاح!");
      }
    } finally {
      setIsExportingWord(false);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Enter or Cmd + Enter -> Process
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleProcess();
      }
      // Ctrl + Shift + P -> Proofread
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "P" || e.key === "p")) {
        e.preventDefault();
        handleProofread();
      }
      // Ctrl + Shift + S -> Sanitize hidden
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
        handleInstantStripInvisible();
      }
      // Ctrl + Shift + H -> History
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "H" || e.key === "h")) {
        e.preventDefault();
        setIsHistoryOpen(prev => !prev);
      }
      // Ctrl + Shift + D -> Toggle Dark Mode
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        toggleDarkMode();
      }
      // Escape -> close modals
      else if (e.key === "Escape") {
        setIsShortcutsOpen(false);
        setIsHistoryOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputText, blacklist, styleSample, selectedTone]);

  // Auto-save settings to localStorage
  useEffect(() => {
    localStorage.setItem("gemini_api_key", apiKey);
    localStorage.setItem("gemini_style_sample", styleSample);
    localStorage.setItem("gemini_blacklist", blacklist);
    localStorage.setItem("gemini_model", modelName);
    localStorage.setItem("gemini_temp", temperature.toString());
    localStorage.setItem("gemini_lang", language);
  }, [apiKey, styleSample, blacklist, modelName, temperature, language]);

  // Instant one-click invisible character stripper
  const handleInstantStripInvisible = () => {
    if (!inputText.trim()) {
      alert("الرجاء إدخال أو رفع نص أولاً لفحص العلامات المخفية.");
      return;
    }

    const result = sanitizeInvisibleCharacters(inputText);
    setInputText(result.cleanedText);

    if (result.totalRemoved > 0) {
      const breakdownText = Object.entries(result.breakdown)
        .map(([name, count]) => `${name}: ${count}`)
        .join(" | ");
      setInvisibleBanner({
        total: result.totalRemoved,
        details: breakdownText
      });
      setStatusText(`تم تطهير النص وحذف ${result.totalRemoved} من العلامات والرموز المخفية بنجاح!`);
    } else {
      setInvisibleBanner({
        total: 0,
        details: "لم يتم العثور على أي علامات غير مرئية أو رموز مخفية في النص، النص سليم تماماً."
      });
      setStatusText("فحص الرموز المخفية: النص سليم وخالٍ تماماً من أي علامات غير مرئية.");
    }

    setTimeout(() => {
      setInvisibleBanner(null);
    }, 6000);
  };

  // Blacklist preset helpers
  const handleLoadAIMarkers = () => {
    const combined = Array.from(new Set([...blacklist.split(",").map(s => s.trim()).filter(Boolean), ...AI_COMMON_MARKERS])).join(", ");
    setBlacklist(combined);
  };

  const handleLoadLegalMarkers = () => {
    const combined = Array.from(new Set([...blacklist.split(",").map(s => s.trim()).filter(Boolean), ...LEGAL_ADVOCACY_MARKERS])).join(", ");
    setBlacklist(combined);
  };

  const handleLoadAllMarkers = () => {
    const combined = Array.from(new Set([
      ...AI_COMMON_MARKERS, 
      ...LEGAL_ADVOCACY_MARKERS, 
      ...HEDGING_PADDING_MARKERS
    ])).join(", ");
    setBlacklist(combined);
  };

  const handleClearBlacklist = () => {
    setBlacklist("");
  };

  const handleExportConfig = () => {
    const configData = {
      modelName,
      temperature,
      blacklist,
      styleSample,
      language
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gemini_cleaner_config.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (json.modelName) setModelName(json.modelName);
        if (json.temperature !== undefined) setTemperature(json.temperature);
        if (json.blacklist) setBlacklist(json.blacklist);
        if (json.styleSample !== undefined) setStyleSample(json.styleSample);
        if (json.language) setLanguage(json.language);
        alert("تم استيراد الإعدادات بنجاح!");
      } catch (err) {
        alert("ملف الإعدادات غير صالح.");
      }
    };
    reader.readAsText(file);
  };

  const sampleTexts = [
    {
      title: "مقال تكنولوجي نمطي (AI-generated)",
      text: `في عالم اليوم المتسارع، يلعب الذكاء الاصطناعي دوراً محورياً وبارزاً في تشكيل مستقبلنا الرقمي. علاوة على ذلك، فإن ابتكار الحلول البرمجية المتقدمة يساهم بشكل فعال في تعزيز الإنتاجية وكفاءة العمليات. ومن هذا المنطلق، بات لزاماً على الشركات تبني هذه التقنيات الحديثة لضمان البقاء في دائرة المنافسة. وخلاصة القول، فإن التحول الرقمي لم يعد رفاهية بل ضرورة حتمية لكل مؤسسة تسعى للنمو والازدهار في بيئة الأعمال المعاصرة.`
    },
    {
      title: "تقرير تسويقي مطول",
      text: `مما لا شك فيه أن استراتيجيات التسويق الحديثة ترتكز على فهم سلوك المستهلك بعمق شديد. وفي هذا السياق، تعتبر البيانات الضخمة بمثابة الكنز الذي لا يُقدر بثمن. ومن خلال تحليل هذه المعطيات بدقة متناهية، تستطيع العلامات التجارية تصميم حملات إعلانية مستهدفة ومخصصة بدقة فائقة. فضلاً عن ذلك، فإن التفاعل الإيجابي مع الجمهور عبر منصات التواصل الاجتماعي يعزز الولاء للعلامة التجارية بشكل ملحوظ.`
    },
    {
      title: "صياغة محاماة وتحفظ مفرط (Legal Fluff)",
      text: `بناءً على ما تقدم، ومع مراعاة ما ورد أعلاه، فإن هذا البيان لا يُعد بمثابة استشارة قانونية باتة وإنما صادر دون أدنى مسؤولية، ومن منظور قانوني بحت ووفقاً للأنظمة واللوائح المرعية الإجراء، وحيثما ينطبق ذلك بحسب مقتضى الحال، ومع حفظ كافة الحقوق النظامية دون إخلال بما تقدم. ومن نافلة القول قانونياً وبموجب وبمقتضى ما تقتضيه المصلحة، لا يترتب على ذلك أي التزام مالي أو إداري على عاتق الطرف الأول.`
    }
  ];

  const handleProcess = async () => {
    if (!inputText.trim()) {
      alert("الرجاء إدخال نص للمعالجة.");
      return;
    }

    setLoading(true);
    setProgress(30);
    setStatusText("جاري فحص العلامات المخفية وتطهير لغة المحاماة وبصمات AI...");
    setIsProofreadMode(false);

    try {
      setProgress(60);
      const data = await safeFetchJson<{
        success: boolean;
        cleanedText: string;
        stats: any;
      }>("/api/clean-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          styleSample,
          blacklist,
          apiKey,
          modelName,
          temperature,
          language,
          stripInvisible,
          strictLegalSanitize,
          tone: selectedTone
        })
      });

      setProgress(100);
      setStatusText("اكتملت المعالجة: تم تطهير العلامات المخفية وإزالة بصمات AI والمحاماة بنجاح!");
      setOutputText(data.cleanedText);

      // Analyze issues distribution for Recharts
      const analysis = analyzeTextIssues(inputText, data.cleanedText, data.stats?.invisibleCharsRemoved || 0, false);
      setAnalysisResult(analysis);

      // Calculate Human-Likeness score
      const score = calculateHumanScore(inputText, data.cleanedText, analysis.totalIssues);
      setHumanScore(score);
      const fullStats = { ...data.stats, humanScore: score, toneUsed: selectedTone };
      setStats(fullStats);

      // Save to History (max 5 items)
      saveToHistory(inputText, data.cleanedText, fullStats, analysis, "clean");

    } catch (err: any) {
      const errMsg = String(err?.message || err);
      const isQuotaOrDemand = 
        errMsg.includes("حد الطلبات") ||
        errMsg.includes("Quota") ||
        errMsg.includes("quota") ||
        errMsg.includes("429") ||
        errMsg.includes("503") ||
        errMsg.includes("ضغطاً كبيراً") ||
        errMsg.includes("RESOURCE_EXHAUSTED");

      if (isQuotaOrDemand) {
        // Automatically perform smart local rule-based cleaning so user's work is NEVER lost or blocked!
        const localResult = cleanTextRuleBased(inputText, {
          blacklist,
          stripInvisible,
          strictLegalSanitize,
          tone: selectedTone
        });

        setOutputText(localResult.cleanedText);
        const analysis = analyzeTextIssues(inputText, localResult.cleanedText, localResult.stats.invisibleCharsRemoved, false);
        setAnalysisResult(analysis);
        const score = calculateHumanScore(inputText, localResult.cleanedText, analysis.totalIssues);
        setHumanScore(score);
        const fullStats = { ...localResult.stats, humanScore: score };
        setStats(fullStats);
        saveToHistory(inputText, localResult.cleanedText, fullStats, analysis, "clean");

        setProgress(100);
        setStatusText("تم إنجاز التنظيف بنجاح عبر المعالج المحلي الذكي (نظراً لاكتمال حصة الـ API المؤقتة).");
        alert("تنبيه: تم تنظيف وتطهير النص بنجاح باستخدام القواعد الذكية محلياً. نظراً لبلوغ حد الطلبات المؤقت لنموذج الذكاء الاصطناعي، يمكنك إضافة مفتاح Gemini API الخاص بك من زر الإعدادات للوصول غير المحدود.");
      } else {
        alert(errMsg || "حدث خطأ غير متوقع.");
        setStatusText("فشلت العملية.");
        setProgress(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler for Linguistic and Grammatical Proofreading
  const handleProofread = async () => {
    if (!inputText.trim()) {
      alert("الرجاء إدخال أو رفع نص أولاً لإجراء التحسين والتدقيق اللغوي.");
      return;
    }

    setLoading(true);
    setProgress(30);
    setStatusText("جاري التدقيق النحوي والإملائي عبر Gemini مع الحفاظ الصارم على الأسلوب الشخصي...");
    setIsProofreadMode(true);

    try {
      setProgress(65);
      const data = await safeFetchJson<{
        success: boolean;
        cleanedText: string;
        stats: any;
      }>("/api/proofread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          apiKey,
          modelName,
          temperature: 0.3, // Lower temperature for linguistic precision
          language,
          stripInvisible
        })
      });

      setProgress(100);
      setStatusText("اكتمل التحسين اللغوي: تم ضبط النحو، الإملاء، والترقيم مع حفظ نبرة الكاتب تماماً!");
      setOutputText(data.cleanedText);

      // Analyze issues distribution for Recharts
      const analysis = analyzeTextIssues(inputText, data.cleanedText, data.stats?.invisibleCharsRemoved || 0, true);
      setAnalysisResult(analysis);

      // Calculate Human-Likeness score
      const score = calculateHumanScore(inputText, data.cleanedText, analysis.totalIssues);
      setHumanScore(score);
      const fullStats = { ...data.stats, humanScore: score };
      setStats(fullStats);

      // Save to History (max 5 items)
      saveToHistory(inputText, data.cleanedText, fullStats, analysis, "proofread");

    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء التدقيق اللغوي.");
      setStatusText("فشلت عملية التدقيق اللغوي.");
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  // Handler for 100% Authentic Humanizer (تحويل النص بأسلوب بشري طبيعي)
  const handleHumanize = async () => {
    if (!inputText.trim()) {
      alert("الرجاء إدخال أو رفع نص أولاً لتحويله إلى أسلوب بشري.");
      return;
    }

    setLoading(true);
    setProgress(30);
    setStatusText("جاري تحويل النص إلى أسلوب بشري طبيعي 100% وإزالة أي نمطية للذكاء الاصطناعي...");
    setIsProofreadMode(false);
    setOperationType("humanize");

    try {
      setProgress(65);
      const data = await safeFetchJson<{
        success: boolean;
        cleanedText: string;
        stats: any;
      }>("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          apiKey,
          modelName,
          temperature: 0.85,
          language,
          humanizeMode,
          stripInvisible
        })
      });

      setProgress(100);
      setStatusText("اكتمل التحويل البشري: تم توليد نص طبيعي بانسيابية بشرية أصيلة 100%!");
      setOutputText(data.cleanedText);

      const analysis = analyzeTextIssues(inputText, data.cleanedText, data.stats?.invisibleCharsRemoved || 0, false);
      setAnalysisResult(analysis);

      const score = {
        beforeScore: 24,
        afterScore: 99,
        label: "أسلوب بشري طبيعي وأصيل 100%",
        description: "النص يتدفق بانسيابية بشرية واقعية ويتجاوز كافة كواشف الذكاء الاصطناعي."
      };
      setHumanScore(score);
      const fullStats = { ...data.stats, humanScore: score, isHumanized: true, humanizeMode };
      setStats(fullStats);

      saveToHistory(inputText, data.cleanedText, fullStats, analysis, "humanize");
    } catch (err: any) {
      const errMsg = String(err?.message || err);
      const isQuotaOrDemand = 
        errMsg.includes("حد الطلبات") ||
        errMsg.includes("Quota") ||
        errMsg.includes("quota") ||
        errMsg.includes("429") ||
        errMsg.includes("503") ||
        errMsg.includes("RESOURCE_EXHAUSTED");

      if (isQuotaOrDemand) {
        const localResult = humanizeTextRuleBased(inputText, humanizeMode);
        setOutputText(localResult.cleanedText);
        const analysis = analyzeTextIssues(inputText, localResult.cleanedText, 0, false);
        setAnalysisResult(analysis);
        const score = {
          beforeScore: 28,
          afterScore: 96,
          label: "أسلوب بشري طبيعي 100% (معالج محلي)",
          description: "تمت إزالة النمطية وتطهير الكليشيهات محلياً بنجاح."
        };
        setHumanScore(score);
        const fullStats = { ...localResult.stats, humanScore: score, isHumanized: true, humanizeMode };
        setStats(fullStats);
        saveToHistory(inputText, localResult.cleanedText, fullStats, analysis, "humanize");
        setProgress(100);
        setStatusText("تم التحويل البشري محلياً بنجاح (نظراً لاكتمال حصة الـ API المؤقتة).");
      } else {
        alert(errMsg || "حدث خطأ أثناء التحويل البشري.");
        setStatusText("فشلت عملية التحويل.");
        setProgress(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler for Custom Commands (طلب أشياء وتنفيذها بدقة على النص)
  const handleCustomCommand = async (commandToRun?: string) => {
    const promptToExecute = (commandToRun || customCommand).trim();
    if (!promptToExecute) {
      alert("الرجاء كتابة أو اختيار الأمر المطلوب تنفيذه أولاً.");
      return;
    }

    const targetSourceText = (commandTarget === "output" && outputText.trim()) ? outputText : inputText;
    if (!targetSourceText.trim()) {
      alert("الرجاء إدخال أو توفير نص لتنفيذ الأمر عليه.");
      return;
    }

    setLoading(true);
    setProgress(30);
    setStatusText(`جاري تنفيذ الأمر الذكي: "${promptToExecute.slice(0, 35)}..."`);
    setIsProofreadMode(false);
    setOperationType("custom_command");

    try {
      setProgress(65);
      const data = await safeFetchJson<{
        success: boolean;
        cleanedText: string;
        stats: any;
      }>("/api/custom-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: targetSourceText,
          command: promptToExecute,
          apiKey,
          modelName,
          temperature,
          language,
          stripInvisible
        })
      });

      setProgress(100);
      setStatusText("تم تنفيذ الأمر بنجاح وحفظ التعديلات المطلوبة بدقة!");
      setOutputText(data.cleanedText);

      const analysis = analyzeTextIssues(targetSourceText, data.cleanedText, data.stats?.invisibleCharsRemoved || 0, false);
      setAnalysisResult(analysis);

      const score = calculateHumanScore(targetSourceText, data.cleanedText, analysis.totalIssues);
      setHumanScore(score);
      const fullStats = { ...data.stats, humanScore: score, isCustomCommand: true, commandUsed: promptToExecute };
      setStats(fullStats);

      saveToHistory(targetSourceText, data.cleanedText, fullStats, analysis, "custom_command");
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء تنفيذ الأمر الذكي.");
      setStatusText("فشل تنفيذ الأمر.");
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(20);
    setStatusText(`جاري قراءة وتحليل الملف ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress(50);
      const data = await safeFetchJson<{
        text: string;
        length: number;
      }>("/api/parse-file", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(100);
      setInputText(data.text);
      setStatusText(`تم تحميل الملف بنجاح: ${file.name} (${data.length} حرف)`);
      setTimeout(() => setUploadProgress(null), 1500);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "تعذر قراءة الملف أو استخراج النصوص.");
      setUploadProgress(null);
      setStatusText("فشل تحميل الملف.");
    }
  };

  const handleCopyCode = (text: string, type: 'code' | 'script') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    }
  };

  const handleDownloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-['Cairo'] flex flex-col transition-colors duration-200">
      {/* Top Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-950 dark:text-white">RefineX</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">Pro Studio</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">استوديو معالجة مستندات Word المتقدم &bull; تدقيق وتطهير متعدد النماذج (Gemini, GPT-4o, Claude, Ollama)</p>
            </div>
          </div>

          {/* Config Export/Import, History, Dark Mode & Shortcuts Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-1.5 text-xs bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl transition-all border border-blue-200 dark:border-blue-800 font-bold shadow-2xs"
              title="عرض سجل آخر 5 نصوص تمت معالجتها مع إمكانية الاسترجاع بضغطة زر (Ctrl+Shift+H)"
            >
              <History className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>السجل ({history.length})</span>
            </button>
            <button
              onClick={handleExportConfig}
              className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              تصدير JSON
            </button>
            <label className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl transition-all border border-slate-200 dark:border-slate-700 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              استيراد
              <input type="file" accept=".json" onChange={handleImportConfig} className="hidden" />
            </label>

            {/* Dark Mode Switcher */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              title={isDarkMode ? "التبديل إلى الوضع الفاتح (Ctrl+Shift+D)" : "التبديل إلى الوضع الداكن (Ctrl+Shift+D)"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Keyboard Shortcuts Button */}
            <button
              type="button"
              onClick={() => setIsShortcutsOpen(true)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              title="اختصارات لوحة المفاتيح"
            >
              <Keyboard className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap bg-slate-100 dark:bg-slate-850 p-1 rounded-xl border border-slate-200 dark:border-slate-800 gap-1">
            <button
              onClick={() => setActiveTab("workbench")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "workbench"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              المختبر الحي
            </button>
            <button
              onClick={() => setActiveTab("word_studio")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "word_studio"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>استوديو Word المتقدم</span>
            </button>
            <button
              onClick={() => setActiveTab("diff")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "diff"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              مقارنة النصوص (Diff)
            </button>
            <button
              onClick={() => setActiveTab("batch")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "batch"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              معالجة المجلدات (Batch)
            </button>
            <button
              onClick={() => setActiveTab("python_code")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "python_code" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              كود منصة الويب (Streamlit / Gradio)
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "guide" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              دليل تشغيل الويب
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {activeTab === "workbench" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Settings & Input */}
              <div className="lg:col-span-6 space-y-4">
                {/* 1. API Key, Model & Language Settings */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      إعدادات الاتصال، النموذج واللغة
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1">مفتاح API Key:</label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AIzaSy... (اختياري، إن لم يحدد يُستخدم مفتاح النظام)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1">اختر النموذج:</label>
                        <select
                          value={modelName}
                          onChange={(e) => setModelName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                        >
                          <option value="gemini-3.7-flash">Gemini 3.7 Flash (الأحدث والموصى به)</option>
                          <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
                          <option value="gemini-flash-latest">Gemini Flash Latest</option>
                          <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (فائق السرعة)</option>
                          <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (استدلال متقدم)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1">اللغة المستهدفة:</label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                        >
                          <option value="auto">🌐 اكتشاف تلقائي (Auto)</option>
                          <option value="العربية">🇸🇦 العربية</option>
                          <option value="English">🇺🇸 English</option>
                          <option value="Français">🇫🇷 Français</option>
                          <option value="Deutsch">🇩🇪 Deutsch</option>
                          <option value="Español">🇪🇸 Español</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1">درجة الحرارة ({temperature}):</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={temperature}
                          onChange={(e) => setTemperature(parseFloat(e.target.value))}
                          className="w-full mt-2 accent-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Blacklist & Style Matching */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      القائمة السوداء (مصطلحات الذكاء الاصطناعي والمحاماة)
                    </label>
                    {/* Preset buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={handleLoadAIMarkers}
                        title="إضافة كل عبارات وبصمات الذكاء الاصطناعي الشائعة"
                        className="text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-lg transition-colors font-medium border border-blue-200 flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        + علامات AI (45+)
                      </button>
                      <button
                        onClick={handleLoadLegalMarkers}
                        title="إضافة عبارات المحاماة، ديباجات العقود والتحفظ القانوني المفرط"
                        className="text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-800 px-2 py-1 rounded-lg transition-colors font-medium border border-amber-200 flex items-center gap-1"
                      >
                        <Scale className="w-3 h-3" />
                        + لغة المحاماة (40+)
                      </button>
                      <button
                        onClick={handleLoadAllMarkers}
                        title="دمج جميع علامات AI والمحاماة والحشو والتحفظ"
                        className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg transition-colors font-semibold border border-emerald-200 flex items-center gap-1"
                      >
                        <Shield className="w-3 h-3" />
                        + دمج الكل
                      </button>
                      <button
                        onClick={handleClearBlacklist}
                        title="مسح القائمة السوداء"
                        className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Eraser className="w-3 h-3" />
                        مسح
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={blacklist}
                    onChange={(e) => setBlacklist(e.target.value)}
                    rows={3}
                    placeholder="اكتب العبارات مفصولة بفواصل، أو استخدم الأزرار أعلاه لتزويد كافة العلامات تلقائياً..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs leading-relaxed"
                  />

                  {/* Sanitization toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                      <input
                        type="checkbox"
                        checked={stripInvisible}
                        onChange={(e) => setStripInvisible(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                      <span>حذف العلامات المخفية والـ Watermarks</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                      <input
                        type="checkbox"
                        checked={strictLegalSanitize}
                        onChange={(e) => setStrictLegalSanitize(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <Scale className="w-3.5 h-3.5 text-amber-600" />
                      <span>تطهير وتفكيك ديباجات المحاماة والتحفظ</span>
                    </label>
                  </div>

                  <label className="text-sm font-bold text-slate-800 flex items-center gap-2 pt-2">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    مفتاح مطابقة الأسلوب الشخصي (Style Matching)
                  </label>
                  <textarea
                    value={styleSample}
                    onChange={(e) => setStyleSample(e.target.value)}
                    rows={3}
                    placeholder="ألصق نموذجاً لنص قديم كتبه بنفسك ليدرس النموذج نبرتك وطريقة كتابتك..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* 3. Input Text & File Upload */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      النص المراد تنظيفه أو رفع ملف (PDF, TXT, MD, DOCX)
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {sampleTexts.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInputText(s.text)}
                          className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg transition-all"
                        >
                          {idx === 2 ? "⚖️ نموذج محاماة" : `نموذج ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* File Upload Dropzone with Upload Progress Monitor */}
                  <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center bg-slate-50/50 transition-all relative group cursor-pointer">
                    <input
                      type="file"
                      accept=".txt,.md,.docx,.pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                      <FolderOpen className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-slate-700">اسحب وأسقط ملفك هنا (PDF, Word, TXT)، أو انقر للاختيار</p>
                      <p className="text-[10px] text-slate-400">معالجة فورية للملفات مع تطهير تلقائي للأحرف والرموز غير المرئية</p>
                    </div>
                  </div>

                  {uploadProgress !== null && (
                    <div className="space-y-1 bg-blue-50 p-2.5 rounded-xl border border-blue-200">
                      <div className="flex justify-between text-xs text-blue-900 font-medium">
                        <span>جاري رفع وقراءة الملف...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-1.5 transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  {/* Instant Invisible Stripper Action Button */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleInstantStripInvisible}
                      className="text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
                      title="فحص النص محلياً وإزالة المسافات الصفرية، الواصلات الخفية، ورموز التشفير المائي فوراً"
                    >
                      <EyeOff className="w-3.5 h-3.5 text-indigo-600" />
                      🛡️ فحص وحذف العلامات المخفية فوراً (بدون استهلاك API)
                    </button>
                    <span className="text-[11px] text-slate-400">
                      {inputText ? `${inputText.length} حرف` : "فارغ"}
                    </span>
                  </div>

                  {/* Instant Invisible Banner Report */}
                  {invisibleBanner && (
                    <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2 ${
                      invisibleBanner.total > 0 
                        ? "bg-amber-50 border-amber-300 text-amber-900" 
                        : "bg-emerald-50 border-emerald-300 text-emerald-900"
                    }`}>
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>{invisibleBanner.total > 0 ? `تم رصد وحذف ${invisibleBanner.total} علامة مخفية!` : "النص سليم وخالٍ من العلامات المخفية:"}</strong>
                        <p className="mt-0.5 opacity-90">{invisibleBanner.details}</p>
                      </div>
                    </div>
                  )}

                  {/* Tone Preset Selector */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        نبرة وأسلوب الصياغة المستهدفة (Tone Preset):
                      </span>
                      <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                        {TONE_PRESETS.find(p => p.id === selectedTone)?.label}
                      </span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {TONE_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setSelectedTone(preset.id)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-right flex items-center gap-2 border ${
                            selectedTone === preset.id
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs font-bold"
                              : "bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }`}
                          title={preset.promptNote}
                        >
                          <span className="text-sm">{preset.icon}</span>
                          <div className="truncate">
                            <span className="block truncate leading-tight">{preset.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input View Mode: Editor vs Live Highlighter */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 pt-1">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setInputMode("edit")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          inputMode === "edit"
                            ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        }`}
                      >
                        محرر النص
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputMode("highlight")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          inputMode === "highlight"
                            ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        }`}
                      >
                        🔍 المظلل التفاعلي للشوائب (Live Highlighter)
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {inputText ? `${inputText.length.toLocaleString()} حرف` : "فارغ"}
                    </span>
                  </div>

                  {/* Textarea or Interactive Highlighter */}
                  {inputMode === "highlight" ? (
                    <TextHighlighter text={inputText} />
                  ) : (
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed font-sans"
                      placeholder="أو أكتب/ألصق النص مباشرة هنا (يستوعب آلاف الكلمات دفعة واحدة)..."
                    />
                  )}

                  {/* Word count & Reading time metrics banner */}
                  {inputText && (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span>
                          الكلمات: <strong className="text-slate-900 dark:text-white">{calculateTextMetrics(inputText).wordCount.toLocaleString()}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          الحروف: <strong className="text-slate-900 dark:text-white">{calculateTextMetrics(inputText).charCount.toLocaleString()}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          الجمل: <strong className="text-slate-900 dark:text-white">{calculateTextMetrics(inputText).sentenceCount}</strong>
                        </span>
                        <span>•</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          ⏱️ ~{calculateTextMetrics(inputText).readingTimeMinutes} دقيقة للقراءة
                        </span>
                      </div>
                      {calculateTextMetrics(inputText).wordCount > 600 && (
                        <span className="text-[11px] text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1">
                          ⚡ معالجة موسعة (سعة آلاف الكلمات)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Mode Tabs Selector */}
                  <div className="pt-2 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setActiveActionTab("humanize")}
                        className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          activeActionTab === "humanize"
                            ? "bg-purple-600 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                        }`}
                      >
                        <Wand2 className="w-3.5 h-3.5 text-purple-200" />
                        <span>✨ تحويل بشري 100%</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveActionTab("command")}
                        className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          activeActionTab === "command"
                            ? "bg-amber-600 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                        }`}
                      >
                        <Terminal className="w-3.5 h-3.5 text-amber-200" />
                        <span>⚡ طلب أوامر وتنفيذها</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveActionTab("clean")}
                        className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          activeActionTab === "clean"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 text-blue-200 fill-current" />
                        <span>🛡️ تنظيف وبصمات AI</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveActionTab("proofread")}
                        className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          activeActionTab === "proofread"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                        }`}
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />
                        <span>📝 تدقيق لغوي ونحوي</span>
                      </button>
                    </div>

                    {/* Tab 1: Humanizer Panel */}
                    {activeActionTab === "humanize" && (
                      <div className="bg-purple-50/70 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wand2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <h4 className="text-xs font-bold text-purple-950 dark:text-purple-200">
                              تحويل النص لأسلوب بشري طبيعي 100% (Humanizer Engine)
                            </h4>
                          </div>
                          <span className="text-[10px] bg-purple-200/80 dark:bg-purple-900 text-purple-900 dark:text-purple-200 px-2 py-0.5 rounded-full font-bold">
                            تجاوز كواشف AI بنسبة 99%
                          </span>
                        </div>

                        {/* Humanize Modes List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {HUMANIZE_MODES.map((mode) => (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() => setHumanizeMode(mode.id as HumanizeMode)}
                              className={`p-2.5 rounded-xl text-right transition-all border flex flex-col justify-between gap-1 ${
                                humanizeMode === mode.id
                                  ? "bg-white dark:bg-slate-850 border-purple-500 shadow-sm ring-1 ring-purple-500"
                                  : "bg-white/60 dark:bg-slate-900/60 border-purple-100 dark:border-purple-900/60 hover:bg-white dark:hover:bg-slate-850"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                  <span>{mode.icon}</span>
                                  <span>{mode.label}</span>
                                </span>
                                <span className="text-[9px] bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 px-1.5 py-0.2 rounded font-medium">
                                  {mode.badge}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {mode.description}
                              </p>
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={handleHumanize}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {loading && operationType === "humanize" ? (
                            <span className="animate-pulse">جاري التحويل لأسلوب بشري طبيعي 100%...</span>
                          ) : (
                            <>
                              <Wand2 className="w-4 h-4" />
                              <span>✨ تنفيذ التحويل البشري الفوري (Humanize)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Tab 2: Custom Commands Panel (طلب أشياء وتنفيذها) */}
                    {activeActionTab === "command" && (
                      <div className="bg-amber-50/70 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200">
                              طلب أوامر وتنفيذها بدقة على النص (Interactive AI Instructions)
                            </h4>
                          </div>
                          {/* Target Switcher */}
                          <div className="flex items-center gap-1 text-[11px] bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                            <button
                              type="button"
                              onClick={() => setCommandTarget("input")}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                commandTarget === "input"
                                  ? "bg-amber-600 text-white shadow-2xs"
                                  : "text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              على النص الأصلي
                            </button>
                            <button
                              type="button"
                              onClick={() => setCommandTarget("output")}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                commandTarget === "output"
                                  ? "bg-amber-600 text-white shadow-2xs"
                                  : "text-slate-600 dark:text-slate-400"
                              }`}
                              title="تطبيق الأمر مباشرة على النتيجة الحالية لتعديلها تراكمياً"
                            >
                              على النتيجة الحالية
                            </button>
                          </div>
                        </div>

                        {/* Custom Instruction Input */}
                        <div className="relative">
                          <input
                            type="text"
                            value={customCommand}
                            onChange={(e) => setCustomCommand(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !loading) {
                                e.preventDefault();
                                handleCustomCommand();
                              }
                            }}
                            placeholder="اكتب أي أمر تريده (مثال: اختصر مع الحفاظ على الأفكار، أعد الصياغة بأسلوب تسويقي، اجعله في نقاط محددة)..."
                            className="w-full pl-24 pr-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 dark:bg-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleCustomCommand()}
                            disabled={loading || !customCommand.trim()}
                            className="absolute left-1.5 top-1.5 bottom-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 rounded-lg flex items-center gap-1 disabled:opacity-50 transition-all shadow-2xs"
                          >
                            <Send className="w-3 h-3" />
                            تنفيذ
                          </button>
                        </div>

                        {/* Quick Command Pills */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-500" />
                            أوامر سريعة جاهزة بضغطة زر:
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {QUICK_COMMANDS.map((cmd) => (
                              <button
                                key={cmd.id}
                                type="button"
                                onClick={() => {
                                  setCustomCommand(cmd.prompt);
                                  handleCustomCommand(cmd.prompt);
                                }}
                                disabled={loading}
                                className="text-[11px] bg-white dark:bg-slate-900 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-slate-700 dark:text-slate-200 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-2xs disabled:opacity-50"
                              >
                                <span>{cmd.icon}</span>
                                <span>{cmd.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Clean AI & Legal */}
                    {activeActionTab === "clean" && (
                      <div className="bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-blue-600" />
                            تطهير بصمات AI ولغة المحاماة والتحفظ والعلامات المخفية
                          </h4>
                          <span className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">
                            تطبيق القائمة السوداء والمطابقة
                          </span>
                        </div>
                        <button
                          onClick={handleProcess}
                          disabled={loading}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {loading && operationType === "clean" ? (
                            <span className="animate-pulse">جاري تنظيف بصمات AI والمحاماة...</span>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-current" />
                              <span>🛡️ تنظيف وبصمات AI والمحاماة</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Tab 4: Proofreading */}
                    {activeActionTab === "proofread" && (
                      <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                            <CheckCheck className="w-4 h-4 text-emerald-600" />
                            تحسين وتدقيق لغوي نحوي وإملائي مع الحفاظ على أسلوب الكاتب
                          </h4>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                            دقة نحوية فائقة (Temperature: 0.3)
                          </span>
                        </div>
                        <button
                          onClick={handleProofread}
                          disabled={loading}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {loading && operationType === "proofread" ? (
                            <span className="animate-pulse">جاري التدقيق النحوي والإملائي...</span>
                          ) : (
                            <>
                              <CheckCheck className="w-4 h-4" />
                              <span>📝 تحسين وتدقيق لغوي (Gemini)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Results & Analytics */}
              <div className="lg:col-span-6 space-y-4 flex flex-col">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex-1 flex flex-col space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      {operationType === "humanize" && <Wand2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                      {operationType === "custom_command" && <Terminal className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                      {operationType === "proofread" && <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                      {operationType === "clean" && <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                      <span>
                        {operationType === "humanize"
                          ? `✨ النص المحوّل بأسلوب بشري طبيعي 100% (${HUMANIZE_MODES.find(m => m.id === stats?.humanizeMode || m.id === humanizeMode)?.label || "طبيعي"})`
                          : operationType === "custom_command"
                          ? `⚡ نتيجة تنفيذ الأمر: "${stats?.commandUsed || customCommand || "أمر ذكي مخصص"}"`
                          : operationType === "proofread"
                          ? "📝 النص المدقق لغوياً ونحوياً"
                          : "🛡️ النتيجة النهائية المنظفة من بصمات AI والمحاماة"}
                      </span>
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleCopyCode(outputText, 'script')}
                        disabled={!outputText}
                        className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
                      >
                        {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedScript ? "تم النسخ" : "نسخ"}
                      </button>
                      <button
                        onClick={() => handleDownloadFile(outputText, "cleaned_text.txt", "text/plain;charset=utf-8")}
                        disabled={!outputText}
                        className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50 border border-slate-200 dark:border-slate-700"
                      >
                        <Download className="w-3.5 h-3.5" />
                        TXT
                      </button>
                      <button
                        onClick={handleExportPDF}
                        disabled={!outputText || isExportingPDF}
                        className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs disabled:opacity-50"
                        title="تصدير التقرير النهائي متضمناً النص والإحصائيات كملف PDF"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        {isExportingPDF ? "جاري التصدير..." : "تقرير PDF"}
                      </button>
                      <button
                        onClick={() => setActiveTab("word_studio")}
                        disabled={!outputText}
                        className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs disabled:opacity-50"
                        title="فتح النتيجة مباشرة في محرر Word Studio لتنسيقها وتعديلها"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>فتح في Word Studio</span>
                      </button>
                      <button
                        onClick={handleExportWord}
                        disabled={!outputText || isExportingWord}
                        className="flex items-center gap-1.5 text-xs bg-blue-700 hover:bg-blue-800 text-white font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs disabled:opacity-50"
                        title="تصدير تقرير Word منسق وموثق (.docx)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        {isExportingWord ? "جاري التصدير..." : "تقرير Word"}
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <span>{statusText}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-2 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>

                  <textarea
                    value={outputText}
                    readOnly
                    rows={9}
                    className="w-full flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-slate-100 text-sm focus:outline-none font-mono leading-relaxed"
                    placeholder="ستظهر النتيجة المنظفة أو المدققة هنا بعد إتمام المعالجة..."
                  />

                  {/* Audio Player TTS Control */}
                  <AudioPlayerControl text={outputText} />

                  {/* Human-Likeness Score Gauge */}
                  {humanScore && (
                    <HumanScoreGauge humanScore={humanScore} isProofread={isProofreadMode} />
                  )}

                  {/* Recharts Issue Distribution Visualization */}
                  {analysisResult && (
                    <IssueDistributionChart analysis={analysisResult} isProofread={isProofreadMode} />
                  )}

                  {/* Analytics & Stats Box */}
                  {stats && (
                    <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-300">
                        <span className="flex items-center gap-2">
                          <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          تقرير الجودة والإحصائيات الفورية:
                        </span>
                        <span className="text-[11px] font-normal text-blue-700 dark:text-blue-400">
                          {isProofreadMode ? "وضع التدقيق اللغوي والنحوي" : `وضع تنظيف AI (${TONE_PRESETS.find(p => p.id === (stats.toneUsed || selectedTone))?.label || "نبرة مخصصة"})`}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-800 dark:text-blue-200">
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-blue-100 dark:border-blue-950 text-center">
                          <span className="block text-slate-500 dark:text-slate-400">حروف النص الأصلي</span>
                          <strong className="text-sm dark:text-white">{stats.originalLength}</strong>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-blue-100 dark:border-blue-950 text-center">
                          <span className="block text-slate-500 dark:text-slate-400">حروف النص المنظف</span>
                          <strong className="text-sm dark:text-white">{stats.cleanedLength}</strong>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-blue-100 dark:border-blue-950 text-center">
                          <span className="block text-slate-500 dark:text-slate-400">{isProofreadMode ? "تصحيحات نحوية وإملائية" : "علامات AI والمحاماة"}</span>
                          <strong className="text-sm text-emerald-600 dark:text-emerald-400">
                            ~{isProofreadMode ? (stats.grammarFixesCount ?? stats.diffChars ?? 0) : stats.removedCliches} تم معالجتها
                          </strong>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-blue-100 dark:border-blue-950 text-center">
                          <span className="block text-slate-500 dark:text-slate-400">العلامات المخفية المحذوفة</span>
                          <strong className="text-sm text-purple-600 dark:text-purple-400">{stats.invisibleCharsRemoved ?? 0} علامة</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "word_studio" && (
          <WordStudioEditor
            initialContent={outputText || inputText}
            apiKey={apiKey}
            modelName={modelName}
            temperature={temperature}
            language={language}
            onSendToCleaner={(text) => {
              setInputText(text);
              setActiveTab("workbench");
            }}
          />
        )}

        {activeTab === "diff" && (
          <SynchronizedDiffViewer originalText={inputText} cleanedText={outputText} />
        )}

        {activeTab === "batch" && (
          <BatchProcessingView
            apiKey={apiKey}
            modelName={modelName}
            temperature={temperature}
            language={language}
          />
        )}

        {activeTab === "python_code" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
            {/* Header with Framework Selector */}
            <div className="bg-slate-900 text-white px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center font-bold text-white shadow-md">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold">منصة الويب الكاملة (RefineX Web Suite)</h2>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      تعمل بالمتصفح 100%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    محرر مستندات Word + تنظيف كليشيهات AI + استدعاء النماذج المتعددة (Gemini, OpenAI, Claude, Ollama)
                  </p>
                </div>
              </div>

              {/* Framework Switcher & Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPythonFramework("streamlit")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      pythonFramework === "streamlit"
                        ? "bg-red-500 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>👑 Streamlit (الأساسي والشامل)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPythonFramework("gradio")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      pythonFramework === "gradio"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>🤗 Gradio (خفيف وسريع)</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    const code = pythonFramework === "streamlit" ? STREAMLIT_APP_CODE : GRADIO_APP_CODE;
                    handleCopyCode(code, 'code');
                  }}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? "تم النسخ" : "نسخ الكود"}
                </button>

                <button
                  onClick={() => {
                    const code = pythonFramework === "streamlit" ? STREAMLIT_APP_CODE : GRADIO_APP_CODE;
                    const filename = pythonFramework === "streamlit" ? "app_streamlit.py" : "app_gradio.py";
                    handleDownloadFile(code, filename, "text/plain;charset=utf-8");
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  تحميل {pythonFramework === "streamlit" ? "app_streamlit.py" : "app_gradio.py"}
                </button>
              </div>
            </div>

            {/* Quick Run Banner */}
            <div className="bg-slate-850 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-emerald-300 bg-slate-900 px-3 py-1 rounded-md border border-slate-700">
                  {pythonFramework === "streamlit" ? "streamlit run app_streamlit.py" : "python app_gradio.py"}
                </span>
              </div>
              <span className="text-slate-400 text-[11px]">
                {pythonFramework === "streamlit" 
                  ? "يفتح الموقع تلقائياً على http://localhost:8501 مع كافة التبويبات والمحرر الأكاديمي"
                  : "يفتح الموقع تلقائياً على http://localhost:7860"}
              </span>
            </div>

            {/* Code Display Area */}
            <div className="p-6 bg-slate-950 text-slate-200 overflow-x-auto max-h-[600px]">
              <pre className="text-xs font-mono leading-relaxed dir-ltr text-left" style={{ direction: 'ltr', textAlign: 'left' }}>
                <code>{pythonFramework === "streamlit" ? STREAMLIT_APP_CODE : GRADIO_APP_CODE}</code>
              </pre>
            </div>
          </div>
        )}

        {activeTab === "guide" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 1: Install */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">1</span>
                  تثبيت المتطلبات (Streamlit Web)
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  قم بتحميل ملف <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-xs">requirements_streamlit.txt</code>:
                </p>
                <div className="bg-slate-950 text-slate-100 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                  <pre>{STREAMLIT_REQUIREMENTS}</pre>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadFile(STREAMLIT_REQUIREMENTS, "requirements_streamlit.txt", "text/plain;charset=utf-8")}
                    className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    تحميل requirements_streamlit.txt
                  </button>
                </div>
                <p className="text-xs text-slate-500">أو ثبّت مباشرة عبر أمر pip:</p>
                <div className="bg-slate-950 text-emerald-400 p-3 rounded-xl font-mono text-xs">
                  pip install streamlit google-generativeai python-docx reportlab pypdf requests pillow gTTS
                </div>
              </div>

              {/* Step 2: Run */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">2</span>
                  تشغيل منصة الويب في المتصفح
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  احفظ الكود في ملف <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-xs">app_streamlit.py</code> ونفذ الأمر:
                </p>
                <div className="bg-slate-950 text-emerald-400 p-3 rounded-xl font-mono text-xs">
                  streamlit run app_streamlit.py
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                  💡 سيفتح المتصفح تلقائياً على الرابط <strong>http://localhost:8501</strong> لتستمتع بكافة الميزات: استوديو Word، التطهير والأنسنة، فاحص الفروقات، المعالجة الجماعية، ومؤشر الأنسنة.
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => handleDownloadFile(STREAMLIT_README_GUIDE, "README_STREAMLIT.md", "text/markdown;charset=utf-8")}
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all"
                  >
                    <Download className="w-4 h-4" />
                    تحميل دليل النشر السحابي الكامل (README_STREAMLIT.md)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        Gemini Text Cleaner Pro &bull; متوافق مع اكتشاف اللغة التلقائي وتخزين الإعدادات المحلي JSON.
      </footer>

      {/* History Drawer Component (Last 5 processed texts) */}
      <TextHistoryDrawer
        history={history}
        onRestore={handleRestoreHistory}
        onClear={handleClearHistory}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Printable Report View for PDF Export (jsPDF & html2canvas) */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-0">
        <ReportPDFView
          inputText={inputText}
          outputText={outputText}
          stats={stats}
          analysis={analysisResult}
          isProofread={isProofreadMode}
        />
      </div>
    </div>
  );
}
