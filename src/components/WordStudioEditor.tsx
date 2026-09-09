import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Download,
  FileText,
  Printer,
  Copy,
  Check,
  Sparkles,
  Upload,
  RefreshCw,
  FolderOpen,
  Send,
  FileCode,
  FileSpreadsheet,
  Cloud,
  CloudOff,
  Save,
  RotateCcw,
  History,
  FilePlus,
  Info,
  X
} from "lucide-react";
import { cleanTextRuleBased, humanizeTextRuleBased } from "../textCleanerUtils";
import { WordStudioToolbar } from "./word-studio/WordStudioToolbar";
import { WordStudioModals } from "./word-studio/WordStudioModals";
import { WordStudioOutline, DocumentHeading, DocumentComment } from "./word-studio/WordStudioOutline";
import { WordStudioAutoSaveModal, DocumentSnapshot } from "./word-studio/WordStudioAutoSaveModal";

interface WordStudioEditorProps {
  initialContent?: string;
  apiKey?: string;
  modelName?: string;
  temperature?: number;
  language?: string;
  onSendToCleaner?: (text: string) => void;
}

export const WordStudioEditor: React.FC<WordStudioEditorProps> = ({
  initialContent = "",
  apiKey = "",
  modelName = "gemini-3.7-flash",
  temperature = 0.7,
  language = "auto",
  onSendToCleaner
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const periodicSnapshotRef = useRef<NodeJS.Timeout | null>(null);
  const lastSnapshotWordCountRef = useRef<number>(0);

  // Ribbon and Navigation Tabs
  const [activeRibbonTab, setActiveRibbonTab] = useState<"home" | "insert" | "layout" | "references" | "tools" | "ai">("home");
  const [activeOutlineTab, setActiveOutlineTab] = useState<"outline" | "comments" | "stats">("outline");
  const [showSidebar, setShowSidebar] = useState(true);

  // Typography and formatting state
  const [fontFamily, setFontFamily] = useState<string>("'Cairo', sans-serif");
  const [fontSize, setFontSize] = useState<string>("16px");
  const [textColor, setTextColor] = useState<string>("#0f172a");
  const [highlightColor, setHighlightColor] = useState<string>("transparent");
  const [currentBlockFormat, setCurrentBlockFormat] = useState<string>("p");
  const [lineHeight, setLineHeight] = useState<string>("1.8");

  // Page layout state
  const [pageOrientation, setPageOrientation] = useState<"portrait" | "landscape">("portrait");
  const [pageMargins, setPageMargins] = useState<"normal" | "narrow" | "wide" | "moderate">("normal");
  const [pagePaperColor, setPagePaperColor] = useState<string>("#ffffff");
  const [pageBorder, setPageBorder] = useState<string>("none");
  const [pageWatermark, setPageWatermark] = useState<string>("");
  const [pageColumns, setPageColumns] = useState<"1" | "2" | "3">("1");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Document Header & Footer
  const [docHeader, setDocHeader] = useState<string>("RefineX Pro Studio | المستند الأكاديمي الموحد");
  const [docFooter, setDocFooter] = useState<string>("صفحة [1] — مسودة موثقة ومطهرة");

  // Document Structure State
  const [headings, setHeadings] = useState<DocumentHeading[]>([]);
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [wordCount, setWordCount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);
  const [paragraphCount, setParagraphCount] = useState<number>(0);
  const [wordGoal, setWordGoal] = useState<number>(1200);

  // Auto-Save and Version Snapshots State
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(() => {
    return localStorage.getItem("refinex_word_autosave_enabled") !== "false";
  });
  const [autoSaveInterval, setAutoSaveInterval] = useState<number>(() => {
    return parseFloat(localStorage.getItem("refinex_word_autosave_interval") || "1.5");
  });
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "off">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() => {
    return localStorage.getItem("refinex_word_last_saved_time") || null;
  });
  const [snapshots, setSnapshots] = useState<DocumentSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem("refinex_word_snapshots_v1");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showAutoSaveModal, setShowAutoSaveModal] = useState<boolean>(false);
  const [restoredBannerInfo, setRestoredBannerInfo] = useState<{ time: string; words: number } | null>(null);

  // Modals visibility state
  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [showMathModal, setShowMathModal] = useState<boolean>(false);
  const [showCitationModal, setShowCitationModal] = useState<boolean>(false);
  const [showFootnoteModal, setShowFootnoteModal] = useState<boolean>(false);
  const [showCalloutModal, setShowCalloutModal] = useState<boolean>(false);
  const [showFindReplaceModal, setShowFindReplaceModal] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [matchCount, setMatchCount] = useState<number | null>(null);

  // AI Assistant State
  const [selectedTextForAi, setSelectedTextForAi] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Initialize editor content (check initialContent first, then local auto-saved draft)
  useEffect(() => {
    if (!editorRef.current) return;

    if (initialContent) {
      const formatted = initialContent
        .split("\n\n")
        .map((p) => `<p style="margin-bottom: 1em;">${p.replace(/\n/g, "<br/>")}</p>`)
        .join("");
      editorRef.current.innerHTML = formatted;
      updateDocumentMetrics();
    } else {
      // Check for saved local draft
      try {
        const savedDraftJson = localStorage.getItem("refinex_word_draft_v2");
        if (savedDraftJson) {
          const draft = JSON.parse(savedDraftJson);
          if (draft.htmlContent && draft.htmlContent.trim().length > 0) {
            editorRef.current.innerHTML = draft.htmlContent;
            if (draft.docHeader) setDocHeader(draft.docHeader);
            if (draft.docFooter) setDocFooter(draft.docFooter);
            if (draft.fontFamily) setFontFamily(draft.fontFamily);
            if (draft.fontSize) setFontSize(draft.fontSize);
            if (draft.lineHeight) setLineHeight(draft.lineHeight);
            if (draft.pageOrientation) setPageOrientation(draft.pageOrientation);
            if (draft.pageMargins) setPageMargins(draft.pageMargins);
            if (draft.pagePaperColor) setPagePaperColor(draft.pagePaperColor);
            if (draft.pageBorder) setPageBorder(draft.pageBorder);
            if (draft.pageWatermark) setPageWatermark(draft.pageWatermark);
            if (draft.pageColumns) setPageColumns(draft.pageColumns);
            if (draft.comments) setComments(draft.comments);
            if (draft.wordGoal) setWordGoal(draft.wordGoal);

            const text = editorRef.current.innerText || "";
            const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
            setRestoredBannerInfo({
              time: draft.savedTimeStr || "سابقاً",
              words
            });
            updateDocumentMetrics();
          }
        }
      } catch (err) {
        console.warn("Could not parse saved draft", err);
      }
    }
  }, [initialContent]);

  // Update statistics and TOC headings
  const updateDocumentMetrics = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const paras = text.split(/\n+/).filter((p) => p.trim().length > 0).length;

    setWordCount(words);
    setCharCount(chars);
    setParagraphCount(paras);

    // Extract headings for outline TOC
    const headingElements = editorRef.current.querySelectorAll("h1, h2, h3");
    const extractedHeadings: DocumentHeading[] = [];
    headingElements.forEach((el, index) => {
      const headingId = el.id || `doc-heading-${index}`;
      el.id = headingId;
      extractedHeadings.push({
        id: headingId,
        text: el.textContent || `عنوان ${index + 1}`,
        level: Number(el.tagName.replace("H", "")) || 1
      });
    });
    setHeadings(extractedHeadings);

    // Trigger auto-save whenever metrics change
    triggerAutoSave();
  }, [
    docHeader,
    docFooter,
    fontFamily,
    fontSize,
    lineHeight,
    pageOrientation,
    pageMargins,
    pagePaperColor,
    pageBorder,
    pageWatermark,
    pageColumns,
    comments,
    wordGoal,
    autoSaveEnabled,
    autoSaveInterval
  ]);

  // Save current document to localStorage
  const performSave = useCallback(() => {
    if (!editorRef.current || !autoSaveEnabled) {
      if (!autoSaveEnabled) setAutoSaveStatus("off");
      return;
    }

    setAutoSaveStatus("saving");
    const htmlContent = editorRef.current.innerHTML || "";
    const textContent = editorRef.current.innerText || "";
    const now = new Date();
    const timeStr = now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const draftData = {
      htmlContent,
      textContent,
      docHeader,
      docFooter,
      fontFamily,
      fontSize,
      lineHeight,
      pageOrientation,
      pageMargins,
      pagePaperColor,
      pageBorder,
      pageWatermark,
      pageColumns,
      comments,
      wordGoal,
      timestamp: Date.now(),
      savedTimeStr: timeStr
    };

    try {
      localStorage.setItem("refinex_word_draft_v2", JSON.stringify(draftData));
      localStorage.setItem("refinex_word_last_saved_time", timeStr);
      setLastSavedTime(timeStr);
      setAutoSaveStatus("saved");

      // Check if we should create an automatic rolling snapshot (if word count shifted by >30 words)
      const currentWords = textContent.trim() ? textContent.trim().split(/\s+/).filter(Boolean).length : 0;
      if (Math.abs(currentWords - lastSnapshotWordCountRef.current) >= 30 && currentWords > 0) {
        createSnapshot("حفظ تلقائي دوري", htmlContent, textContent, currentWords);
        lastSnapshotWordCountRef.current = currentWords;
      }
    } catch (e) {
      console.warn("Storage quota exceeded or error saving draft", e);
      setAutoSaveStatus("idle");
    }
  }, [
    autoSaveEnabled,
    docHeader,
    docFooter,
    fontFamily,
    fontSize,
    lineHeight,
    pageOrientation,
    pageMargins,
    pagePaperColor,
    pageBorder,
    pageWatermark,
    pageColumns,
    comments,
    wordGoal
  ]);

  // Debounced Auto-Save Trigger
  const triggerAutoSave = useCallback(() => {
    if (!autoSaveEnabled) {
      setAutoSaveStatus("off");
      return;
    }

    setAutoSaveStatus("saving");
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, autoSaveInterval * 1000);
  }, [autoSaveEnabled, autoSaveInterval, performSave]);

  // Periodic Snapshot Timer (every 3 minutes)
  useEffect(() => {
    if (!autoSaveEnabled) return;

    periodicSnapshotRef.current = setInterval(() => {
      if (editorRef.current) {
        const html = editorRef.current.innerHTML || "";
        const text = editorRef.current.innerText || "";
        const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
        if (words > 5) {
          createSnapshot("نسخة احتياطية دورية", html, text, words);
        }
      }
    }, 180000);

    return () => {
      if (periodicSnapshotRef.current) clearInterval(periodicSnapshotRef.current);
    };
  }, [autoSaveEnabled]);

  // Create Snapshot Helper
  const createSnapshot = (
    label: string,
    htmlContent?: string,
    textContent?: string,
    words?: number
  ) => {
    if (!editorRef.current) return;
    const html = htmlContent !== undefined ? htmlContent : editorRef.current.innerHTML;
    const text = textContent !== undefined ? textContent : editorRef.current.innerText;
    const currentWords = words !== undefined ? words : (text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0);
    const now = new Date();

    const newSnapshot: DocumentSnapshot = {
      id: "snap-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      dateFormatted: now.toLocaleDateString("ar-EG", { month: "short", day: "numeric", year: "numeric" }),
      timeFormatted: now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      title: text.trim().slice(0, 40) || "مستند بدون عنوان",
      snippet: text.trim().slice(0, 80),
      wordCount: currentWords,
      charCount: text.length,
      label,
      htmlContent: html,
      docHeader,
      docFooter,
      fontFamily,
      fontSize,
      lineHeight,
      pageOrientation,
      pageMargins,
      pagePaperColor,
      pageBorder,
      pageWatermark,
      pageColumns,
      comments
    };

    setSnapshots((prev) => {
      const updated = [newSnapshot, ...prev.filter((s) => s.id !== newSnapshot.id)].slice(0, 20);
      try {
        localStorage.setItem("refinex_word_snapshots_v1", JSON.stringify(updated));
      } catch (e) {
        console.warn("Storage full for snapshots", e);
      }
      return updated;
    });
  };

  // Restore snapshot handler
  const handleRestoreSnapshot = (snapshot: DocumentSnapshot) => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = snapshot.htmlContent;
    if (snapshot.docHeader !== undefined) setDocHeader(snapshot.docHeader);
    if (snapshot.docFooter !== undefined) setDocFooter(snapshot.docFooter);
    if (snapshot.fontFamily !== undefined) setFontFamily(snapshot.fontFamily);
    if (snapshot.fontSize !== undefined) setFontSize(snapshot.fontSize);
    if (snapshot.lineHeight !== undefined) setLineHeight(snapshot.lineHeight);
    if (snapshot.pageOrientation !== undefined) setPageOrientation(snapshot.pageOrientation);
    if (snapshot.pageMargins !== undefined) setPageMargins(snapshot.pageMargins);
    if (snapshot.pagePaperColor !== undefined) setPagePaperColor(snapshot.pagePaperColor);
    if (snapshot.pageBorder !== undefined) setPageBorder(snapshot.pageBorder);
    if (snapshot.pageWatermark !== undefined) setPageWatermark(snapshot.pageWatermark);
    if (snapshot.pageColumns !== undefined) setPageColumns(snapshot.pageColumns);
    if (snapshot.comments !== undefined) setComments(snapshot.comments);

    updateDocumentMetrics();
    performSave();
  };

  // Delete single snapshot
  const handleDeleteSnapshot = (id: string) => {
    setSnapshots((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem("refinex_word_snapshots_v1", JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  // Clear all snapshots
  const handleClearAllSnapshots = () => {
    if (confirm("هل تريد مسح جميع النسخ الاحتياطية المسجلة؟")) {
      setSnapshots([]);
      localStorage.removeItem("refinex_word_snapshots_v1");
    }
  };

  // Toggle Auto-save
  const handleToggleAutoSave = (enabled: boolean) => {
    setAutoSaveEnabled(enabled);
    localStorage.setItem("refinex_word_autosave_enabled", enabled ? "true" : "false");
    if (!enabled) {
      setAutoSaveStatus("off");
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    } else {
      setAutoSaveStatus("saved");
      triggerAutoSave();
    }
  };

  // Change interval
  const handleChangeAutoSaveInterval = (interval: number) => {
    setAutoSaveInterval(interval);
    localStorage.setItem("refinex_word_autosave_interval", interval.toString());
    triggerAutoSave();
  };

  // Clear Document and start fresh
  const handleResetDocument = () => {
    if (confirm("هل أنت متأكد من رغبتك في تفريغ المحرر والبدء بمستند جديد؟ (سيتم حفظ نسخة في السجل أولاً)")) {
      if (editorRef.current && editorRef.current.innerText.trim().length > 0) {
        createSnapshot("نسخة قبل تفريغ المستند");
      }
      if (editorRef.current) {
        editorRef.current.innerHTML = "<p><br/></p>";
      }
      setDocHeader("RefineX Pro Studio | المستند الأكاديمي الموحد");
      setDocFooter("صفحة [1] — مسودة موثقة ومطهرة");
      setComments([]);
      setRestoredBannerInfo(null);
      updateDocumentMetrics();
      performSave();
    }
  };

  // Execute standard rich text command
  const exec = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    updateDocumentMetrics();
  };

  // Font and typography handlers
  const handleFontFamilyChange = (family: string) => {
    setFontFamily(family);
    exec("fontName", family);
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    // Apply size to current selection or editor
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const span = document.createElement("span");
      span.style.fontSize = size;
      const range = selection.getRangeAt(0);
      span.appendChild(range.extractContents());
      range.insertNode(span);
    } else {
      exec("fontSize", "3");
    }
    updateDocumentMetrics();
  };

  const handleIncreaseFontSize = () => {
    const currentNum = parseInt(fontSize) || 16;
    const nextSize = `${Math.min(72, currentNum + 2)}px`;
    handleFontSizeChange(nextSize);
  };

  const handleDecreaseFontSize = () => {
    const currentNum = parseInt(fontSize) || 16;
    const nextSize = `${Math.max(9, currentNum - 2)}px`;
    handleFontSizeChange(nextSize);
  };

  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    exec("foreColor", color);
  };

  const handleHighlightColorChange = (color: string) => {
    setHighlightColor(color);
    if (color === "transparent") {
      exec("removeFormat");
    } else {
      exec("hiliteColor", color);
    }
  };

  const handleBlockFormatChange = (format: string) => {
    setCurrentBlockFormat(format);
    if (format === "blockquote") {
      exec("formatBlock", "<blockquote>");
    } else if (format === "pre") {
      exec("formatBlock", "<pre>");
    } else {
      exec("formatBlock", `<${format}>`);
    }
    updateDocumentMetrics();
  };

  const handleLineHeightChange = (height: string) => {
    setLineHeight(height);
    if (editorRef.current) {
      editorRef.current.style.lineHeight = height;
    }
  };

  const handleToggleDirection = (dir: "rtl" | "ltr") => {
    if (editorRef.current) {
      editorRef.current.setAttribute("dir", dir);
    }
  };

  // Jump to heading from Outline TOC
  const handleJumpToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("bg-blue-100", "dark:bg-blue-900/60");
      setTimeout(() => {
        el.classList.remove("bg-blue-100", "dark:bg-blue-900/60");
      }, 1500);
    }
  };

  // Comments Management
  const handleAddComment = (text: string) => {
    const selection = window.getSelection()?.toString() || "";
    const newComment: DocumentComment = {
      id: Math.random().toString(36).substring(2, 9),
      author: "المراجع الأكاديمي",
      text,
      selectedText: selection.slice(0, 80),
      date: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      resolved: false
    };
    setComments((prev) => [newComment, ...prev]);
  };

  const handleResolveComment = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c))
    );
  };

  const handleDeleteComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  // Insert Operations
  const handleInsertTable = (
    rows: number,
    cols: number,
    hasHeader: boolean,
    style: "classic" | "striped" | "modern" | "academic"
  ) => {
    let styleClass = "border-collapse w-full my-4 text-xs ";
    let headerStyle = "background-color: #f1f5f9; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px 12px; text-align: right;";
    let cellStyle = "border: 1px solid #e2e8f0; padding: 8px 12px; text-align: right;";

    if (style === "academic") {
      headerStyle = "border-top: 2px solid #0f172a; border-bottom: 1.5px solid #0f172a; font-weight: bold; padding: 8px 12px; text-align: right;";
      cellStyle = "border-bottom: 1px solid #e2e8f0; padding: 8px 12px; text-align: right;";
    } else if (style === "modern") {
      headerStyle = "background-color: #1e40af; color: #ffffff; font-weight: bold; padding: 10px 14px; text-align: right;";
      cellStyle = "border: 1px solid #e2e8f0; padding: 8px 12px; text-align: right;";
    }

    let html = `<table class="${styleClass}" style="width: 100%; margin: 16px 0;">`;
    if (hasHeader) {
      html += `<thead><tr>`;
      for (let c = 0; c < cols; c++) {
        html += `<th style="${headerStyle}">عنوان العمود ${c + 1}</th>`;
      }
      html += `</tr></thead>`;
    }
    html += `<tbody>`;
    for (let r = 0; r < rows; r++) {
      const rowBg = style === "striped" && r % 2 === 1 ? "background-color: #f8fafc;" : "";
      html += `<tr style="${rowBg}">`;
      for (let c = 0; c < cols; c++) {
        html += `<td style="${cellStyle}">بيانات ${r + 1}-${c + 1}</td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table><p><br/></p>`;

    exec("insertHTML", html);
  };

  const handleInsertLink = (url: string, text: string) => {
    const html = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; font-weight: 600;">${text}</a>`;
    exec("insertHTML", html);
  };

  const handleInsertImage = (url: string, caption: string, width: string) => {
    const html = `
      <figure style="margin: 20px auto; text-align: center; max-width: ${width};">
        <img src="${url}" alt="${caption}" style="width: 100%; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
        ${caption ? `<figcaption style="margin-top: 8px; font-size: 12px; color: #64748b; font-style: italic;">${caption}</figcaption>` : ""}
      </figure>
      <p><br/></p>
    `;
    exec("insertHTML", html);
  };

  const handleInsertSymbol = (sym: string) => {
    exec("insertText", sym);
  };

  const handleInsertCitation = (
    style: string,
    author: string,
    title: string,
    year: string,
    publisher: string,
    url: string
  ) => {
    let citationFormatted = "";
    if (style === "apa") {
      citationFormatted = `${author} (${year}). <em>${title}</em>. ${publisher}. ${url}`;
    } else if (style === "mla") {
      citationFormatted = `${author}. <em>${title}</em>. ${publisher}, ${year}. ${url}`;
    } else if (style === "ieee") {
      citationFormatted = `[1] ${author}, "<em>${title}</em>," ${publisher}, ${year}.`;
    } else {
      citationFormatted = `${author}, <em>${title}</em> (${publisher}, ${year}).`;
    }

    const html = `
      <div style="background-color: #f8fafc; border-right: 4px solid #6366f1; padding: 10px 14px; margin: 12px 0; border-radius: 6px; font-size: 13px;">
        <strong style="color: #4f46e5; display: block; font-size: 11px; margin-bottom: 4px;">مرجع موثق (${style.toUpperCase()}):</strong>
        <span>${citationFormatted}</span>
      </div>
      <p><br/></p>
    `;
    exec("insertHTML", html);
  };

  const handleInsertFootnote = (text: string) => {
    const footnoteNum = (editorRef.current?.querySelectorAll(".doc-footnote").length || 0) + 1;
    const html = `<sup class="doc-footnote" style="color: #7c3aed; font-weight: bold; cursor: pointer; padding: 0 2px;" title="${text}">[${footnoteNum}]</sup>`;
    exec("insertHTML", html);

    // Append footnote explanation to bottom if not exists
    let footnotesContainer = editorRef.current?.querySelector("#document-footnotes-section");
    if (!footnotesContainer && editorRef.current) {
      const sectionHtml = `
        <div id="document-footnotes-section" style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #cbd5e1; font-size: 12px; color: #475569;">
          <strong style="display: block; margin-bottom: 8px; color: #334155;">الهوامش والملاحظات:</strong>
          <ol style="padding-right: 20px; list-style-type: decimal; margin: 0;">
            <li id="footnote-${footnoteNum}">${text}</li>
          </ol>
        </div>
      `;
      editorRef.current.innerHTML += sectionHtml;
    } else if (footnotesContainer) {
      const ol = footnotesContainer.querySelector("ol");
      if (ol) {
        ol.innerHTML += `<li id="footnote-${footnoteNum}">${text}</li>`;
      }
    }
  };

  const handleInsertCallout = (
    type: "info" | "warning" | "success" | "quote" | "academic",
    title: string,
    text: string
  ) => {
    let borderColor = "#3b82f6";
    let bg = "#eff6ff";
    let textColor = "#1e40af";
    let icon = "💡";

    if (type === "warning") {
      borderColor = "#f59e0b";
      bg = "#fffbeb";
      textColor = "#b45309";
      icon = "⚠️";
    } else if (type === "success") {
      borderColor = "#10b981";
      bg = "#ecfdf5";
      textColor = "#047857";
      icon = "✅";
    } else if (type === "quote") {
      borderColor = "#a855f7";
      bg = "#faf5ff";
      textColor = "#7e22ce";
      icon = "💬";
    }

    const html = `
      <div style="background-color: ${bg}; border-right: 4px solid ${borderColor}; padding: 14px 16px; margin: 16px 0; border-radius: 8px;">
        <div style="font-weight: bold; color: ${textColor}; margin-bottom: 6px; font-size: 13px; display: flex; align-items: center; gap: 6px;">
          <span>${icon}</span>
          <span>${title}</span>
        </div>
        <div style="font-size: 13px; color: #334155; line-height: 1.6;">${text}</div>
      </div>
      <p><br/></p>
    `;
    exec("insertHTML", html);
  };

  const handleInsertToc = () => {
    if (headings.length === 0) {
      updateDocumentMetrics();
    }
    const tocHtml = `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <h3 style="font-size: 15px; font-weight: bold; color: #1e293b; margin-bottom: 12px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">فهرس المحتويات (Table of Contents)</h3>
        <ul style="list-style-type: none; padding: 0; margin: 0; font-size: 13px; line-height: 2;">
          ${headings
            .map(
              (h) =>
                `<li style="padding-right: ${(h.level - 1) * 16}px;">
                  <a href="#${h.id}" style="color: #2563eb; text-decoration: none; font-weight: 500;">
                    <span style="display: inline-block; width: 6px; height: 6px; background-color: #3b82f6; border-radius: 50%; margin-left: 8px;"></span>
                    ${h.text}
                  </a>
                </li>`
            )
            .join("")}
        </ul>
      </div>
      <p><br/></p>
    `;
    if (editorRef.current) {
      editorRef.current.innerHTML = tocHtml + editorRef.current.innerHTML;
      updateDocumentMetrics();
    }
  };

  const handleInsertChecklist = () => {
    const html = `
      <div style="display: flex; align-items: center; gap: 8px; margin: 8px 0;">
        <input type="checkbox" style="width: 16px; height: 16px; cursor: pointer; accent-color: #2563eb;" />
        <span contenteditable="true" style="font-size: 14px;">بند المهمة أو المتطلب...</span>
      </div>
      <p><br/></p>
    `;
    exec("insertHTML", html);
  };

  const handleInsertDateStamp = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long"
    });
    exec("insertText", ` [${dateStr}] `);
  };

  const handleInsertPageBreak = () => {
    const html = `<hr style="page-break-before: always; border: 0; border-top: 2px dashed #94a3b8; margin: 30px 0;" title="فاصل صفحات" /><p><br/></p>`;
    exec("insertHTML", html);
  };

  const handleInsertHorizontalRule = () => {
    const html = `<hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 24px 0;" /><p><br/></p>`;
    exec("insertHTML", html);
  };

  // Find & Replace
  const handleSearch = (query: string, matchCase: boolean) => {
    if (!editorRef.current || !query) {
      setMatchCount(null);
      return;
    }
    const text = editorRef.current.innerText || "";
    const flags = matchCase ? "g" : "gi";
    const matches = text.match(new RegExp(query, flags));
    setMatchCount(matches ? matches.length : 0);
  };

  const handleReplaceAll = (query: string, replacement: string, matchCase: boolean) => {
    if (!editorRef.current || !query) return;
    const content = editorRef.current.innerHTML;
    const flags = matchCase ? "g" : "gi";
    editorRef.current.innerHTML = content.replace(new RegExp(query, flags), replacement);
    setMatchCount(0);
    updateDocumentMetrics();
  };

  // In-Place AI Execution
  const handleOpenAiModal = (mode: string = "humanize") => {
    const selection = window.getSelection()?.toString() || "";
    setSelectedTextForAi(selection);
    setShowAiModal(true);
  };

  const handleExecuteAi = async (mode: string, customPrompt: string) => {
    if (!editorRef.current) return;
    setIsAiLoading(true);
    setAiStatusMessage("جاري معالجة النص بالذكاء الاصطناعي بدقة...");

    const targetText = selectedTextForAi.trim() || editorRef.current.innerText;

    try {
      let endpoint = "/api/humanize";
      let body: any = {
        text: targetText,
        apiKey,
        modelName,
        temperature,
        language
      };

      if (mode === "clean") {
        endpoint = "/api/clean-text";
        body.strictLegalSanitize = true;
      } else if (mode === "proofread") {
        endpoint = "/api/proofread";
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      let cleanedResult = "";
      if (res.ok) {
        const data = await res.json();
        cleanedResult = data.cleanedText || "";
      } else {
        if (mode === "clean") {
          cleanedResult = cleanTextRuleBased(targetText).cleanedText;
        } else {
          cleanedResult = humanizeTextRuleBased(targetText, "authentic").cleanedText;
        }
      }

      if (cleanedResult) {
        if (selectedTextForAi.trim()) {
          exec("insertHTML", cleanedResult.replace(/\n/g, "<br/>"));
        } else {
          editorRef.current.innerHTML = cleanedResult
            .split("\n\n")
            .map((p) => `<p style="margin-bottom: 1em;">${p.replace(/\n/g, "<br/>")}</p>`)
            .join("");
        }
        updateDocumentMetrics();
        setShowAiModal(false);
      }
    } catch (err) {
      const localResult = humanizeTextRuleBased(targetText, "authentic").cleanedText;
      if (selectedTextForAi.trim()) {
        exec("insertHTML", localResult.replace(/\n/g, "<br/>"));
      } else if (editorRef.current) {
        editorRef.current.innerHTML = localResult
          .split("\n\n")
          .map((p) => `<p style="margin-bottom: 1em;">${p.replace(/\n/g, "<br/>")}</p>`)
          .join("");
      }
      updateDocumentMetrics();
      setShowAiModal(false);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Document Templates
  const handleLoadTemplate = (templateType: "research" | "legal" | "report") => {
    if (!editorRef.current) return;

    if (templateType === "research") {
      editorRef.current.innerHTML = `
        <h1 style="text-align: center; color: #1e3a8a; margin-bottom: 8px;">أثر التحول الرقمي على كفاءة الأداء المؤسسي</h1>
        <p style="text-align: center; font-size: 13px; color: #64748b; margin-bottom: 24px;">بحث علمي محكم — قسم الإدارة والتطوير المؤسسي</p>
        
        <h2>المستخلص (Abstract)</h2>
        <p>هدفت هذه الدراسة إلى قياس الأثر المباشر لتبني الأنظمة الذكية والتحول الرقمي على مؤشرات الكفاءة التشغيلية، مع التركيز على جودة المخرجات وسرعة الإنجاز.</p>
        
        <h2>1. المقدمة والخلفية النظرية</h2>
        <p>يعد التحول الرقمي ركيزة أساسية في استراتيجيات التطوير الحديثة، حيث يتجاوز مجرد أتمتة العمليات إلى إعادة هيكلة نماذج الأعمال.<sup style="color:#7c3aed;font-weight:bold;">[1]</sup></p>
        
        <h2>2. منهجية البحث</h2>
        <p>اعتمدت الدراسة المنهج الوصفي التحليلي لمسح آراء العينة المستهدفة وتحليل البيانات الناتجة.</p>
        
        <div style="background-color: #f8fafc; border-right: 4px solid #6366f1; padding: 10px 14px; margin: 12px 0; border-radius: 6px; font-size: 13px;">
          <strong style="color: #4f46e5; display: block; font-size: 11px;">توثيق APA:</strong>
          السعيد، أحمد (2024). <em>مناهج البحث العلمي المعاصر</em>. دار الفكر العربي.
        </div>
      `;
    } else if (templateType === "legal") {
      editorRef.current.innerHTML = `
        <h1 style="text-align: center; color: #0f172a; margin-bottom: 8px;">مذكرة استشارة ورأي قانوني</h1>
        <p style="text-align: center; font-size: 13px; color: #64748b; margin-bottom: 20px;">الموضوع: دراسة الموقف التعاقدي ومخاطر الالتزامات المالية</p>
        
        <h2>أولاً: الوقائع محل الاستشارة</h2>
        <p>تتلخص وقائع الاستشارة في النزاع الناشئ عن العقد المبرم بين الطرفين والمتعلق بتوريد البرمجيات والخدمات السحابية.</p>
        
        <h2>ثانياً: الأساس النظامي والتحليل</h2>
        <p>بالرجوع إلى نصوص نظام المعاملات المدنية، فإن العقد شريعة المتعاقدين، ويلزم كل طرف بما تعهد به كتابةً دون الإخلال بحسن النية.</p>
        
        <div style="background-color: #eff6ff; border-right: 4px solid #3b82f6; padding: 14px 16px; margin: 16px 0; border-radius: 8px;">
          <strong style="color: #1e40af; display: block; margin-bottom: 4px;">الرأي القانوني النهائي:</strong>
          نوصي بتقديم إخطار رسمي بفسخ العقد لعدم تنفيذ الالتزام خلال المدة المتفق عليها، مع الاحتفاظ بحق المطالبة بالتعويض.
        </div>
      `;
    } else {
      editorRef.current.innerHTML = `
        <h1 style="color: #047857; margin-bottom: 6px;">التقرير التنفيذي الشامل للربع السنوي</h1>
        <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">إعداد: فريق التخطيط الاستراتيجي</p>
        
        <h2>ملخص الأداء والمؤشرات الرئيسية</h2>
        <p>حقق الربع الحالي نمواً بنسبة 18% مقارنة بالفترة المماثلة من العام الماضي، مدفوعاً بزيادة الاعتماد على حلول الذكاء الاصطناعي.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background-color: #1e40af; color: white;">
              <th style="padding: 8px 12px; text-align: right;">المؤشر</th>
              <th style="padding: 8px 12px; text-align: right;">المستهدف</th>
              <th style="padding: 8px 12px; text-align: right;">المحقق</th>
              <th style="padding: 8px 12px; text-align: right;">نسبة الإنجاز</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #e2e8f0; padding: 8px 12px;">المستخدمين الجدد</td>
              <td style="border: 1px solid #e2e8f0; padding: 8px 12px;">10,000</td>
              <td style="border: 1px solid #e2e8f0; padding: 8px 12px;">12,450</td>
              <td style="border: 1px solid #e2e8f0; padding: 8px 12px; color: #047857; font-weight: bold;">124.5%</td>
            </tr>
          </tbody>
        </table>
      `;
    }
    updateDocumentMetrics();
  };

  // Export Document Handlers
  const handleExportWord = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    const htmlDocument = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>RefineX Document</title>
          <style>
            body { font-family: ${fontFamily}; font-size: ${fontSize}; line-height: ${lineHeight}; direction: rtl; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; }
            h1, h2, h3 { color: #1e293b; }
          </style>
        </head>
        <body>
          <div style="text-align: right; border-bottom: 1px solid #cbd5e1; font-size: 10pt; color: #64748b; margin-bottom: 20pt;">${docHeader}</div>
          ${content}
          <div style="text-align: center; border-top: 1px solid #cbd5e1; font-size: 10pt; color: #64748b; margin-top: 30pt;">${docFooter}</div>
        </body>
      </html>
    `;
    const blob = new Blob(["\ufeff", htmlDocument], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RefineX_Word_Document_${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportText = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RefineX_Document_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (!editorRef.current) return;
    navigator.clipboard.writeText(editorRef.current.innerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/parse-file", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (editorRef.current && data.text) {
          editorRef.current.innerHTML = data.text
            .split("\n\n")
            .map((p: string) => `<p style="margin-bottom: 1em;">${p.replace(/\n/g, "<br/>")}</p>`)
            .join("");
          updateDocumentMetrics();
        }
      }
    } catch (err) {
      console.error("Error parsing file:", err);
    }
  };

  // Dynamic Padding based on Margin setup
  const getMarginPadding = () => {
    if (pageMargins === "narrow") return "p-6 sm:p-8";
    if (pageMargins === "wide") return "p-12 sm:p-16";
    if (pageMargins === "moderate") return "p-8 sm:p-10";
    return "p-8 sm:p-12"; // normal
  };

  // Dynamic Border Class
  const getPageBorderClass = () => {
    if (pageBorder === "single") return "border-2 border-slate-300 dark:border-slate-700";
    if (pageBorder === "double") return "border-4 border-double border-slate-700 dark:border-slate-300";
    if (pageBorder === "gold") return "border-4 border-amber-500 shadow-amber-500/10";
    if (pageBorder === "ornamental") return "border-8 border-slate-800 outline outline-2 outline-slate-400";
    return "border border-slate-200 dark:border-slate-800";
  };

  return (
    <div className={`flex flex-col bg-slate-100 dark:bg-slate-950 ${isFullscreen ? "fixed inset-0 z-50 overflow-hidden" : "rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs"}`}>
      {/* Top Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs">
            W
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">RefineX Word Studio</h2>
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Google Docs & Word Complete Suite
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>{wordCount.toLocaleString()} كلمة • {charCount.toLocaleString()} حرف</span>
              <span>•</span>
              {/* Google Docs Style Auto-save Live Status Badge */}
              <button
                onClick={() => setShowAutoSaveModal(true)}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                  autoSaveStatus === "saving"
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                    : autoSaveStatus === "saved"
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
                    : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                }`}
                title="اضغط لفتح خيارات الحفظ التلقائي وسجل الإصدارات"
              >
                {autoSaveStatus === "saving" ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : autoSaveStatus === "saved" ? (
                  <>
                    <Cloud className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>تم الحفظ تلقائياً {lastSavedTime ? `(${lastSavedTime})` : ""}</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3 h-3 text-amber-500" />
                    <span>الحفظ التلقائي متوقف</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Quick Snapshot / Save Button */}
          <button
            onClick={() => {
              createSnapshot("حفظ يدوي");
              performSave();
              setAutoSaveStatus("saved");
            }}
            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            title="حفظ نسخة فورية الآن"
          >
            <Save className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">حفظ فوري</span>
          </button>

          {/* Version History Button */}
          <button
            onClick={() => setShowAutoSaveModal(true)}
            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all relative"
            title="عرض سجل الإصدارات والنسخ المحفوظة"
          >
            <History className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">سجل الإصدارات</span>
            {snapshots.length > 0 && (
              <span className="bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                {snapshots.length}
              </span>
            )}
          </button>

          {/* Templates Dropdown */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleLoadTemplate(e.target.value as any);
                e.target.value = "";
              }
            }}
            defaultValue=""
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="" disabled>
              📋 إدراج قالب جاهز...
            </option>
            <option value="research">🎓 بحث علمي وأكاديمي محكم</option>
            <option value="legal">⚖️ مذكرة ورأي قانوني</option>
            <option value="report">📊 تقرير إداري وتنفيذي</option>
          </select>

          {/* Import File */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".docx,.pdf,.txt,.md"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            title="استيراد ملف Word أو PDF أو نصي"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>استيراد</span>
          </button>

          {/* Export Word */}
          <button
            onClick={handleExportWord}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير Word (.doc)</span>
          </button>

          {/* Send to Main Cleaner */}
          {onSendToCleaner && (
            <button
              onClick={() => {
                if (editorRef.current) {
                  onSendToCleaner(editorRef.current.innerText);
                }
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال للمنصة</span>
            </button>
          )}

          {/* New / Reset Document */}
          <button
            onClick={handleResetDocument}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl"
            title="مستند جديد فارغ"
          >
            <FilePlus className="w-4 h-4" />
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl"
            title="نسخ النص كاملاً"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Comprehensive Ribbon Toolbar */}
      <WordStudioToolbar
        activeRibbonTab={activeRibbonTab}
        setActiveRibbonTab={setActiveRibbonTab}
        exec={exec}
        fontFamily={fontFamily}
        onChangeFontFamily={handleFontFamilyChange}
        fontSize={fontSize}
        onChangeFontSize={handleFontSizeChange}
        onIncreaseFontSize={handleIncreaseFontSize}
        onDecreaseFontSize={handleDecreaseFontSize}
        textColor={textColor}
        onChangeTextColor={handleTextColorChange}
        highlightColor={highlightColor}
        onChangeHighlightColor={handleHighlightColorChange}
        currentBlockFormat={currentBlockFormat}
        onChangeBlockFormat={handleBlockFormatChange}
        lineHeight={lineHeight}
        onChangeLineHeight={handleLineHeightChange}
        onToggleDirection={handleToggleDirection}
        pageOrientation={pageOrientation}
        setPageOrientation={setPageOrientation}
        pageMargins={pageMargins}
        setPageMargins={setPageMargins}
        pagePaperColor={pagePaperColor}
        setPagePaperColor={setPagePaperColor}
        pageBorder={pageBorder}
        setPageBorder={setPageBorder}
        pageWatermark={pageWatermark}
        setPageWatermark={setPageWatermark}
        pageColumns={pageColumns}
        setPageColumns={setPageColumns}
        onOpenTableModal={() => setShowTableModal(true)}
        onOpenLinkModal={() => setShowLinkModal(true)}
        onOpenImageModal={() => setShowImageModal(true)}
        onOpenMathModal={() => setShowMathModal(true)}
        onOpenCitationModal={() => setShowCitationModal(true)}
        onOpenFootnoteModal={() => setShowFootnoteModal(true)}
        onOpenCalloutModal={() => setShowCalloutModal(true)}
        onOpenFindReplaceModal={() => setShowFindReplaceModal(true)}
        onOpenAiModal={handleOpenAiModal}
        onInsertDateStamp={handleInsertDateStamp}
        onInsertPageBreak={handleInsertPageBreak}
        onInsertHorizontalRule={handleInsertHorizontalRule}
        onInsertToc={handleInsertToc}
        onInsertChecklist={handleInsertChecklist}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        onPrint={handlePrint}
      />

      {/* Restored Draft Toast Banner */}
      {restoredBannerInfo && (
        <div className="bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900/50 px-4 py-2 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              تمت استعادة آخر مسودة محفوظة تلقائياً ({restoredBannerInfo.words} كلمة - {restoredBannerInfo.time}) بنجاح.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAutoSaveModal(true)}
              className="text-blue-700 dark:text-blue-300 font-bold hover:underline"
            >
              عرض سجل النسخ
            </button>
            <button
              onClick={() => setRestoredBannerInfo(null)}
              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded text-blue-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Area (Sidebar + Canvas) */}
      <div className="flex flex-1 overflow-hidden min-h-[620px]">
        {/* Document Outline & Stats Sidebar */}
        {showSidebar && (
          <WordStudioOutline
            headings={headings}
            comments={comments}
            wordCount={wordCount}
            charCount={charCount}
            paragraphCount={paragraphCount}
            wordGoal={wordGoal}
            onSetWordGoal={setWordGoal}
            onJumpToHeading={handleJumpToHeading}
            onAddComment={handleAddComment}
            onResolveComment={handleResolveComment}
            onDeleteComment={handleDeleteComment}
            activeOutlineTab={activeOutlineTab}
            setActiveOutlineTab={setActiveOutlineTab}
          />
        )}

        {/* Document Canvas Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/70 dark:bg-slate-950">
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top center",
              transition: "transform 0.2s ease"
            }}
            className="w-full flex justify-center"
          >
            {/* The Document Page (A4 Paper emulation) */}
            <div
              style={{
                backgroundColor: pagePaperColor,
                fontFamily: fontFamily,
                fontSize: fontSize,
                lineHeight: lineHeight,
                maxWidth: pageOrientation === "landscape" ? "1100px" : "840px"
              }}
              className={`w-full min-h-[1050px] shadow-2xl rounded-sm transition-all relative ${getMarginPadding()} ${getPageBorderClass()}`}
            >
              {/* Optional Watermark */}
              {pageWatermark && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                  <span className="text-slate-300 dark:text-slate-700/40 text-5xl sm:text-7xl font-black rotate-[-30deg] tracking-widest opacity-25 uppercase">
                    {pageWatermark}
                  </span>
                </div>
              )}

              {/* Editable Document Header */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2 mb-6 text-[11px] text-slate-400 flex items-center justify-between select-none">
                <input
                  type="text"
                  value={docHeader}
                  onChange={(e) => {
                    setDocHeader(e.target.value);
                    triggerAutoSave();
                  }}
                  className="bg-transparent border-none text-slate-400 text-xs w-2/3 focus:outline-none focus:text-slate-700"
                  placeholder="رأس الصفحة..."
                />
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {pageOrientation === "portrait" ? "A4 عمودي" : "A4 أفقي"}
                </span>
              </div>

              {/* Rich Text Editor Content Area */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={updateDocumentMetrics}
                onKeyUp={updateDocumentMetrics}
                style={{
                  minHeight: "750px",
                  columnCount: pageColumns !== "1" ? Number(pageColumns) : undefined,
                  columnGap: "32px",
                  color: textColor
                }}
                className="focus:outline-none relative z-10 leading-relaxed prose max-w-none text-slate-900 dark:text-slate-100 selection:bg-blue-200 dark:selection:bg-blue-900"
              />

              {/* Editable Document Footer */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-8 text-[11px] text-slate-400 flex items-center justify-between select-none">
                <input
                  type="text"
                  value={docFooter}
                  onChange={(e) => {
                    setDocFooter(e.target.value);
                    triggerAutoSave();
                  }}
                  className="bg-transparent border-none text-slate-400 text-xs w-2/3 focus:outline-none focus:text-slate-700"
                  placeholder="تذييل الصفحة..."
                />
                <span className="text-[10px] font-mono">
                  {wordCount} كلمة
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Dialogs and Modals */}
      <WordStudioModals
        showTableModal={showTableModal}
        setShowTableModal={setShowTableModal}
        onInsertTable={handleInsertTable}
        showLinkModal={showLinkModal}
        setShowLinkModal={setShowLinkModal}
        onInsertLink={handleInsertLink}
        showImageModal={showImageModal}
        setShowImageModal={setShowImageModal}
        onInsertImage={handleInsertImage}
        showMathModal={showMathModal}
        setShowMathModal={setShowMathModal}
        onInsertSymbol={handleInsertSymbol}
        showCitationModal={showCitationModal}
        setShowCitationModal={setShowCitationModal}
        onInsertCitation={handleInsertCitation}
        showFootnoteModal={showFootnoteModal}
        setShowFootnoteModal={setShowFootnoteModal}
        onInsertFootnote={handleInsertFootnote}
        showCalloutModal={showCalloutModal}
        setShowCalloutModal={setShowCalloutModal}
        onInsertCallout={handleInsertCallout}
        showFindReplaceModal={showFindReplaceModal}
        setShowFindReplaceModal={setShowFindReplaceModal}
        onSearch={handleSearch}
        onReplaceAll={handleReplaceAll}
        matchCount={matchCount}
        showAiModal={showAiModal}
        setShowAiModal={setShowAiModal}
        selectedTextForAi={selectedTextForAi}
        modelName={modelName}
        onExecuteAi={handleExecuteAi}
        isAiLoading={isAiLoading}
        aiStatusMessage={aiStatusMessage}
      />

      {/* AutoSave & Version Snapshots Modal */}
      <WordStudioAutoSaveModal
        isOpen={showAutoSaveModal}
        onClose={() => setShowAutoSaveModal(false)}
        snapshots={snapshots}
        onRestoreSnapshot={handleRestoreSnapshot}
        onDeleteSnapshot={handleDeleteSnapshot}
        onClearAllSnapshots={handleClearAllSnapshots}
        onSaveManualSnapshot={(customLabel) => {
          createSnapshot(customLabel || "نسخة محفوظة يدوياً");
          performSave();
        }}
        autoSaveEnabled={autoSaveEnabled}
        onToggleAutoSave={handleToggleAutoSave}
        autoSaveInterval={autoSaveInterval}
        onChangeAutoSaveInterval={handleChangeAutoSaveInterval}
        lastSavedTime={lastSavedTime}
        currentWordCount={wordCount}
      />
    </div>
  );
};
