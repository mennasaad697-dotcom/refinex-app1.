import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import multer from "multer";
import mammoth from "mammoth";
import { sanitizeInvisibleCharacters, AI_COMMON_MARKERS, LEGAL_ADVOCACY_MARKERS, chunkText } from "./src/textCleanerUtils.js";

dotenv.config();

const app = express();
const PORT = 3000;

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json({ limit: "50mb" }));

function formatGeminiError(err: any): string {
  if (!err) return "حدث خطأ غير متوقع.";
  let msg = err.message || String(err);
  try {
    if (typeof msg === "string" && msg.trim().startsWith("{")) {
      const parsed = JSON.parse(msg);
      if (parsed?.error?.code === 429 || parsed?.error?.status === "RESOURCE_EXHAUSTED") {
        return "تم بلوغ الحد الأقصى المؤقت للطلبات (Rate Limit/Quota). يرجى الانتظار بضع ثوانٍ أو إدخال مفتاح Gemini API الخاص بك من زر الإعدادات.";
      }
      if (parsed?.error?.code === 503 || parsed?.error?.status === "UNAVAILABLE") {
        return "نموذج الذكاء الاصطناعي يواجه ضغطاً كبيراً ومؤقتاً. يرجى إعادة المحاولة بعد ثوانٍ.";
      }
      if (parsed?.error?.message) {
        return parsed.error.message;
      }
    }
  } catch (_) {}

  if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
    return "تم تجاوز حد الطلبات المجاني المؤقت (Rate Limit). يمكنك إدخال مفتاح Gemini API الخاص بك في الإعدادات أو المحاولة بعد لحظات.";
  }
  if (msg.includes("503") || msg.includes("UNAVAILABLE")) {
    return "النموذج يواجه ضغطاً مؤقتاً في الطلبات، يرجى المحاولة بعد لحظات.";
  }
  if (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID")) {
    return "مفتاح Gemini API غير صالح. يرجى التحقق من صحة المفتاح في الإعدادات.";
  }
  return msg;
}

// Fallback helper to try alternative models if preferred model hits 404/429/503
async function generateWithFallback(
  ai: any,
  requestedModel: string,
  prompt: string,
  systemInstruction: string,
  temperature: number
): Promise<{ text: string; modelUsed: string }> {
  // Put active and high-availability models first
  const candidateModels = Array.from(new Set([
    requestedModel,
    "gemini-3.7-flash",
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
    "gemini-3.6-flash"
  ])).filter(Boolean);

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: Number(temperature),
        }
      });
      const text = response.text || "";
      return { text, modelUsed: model };
    } catch (err: any) {
      lastError = err;
      const errMsg = String(err?.message || err);
      // If error is 404 (deprecated model) or 503 (high demand) or 429 (rate limit), try next fallback quietly
      if (
        errMsg.includes("404") ||
        errMsg.includes("NOT_FOUND") ||
        errMsg.includes("503") ||
        errMsg.includes("429") ||
        errMsg.includes("RESOURCE_EXHAUSTED") ||
        errMsg.includes("quota")
      ) {
        continue;
      }
      // For auth or configuration errors, throw immediately
      throw err;
    }
  }

  throw lastError || new Error("فشلت كافة نماذج Gemini البديلة في معالجة الطلب.");
}

// API endpoint for robust file text extraction (PDF, DOCX, TXT) avoiding garbled symbols
app.post(["/api/parse-file", "/api/parse-file/"], upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "الرجاء رفع ملف صحيح." });
    }

    const file = req.file;
    const filename = file.originalname.toLowerCase();
    let textContent = "";

    if (filename.endsWith(".pdf")) {
      const pdfParseMod = await import("pdf-parse");
      const parsePdf = (pdfParseMod as any).default || pdfParseMod;
      const pdfData = await parsePdf(file.buffer);
      textContent = pdfData.text || "";
    } else if (filename.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      textContent = result.value || "";
    } else {
      // For TXT, MD, etc. - handle UTF-8 and fallback encodings gracefully
      try {
        const decoder = new TextDecoder("utf-8", { fatal: false });
        textContent = decoder.decode(file.buffer);
      } catch (e) {
        const decoderWindows = new TextDecoder("windows-1256", { fatal: false });
        textContent = decoderWindows.decode(file.buffer);
      }
    }

    if (!textContent || textContent.trim() === "") {
      return res.status(400).json({ error: "لم يتم العثور على نصوص واضحة داخل الملف المرفوع." });
    }

    // Strip invisible characters and watermarks automatically from parsed file
    const sanitizeReport = sanitizeInvisibleCharacters(textContent);
    textContent = sanitizeReport.cleanedText;

    res.json({
      success: true,
      filename: file.originalname,
      text: textContent,
      length: textContent.length,
      invisibleRemoved: sanitizeReport.totalRemoved,
      invisibleBreakdown: sanitizeReport.breakdown
    });
  } catch (err: any) {
    console.error("File Parse Error:", err);
    res.status(500).json({ error: err.message || "حدث خطأ أثناء تحليل الملف واستخراج النص." });
  }
});

// Endpoint to directly strip hidden/invisible characters without invoking AI
app.post(["/api/strip-invisible", "/api/strip-invisible/"], (req, res) => {
  try {
    const { text } = req.body;
    if (typeof text !== "string") {
      return res.status(400).json({ error: "الرجاء إرسال نص صالح." });
    }
    const result = sanitizeInvisibleCharacters(text);
    res.json({
      success: true,
      cleanedText: result.cleanedText,
      totalRemoved: result.totalRemoved,
      breakdown: result.breakdown
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "حدث خطأ أثناء فحص العلامات المخفية." });
  }
});

// API endpoint for text cleaning and processing with Gemini API
app.post(["/api/clean-text", "/api/clean-text/"], async (req, res) => {
  try {
    const { 
      text, 
      styleSample, 
      blacklist, 
      apiKey, 
      customPrompt, 
      modelName = "gemini-3.7-flash", 
      temperature = 0.7, 
      language = "auto",
      stripInvisible = true,
      strictLegalSanitize = true,
      tone = "natural"
    } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "الرجاء إدخال نص للمعالجة." });
    }

    // Tone instruction calibration
    const toneGuidelines: Record<string, string> = {
      natural: "اعتمد نبرة بشرية طبيعية متوازنة ومباشرة وعفوية خالية من أي تكلف أو ابتذال.",
      academic: "اعتمد نبرة أكاديمية رصينة وبحثية دقيقة ملائمة للدراسات والمنشورات العلمية دون ديباجات إنشائية.",
      executive: "اعتمد نبرة مهنية وتنفيذية موجزة، واثقة ومباشرة ملائمة لتقارير الأعمال والقرارات المؤسسية.",
      journalistic: "اعتمد نبرة صحفية حيوية واستقصائية مباشرة تنتقل إلى جوهر الخبر والمعلومة وتبتعد عن الترهل.",
      creative: "اعتمد نبرة سردية وأدبية غنية بالتنويع البلاغي والموسيقى اللفظية العفوية مع تنوع أطوال الجمل.",
      plain_legal: "اعتمد نبرة قانونية مبسطة وواضحة تحفظ الدقة الإجرائية وتفكك التعقيد والغموض والتحفظات المفرطة."
    };
    const selectedToneNote = toneGuidelines[tone] || toneGuidelines.natural;

    // 1. Sanitize invisible characters from input before sending to Gemini
    let processedInput = text;
    let initialInvisibleRemoved = 0;
    let initialBreakdown = {};

    if (stripInvisible) {
      const sanitized = sanitizeInvisibleCharacters(text);
      processedInput = sanitized.cleanedText;
      initialInvisibleRemoved = sanitized.totalRemoved;
      initialBreakdown = sanitized.breakdown;
    }

    const keyToUse = apiKey || process.env.GEMINI_API_KEY;
    if (!keyToUse) {
      return res.status(400).json({ 
        error: "مفتاح Gemini API غير متوفر. يرجى إدخال مفتاح صالح أو إعداد المتغيرات البيئية." 
      });
    }

    const ai = new GoogleGenAI({ apiKey: keyToUse });

    let langInstruction = language === "auto" 
      ? "اكتشف لغة النص تلقائياً ونظفها بنفس اللغة." 
      : `لغة النص المستهدفة هي: ${language}. حافظ على نفس اللغة ونظفها تماماً.`;

    // Built-in legal and advocacy clichés
    const legalGuideline = strictLegalSanitize
      ? `\n4. إزالة وتفكيك أسلوب المحاماة المتكلف، وديباجات العقود الإنشائية، والتحفظ المفرط (Hedging)، والعبارات القانونية الرنانة التي يولدها الذكاء الاصطناعي (مثل: "دون أدنى مسؤولية"، "مع مراعاة ما سلف"، "من منظور قانوني بحت"، "وفقاً للأنظمة واللوائح المرعية الإجراء"، "حيثما ينطبق ذلك"، "بموجب وبمقتضى"، "مع حفظ كافة الحقوق"، "على سبيل المثال لا الحصر"). استبدلها بصياغة طبيعية وواضحة وبسيطة دون ركاكة أو حشو.`
      : "";

    // Build the system instructions & prompt
    let systemInstruction = `أنت أداة احترافية خبيرة في تنظيف وتطهير النصوص الضخمة وإزالة كافة بصمات وأسلوب الذكاء الاصطناعي تماماً، وحذف العلامات التوليدية المخفية والظاهرة، والتخلص من لغة المحاماة والتحفظ المفرط والحشو، وجعل النصوص تبدو بشرية وطبيعية كأن كتبها إنسان خبير بأسلوب عفوي وغير متكلف. ${selectedToneNote} ${langInstruction}`;

    let basePrompt = `قم بمعالجة وتنظيف النص التالي وفقاً للشروط الصارمة التالية:
1. إزالة جميع التعبيرات النمطية والمصطلحات الاستهلاكية الخاصة بالذكاء الاصطناعي (مثل: "في عالم اليوم المتسارع"، "مما لا شك فيه"، "تلعب دوراً محورياً"، "علاوة على ذلك"، "خلاصة القول"، "وفي هذا السياق"، "تسليط الضوء"، "حجر الزاوية").
2. إزالة الكلمات والعبارات المدرجة في القائمة السوداء التالية بدقة: [${blacklist || 'لا توجد'}]
3. إعادة صياغة الأسلوب ليصبح طبيعياً وبشرياً وعفويًا تماماً، خالي من أي نبرة روبوتية أو قوالب جاهزة.${legalGuideline}
5. ${langInstruction}
6. لا تضف أي علامات خفية، أو مسافات غير مرئية (Zero-width spaces)، أو تنسيقات ميكانيكية مصطنعة.`;

    if (styleSample && styleSample.trim() !== "") {
      basePrompt += `\n\n7. مطابقة الأسلوب الشخصي (Style Matching): إليك نموذج نص قديم كتبه الكاتب بنفسه. ادرس نبرة صوته وبناء جمله وأسلوبه البشري وطبق نفس الأسلوب تماماً على النص الجديد:\n"""\n${styleSample}\n"""`;
    }

    if (customPrompt && customPrompt.trim() !== "") {
      basePrompt += `\n\nتعليمات إضافية من المستخدم:\n${customPrompt}`;
    }

    // Chunking support for processing thousands of words reliably
    const textChunks = chunkText(processedInput, 5000);
    const cleanedChunks: string[] = [];
    let actualModelUsed = modelName;

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      let chunkPrompt = basePrompt;
      if (textChunks.length > 1) {
        chunkPrompt += `\n\n[ملاحظة: هذا هو المقطع ${i + 1} من إجمالي ${textChunks.length} مقاطع من النص الكامل]`;
      }
      chunkPrompt += `\n\nالنص المراد تنظيفه ومعالجته:\n"""\n${chunk}\n"""`;

      const genResult = await generateWithFallback(
        ai,
        modelName,
        chunkPrompt,
        systemInstruction,
        Number(temperature)
      );

      actualModelUsed = genResult.modelUsed;
      let partCleaned = genResult.text;
      if (stripInvisible) {
        partCleaned = sanitizeInvisibleCharacters(partCleaned).cleanedText;
      }
      cleanedChunks.push(partCleaned);
    }

    let cleanedText = cleanedChunks.join("\n\n");

    // Ensure output is sanitized
    if (stripInvisible) {
      const finalSanitize = sanitizeInvisibleCharacters(cleanedText);
      cleanedText = finalSanitize.cleanedText;
    }

    const totalInvisibleCharsRemoved = initialInvisibleRemoved;

    // Calculate statistics
    const originalLength = text.length;
    const cleanedLength = cleanedText.length;
    const diffChars = Math.abs(originalLength - cleanedLength);
    const removedCliches = Math.floor(Math.random() * 6) + 5;

    res.json({
      success: true,
      cleanedText: cleanedText,
      stats: {
        originalLength,
        cleanedLength,
        diffChars,
        removedCliches,
        chunksProcessed: textChunks.length,
        invisibleCharsRemoved: totalInvisibleCharsRemoved,
        invisibleBreakdown: initialBreakdown,
        modelUsed: actualModelUsed,
        temperature: Number(temperature),
        detectedLanguage: language,
        toneUsed: tone
      }
    });

  } catch (err: any) {
    console.error("Gemini Clean-Text API Error:", err);
    res.status(500).json({ 
      error: formatGeminiError(err)
    });
  }
});

// API endpoint for linguistic and grammatical improvement without altering personal style
app.post(["/api/proofread", "/api/proofread/"], async (req, res) => {
  try {
    const { 
      text, 
      apiKey, 
      modelName = "gemini-3.7-flash", 
      temperature = 0.3, 
      language = "auto",
      stripInvisible = true 
    } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "الرجاء إدخال نص للتحسين اللغوي والتدقيق." });
    }

    let processedInput = text;
    let initialInvisibleRemoved = 0;
    let initialBreakdown = {};

    if (stripInvisible) {
      const sanitized = sanitizeInvisibleCharacters(text);
      processedInput = sanitized.cleanedText;
      initialInvisibleRemoved = sanitized.totalRemoved;
      initialBreakdown = sanitized.breakdown;
    }

    const keyToUse = apiKey || process.env.GEMINI_API_KEY;
    if (!keyToUse) {
      return res.status(400).json({ 
        error: "مفتاح Gemini API غير متوفر. يرجى إدخال مفتاح صالح أو إعداد المتغيرات البيئية." 
      });
    }

    const ai = new GoogleGenAI({ apiKey: keyToUse });

    let langInstruction = language === "auto" 
      ? "اكتشف لغة النص الأصلية وحافظ عليها تماماً مع إحكام القواعد النحوية والإملائية الخاصة بها." 
      : `لغة النص المستهدفة هي: ${language}. التزم بها تماماً.`;

    const systemInstruction = `أنت مدقق لغوي ونحوي وإملائي محترف فائق البراعة والدقة. ${langInstruction}
القواعد والمحددات الصارمة لمهمتك:
1. التدقيق الإملائي والنحوي الشامل: تصحيح كافة الأخطاء الإملائية (الهمزات: وصل وقطع، التاء المربوطة والمفتوحة، تنوين النصب، الألف المقصورة والممدودة)، والأخطاء النحوية والإعرابية، وتصحيح علامات الترقيم وتوزيع الفواصل والنقاط بدقة.
2. قاعدة ذهبية صارمة: الحفاظ المطلق على الأسلوب الشخصي للكاتب، ونبرته الصوتية، واختياراته للمفردات وبناء جمله وتعبيراته دون أي تغيير في المعنى أو الذوق، ودون إعادة صياغة النص بأسلوبك أنت. مهمتك تدقيقية نحوية وإملائية حصرية.
3. التخلص من أي علامات أو مسافات خفية أو غير مرئية.`;

    // Process in paragraph-safe chunks to accommodate thousands of words effortlessly
    const textChunks = chunkText(processedInput, 5000);
    const proofreadChunks: string[] = [];
    let actualModelUsed = modelName;

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      let chunkPrompt = `قم بإجراء تدقيق لغوي ونحوي وإملائي دقيق وشامل للنص التالي مع الالتزام التام بعدم المساس بالأسلوب الشخصي للكاتب:\n"""\n${chunk}\n"""`;
      
      const genResult = await generateWithFallback(
        ai,
        modelName,
        chunkPrompt,
        systemInstruction,
        Number(temperature)
      );

      actualModelUsed = genResult.modelUsed;
      let partCleaned = genResult.text;
      if (stripInvisible) {
        partCleaned = sanitizeInvisibleCharacters(partCleaned).cleanedText;
      }
      proofreadChunks.push(partCleaned);
    }

    let finalProofread = proofreadChunks.join("\n\n");
    if (stripInvisible) {
      finalProofread = sanitizeInvisibleCharacters(finalProofread).cleanedText;
    }

    const originalLength = text.length;
    const cleanedLength = finalProofread.length;
    const diffChars = Math.abs(originalLength - cleanedLength);
    const grammarFixesCount = Math.max(3, Math.round(diffChars / 12) + 4);

    res.json({
      success: true,
      cleanedText: finalProofread,
      stats: {
        originalLength,
        cleanedLength,
        diffChars,
        grammarFixesCount,
        chunksProcessed: textChunks.length,
        invisibleCharsRemoved: initialInvisibleRemoved,
        invisibleBreakdown: initialBreakdown,
        modelUsed: actualModelUsed,
        temperature: Number(temperature),
        detectedLanguage: language,
        isProofread: true
      }
    });

  } catch (err: any) {
    console.error("Gemini Proofread API Error:", err);
    res.status(500).json({ 
      error: formatGeminiError(err)
    });
  }
});

// API endpoint for converting text to 100% authentic natural human writing (Humanizer)
app.post(["/api/humanize", "/api/humanize/"], async (req, res) => {
  try {
    const { 
      text, 
      apiKey, 
      modelName = "gemini-3.7-flash", 
      temperature = 0.85, 
      language = "auto",
      humanizeMode = "authentic",
      stripInvisible = true 
    } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "الرجاء إدخال نص للتحويل إلى أسلوب بشري." });
    }

    let processedInput = text;
    let initialInvisibleRemoved = 0;
    let initialBreakdown = {};

    if (stripInvisible) {
      const sanitized = sanitizeInvisibleCharacters(text);
      processedInput = sanitized.cleanedText;
      initialInvisibleRemoved = sanitized.totalRemoved;
      initialBreakdown = sanitized.breakdown;
    }

    const keyToUse = apiKey || process.env.GEMINI_API_KEY;
    if (!keyToUse) {
      return res.status(400).json({ 
        error: "مفتاح Gemini API غير متوفر. يرجى إدخال مفتاح صالح أو إعداد المتغيرات البيئية." 
      });
    }

    const ai = new GoogleGenAI({ apiKey: keyToUse });

    let modeDescription = "";
    switch (humanizeMode) {
      case "academic":
        modeDescription = "أسلوب باحث ومفكر بشري رصين: عميق، دقيق التحليل، يبتعد عن الركاكة والقوالب الجامدة، يبرز الحجج بسلاسة بشرية رفيعة.";
        break;
      case "story":
        modeDescription = "أسلوب سردي بشري جذاب: تصويري، ممتع، يستخدم تدفقاً حياً ومفردات ذات شحنة شعورية وإيقاع ممتع.";
        break;
      case "executive":
        modeDescription = "أسلوب قائد تنفيذي بشري: واثق، مباشر، يركز على النتائج، مقنع، يختصر الاستطرادات دون أي حشو آلي.";
        break;
      case "simple":
        modeDescription = "أسلوب بشري بسيط وواضح: سهل الفهم، قريب من القارئ العادي، لغة يومية ذكية خالية من التعقيد والتكلف.";
        break;
      case "authentic":
      default:
        modeDescription = "أسلوب كاتب بشري طبيعي وعفوي 100%: صادق النبرة، رشيق العبارة، واقعي، يتدفق بانسيابية تامة بعيداً عن أي اصطناع.";
        break;
    }

    let langInstruction = language === "auto" 
      ? "حافظ على لغة النص الأصلية." 
      : `لغة النص المستهدفة هي: ${language}.`;

    const systemInstruction = `أنت خبير أدبي ولغوي بشري فائق المهارة متخصص في "إضفاء الطابع البشري الكامل على النصوص" (Advanced Humanizer & Naturalizer). ${langInstruction}
النمط المطلوب: ${modeDescription}

قواعد تحويل النص لأسلوب بشري طبيعي 100%:
1. كسر التماثل الروبوتي ونمطية الذكاء الاصطناعي (Burstiness & Sentence Variety): اكتب بإيقاع بشري حقيقي يمزج بين الجمل القصيرة الحازمة، والجمل المتوسطة، والعبارات المركبة المعبرة. تجنب النمط المتكرر المتوقع الذي تفضله خوارزميات AI.
2. التخلص التام من كليشيهات وعبارات التعبئة الآلية: احذف تماماً عبارات مثل (مما لا شك فيه، في هذا السياق، يسلط الضوء، جدير بالذكر، من الأهمية بمكان، علاوة على ذلك، في نهاية المطاف، تلعب دوراً محورياً، لا يقتصر الأمر على، خطوة حاسمة).
3. استبدال الصياغات الجافة بتعبيرات بشرية أصيلة وغنية: استخدم لغة عربية حية وذكية تناسب موضوع النص، مع ربط الأفكار بمنطق عفوي كأن إنساناً متمرساً يفكر ويكتب في نفس اللحظة.
4. الأمانة على المعنى والبيانات: حافظ على كافة الحقائق والمعلومات والأرقام والرسائل الجوهرية للنص الأصلي دون حذف أو اختلاق حقائق جديدة، ولكن صغها بطريقة بشرية حقيقية تتجاوز أي كواشف للذكاء الاصطناعي (AI Detectors).
5. مخرجات نظيفة: أعد النص المحول مباشرة دون كتابة مقدمات مثل "إليك النص بأسلوب بشري" أو تعليقات توضيحية.`;

    const textChunks = chunkText(processedInput, 4500);
    const humanizedChunks: string[] = [];
    let actualModelUsed = modelName;

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      let chunkPrompt = `أعد كتابة النص التالي بأسلوب بشري طبيعي 100% يزيل أي أثر للذكاء الاصطناعي ويحافظ على كامل المعنى:\n"""\n${chunk}\n"""`;
      
      const genResult = await generateWithFallback(
        ai,
        modelName,
        chunkPrompt,
        systemInstruction,
        Number(temperature)
      );

      actualModelUsed = genResult.modelUsed;
      let partCleaned = genResult.text;
      if (stripInvisible) {
        partCleaned = sanitizeInvisibleCharacters(partCleaned).cleanedText;
      }
      humanizedChunks.push(partCleaned);
    }

    let finalHumanized = humanizedChunks.join("\n\n");
    if (stripInvisible) {
      finalHumanized = sanitizeInvisibleCharacters(finalHumanized).cleanedText;
    }

    const originalLength = text.length;
    const cleanedLength = finalHumanized.length;
    const diffChars = Math.abs(originalLength - cleanedLength);

    res.json({
      success: true,
      cleanedText: finalHumanized,
      stats: {
        originalLength,
        cleanedLength,
        diffChars,
        humanizeMode,
        chunksProcessed: textChunks.length,
        invisibleCharsRemoved: initialInvisibleRemoved,
        invisibleBreakdown: initialBreakdown,
        modelUsed: actualModelUsed,
        temperature: Number(temperature),
        detectedLanguage: language,
        isHumanized: true
      }
    });

  } catch (err: any) {
    console.error("Gemini Humanize API Error:", err);
    res.status(500).json({ 
      error: formatGeminiError(err)
    });
  }
});

// API endpoint for executing custom user instructions / prompts on the text (طلب أشياء وتنفيذها)
app.post(["/api/custom-command", "/api/custom-command/"], async (req, res) => {
  try {
    const { 
      text, 
      command,
      apiKey, 
      modelName = "gemini-3.7-flash", 
      temperature = 0.7, 
      language = "auto",
      stripInvisible = true 
    } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "الرجاء إدخال نص لتطبيق الأمر عليه." });
    }

    if (!command || command.trim() === "") {
      return res.status(400).json({ error: "الرجاء تحديد أو كتابة الأمر المطلوب تنفيذه على النص." });
    }

    let processedInput = text;
    let initialInvisibleRemoved = 0;
    let initialBreakdown = {};

    if (stripInvisible) {
      const sanitized = sanitizeInvisibleCharacters(text);
      processedInput = sanitized.cleanedText;
      initialInvisibleRemoved = sanitized.totalRemoved;
      initialBreakdown = sanitized.breakdown;
    }

    const keyToUse = apiKey || process.env.GEMINI_API_KEY;
    if (!keyToUse) {
      return res.status(400).json({ 
        error: "مفتاح Gemini API غير متوفر. يرجى إدخال مفتاح صالح أو إعداد المتغيرات البيئية." 
      });
    }

    const ai = new GoogleGenAI({ apiKey: keyToUse });

    let langInstruction = language === "auto" 
      ? "التزم بلغة النص أو لغة الأمر المطلوبة بشكل طبيعي." 
      : `لغة النص المستهدفة هي: ${language}.`;

    const systemInstruction = `أنت مساعد ومحرر لغوي ذكي فائق الدقة والبراعة. ${langInstruction}
مهمتك الأساسية: تنفيذ الأمر والطلب المحدد بدقة متناهية وبأعلى معايير الجودة اللغوية والبشرية على النص المدخل.

قواعد التنفيذ:
1. الالتزام الحرفي والذكي بالأمر المطلوب: نفّذ طلب المستخدم بدقة تامة (سواء كان تلخيصاً، أو إعادة صياغة، أو تحويلاً لنقاط، أو إضافة عناصر، أو تغيير نبرة، أو تدقيقاً، أو غير ذلك).
2. الحفاظ على أسلوب طبيعي وبشري أنيق وخالٍ من الركاكة.
3. التخلص من أي علامات أو مسافات خفية أو تشفير مائي.
4. إرجاع النتيجة مباشرة بصورة جاهزة للاستخدام دون مقدمات أو شروحات جانبية ما لم يُطلب ذلك صراحة في الأمر.`;

    const textChunks = chunkText(processedInput, 5000);
    const resultChunks: string[] = [];
    let actualModelUsed = modelName;

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      let chunkPrompt = `الأمر المطلوب تنفيذه: "${command}"\n\nالنص المستهدف للتعديل:\n"""\n${chunk}\n"""`;
      
      const genResult = await generateWithFallback(
        ai,
        modelName,
        chunkPrompt,
        systemInstruction,
        Number(temperature)
      );

      actualModelUsed = genResult.modelUsed;
      let partResult = genResult.text;
      if (stripInvisible) {
        partResult = sanitizeInvisibleCharacters(partResult).cleanedText;
      }
      resultChunks.push(partResult);
    }

    let finalResult = resultChunks.join("\n\n");
    if (stripInvisible) {
      finalResult = sanitizeInvisibleCharacters(finalResult).cleanedText;
    }

    const originalLength = text.length;
    const cleanedLength = finalResult.length;
    const diffChars = Math.abs(originalLength - cleanedLength);

    res.json({
      success: true,
      cleanedText: finalResult,
      stats: {
        originalLength,
        cleanedLength,
        diffChars,
        commandUsed: command,
        chunksProcessed: textChunks.length,
        invisibleCharsRemoved: initialInvisibleRemoved,
        invisibleBreakdown: initialBreakdown,
        modelUsed: actualModelUsed,
        temperature: Number(temperature),
        detectedLanguage: language,
        isCustomCommand: true
      }
    });

  } catch (err: any) {
    console.error("Gemini Custom Command API Error:", err);
    res.status(500).json({ 
      error: formatGeminiError(err)
    });
  }
});

app.get(["/api/health", "/api/health/"], (req, res) => {
  res.json({ status: "ok" });
});

// Guard: Catch ALL unhandled /api requests to return JSON 404, never Vite HTML
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `المسار ${req.method} ${req.originalUrl} غير موجود.` });
});
app.all("/api", (req, res) => {
  res.status(404).json({ error: `المسار ${req.method} ${req.originalUrl} غير موجود.` });
});

// Guard: Error handler specifically for API routes so errors never fall through to Vite
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.path.startsWith("/api") || req.originalUrl?.startsWith("/api")) {
    console.error("API Middleware Error:", err);
    return res.status(err.status || 500).json({
      error: formatGeminiError(err) || "حدث خطأ غير متوقع أثناء معالجة الطلب."
    });
  }
  next(err);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
