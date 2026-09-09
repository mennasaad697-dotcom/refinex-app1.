export interface FontOption {
  name: string;
  family: string;
  category: "arabic" | "english_sans" | "english_serif" | "monospace";
  description?: string;
}

export const FONT_OPTIONS: FontOption[] = [
  // Arabic Fonts
  { name: "Cairo (كايرو - عصري متوازن)", family: "'Cairo', sans-serif", category: "arabic" },
  { name: "Amiri (أميري - كلاسيكي أكاديمي)", family: "'Amiri', serif", category: "arabic" },
  { name: "Almarai (المراعي - واضح وعصري)", family: "'Almarai', sans-serif", category: "arabic" },
  { name: "Tajawal (تجوال - ناعم وجذاب)", family: "'Tajawal', sans-serif", category: "arabic" },
  { name: "Alexandria (الإسكندرية - هندسي أنيق)", family: "'Alexandria', sans-serif", category: "arabic" },
  { name: "Readex Pro (ريدكس - تقني دقيق)", family: "'Readex Pro', sans-serif", category: "arabic" },
  { name: "IBM Plex Sans Arabic (رسمي مؤسسي)", family: "'IBM Plex Sans Arabic', sans-serif", category: "arabic" },
  { name: "Noto Naskh Arabic (نسخ كلاسيكي)", family: "'Noto Naskh Arabic', serif", category: "arabic" },
  { name: "Noto Kufi Arabic (كوفي حديث)", family: "'Noto Kufi Arabic', sans-serif", category: "arabic" },
  { name: "Scheherazade New (شهرزاد - نسخ عثماني)", family: "'Scheherazade New', serif", category: "arabic" },
  { name: "El Messiri (المسيري - جمالي منحني)", family: "'El Messiri', sans-serif", category: "arabic" },
  { name: "Changa (تشانجا - عريض للعناوين)", family: "'Changa', sans-serif", category: "arabic" },
  { name: "Reem Kufi (ريم كوفي - تراثي)", family: "'Reem Kufi', sans-serif", category: "arabic" },
  { name: "Lateef (لطيف - رشيق خفيف)", family: "'Lateef', cursive", category: "arabic" },
  { name: "Tahoma (تاهوما المكتبي)", family: "Tahoma, Arial, sans-serif", category: "arabic" },
  { name: "Traditional Arabic", family: "'Traditional Arabic', Arial, serif", category: "arabic" },

  // English & Academic Serif
  { name: "Times New Roman (Word Academic)", family: "'Times New Roman', Times, serif", category: "english_serif" },
  { name: "Georgia (Google Docs Editorial)", family: "Georgia, serif", category: "english_serif" },
  { name: "Garamond (كلاسيكي أدبي)", family: "Garamond, serif", category: "english_serif" },
  { name: "Merriweather (قراءة مريحة)", family: "'Merriweather', serif", category: "english_serif" },
  { name: "Playfair Display (عناوين فاخرة)", family: "'Playfair Display', serif", category: "english_serif" },
  { name: "Lora (مجلات وبحوث)", family: "'Lora', serif", category: "english_serif" },
  { name: "Source Serif 4 (أكاديمي حديث)", family: "'Source Serif 4', serif", category: "english_serif" },

  // English Sans-Serif
  { name: "Arial (قياسي عالمي)", family: "Arial, sans-serif", category: "english_sans" },
  { name: "Calibri / Aptos (Word الحديث)", family: "Calibri, Aptos, Candara, sans-serif", category: "english_sans" },
  { name: "Inter (واجهات رقمية)", family: "'Inter', sans-serif", category: "english_sans" },
  { name: "Roboto (Google Docs)", family: "'Roboto', sans-serif", category: "english_sans" },
  { name: "Montserrat (عصري هندسي)", family: "'Montserrat', sans-serif", category: "english_sans" },
  { name: "Trebuchet MS", family: "'Trebuchet MS', sans-serif", category: "english_sans" },
  { name: "Verdana", family: "Verdana, sans-serif", category: "english_sans" },

  // Monospace
  { name: "JetBrains Mono (أكواد ومصفوفات)", family: "'JetBrains Mono', monospace", category: "monospace" },
  { name: "Courier New (آلة كاتبة)", family: "'Courier New', Courier, monospace", category: "monospace" }
];

export const FONT_SIZES = [
  { label: "8 pt", size: "1", px: "11px" },
  { label: "9 pt", size: "1", px: "12px" },
  { label: "10 pt", size: "2", px: "13px" },
  { label: "11 pt", size: "2", px: "14px" },
  { label: "12 pt (قياسي)", size: "3", px: "16px" },
  { label: "14 pt (متوسط)", size: "3", px: "18px" },
  { label: "16 pt (عريض)", size: "4", px: "21px" },
  { label: "18 pt (عنوان فرعي)", size: "5", px: "24px" },
  { label: "24 pt (عنوان رئيسي)", size: "6", px: "32px" },
  { label: "32 pt (ملصق كبير)", size: "7", px: "42px" },
  { label: "48 pt (غلاف)", size: "7", px: "64px" }
];

export const MATH_SYMBOLS = [
  "∑", "∏", "∫", "∬", "∭", "∮", "√", "∛", "∜", "∝", "∞", "∠", "⊥", "∆", "∇",
  "±", "∓", "×", "÷", "≠", "≈", "≡", "≤", "≥", "≪", "≫", "∈", "∉", "⊂", "⊃", "⊆", "⊇",
  "∪", "∩", "⊕", "⊗", "∴", "∵", "¬", "∧", "∨", "∀", "∃", "⇒", "⇔", "→", "←", "↔",
  "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ", "ν", "ξ", "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ", "ω",
  "Α", "Β", "Γ", "Δ", "Ε", "Ζ", "Η", "Θ", "Ι", "Κ", "Λ", "Μ", "Ν", "Ξ", "Π", "Ρ", "Σ", "Τ", "Υ", "Φ", "Χ", "Ψ", "Ω"
];
