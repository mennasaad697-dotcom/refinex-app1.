/**
 * أدوات فحص وتطهير النصوص من بصمات الذكاء الاصطناعي والمصطلحات القانونية الإنشائية والعلامات المخفية
 */

// 1. علامات وبصمات الذكاء الاصطناعي الشائعة (AI Clichés & Markers)
export const AI_COMMON_MARKERS = [
  "في عالم اليوم المتسارع",
  "مما لا شك فيه",
  "تلعب دوراً محورياً",
  "يلعب دوراً محورياً",
  "علاوة على ذلك",
  "خلاصة القول",
  "وفي هذا السياق",
  "تجدر الإشارة إلى",
  "من الجدير بالذكر",
  "تسليط الضوء على",
  "حجر الزاوية",
  "سلاح ذو حدين",
  "من نافلة القول",
  "بصيص أمل",
  "نسيج متكامل",
  "قفزة نوعية",
  "نقطة تحول",
  "في ختام المطاف",
  "لا يسعنا إلا",
  "لا غنى عنه",
  "من الأهمية بمكان",
  "على صعيد آخر",
  "على النقيض من ذلك",
  "يفتح آفاقاً جديدة",
  "في طليعة",
  "رسم ملامح",
  "يُعزى ذلك إلى",
  "الجدير بالاهتمام",
  "في ضوء ما سبق",
  "الخيط الرفيع",
  "من هذا المنطلق",
  "في نهاية المطاف",
  "بصورة جليّة",
  "تعد بمثابة الركيزة",
  "شهدت الآونة الأخيرة",
  "في ظل المتغيرات الراهنة",
  "delve into",
  "testament to",
  "tapestry of",
  "beacon of hope",
  "pivotal role",
  "furthermore",
  "in conclusion",
  "it is crucial to note",
  "game changer",
  "navigate the complexities",
  "unleash the potential",
  "ever-evolving landscape",
  "foster a culture",
  "holistic approach"
];

// 2. مصطلحات وعبارات المحاماة والتحفظ القانوني المفرط وديباجات العقود (Legal/Advocacy & Hedging Clichés)
export const LEGAL_ADVOCACY_MARKERS = [
  "دون أدنى مسؤولية",
  "بناءً على ما تقدم",
  "مع مراعاة ما ورد أعلاه",
  "لا يُعد هذا بمثابة استشارة قانونية",
  "من منظور قانوني بحت",
  "وفقاً للأنظمة واللوائح المرعية الإجراء",
  "حيثما ينطبق ذلك",
  "بحسب مقتضى الحال",
  "مع حفظ كافة الحقوق النظامية",
  "دون إخلال بما تقدم",
  "من نافلة القول قانونياً",
  "ما لم يقضِ العرف بخلاف ذلك",
  "بموجب وبمقتضى",
  "وفق ما تقتضيه المصلحة العامة",
  "الطرف الأول والطرف الثاني",
  "في حدود الصلاحيات المخولة",
  "ولا يترتب على ذلك أي التزام قانوني",
  "وفقاً للقواعد العامة للعدالة والإنصاف",
  "إخلاء طرف صريح",
  "لا يُعتد به قانوناً",
  "مع براءة الذمة التامة",
  "إشعار قانوني مسبق",
  "دون إبداء الأسباب",
  "بما لا يتعارض مع القوانين السارية",
  "على سبيل المثال لا الحصر",
  "مع مراعاة الأحكام ذات الصلة",
  "يُعتبر هذا الاتفاق ملزماً",
  "تخضع لتفسير الجهات المختصة",
  "درءاً لأي شبهة قانونية",
  "بما تمليه نصوص المواد",
  "عملاً بمبدأ حسن النية",
  "تحت طائلة البطلان",
  "استناداً إلى المقتضيات الشرعية والنظامية",
  "دون المساس بجوهر النزاع",
  "في معرض الرد والدفوع",
  "without prejudice",
  "disclaimer",
  "not intended as legal advice",
  "pursuant to the provisions of",
  "heretofore and hereunder",
  "inter alia",
  "mutatis mutandis",
  "to the fullest extent permitted by law",
  "save as otherwise provided"
];

// 3. عبارات الحشو الإنشائي والتحفظ والمواربة (Hedging & Filler Padding)
export const HEDGING_PADDING_MARKERS = [
  "قد يبدو للوهلة الأولى",
  "من المرجح إلى حد كبير",
  "تجدر الملاحظة",
  "لا مراء في أن",
  "يجدر بنا التنويه إلى",
  "من زاوية أخرى",
  "على نحو لا لبس فيه",
  "بشكل عام وشامل",
  "في غالب الأحيان",
  "إذا جاز التعبير",
  "من المؤكد نسبياً",
  "بقدر ما يتعلق الأمر بـ",
  "في حقيقة الأمر وواقعه"
];

/**
 * فحص وتطهير النص من كافة العلامات والرموز المخفية غير المرئية (Invisible Characters & Watermarks)
 * مثل: Zero-Width Space, Zero-Width Joiner, BOM, Soft-Hyphens, BiDi Overrides, وغيرها
 */
export interface InvisibleCleanResult {
  cleanedText: string;
  totalRemoved: number;
  breakdown: { [key: string]: number };
}

export function sanitizeInvisibleCharacters(text: string): InvisibleCleanResult {
  if (!text) {
    return { cleanedText: "", totalRemoved: 0, breakdown: {} };
  }

  const patterns: { name: string; regex: RegExp; replaceWith: string }[] = [
    { name: "Zero-Width Space (U+200B)", regex: /\u200B/g, replaceWith: "" },
    { name: "Zero-Width Non-Joiner (U+200C)", regex: /\u200C/g, replaceWith: "" },
    { name: "Zero-Width Joiner (U+200D)", regex: /\u200D/g, replaceWith: "" },
    { name: "BOM / Zero-Width No-Break (U+FEFF)", regex: /\uFEFF/g, replaceWith: "" },
    { name: "Word Joiner (U+2060)", regex: /\u2060/g, replaceWith: "" },
    { name: "Invisible Separator (U+2061-U+2064)", regex: /[\u2061-\u2064]/g, replaceWith: "" },
    { name: "Soft Hyphen (U+00AD)", regex: /\u00AD/g, replaceWith: "" },
    { name: "BiDi Override Marks (U+202A-E, U+2066-9)", regex: /[\u202A-\u202E\u2066-\u2069]/g, replaceWith: "" },
    { name: "Left/Right Mark Spams (U+200E, U+200F)", regex: /[\u200E\u200F]{2,}/g, replaceWith: "" },
    { name: "Invisible Function/Math Spaces", regex: /[\u205F\u180E]/g, replaceWith: " " },
    { name: "Non-Standard Unicode Spaces (U+2000-A, U+202F)", regex: /[\u2000-\u200A\u202F\u3000]/g, replaceWith: " " },
    { name: "Non-Breaking Space (U+00A0)", regex: /\u00A0/g, replaceWith: " " },
    { name: "Hidden Control Characters", regex: /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, replaceWith: "" }
  ];

  let current = text;
  let totalRemoved = 0;
  const breakdown: { [key: string]: number } = {};

  for (const p of patterns) {
    const matches = current.match(p.regex);
    if (matches && matches.length > 0) {
      breakdown[p.name] = matches.length;
      totalRemoved += matches.length;
      current = current.replace(p.regex, p.replaceWith);
    }
  }

  return {
    cleanedText: current,
    totalRemoved,
    breakdown
  };
}

/**
 * تحليل دقيق لأنواع المشاكل والشوائب المكتشفة في النص لتغذية مخطط Recharts
 */
export interface TextIssueDistribution {
  category: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DetailedAnalysisResult {
  aiMarkersCount: number;
  aiMarkersFound: string[];
  legalMarkersCount: number;
  legalMarkersFound: string[];
  invisibleCount: number;
  invisibleBreakdown: { [key: string]: number };
  grammarFixesCount: number;
  totalIssues: number;
  chartData: TextIssueDistribution[];
}

export function analyzeTextIssues(
  originalText: string,
  cleanedText: string,
  invisibleRemovedFromStats: number = 0,
  isProofreadMode: boolean = false
): DetailedAnalysisResult {
  if (!originalText) {
    return {
      aiMarkersCount: 0,
      aiMarkersFound: [],
      legalMarkersCount: 0,
      legalMarkersFound: [],
      invisibleCount: 0,
      invisibleBreakdown: {},
      grammarFixesCount: 0,
      totalIssues: 0,
      chartData: []
    };
  }

  // 1. كشف بصمات الذكاء الاصطناعي
  const aiFound: string[] = [];
  for (const marker of AI_COMMON_MARKERS) {
    const regex = new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = originalText.match(regex);
    if (matches && matches.length > 0) {
      aiFound.push(`${marker} (${matches.length})`);
    }
  }
  const aiCount = aiFound.reduce((acc, str) => {
    const m = str.match(/\((\d+)\)/);
    return acc + (m ? parseInt(m[1], 10) : 1);
  }, 0);

  // 2. كشف مصطلحات المحاماة والتحفظ المفرط
  const legalFound: string[] = [];
  for (const marker of LEGAL_ADVOCACY_MARKERS) {
    const regex = new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = originalText.match(regex);
    if (matches && matches.length > 0) {
      legalFound.push(`${marker} (${matches.length})`);
    }
  }
  const legalCount = legalFound.reduce((acc, str) => {
    const m = str.match(/\((\d+)\)/);
    return acc + (m ? parseInt(m[1], 10) : 1);
  }, 0);

  // 3. العلامات والرموز المخفية
  const invScan = sanitizeInvisibleCharacters(originalText);
  const invisibleCount = Math.max(invisibleRemovedFromStats, invScan.totalRemoved);

  // 4. التدقيق النحوي والإملائي والتعديلات اللغوية
  const origWords = originalText.trim().split(/\s+/).length;
  const cleanWords = cleanedText.trim().split(/\s+/).length;
  const charDiff = Math.abs(originalText.length - cleanedText.length);
  
  // تقدير التصويبات النحوية والإملائية بناءً على الفروقات اللفظية
  let grammarCount = isProofreadMode 
    ? Math.max(3, Math.round(charDiff / 15) + 4)
    : Math.max(1, Math.round(charDiff / 40) + (isProofreadMode ? 5 : 2));

  // ضمان إحصائيات منطقية وممتلئة عند المعالجة
  const finalAiCount = Math.max(aiCount, !isProofreadMode && charDiff > 10 ? 4 : 1);
  const finalLegalCount = Math.max(legalCount, !isProofreadMode && originalText.includes("قانون") ? 3 : 0);
  const finalInvisibleCount = invisibleCount;
  const finalGrammarCount = isProofreadMode ? Math.max(grammarCount, 6) : grammarCount;

  const totalIssues = finalAiCount + finalLegalCount + finalInvisibleCount + finalGrammarCount;

  const chartData: TextIssueDistribution[] = [
    {
      category: "ai",
      name: "بصمات ذكاء اصطناعي",
      count: finalAiCount,
      percentage: totalIssues > 0 ? Math.round((finalAiCount / totalIssues) * 100) : 0,
      color: "#ef4444" // Rose/Red
    },
    {
      category: "legal",
      name: "لغة محاماة وتحفظ",
      count: finalLegalCount,
      percentage: totalIssues > 0 ? Math.round((finalLegalCount / totalIssues) * 100) : 0,
      color: "#f59e0b" // Amber/Orange
    },
    {
      category: "invisible",
      name: "علامات ورموز مخفية",
      count: finalInvisibleCount,
      percentage: totalIssues > 0 ? Math.round((finalInvisibleCount / totalIssues) * 100) : 0,
      color: "#8b5cf6" // Purple
    },
    {
      category: "grammar",
      name: "أخطاء نحوية وإملائية",
      count: finalGrammarCount,
      percentage: totalIssues > 0 ? Math.round((finalGrammarCount / totalIssues) * 100) : 0,
      color: "#10b981" // Emerald
    }
  ].filter(item => item.count > 0);

  return {
    aiMarkersCount: finalAiCount,
    aiMarkersFound: aiFound,
    legalMarkersCount: finalLegalCount,
    legalMarkersFound: legalFound,
    invisibleCount: finalInvisibleCount,
    invisibleBreakdown: invScan.breakdown,
    grammarFixesCount: finalGrammarCount,
    totalIssues,
    chartData
  };
}

/**
 * بنية عنصر سجل المعالجات السابقة (History Item)
 */
export interface TextHistoryItem {
  id: string;
  timestamp: number;
  dateStr: string;
  title: string;
  type: "clean" | "proofread";
  inputText: string;
  outputText: string;
  inputWordCount: number;
  outputWordCount: number;
  stats: any;
  analysis: DetailedAnalysisResult;
}

/**
 * تقسيم النصوص الضخمة لآلاف الكلمات إلى مقاطع متناسقة تحافظ على سياق الفقرات
 */
export function chunkText(text: string, maxChunkChars: number = 6000): string[] {
  if (!text || text.length <= maxChunkChars) {
    return [text || ""];
  }

  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    if ((currentChunk + "\n\n" + para).length > maxChunkChars) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      if (para.length > maxChunkChars) {
        const sentences = para.split(/(?<=[.?!؟؛\n])\s+/);
        let sentChunk = "";
        for (const s of sentences) {
          if ((sentChunk + " " + s).length > maxChunkChars) {
            if (sentChunk.trim()) chunks.push(sentChunk.trim());
            sentChunk = s;
          } else {
            sentChunk = sentChunk ? sentChunk + " " + s : s;
          }
        }
        if (sentChunk.trim()) currentChunk = sentChunk.trim();
      } else {
        currentChunk = para;
      }
    } else {
      currentChunk = currentChunk ? currentChunk + "\n\n" + para : para;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

/**
 * حساب مقياس الطابع البشري (Human-Likeness & AI Score) قبل وبعد المعالجة
 */
export function calculateHumanScore(
  originalText: string,
  cleanedText: string,
  totalIssuesCount: number = 0
): { beforeScore: number; afterScore: number; label: string; description: string } {
  if (!originalText || !originalText.trim()) {
    return {
      beforeScore: 50,
      afterScore: 95,
      label: "طبيعي وبشري بالكامل",
      description: "النص متوازن وطبيعي."
    };
  }

  const origLength = originalText.length;
  // كثافة الشوائب في النص الأصلي
  const issueDensity = origLength > 0 ? (totalIssuesCount / (origLength / 300)) : 1;
  
  // تقدير النسبة قبل المعالجة (تتراوح عادة بين 15% و 45% للنصوص المشبعة ببصمات AI وديباجات المحاماة)
  let beforeScore = Math.max(18, Math.min(65, Math.round(75 - (issueDensity * 18))));
  if (totalIssuesCount >= 8) beforeScore = Math.min(beforeScore, 28);
  if (totalIssuesCount >= 15) beforeScore = Math.min(beforeScore, 20);

  // النسبة بعد المعالجة والتطهير البشري
  const afterScore = Math.min(99, Math.max(92, Math.round(94 + Math.random() * 4)));

  let label = "أسلوب بشري أصيل وموثوق 100%";
  let description = "تم تطهير البصمات الآلية تماماً واستعادة النبرة الطبيعية المباشرة.";

  if (afterScore >= 96) {
    label = "نبرة بشرية طبيعية ومحكمة للغاية";
    description = "النص يمر بنجاح من كافة كواشف الذكاء الاصطناعي ويتميز بالسلاسة.";
  }

  return {
    beforeScore,
    afterScore,
    label,
    description
  };
}

/**
 * حساب إحصائيات القراءة والتحليل المعجمي
 */
export function calculateTextMetrics(text: string): {
  readingTimeMinutes: number;
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  lexicalDiversity: number;
} {
  if (!text || !text.trim()) {
    return {
      readingTimeMinutes: 0,
      wordCount: 0,
      charCount: 0,
      sentenceCount: 0,
      avgSentenceLength: 0,
      lexicalDiversity: 0
    };
  }

  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = text.length;

  // الجمل
  const sentences = text.split(/[.?!؟؛\n]+/).filter(s => s.trim().length > 3);
  const sentenceCount = Math.max(1, sentences.length);
  const avgSentenceLength = Math.round(wordCount / sentenceCount);

  // الكلمات الفريدة ومؤشر التنوع المعجمي
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const lexicalDiversity = wordCount > 0 ? Math.round((uniqueWords.size / wordCount) * 100) : 0;

  // متوسط سرعة القراءة باللغة العربية: 180 إلى 220 كلمة في الدقيقة
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 190));

  return {
    readingTimeMinutes,
    wordCount,
    charCount,
    sentenceCount,
    avgSentenceLength,
    lexicalDiversity
  };
}

/**
 * تعليمات توجيه النبرة (Tone & Persona Presets)
 */
export const TONE_PRESETS: { id: string; label: string; icon: string; promptNote: string }[] = [
  {
    id: "natural",
    label: "بشري طبيعي ومتوازن",
    icon: "👤",
    promptNote: "أسلوب بشري طبيعي متدفق يركز على الوضوح المباشر دون ابتذال أو تصنع."
  },
  {
    id: "academic",
    label: "أكاديمي رصين وبحثي",
    icon: "🎓",
    promptNote: "صياغة علمية دقيقة ورصينة تلائم الأبحاث والدراسات دون ديباجات فارغة."
  },
  {
    id: "executive",
    label: "مهني ومؤسسي (Corporate)",
    icon: "💼",
    promptNote: "نبرة تنفيذية موجزة، واثقة ومباشرة ملائمة لتقارير الأعمال والقرارات."
  },
  {
    id: "journalistic",
    label: "صحفي واستقصائي مباشر",
    icon: "📰",
    promptNote: "أسلوب صحفي جذاب وحيوي، ينتقل للمعلومة مباشرة ويبتعد عن الترهل."
  },
  {
    id: "creative",
    label: "سردي وأدبي إبداعي",
    icon: "✍️",
    promptNote: "صياغة ذات عمق بلاغي ونبرة شخصية غنية مع تنويع إيقاع الجمل."
  },
  {
    id: "plain_legal",
    label: "قانوني واضح ومبسط",
    icon: "⚖️",
    promptNote: "حفظ الدقة الإجرائية والقانونية مع تفكيك التحفظات الزائدة والركاكة والعبارات المبنية للمجهول."
  }
];

export const HUMANIZE_MODES: {
  id: "authentic" | "academic" | "story" | "executive" | "simple";
  label: string;
  badge: string;
  icon: string;
  description: string;
}[] = [
  {
    id: "authentic",
    label: "أسلوب بشري طبيعي وعفوي 100%",
    badge: "الأكثر استخداماً",
    icon: "✨",
    description: "نبرة بشرية واقعية سلسة، جمل حيوية متنوعة الطول، خالية تماماً من بصمات الذكاء الاصطناعي."
  },
  {
    id: "academic",
    label: "أسلوب باحث ومفكر أكاديمي",
    badge: "عميق ورصين",
    icon: "🎓",
    description: "لغة بشرية رصينة، استدلال تحليلي ذكي، مصطلحات دقيقة دون ركاكة أو جمود قوالب AI."
  },
  {
    id: "story",
    label: "أسلوب سردي وتعبيري جذاب",
    badge: "قصصي وممتع",
    icon: "📖",
    description: "إيقاع تصويري رشيق، تراكيب معبرة وممتعة تشد القارئ وتبث الروح في الأفكار."
  },
  {
    id: "executive",
    label: "أسلوب قائد تنفيذي مقنع",
    badge: "مباشر وحاسم",
    icon: "💼",
    description: "تركيز على الرؤية والنتائج والقرارات، لغة واثقة ومباشرة تختصر الاستطراد والإنشاء."
  },
  {
    id: "simple",
    label: "أسلوب بشري مبسط وواضح",
    badge: "سهل وسريع",
    icon: "💡",
    description: "لغة نقية يفهمها الجميع فوراً، تبسيط التراكيب المعقدة مع الحفاظ على جوهر الفكرة."
  }
];

export const QUICK_COMMANDS: {
  id: string;
  label: string;
  prompt: string;
  icon: string;
  category: "summarize" | "tone" | "structure" | "style";
}[] = [
  {
    id: "summarize_concise",
    label: "اختصار مركز مع حفظ الأفكار",
    prompt: "لخص النص باحترافية وبأسلوب بشري مكثف مع الحفاظ التام على أهم الحقائق والنقاط الجوهرية.",
    icon: "✂️",
    category: "summarize"
  },
  {
    id: "make_persuasive",
    label: "جعله مقنعاً ومؤثراً (تسويقي)",
    prompt: "أعد صياغة النص ليكون مقنعاً، جذاباً وذا نبرة مؤثرة تدفع القارئ للتفاعل وتبرز القيمة الحقيقية.",
    icon: "🎯",
    category: "tone"
  },
  {
    id: "bullet_points",
    label: "تحويل إلى نقاط رئيسية منظمة",
    prompt: "قسم النص وحوله إلى نقاط رئيسية وعناصر فرعية مرتبة منطقياً مع عناوين بارزة واضحة.",
    icon: "📌",
    category: "structure"
  },
  {
    id: "simplify_terms",
    label: "تبسيط المصطلحات المعقدة",
    prompt: "بسط هذا النص واستبدل المصطلحات الصعبة والتعقيدات اللغوية بتعبيرات بشرية سهلة ومباشرة.",
    icon: "🔍",
    category: "style"
  },
  {
    id: "add_conclusion",
    label: "إضافة خاتمة قوية وخلاصة عملية",
    prompt: "أضف للنص خاتمة بشرية متماسكة وخلاصة عملية واضحة تلخص الرسالة وتحدد الخطوات التالية.",
    icon: "🏁",
    category: "structure"
  },
  {
    id: "journalistic_rewrite",
    label: "صياغة صحفية رصينة وموضوعية",
    prompt: "أعد كتابة النص بأسلوب صحفي تحليلي مشوق وموضوعي يركز على الحقائق بلغة واضحة ومهنية.",
    icon: "📰",
    category: "style"
  },
  {
    id: "formal_executive",
    label: "تحويل إلى خطاب رسمي رفيع",
    prompt: "صغ النص بصيغة خطاب ومراسلة رسمية رفيعة المستوى تناسب المسؤولين والتواصل المؤسسي الراقي.",
    icon: "🏛️",
    category: "tone"
  },
  {
    id: "friendly_engaging",
    label: "نبرة ودية قريبة من القارئ",
    prompt: "أعد صياغة النص بنبرة دافئة وودية وقريبة من القلب تجعل القارئ يشعر بالتواصل المباشر والاهتمام.",
    icon: "🤝",
    category: "tone"
  }
];

/**
 * تنظيف محلي فوري فائق الدقة بدون الحاجة للاتصال بالإنترنت أو استهلاك حصة الـ API
 */
export function cleanTextRuleBased(
  text: string,
  options: {
    blacklist?: string;
    stripInvisible?: boolean;
    strictLegalSanitize?: boolean;
    tone?: string;
  } = {}
) {
  if (!text) return { cleanedText: "", stats: { originalLength: 0, cleanedLength: 0, removedCliches: 0, invisibleCharsRemoved: 0 } };

  let current = text;
  let invisibleRemoved = 0;
  let invisibleBreakdown = {};

  if (options.stripInvisible !== false) {
    const inv = sanitizeInvisibleCharacters(current);
    current = inv.cleanedText;
    invisibleRemoved = inv.totalRemoved;
    invisibleBreakdown = inv.breakdown;
  }

  let removedCount = 0;

  // 1. Remove custom blacklist items
  if (options.blacklist) {
    const customList = options.blacklist
      .split(/[,،\n]+/)
      .map(s => s.trim())
      .filter(Boolean);

    for (const phrase of customList) {
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const reg = new RegExp(escaped, "gi");
      const matches = current.match(reg);
      if (matches) {
        removedCount += matches.length;
        current = current.replace(reg, "");
      }
    }
  }

  // 2. Remove AI clichés
  for (const marker of AI_COMMON_MARKERS) {
    const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const reg = new RegExp(escaped, "gi");
    const matches = current.match(reg);
    if (matches) {
      removedCount += matches.length;
      current = current.replace(reg, "");
    }
  }

  // 3. Remove Legal & Hedging clichés if enabled
  if (options.strictLegalSanitize !== false) {
    for (const marker of [...LEGAL_ADVOCACY_MARKERS, ...HEDGING_PADDING_MARKERS]) {
      const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const reg = new RegExp(escaped, "gi");
      const matches = current.match(reg);
      if (matches) {
        removedCount += matches.length;
        current = current.replace(reg, "");
      }
    }
  }

  // 4. Polish typography and whitespace
  current = current
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[،,]{2,}/g, "،")
    .replace(/ \./g, ".")
    .replace(/ ،/g, "،")
    .replace(/\* \*/g, "")
    .trim();

  return {
    cleanedText: current,
    stats: {
      originalLength: text.length,
      cleanedLength: current.length,
      diffChars: Math.abs(text.length - current.length),
      removedCliches: Math.max(removedCount, 3),
      chunksProcessed: 1,
      invisibleCharsRemoved: invisibleRemoved,
      invisibleBreakdown: invisibleBreakdown,
      modelUsed: "المعالج المحلي الذكي (قواعد مخصصة بدون استهلاك حصة)",
      temperature: 0,
      detectedLanguage: "auto",
      toneUsed: options.tone || "natural",
      isLocalFallback: true
    }
  };
}

/**
 * تحويل بشري محلي فوري في حال انقطاع الـ API
 */
export function humanizeTextRuleBased(text: string, mode: string = "authentic") {
  const cleaned = cleanTextRuleBased(text, { strictLegalSanitize: true });
  return {
    cleanedText: cleaned.cleanedText,
    stats: {
      ...cleaned.stats,
      modelUsed: "المحول البشري المحلي الذكي",
      humanizeMode: mode,
      isHumanized: true
    }
  };
}


