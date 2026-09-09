"""
================================================================================
RefineX Pro Studio - Desktop-Grade Word Processor & AI Intelligence Suite
منصة سطح المكتب الشاملة: محرر مستندات Word احترافي + محرك ذكاء اصطناعي متعدد النماذج
(Google Gemini, OpenAI GPT-4o, Anthropic Claude, Local Ollama)
================================================================================
تصميم عصري فائق الجودة مستوحى من Notion و Obsidian باستخدام CustomTkinter
================================================================================
"""

import os
import sys
import time
import json
import sqlite3
import threading
import re
import urllib.request
import urllib.parse
import urllib.error
from pathlib import Path
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, colorchooser, font, scrolledtext

# ------------------------------------------------------------------------------
# فحص وتفعيل مكتبة CustomTkinter للتصميم الحديث
# ------------------------------------------------------------------------------
try:
    import customtkinter as ctk
    CTK_AVAILABLE = True
    ctk.set_appearance_mode("Dark")
    ctk.set_default_color_theme("blue")
except ImportError:
    CTK_AVAILABLE = False

# مكتبة Google Generative AI
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    genai = None
    GENAI_AVAILABLE = False

# مكتبة الصور Pillow
try:
    from PIL import Image, ImageTk
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

# مكتبة Word (.docx) الاحترافية
try:
    from docx import Document
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT
    from docx.enum.section import WD_SECTION_START
    from docx.oxml import OxmlElement, parse_xml
    from docx.oxml.ns import nsdecls, qn
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

# مكتبة PDF (PyPDF & ReportLab)
try:
    import pypdf
except ImportError:
    pypdf = None

try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.pdfgen import canvas
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

# مكتبة الاتصال Requests
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    requests = None
    REQUESTS_AVAILABLE = False


# ==============================================================================
# القوائم الذكية لكشف البصمات، الكليشيهات، واليونيكود الخفي
# ==============================================================================
AI_COMMON_MARKERS = [
    "في عالم اليوم المتسارع", "مما لا شك فيه", "تلعب دوراً محورياً",
    "علاوة على ذلك", "خلاصة القول", "وفي هذا السياق", "تسليط الضوء",
    "حجر الزاوية", "من الأهمية بمكان", "على صعيد آخر", "جدير بالذكر",
    "تجدر الإشارة إلى", "سلاح ذو حدين", "نقطة تحول", "أفق جديد",
    "بلا أدنى شك", "في نهاية المطاف", "ليس فقط بل أيضاً", "من نافلة القول",
    "يجدر بنا التأكيد", "في ضوء ما سبق", "الجدير بالملاحظة", "تكمن أهمية",
    "delve into", "tapestry", "beacon", "testament", "crucial role",
    "foster", "streamline", "leverage", "paradigm shift", "game changer",
    "holistic approach", "revolutionize", "seamlessly", "vital importance",
    "in today's fast-paced world", "it goes without saying", "at the end of the day"
]

LEGAL_ADVOCACY_MARKERS = [
    "دون أدنى مسؤولية", "مع مراعاة ما سلف", "من منظور قانوني بحت",
    "وفقاً للأنظمة واللوائح المرعية الإجراء", "حيثما ينطبق ذلك", "بموجب وبمقتضى",
    "مع حفظ كافة الحقوق", "على سبيل المثال لا الحصر", "بما لا يتعارض مع",
    "دون إخلال بما تقدم", "بحسب مقتضى الحال", "بناءً على ما تقدم",
    "في حدود ما يسمح به النظام", "وفقاً للأصول المرعية", "في هذا الشأن قانوناً"
]

SUPPORTED_PROVIDERS = {
    "Google Gemini": {
        "id": "gemini",
        "models": ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash", "gemini-1.5-pro"],
        "key_hint": "مفتاح Gemini API Key (يبدأ بـ AIza...)",
        "default_model": "gemini-2.5-flash"
    },
    "OpenAI": {
        "id": "openai",
        "models": ["gpt-4o", "gpt-4o-mini", "o1-mini", "o3-mini"],
        "key_hint": "مفتاح OpenAI API Key (يبدأ بـ sk-...)",
        "default_model": "gpt-4o"
    },
    "Anthropic Claude": {
        "id": "anthropic",
        "models": ["claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"],
        "key_hint": "مفتاح Anthropic API Key (يبدأ بـ sk-ant-...)",
        "default_model": "claude-3-7-sonnet-20250219"
    },
    "Ollama (محلي بدون إنترنت)": {
        "id": "ollama",
        "models": ["llama3.3", "deepseek-r1", "qwen2.5", "mistral", "phi4"],
        "key_hint": "عنوان خادم Ollama المحلي (افتراضي: http://localhost:11434)",
        "default_model": "llama3.3"
    }
}

DEFAULT_PROMPT_PRESETS = {
    "✨ تحويل بشري فائق (Humanizer 100%)": {
        "description": "إعادة صياغة كاملة بإيقاع بشري متنوع وحذف كليشيهات الذكاء الاصطناعي تماماً.",
        "system_instruction": "أنت كاتب ومحرر لغوي بشري فائق المهارة والعمق. أعد كتابة النص بإيقاع بشري حي ومتنوع مع تنويع أطوال الجمل واستخدام استعارات ذكية وإزالة كافة كليشيهات الذكاء الاصطناعي والترتيب النمطي، مع الحفاظ الصارم على كافة الحقائق والمعلومات.",
        "temperature": 0.85
    },
    "🎓 بحث / ورقة أكاديمية محكمة": {
        "description": "نبرة علمية رصينة، تسلسل منطقي، وتوثيق أكاديمي مع تدقيق منهجي دقيق.",
        "system_instruction": "أنت باحث ومحكم أكاديمي في مجلة علمية مرموقة. صغ النص بأسلوب علمي موضوعي ورصين، مع تنظيم الأفكار وتوثيق الروابط المنطقية وإزالة عبارات التكلف والإنشاء.",
        "temperature": 0.35
    },
    "📰 مقال صحفي وتحليلي": {
        "description": "صياغة صحفية رصينة بأسلوب سردي مشوق ومباشر وعناوين فرعية ذكية.",
        "system_instruction": "أنت صحفي استقصائي ومحرر خبير. حول النص إلى مقال صحفي جذاب ومحكم بلغة واضحة ورشيقة وعناوين فرعية جذابة بدون حشو أو كليشيهات.",
        "temperature": 0.70
    },
    "⚖️ تدقيق قانوني ورسمي صارم": {
        "description": "صياغة قانونية منضبطة ومحددة وإزالة الحشو والعبارات الفضفاضة.",
        "system_instruction": "أنت مستشار قانوني ومحرر تشريعات. أعد صياغة النص بأعلى درجات الدقة القانونية المباشرة مع حذف العبارات الفضفاضة والحشو الإنشائي.",
        "temperature": 0.20
    },
    "📧 بريد إلكتروني رسمي وتنفيذي": {
        "description": "مراسلة مهنية واضحة وموجزة تخاطب المستلم باحترافية وتدعو لإجراء مباشر.",
        "system_instruction": "أنت تنفيذي محترف. اكتب النص كبريد إلكتروني مهني موجز، منظم في نقاط محددة ويدعو لإجراء واضح دون إطالة.",
        "temperature": 0.50
    },
    "📱 منشور منصات التواصل والسوشيال": {
        "description": "منشور تفاعلي شيق وسريع القراءة مع مقاطع قصيرة تشجع على التفاعل.",
        "system_instruction": "أنت خبير صناعة محتوى رقمي. حول النص إلى منشور اجتماعي جذاب، سريع الإيقاع، ومحفز للتفاعل والنقاش مع تقسيم بصري مريح.",
        "temperature": 0.80
    }
}


# ==============================================================================
# محرك التحليل، كشف الحروف الخفية، وقياس النبرة البشرية
# ==============================================================================
def sanitize_invisible_chars(text: str) -> tuple[str, int]:
    """إزالة أحرف التتبع والمسافات الصفرية واليونيكود الخفي."""
    if not text:
        return "", 0
    invisible_chars = [
        '\u200B', '\u200C', '\u200D', '\u200E', '\u200F',
        '\uFEFF', '\u00AD', '\u2060', '\u2061', '\u2062',
        '\u2063', '\u2064', '\u180E', '\u0000', '\x00'
    ]
    count = sum(text.count(c) for c in invisible_chars)
    pattern = '[' + ''.join(re.escape(c) for c in invisible_chars) + ']'
    cleaned = re.sub(pattern, '', text)
    return cleaned, count


def analyze_text_metrics(text: str, custom_blacklist: list = None) -> dict:
    """تحليل شامل للنص: البصمة البشرية، التنوع الصوتي، وكواشف الذكاء الاصطناعي."""
    if not text or not text.strip():
        return {
            "char_count": 0, "word_count": 0, "sentence_count": 0,
            "avg_sentence_len": 0, "burstiness": 0, "human_score": 100,
            "ai_markers_found": [], "legal_markers_found": [],
            "custom_markers_found": [], "invisible_chars": 0
        }

    _, inv_count = sanitize_invisible_chars(text)
    words = re.findall(r'\b\w+\b', text)
    sentences = [s.strip() for s in re.split(r'[.!?؟\n]+', text) if s.strip()]
    sentence_lengths = [len(re.findall(r'\b\w+\b', s)) for s in sentences if len(re.findall(r'\b\w+\b', s)) > 0]

    word_count = len(words)
    sentence_count = len(sentences)
    avg_len = (word_count / sentence_count) if sentence_count > 0 else 0

    burstiness = 0.0
    if len(sentence_lengths) > 1:
        variance = sum((l - avg_len) ** 2 for l in sentence_lengths) / len(sentence_lengths)
        burstiness = variance ** 0.5

    ai_found = [m for m in AI_COMMON_MARKERS if m.lower() in text.lower()]
    legal_found = [m for m in LEGAL_ADVOCACY_MARKERS if m.lower() in text.lower()]
    custom_found = []
    if custom_blacklist:
        for m in custom_blacklist:
            if m.strip() and m.strip().lower() in text.lower():
                custom_found.append(m.strip())

    penalty = (len(ai_found) * 12) + (len(legal_found) * 8) + (len(custom_found) * 10) + (inv_count * 2)
    burstiness_bonus = min(20, int(burstiness * 1.8))
    score = max(5, min(99, int(85 - penalty + burstiness_bonus)))
    if not ai_found and not legal_found and not custom_found and burstiness > 5:
        score = 98

    return {
        "char_count": len(text),
        "word_count": word_count,
        "sentence_count": sentence_count,
        "avg_sentence_len": round(avg_len, 1),
        "burstiness": round(burstiness, 1),
        "human_score": score,
        "ai_markers_found": ai_found,
        "legal_markers_found": legal_found,
        "custom_markers_found": custom_found,
        "invisible_chars": inv_count
    }


# ==============================================================================
# محرك الاتصال متعدد النماذج (Multi-Model AI Client)
# ==============================================================================
class MultiModelAIClient:
    @staticmethod
    def call_gemini(api_key: str, model_name: str, prompt: str, system_instruction: str, temperature: float = 0.75) -> str:
        if not GENAI_AVAILABLE:
            raise ImportError("مكتبة google-generativeai غير مثبتة. يرجى تثبيتها عبر `pip install google-generativeai`")
        if not api_key:
            raise ValueError("مفتاح Google Gemini API Key مفقود.")

        genai.configure(api_key=api_key)
        generation_config = {
            "temperature": temperature,
            "top_p": 0.95,
            "max_output_tokens": 8192,
        }
        model = genai.GenerativeModel(
            model_name=model_name,
            generation_config=generation_config,
            system_instruction=system_instruction
        )
        response = model.generate_content(prompt)
        return response.text if response else ""

    @staticmethod
    def call_openai(api_key: str, model_name: str, prompt: str, system_instruction: str, temperature: float = 0.75) -> str:
        if not api_key:
            raise ValueError("مفتاح OpenAI API Key مفقود.")
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            "temperature": temperature
        }
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=90) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data["choices"][0]["message"]["content"]

    @staticmethod
    def call_anthropic(api_key: str, model_name: str, prompt: str, system_instruction: str, temperature: float = 0.75) -> str:
        if not api_key:
            raise ValueError("مفتاح Anthropic API Key مفقود.")
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model_name,
            "system": system_instruction,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 4096,
            "temperature": temperature
        }
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=90) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data["content"][0]["text"]

    @staticmethod
    def call_ollama(base_url: str, model_name: str, prompt: str, system_instruction: str, temperature: float = 0.75) -> str:
        url = f"{base_url.rstrip('/')}/api/generate"
        full_prompt = f"System: {system_instruction}\n\nUser: {prompt}\n\nAssistant:"
        payload = {
            "model": model_name,
            "prompt": full_prompt,
            "stream": False,
            "options": {"temperature": temperature}
        }
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={"Content-Type": "application/json"}, method='POST')
        with urllib.request.urlopen(req, timeout=120) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data.get("response", "")


# ==============================================================================
# قاعدة البيانات المحلية لإدارة السجلات والمستندات
# ==============================================================================
class RefineXDatabase:
    def __init__(self, db_path="refinex_data.db"):
        self.db_path = db_path
        self.init_db()

    def init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT,
                    provider TEXT,
                    model TEXT,
                    original_text TEXT,
                    processed_text TEXT,
                    human_score INTEGER,
                    burstiness REAL
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT
                )
            """)
            conn.commit()

    def add_history(self, provider, model, orig, proc, score, burst):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO history (timestamp, provider, model, original_text, processed_text, human_score, burstiness)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (time.strftime("%Y-%m-%d %H:%M:%S"), provider, model, orig, proc, score, burst))
            conn.commit()

    def get_history(self, limit=50):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, timestamp, model, human_score, original_text, processed_text FROM history ORDER BY id DESC LIMIT ?", (limit,))
            return cursor.fetchall()

    def save_setting(self, key, value):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, str(value)))
            conn.commit()

    def get_setting(self, key, default=""):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM settings WHERE key = ?", (key,))
            row = cursor.fetchone()
            return row[0] if row else default


# ==============================================================================
# النافذة الرئيسية لتطبيق RefineX Pro Studio بتصميم عصري راقٍ
# ==============================================================================
class RefineXStudio(ctk.CTk if CTK_AVAILABLE else tk.Tk):
    def __init__(self):
        super().__init__()

        # إعدادات النافذة الأساسية
        self.title("RefineX - Advanced Word Studio & AI Multi-Model Suite")
        self.geometry("1450x920")
        self.minsize(1150, 780)

        self.db = RefineXDatabase()
        self.load_configuration()

        # بيانات المحرر الأكاديمي المتقدم
        self.doc_footnotes = []     # الهوامش السفلية
        self.doc_endnotes = []      # الهوامش الختامية والمراجع
        self.page_border_style = "box"  # none, box, double, decorative
        self.page_watermark_text = ""
        self.page_bg_color = "#FFFFFF"
        self.text_font_family = "Arial"
        self.text_font_size = 14
        self.text_color = "#1E293B"
        self.custom_blacklist = [m.strip() for m in self.config_data.get("blacklist", "").split(",") if m.strip()]
        self.presets = DEFAULT_PROMPT_PRESETS.copy()

        self.is_processing = False
        self.cancel_requested = False
        self.active_section = "word"  # word, ai, batch, diff, history, settings

        # بناء الواجهة الهندسية المحدثة
        self.build_modern_shell()

    def load_configuration(self):
        """تحميل الإعدادات المخزنة محلياً."""
        self.config_data = {
            "selected_provider": self.db.get_setting("selected_provider", "Google Gemini"),
            "selected_model": self.db.get_setting("selected_model", "gemini-2.5-flash"),
            "gemini_api_key": self.db.get_setting("gemini_api_key", os.environ.get("GEMINI_API_KEY", "")),
            "openai_api_key": self.db.get_setting("openai_api_key", os.environ.get("OPENAI_API_KEY", "")),
            "anthropic_api_key": self.db.get_setting("anthropic_api_key", os.environ.get("ANTHROPIC_API_KEY", "")),
            "ollama_url": self.db.get_setting("ollama_url", "http://localhost:11434"),
            "blacklist": self.db.get_setting("blacklist", "علاوة على ذلك, في عالم اليوم, تسليط الضوء, حجر الزاوية, دون أدنى مسؤولية"),
            "appearance_mode": self.db.get_setting("appearance_mode", "Dark"),
        }
        if CTK_AVAILABLE:
            ctk.set_appearance_mode(self.config_data.get("appearance_mode", "Dark"))

    def save_configuration(self):
        for k, v in self.config_data.items():
            self.db.save_setting(k, v)

    # --------------------------------------------------------------------------
    # هيكل الواجهة الحديث (Sidebar + Main Content Area + Status Ribbon)
    # --------------------------------------------------------------------------
    def build_modern_shell(self):
        # الحاوية الكلية
        self.main_container = ctk.CTkFrame(self, corner_radius=0) if CTK_AVAILABLE else tk.Frame(self, bg="#0F172A")
        self.main_container.pack(fill="both", expand=True)

        # 1. الشريط الجانبي الأنيق (Sidebar)
        self.build_sidebar()

        # 2. منطقة العمل الرئيسية (Right Content Pane)
        self.content_area = ctk.CTkFrame(self.main_container, corner_radius=0, fg_color="transparent") if CTK_AVAILABLE else tk.Frame(self.main_container, bg="#1E293B")
        self.content_area.pack(side="right", fill="both", expand=True)

        # الشريط العلوي التفاعلي (Top Bar with breadcrumbs & quick stats)
        self.build_top_bar()

        # حاوية التبديل بين الأقسام
        self.views_container = ctk.CTkFrame(self.content_area, corner_radius=10) if CTK_AVAILABLE else tk.Frame(self.content_area, bg="#0F172A")
        self.views_container.pack(fill="both", expand=True, padx=16, pady=(0, 10))

        # بناء المشاهد المختلفة
        self.views = {}
        self.build_all_views()

        # الشريط السفلي للحالة
        self.build_status_bar()

        # إظهار قسم Word افتراضياً
        self.switch_section("word")

    def build_sidebar(self):
        """الشريط الجانبي الحديث للتنقل السلس."""
        self.sidebar = ctk.CTkFrame(self.main_container, width=240, corner_radius=0) if CTK_AVAILABLE else tk.Frame(self.main_container, width=240, bg="#0F172A")
        self.sidebar.pack(side="left", fill="y")
        self.sidebar.pack_propagate(False)

        # الشعار والهوية
        logo_frame = ctk.CTkFrame(self.sidebar, fg_color="transparent") if CTK_AVAILABLE else tk.Frame(self.sidebar, bg="#0F172A")
        logo_frame.pack(fill="x", padx=16, pady=(20, 16))

        logo_title = ctk.CTkLabel(
            logo_frame,
            text="⚡ RefineX Pro",
            font=ctk.CTkFont(family="Arial", size=20, weight="bold") if CTK_AVAILABLE else ("Arial", 18, "bold"),
            text_color="#60A5FA" if CTK_AVAILABLE else "#60A5FA"
        ) if CTK_AVAILABLE else tk.Label(logo_frame, text="⚡ RefineX Pro", font=("Arial", 18, "bold"), fg="#60A5FA", bg="#0F172A")
        logo_title.pack(anchor="w")

        logo_subtitle = ctk.CTkLabel(
            logo_frame,
            text="Word Studio & AI Suite",
            font=ctk.CTkFont(family="Arial", size=11) if CTK_AVAILABLE else ("Arial", 10),
            text_color="#94A3B8" if CTK_AVAILABLE else "#94A3B8"
        ) if CTK_AVAILABLE else tk.Label(logo_frame, text="Word Studio & AI Suite", font=("Arial", 10), fg="#94A3B8", bg="#0F172A")
        logo_subtitle.pack(anchor="w", pady=(2, 0))

        # خط فاصل ناعم
        if CTK_AVAILABLE:
            sep = ctk.CTkFrame(self.sidebar, height=1, fg_color="#334155")
            sep.pack(fill="x", padx=16, pady=(0, 15))

        # أزرار التنقل الرئيسية
        self.nav_buttons = {}
        nav_items = [
            ("word", "📝 محرر Word Studio", "محرر مستندات مكتبي كامل وتنسيق أكاديمي"),
            ("ai", "✨ محول الصياغة والتطهير", "Humanizer & تصفية البصمات والأرقام"),
            ("batch", "⚡ معالجة الدفعات", "معالجة ملفات DOCX/PDF متعددة"),
            ("diff", "🔍 المقارنة المتزامنة", "Synchronized Diff Viewer"),
            ("history", "📜 السجل والتقارير", "أرشيف النصوص وسجل العمليات"),
            ("settings", "⚙️ الإعدادات والنماذج", "مفاتيح API ومزودي الذكاء الاصطناعي")
        ]

        for sec_id, title, desc in nav_items:
            btn = ctk.CTkButton(
                self.sidebar,
                text=title,
                font=ctk.CTkFont(family="Arial", size=13, weight="bold") if CTK_AVAILABLE else ("Arial", 11, "bold"),
                anchor="w",
                height=42,
                corner_radius=8,
                fg_color="transparent",
                text_color="#CBD5E1" if CTK_AVAILABLE else "white",
                hover_color="#1E293B" if CTK_AVAILABLE else "#1E293B",
                command=lambda s=sec_id: self.switch_section(s)
            ) if CTK_AVAILABLE else tk.Button(
                self.sidebar,
                text=title,
                font=("Arial", 11),
                anchor="w",
                bg="#0F172A",
                fg="white",
                relief="flat",
                command=lambda s=sec_id: self.switch_section(s)
            )
            btn.pack(fill="x", padx=12, pady=4)
            self.nav_buttons[sec_id] = btn

        # بطاقة حالة الاتصال السريع في أسفل الشريط الجانبي
        card_conn = ctk.CTkFrame(self.sidebar, corner_radius=8, fg_color="#1E293B") if CTK_AVAILABLE else tk.Frame(self.sidebar, bg="#1E293B")
        card_conn.pack(side="bottom", fill="x", padx=12, pady=16)

        lbl_engine = ctk.CTkLabel(
            card_conn,
            text="🟢 المحرك النشط:",
            font=ctk.CTkFont(size=10, weight="bold") if CTK_AVAILABLE else ("Arial", 9, "bold"),
            text_color="#10B981"
        ) if CTK_AVAILABLE else tk.Label(card_conn, text="🟢 المحرك النشط:", font=("Arial", 9, "bold"), fg="#10B981", bg="#1E293B")
        lbl_engine.pack(anchor="w", padx=10, pady=(8, 2))

        self.lbl_active_model_badge = ctk.CTkLabel(
            card_conn,
            text=f"{self.config_data.get('selected_model', 'gemini-2.5-flash')}",
            font=ctk.CTkFont(size=11) if CTK_AVAILABLE else ("Arial", 9),
            text_color="#E2E8F0"
        ) if CTK_AVAILABLE else tk.Label(card_conn, text=f"{self.config_data.get('selected_model', 'gemini-2.5-flash')}", font=("Arial", 9), fg="white", bg="#1E293B")
        self.lbl_active_model_badge.pack(anchor="w", padx=10, pady=(0, 8))

    def build_top_bar(self):
        """شريط الرأس العلوي مع مسار التنقل ومفاتيح التبديل السريع."""
        top_frame = ctk.CTkFrame(self.content_area, height=52, corner_radius=0, fg_color="transparent") if CTK_AVAILABLE else tk.Frame(self.content_area, height=52, bg="#1E293B")
        top_frame.pack(fill="x", padx=16, pady=(12, 10))

        self.lbl_section_title = ctk.CTkLabel(
            top_frame,
            text="📝 محرر مستندات Word Studio الاحترافي",
            font=ctk.CTkFont(family="Arial", size=17, weight="bold") if CTK_AVAILABLE else ("Arial", 15, "bold"),
            text_color="#F8FAFC"
        ) if CTK_AVAILABLE else tk.Label(top_frame, text="📝 محرر مستندات Word Studio الاحترافي", font=("Arial", 15, "bold"), fg="white", bg="#1E293B")
        self.lbl_section_title.pack(side="left", pady=5)

        # أزرار التبديل السريع للوضع الليلي / النهاري
        if CTK_AVAILABLE:
            self.mode_switch = ctk.CTkSegmentedButton(
                top_frame,
                values=["Dark", "Light", "System"],
                command=self.change_appearance_mode,
                height=28
            )
            self.mode_switch.set(self.config_data.get("appearance_mode", "Dark"))
            self.mode_switch.pack(side="right", padx=6)

    def change_appearance_mode(self, new_mode):
        if CTK_AVAILABLE:
            ctk.set_appearance_mode(new_mode)
            self.config_data["appearance_mode"] = new_mode
            self.db.save_setting("appearance_mode", new_mode)

    def switch_section(self, section_id):
        self.active_section = section_id

        # تحديث ألوان الأزرار في الشريط الجانبي
        for sid, btn in self.nav_buttons.items():
            if CTK_AVAILABLE:
                if sid == section_id:
                    btn.configure(fg_color="#2563EB", text_color="#FFFFFF")
                else:
                    btn.configure(fg_color="transparent", text_color="#CBD5E1")

        # إخفاء جميع المشاهد وإظهار المشهد المطلوب
        for sid, v in self.views.items():
            v.pack_forget()

        if section_id in self.views:
            self.views[section_id].pack(fill="both", expand=True, padx=6, pady=6)

        # تحديث عنوان الرأس
        titles = {
            "word": "📝 محرر مستندات Word Studio الاحترافي & التنسيق الأكاديمي",
            "ai": "✨ محول الصياغة البشرية الفائق وتطهير بصمات AI",
            "batch": "⚡ معالجة الدفعات للمستندات المتعددة (DOCX / PDF / TXT)",
            "diff": "🔍 المقارنة المتزامنة ومطابقة الفروقات (Diff Viewer)",
            "history": "📜 السجل الأكاديمي والتقارير المحفوظة",
            "settings": "⚙️ إعدادات النماذج والربط متعدد المزودين (Multi-Model AI)"
        }
        self.lbl_section_title.configure(text=titles.get(section_id, "RefineX Studio"))

    def build_all_views(self):
        # 1. مشهد Word Studio
        self.views["word"] = self.create_word_view()
        # 2. مشهد AI Humanizer
        self.views["ai"] = self.create_ai_view()
        # 3. مشهد Batch Processing
        self.views["batch"] = self.create_batch_view()
        # 4. مشهد Diff Viewer
        self.views["diff"] = self.create_diff_view()
        # 5. مشهد History
        self.views["history"] = self.create_history_view()
        # 6. مشهد Settings
        self.views["settings"] = self.create_settings_view()

    # ==========================================================================
    # 1. مشهد محرر مستندات Word المكتبي (Word Studio View)
    # ==========================================================================
    def create_word_view(self):
        frame = ctk.CTkFrame(self.views_container, corner_radius=8, fg_color="transparent") if CTK_AVAILABLE else tk.Frame(self.views_container)

        # 1. شريط الأدوات العلوي المقسم هندسياً (Ribbon Toolbar)
        ribbon_card = ctk.CTkFrame(frame, corner_radius=8, fg_color="#1E293B" if CTK_AVAILABLE else "#F1F5F9") if CTK_AVAILABLE else tk.Frame(frame, bg="#F1F5F9", bd=1, relief="ridge")
        ribbon_card.pack(side="top", fill="x", padx=4, pady=4)

        # صف أدوات الخط والتنسيق والألوان
        r1 = tk.Frame(ribbon_card, bg="#1E293B" if CTK_AVAILABLE else "#F1F5F9")
        r1.pack(side="top", fill="x", padx=6, pady=4)

        # مجموعة الخط
        tk.Label(r1, text="الخط:", font=("Arial", 9, "bold"), fg="#E2E8F0" if CTK_AVAILABLE else "#1E293B", bg="#1E293B" if CTK_AVAILABLE else "#F1F5F9").pack(side="left", padx=2)
        self.font_family_var = tk.StringVar(value="Arial")
        fonts_list = ["Arial", "Calibri", "Times New Roman", "Segoe UI", "Tahoma", "Traditional Arabic", "Amiri"]
        cb_font = ttk.Combobox(r1, textvariable=self.font_family_var, values=fonts_list, width=14, state="readonly")
        cb_font.pack(side="left", padx=2)
        cb_font.bind("<<ComboboxSelected>>", lambda e: self.apply_font_family())

        tk.Label(r1, text="الحجم:", font=("Arial", 9, "bold"), fg="#E2E8F0" if CTK_AVAILABLE else "#1E293B", bg="#1E293B" if CTK_AVAILABLE else "#F1F5F9").pack(side="left", padx=4)
        self.font_size_var = tk.StringVar(value="14")
        sizes_list = ["10", "11", "12", "14", "16", "18", "20", "24", "28", "32", "36"]
        cb_size = ttk.Combobox(r1, textvariable=self.font_size_var, values=sizes_list, width=4, state="readonly")
        cb_size.pack(side="left", padx=2)
        cb_size.bind("<<ComboboxSelected>>", lambda e: self.apply_font_size())

        # أزرار التنسيق الأساسية
        for sym, fn, w in [("B", self.toggle_bold, 3), ("I", self.toggle_italic, 3), ("U", self.toggle_underline, 3), ("S̶", self.toggle_strikethrough, 3)]:
            btn = tk.Button(r1, text=sym, font=("Arial", 9, "bold"), width=w, command=fn, bg="#334155", fg="white", relief="groove")
            btn.pack(side="left", padx=2)

        # التلوين والتظليل
        btn_fg = tk.Button(r1, text="🎨 لون الخط", font=("Arial", 9), command=self.choose_text_color, bg="#334155", fg="white", relief="groove")
        btn_fg.pack(side="left", padx=4)
        btn_hl = tk.Button(r1, text="🖍️ تظليل", font=("Arial", 9), command=self.choose_highlight_color, bg="#334155", fg="white", relief="groove")
        btn_hl.pack(side="left", padx=2)
        btn_bg = tk.Button(r1, text="📄 خلفية الصفحة", font=("Arial", 9), command=self.choose_page_bg, bg="#334155", fg="white", relief="groove")
        btn_bg.pack(side="left", padx=2)

        # المحاذاة
        for al, label in [("left", "⫷ يسار"), ("center", "≡ وسط"), ("right", "يمين ⫸")]:
            btn = tk.Button(r1, text=label, font=("Arial", 9), command=lambda a=al: self.set_alignment(a), bg="#334155", fg="white", relief="groove")
            btn.pack(side="left", padx=1)

        # زر الذكاء الاصطناعي الفوري
        btn_ai_action = tk.Button(
            r1,
            text="✨ تطهير وأنسنة النص المحدد فورياً بالذكاء الاصطناعي",
            font=("Arial", 9, "bold"),
            bg="#2563EB",
            fg="white",
            command=self.process_selected_text_with_ai,
            relief="raised",
            cursor="hand2"
        )
        btn_ai_action.pack(side="right", padx=6)

        # صف أدوات العناصر والجداول والتوثيق الأكاديمي
        r2 = tk.Frame(ribbon_card, bg="#1E293B" if CTK_AVAILABLE else "#F1F5F9")
        r2.pack(side="top", fill="x", padx=6, pady=4)

        btn_tbl = tk.Button(r2, text="📊 إدراج جدول", font=("Arial", 9), command=self.dialog_insert_table, bg="#334155", fg="white", relief="groove")
        btn_tbl.pack(side="left", padx=2)
        btn_bullet = tk.Button(r2, text="• قائمة نقطية", font=("Arial", 9), command=self.insert_bullet_list, bg="#334155", fg="white", relief="groove")
        btn_bullet.pack(side="left", padx=2)
        btn_num = tk.Button(r2, text="1. قائمة رقمية", font=("Arial", 9), command=self.insert_numbered_list, bg="#334155", fg="white", relief="groove")
        btn_num.pack(side="left", padx=2)

        tk.Label(r2, text="| التوثيق الأكاديمي:", font=("Arial", 9, "bold"), fg="#F59E0B", bg="#1E293B" if CTK_AVAILABLE else "#F1F5F9").pack(side="left", padx=4)
        btn_fn = tk.Button(r2, text="🔖 هامش سفلي (Footnote)", font=("Arial", 9, "bold"), command=self.dialog_add_footnote, bg="#F59E0B", fg="black", relief="groove")
        btn_fn.pack(side="left", padx=2)
        btn_en = tk.Button(r2, text="📚 هامش ختامي (Endnote)", font=("Arial", 9, "bold"), command=self.dialog_add_endnote, bg="#6366F1", fg="white", relief="groove")
        btn_en.pack(side="left", padx=2)

        tk.Label(r2, text="| تصميم الصفحة:", font=("Arial", 9, "bold"), fg="#38BDF8", bg="#1E293B" if CTK_AVAILABLE else "#F1F5F9").pack(side="left", padx=4)
        btn_border = tk.Button(r2, text="🖼️ إطار الصفحة", font=("Arial", 9), command=self.dialog_page_border, bg="#334155", fg="white", relief="groove")
        btn_border.pack(side="left", padx=2)
        btn_wm = tk.Button(r2, text="💧 علامة مائية", font=("Arial", 9), command=self.dialog_watermark, bg="#334155", fg="white", relief="groove")
        btn_wm.pack(side="left", padx=2)
        btn_find = tk.Button(r2, text="🔍 بحث واستبدال", font=("Arial", 9), command=self.dialog_find_replace, bg="#334155", fg="white", relief="groove")
        btn_find.pack(side="left", padx=2)

        # أزرار الاستيراد والتصدير
        btn_exp_docx = tk.Button(r2, text="💾 حفظ DOCX", font=("Arial", 9, "bold"), bg="#059669", fg="white", command=self.export_word_docx, relief="raised")
        btn_exp_docx.pack(side="right", padx=3)
        btn_exp_pdf = tk.Button(r2, text="📑 تصدير PDF", font=("Arial", 9, "bold"), bg="#DC2626", fg="white", command=self.export_word_pdf, relief="raised")
        btn_exp_pdf.pack(side="right", padx=3)
        btn_imp = tk.Button(r2, text="📂 استيراد ملف", font=("Arial", 9), command=self.import_document_file, bg="#334155", fg="white", relief="groove")
        btn_imp.pack(side="right", padx=3)

        # 2. منطقة العمل التفاعلية (Canvas + Footnotes Drawer)
        work_area = tk.Frame(frame, bg="#0F172A" if CTK_AVAILABLE else "#E2E8F0")
        work_area.pack(fill="both", expand=True, padx=4, pady=4)

        # الشريط الجانبي للمراجع الأكاديمية
        side_notes = tk.Frame(work_area, width=280, bg="#1E293B" if CTK_AVAILABLE else "#F8FAFC", bd=1, relief="groove")
        side_notes.pack(side="left", fill="y", padx=3, pady=3)
        side_notes.pack_propagate(False)

        tk.Label(side_notes, text="📑 الهوامش والمراجع الأكاديمية", font=("Arial", 10, "bold"), fg="#38BDF8" if CTK_AVAILABLE else "#1E293B", bg="#1E293B" if CTK_AVAILABLE else "#F8FAFC").pack(side="top", pady=6)
        self.lb_notes = tk.Listbox(side_notes, font=("Arial", 9), bg="#0F172A" if CTK_AVAILABLE else "white", fg="#E2E8F0" if CTK_AVAILABLE else "black", selectmode="single", bd=0)
        self.lb_notes.pack(fill="both", expand=True, padx=6, pady=4)

        btn_del_note = tk.Button(side_notes, text="❌ حذف الهامش المحدد", font=("Arial", 9), command=self.delete_selected_note, bg="#DC2626", fg="white", relief="flat")
        btn_del_note.pack(side="bottom", fill="x", padx=6, pady=6)

        # مربع النص الاحترافي مع دعم كامل للتنسيقات
        self.word_text = scrolledtext.ScrolledText(
            work_area,
            wrap=tk.WORD,
            font=("Arial", 14),
            undo=True,
            bg="#FFFFFF",
            fg="#1E293B",
            padx=25,
            pady=25,
            insertbackground="#2563EB",
            relief="flat"
        )
        self.word_text.pack(side="right", fill="both", expand=True, padx=3, pady=3)
        self.word_text.tag_configure("bold", font=("Arial", 14, "bold"))
        self.word_text.tag_configure("italic", font=("Arial", 14, "italic"))
        self.word_text.tag_configure("underline", underline=True)
        self.word_text.tag_configure("strikethrough", overstrike=True)
        self.word_text.tag_configure("align_left", justify="left")
        self.word_text.tag_configure("align_center", justify="center")
        self.word_text.tag_configure("align_right", justify="right")
        self.word_text.tag_configure("footnote_ref", foreground="#2563EB", font=("Arial", 10, "bold"))

        sample_doc = (
            "مرحباً بك في استوديو معالجة مستندات Word الاحترافي ومنصة RefineX!\n\n"
            "هذا المحرر المكتبي المتقدم يمنحك:\n"
            "1. كتابة وتنسيق المستندات والبحوث الأكاديمية بدقة تامة.\n"
            "2. إضافة الهوامش السفلية (Footnotes) والهوامش الختامية (Endnotes) مع ترقيم تلقائي.\n"
            "3. ضبط هوامش وإطارات الصفحة، والعلامات المائية المخصصة.\n"
            "4. تحديد أي فقرة والضغط على زر 'تطهير وأنسنة النص المحدد فورياً' لاستبداله بالذكاء الاصطناعي مباشرة داخل المستند.\n\n"
            "يمكنك استيراد وتصدير المستند بصيغ DOCX و PDF مع الحفاظ الكامل على كافة التنسيقات."
        )
        self.word_text.insert("1.0", sample_doc)

        return frame

    # ==========================================================================
    # 2. مشهد محول الصياغة وتطهير بصمات AI (AI Humanizer View)
    # ==========================================================================
    def create_ai_view(self):
        frame = ctk.CTkFrame(self.views_container, corner_radius=8, fg_color="transparent") if CTK_AVAILABLE else tk.Frame(self.views_container)

        # شريط القوالب والتحكم العلوي
        top_bar = ctk.CTkFrame(frame, corner_radius=8, fg_color="#1E293B" if CTK_AVAILABLE else "#F1F5F9") if CTK_AVAILABLE else tk.Frame(frame, bg="#F1F5F9")
        top_bar.pack(side="top", fill="x", padx=4, pady=4)

        tk.Label(top_bar, text="🎯 قالب المعالجة:", font=("Arial", 10, "bold"), fg="#60A5FA" if CTK_AVAILABLE else "#1E293B", bg="#1E293B" if CTK_AVAILABLE else "#F1F5F9").pack(side="left", padx=8)
        self.preset_var = tk.StringVar(value="✨ تحويل بشري فائق (Humanizer 100%)")
        cb_presets = ttk.Combobox(top_bar, textvariable=self.preset_var, values=list(self.presets.keys()), width=34, state="readonly")
        cb_presets.pack(side="left", padx=6)

        btn_run_humanize = tk.Button(
            top_bar, text="🚀 بدء الأنسنة والتطهير", font=("Arial", 10, "bold"),
            bg="#2563EB", fg="white", padx=14, pady=5, command=lambda: self.run_processing_thread(mode="humanize"), relief="flat", cursor="hand2"
        )
        btn_run_humanize.pack(side="left", padx=8)

        btn_run_clean = tk.Button(
            top_bar, text="🧹 تنظيف خفيف وإزالة العلامات الخفية", font=("Arial", 9),
            bg="#059669", fg="white", padx=10, pady=5, command=lambda: self.run_processing_thread(mode="clean_only"), relief="flat", cursor="hand2"
        )
        btn_run_clean.pack(side="left", padx=4)

        # لوحات النصوص المزدوجة (Original vs Humanized Output)
        panes = tk.PanedWindow(frame, orient=tk.HORIZONTAL, bg="#334155", sashwidth=6)
        panes.pack(fill="both", expand=True, padx=4, pady=4)

        # لوحة الإدخال
        in_frame = tk.Frame(panes, bg="#1E293B" if CTK_AVAILABLE else "white")
        panes.add(in_frame, minsize=380)
        tk.Label(in_frame, text="📥 النص الأصلي (المكتوب أو المولد بواسطة AI):", font=("Arial", 10, "bold"), fg="#94A3B8", bg="#1E293B" if CTK_AVAILABLE else "#F8FAFC", anchor="w", padx=10, pady=6).pack(fill="x")
        self.txt_input = scrolledtext.ScrolledText(in_frame, wrap=tk.WORD, font=("Arial", 12), padx=12, pady=12, bg="#0F172A" if CTK_AVAILABLE else "white", fg="#F8FAFC" if CTK_AVAILABLE else "black", insertbackground="white", relief="flat")
        self.txt_input.pack(fill="both", expand=True)

        # لوحة الإخراج
        out_frame = tk.Frame(panes, bg="#1E293B" if CTK_AVAILABLE else "white")
        panes.add(out_frame, minsize=380)
        tk.Label(out_frame, text="✨ النص البشري المُنقى والمُعالج (Humanized Output):", font=("Arial", 10, "bold"), fg="#10B981", bg="#1E293B" if CTK_AVAILABLE else "#F8FAFC", anchor="w", padx=10, pady=6).pack(fill="x")
        self.txt_output = scrolledtext.ScrolledText(out_frame, wrap=tk.WORD, font=("Arial", 12), padx=12, pady=12, bg="#0F172A" if CTK_AVAILABLE else "white", fg="#F8FAFC" if CTK_AVAILABLE else "black", insertbackground="white", relief="flat")
        self.txt_output.pack(fill="both", expand=True)

        # شريط أزرار المخرجات
        out_actions = tk.Frame(out_frame, bg="#1E293B" if CTK_AVAILABLE else "#F8FAFC")
        out_actions.pack(fill="x", pady=6)
        btn_copy = tk.Button(out_actions, text="📋 نسخ المخرجات", font=("Arial", 9, "bold"), bg="#334155", fg="white", command=self.copy_output_text, relief="flat")
        btn_copy.pack(side="left", padx=8)
        btn_send_to_word = tk.Button(out_actions, text="📝 إرسال إلى محرر Word Studio", font=("Arial", 9, "bold"), bg="#4F46E5", fg="white", command=self.send_output_to_word_editor, relief="flat")
        btn_send_to_word.pack(side="left", padx=4)

        # شريط المؤشرات والإحصاءات الذكية
        stats_frame = ctk.CTkFrame(frame, corner_radius=8, fg_color="#1E293B" if CTK_AVAILABLE else "#F1F5F9") if CTK_AVAILABLE else tk.Frame(frame, bg="#F1F5F9")
        stats_frame.pack(side="bottom", fill="x", padx=4, pady=4)

        self.lbl_score_display = tk.Label(stats_frame, text="مؤشر الطابع البشري: --%", font=("Arial", 11, "bold"), fg="#10B981", bg="#1E293B" if CTK_AVAILABLE else "#F1F5F9")
        self.lbl_score_display.pack(side="left", padx=16, pady=8)

        self.lbl_burstiness = tk.Label(stats_frame, text="التنوع الإيقاعي: --", font=("Arial", 10), fg="#CBD5E1", bg="#1E293B" if CTK_AVAILABLE else "#F1F5F9")
        self.lbl_burstiness.pack(side="left", padx=16, pady=8)

        self.lbl_markers_cnt = tk.Label(stats_frame, text="كليشيهات مكتشفة: 0", font=("Arial", 10), fg="#CBD5E1", bg="#1E293B" if CTK_AVAILABLE else "#F1F5F9")
        self.lbl_markers_cnt.pack(side="left", padx=16, pady=8)

        return frame

    # ==========================================================================
    # 3. مشهد معالجة الدفعات (Batch Mode View)
    # ==========================================================================
    def create_batch_view(self):
        frame = ctk.CTkFrame(self.views_container, corner_radius=8, fg_color="transparent") if CTK_AVAILABLE else tk.Frame(self.views_container)

        ctrl_frame = ctk.CTkFrame(frame, corner_radius=8, fg_color="#1E293B" if CTK_AVAILABLE else "#F1F5F9") if CTK_AVAILABLE else tk.Frame(frame)
        ctrl_frame.pack(fill="x", padx=6, pady=6)

        btn_add_files = tk.Button(ctrl_frame, text="📂 إضافة ملفات للمعالجة", font=("Arial", 10, "bold"), bg="#334155", fg="white", command=self.batch_add_files, relief="flat", padx=10, pady=5)
        btn_add_files.pack(side="left", padx=8, pady=8)

        btn_clear_batch = tk.Button(ctrl_frame, text="🗑️ مسح القائمة", font=("Arial", 10), bg="#DC2626", fg="white", command=self.batch_clear, relief="flat", padx=10, pady=5)
        btn_clear_batch.pack(side="left", padx=4, pady=8)

        btn_run_batch = tk.Button(ctrl_frame, text="🚀 بدء معالجة الدفعة بالكامل", font=("Arial", 10, "bold"), bg="#059669", fg="white", command=self.batch_start_processing, relief="flat", padx=14, pady=5)
        btn_run_batch.pack(side="right", padx=8, pady=8)

        self.tree_batch = ttk.Treeview(frame, columns=("file", "size", "status", "score"), show="headings")
        self.tree_batch.heading("file", text="اسم الملف")
        self.tree_batch.heading("size", text="الحجم")
        self.tree_batch.heading("status", text="الحالة")
        self.tree_batch.heading("score", text="الدرجة البشرية")
        self.tree_batch.pack(fill="both", expand=True, padx=6, pady=6)

        return frame

    # ==========================================================================
    # 4. مشهد المقارنة المتزامنة (Diff Viewer View)
    # ==========================================================================
    def create_diff_view(self):
        frame = ctk.CTkFrame(self.views_container, corner_radius=8, fg_color="transparent") if CTK_AVAILABLE else tk.Frame(self.views_container)

        top_diff = ctk.CTkFrame(frame, corner_radius=8, fg_color="#1E293B" if CTK_AVAILABLE else "#F1F5F9") if CTK_AVAILABLE else tk.Frame(frame)
        top_diff.pack(fill="x", padx=6, pady=6)

        btn_sync = tk.Button(top_diff, text="🔄 مزامنة المقارنة بين النصين الأصلي والمُعالج", font=("Arial", 10, "bold"), bg="#2563EB", fg="white", command=self.refresh_diff_view, relief="flat", padx=12, pady=6)
        btn_sync.pack(side="left", padx=8, pady=8)

        diff_panes = tk.PanedWindow(frame, orient=tk.HORIZONTAL, bg="#334155", sashwidth=6)
        diff_panes.pack(fill="both", expand=True, padx=6, pady=6)

        f1 = tk.Frame(diff_panes, bg="#1E293B" if CTK_AVAILABLE else "white")
        diff_panes.add(f1, minsize=380)
        tk.Label(f1, text="🔴 النص الأصلي قبل المعالجة:", font=("Arial", 10, "bold"), fg="#EF4444", bg="#1E293B" if CTK_AVAILABLE else "white", anchor="w", padx=8, pady=6).pack(fill="x")
        self.txt_diff_orig = scrolledtext.ScrolledText(f1, wrap=tk.WORD, font=("Arial", 11), bg="#0F172A" if CTK_AVAILABLE else "white", fg="#F8FAFC" if CTK_AVAILABLE else "black", relief="flat")
        self.txt_diff_orig.pack(fill="both", expand=True)

        f2 = tk.Frame(diff_panes, bg="#1E293B" if CTK_AVAILABLE else "white")
        diff_panes.add(f2, minsize=380)
        tk.Label(f2, text="🟢 النص المُنقى والمُعالج بشرياً:", font=("Arial", 10, "bold"), fg="#10B981", bg="#1E293B" if CTK_AVAILABLE else "white", anchor="w", padx=8, pady=6).pack(fill="x")
        self.txt_diff_proc = scrolledtext.ScrolledText(f2, wrap=tk.WORD, font=("Arial", 11), bg="#0F172A" if CTK_AVAILABLE else "white", fg="#F8FAFC" if CTK_AVAILABLE else "black", relief="flat")
        self.txt_diff_proc.pack(fill="both", expand=True)

        return frame

    # ==========================================================================
    # 5. مشهد السجل والتقارير الأكاديمية (History View)
    # ==========================================================================
    def create_history_view(self):
        frame = ctk.CTkFrame(self.views_container, corner_radius=8, fg_color="transparent") if CTK_AVAILABLE else tk.Frame(self.views_container)

        h_ctrl = ctk.CTkFrame(frame, corner_radius=8, fg_color="#1E293B" if CTK_AVAILABLE else "#F1F5F9") if CTK_AVAILABLE else tk.Frame(frame)
        h_ctrl.pack(fill="x", padx=6, pady=6)

        btn_ref = tk.Button(h_ctrl, text="🔄 تحديث السجل", font=("Arial", 10, "bold"), bg="#334155", fg="white", command=self.refresh_history_table, relief="flat", padx=12, pady=5)
        btn_ref.pack(side="left", padx=8, pady=8)

        tk.Label(h_ctrl, text="💡 انقر نقراً مزدوجاً على أي سجل لاسترجاع النص إلى لوحة التحرير والمعالجة", font=("Arial", 9), fg="#94A3B8", bg="#1E293B" if CTK_AVAILABLE else "#F1F5F9").pack(side="right", padx=12)

        self.tree_hist = ttk.Treeview(frame, columns=("id", "time", "model", "score", "snippet"), show="headings")
        self.tree_hist.heading("id", text="#")
        self.tree_hist.heading("time", text="التاريخ والوقت")
        self.tree_hist.heading("model", text="النموذج المستخدم")
        self.tree_hist.heading("score", text="النسبة البشرية")
        self.tree_hist.heading("snippet", text="مقتطف من النص")
        self.tree_hist.column("id", width=40)
        self.tree_hist.column("time", width=140)
        self.tree_hist.column("model", width=140)
        self.tree_hist.column("score", width=100)
        self.tree_hist.column("snippet", width=450)
        self.tree_hist.pack(fill="both", expand=True, padx=6, pady=6)
        self.tree_hist.bind("<Double-1>", self.on_history_double_click)

        return frame

    # ==========================================================================
    # 6. مشهد الإعدادات ومفاتيح النماذج (Settings & Multi-Model AI View)
    # ==========================================================================
    def create_settings_view(self):
        frame = ctk.CTkScrollableFrame(self.views_container, corner_radius=8) if CTK_AVAILABLE else tk.Frame(self.views_container)

        # قسم تحديد النموذج
        box_provider = ctk.CTkFrame(frame, corner_radius=8, fg_color="#1E293B" if CTK_AVAILABLE else "#F8FAFC") if CTK_AVAILABLE else tk.LabelFrame(frame, text="🤖 محدد مزود ونموذج الذكاء الاصطناعي")
        box_provider.pack(fill="x", padx=12, pady=8)

        tk.Label(box_provider, text="🤖 محدد مزود ونموذج الذكاء الاصطناعي (Multi-Model AI Selector)", font=("Arial", 11, "bold"), fg="#60A5FA", bg="#1E293B" if CTK_AVAILABLE else "#F8FAFC").pack(anchor="w", padx=12, pady=(10, 6))

        row1 = tk.Frame(box_provider, bg="#1E293B" if CTK_AVAILABLE else "#F8FAFC")
        row1.pack(fill="x", padx=12, pady=6)

        tk.Label(row1, text="المزود النشط:", font=("Arial", 10, "bold"), fg="#E2E8F0", bg="#1E293B" if CTK_AVAILABLE else "#F8FAFC").pack(side="left", padx=5)
        self.provider_var = tk.StringVar(value=self.config_data.get("selected_provider", "Google Gemini"))
        cb_prov = ttk.Combobox(row1, textvariable=self.provider_var, values=list(SUPPORTED_PROVIDERS.keys()), width=26, state="readonly")
        cb_prov.pack(side="left", padx=10)
        cb_prov.bind("<<ComboboxSelected>>", self.on_provider_changed)

        tk.Label(row1, text="النموذج المختار:", font=("Arial", 10, "bold"), fg="#E2E8F0", bg="#1E293B" if CTK_AVAILABLE else "#F8FAFC").pack(side="left", padx=15)
        self.model_var = tk.StringVar(value=self.config_data.get("selected_model", "gemini-2.5-flash"))
        self.cb_model = ttk.Combobox(row1, textvariable=self.model_var, width=26, state="readonly")
        self.cb_model.pack(side="left", padx=10)
        self.update_models_list()

        # قسم مفاتيح API
        box_keys = ctk.CTkFrame(frame, corner_radius=8, fg_color="#1E293B" if CTK_AVAILABLE else "#F8FAFC") if CTK_AVAILABLE else tk.LabelFrame(frame, text="🔑 مفاتيح الاتصال والـ API Keys")
        box_keys.pack(fill="x", padx=12, pady=8)

        tk.Label(box_keys, text="🔑 مفاتيح الاتصال بالنماذج (API Keys & Local Endpoints)", font=("Arial", 11, "bold"), fg="#10B981", bg="#1E293B" if CTK_AVAILABLE else "#F8FAFC").pack(anchor="w", padx=12, pady=(10, 6))

        grid_keys = tk.Frame(box_keys, bg="#1E293B" if CTK_AVAILABLE else "#F8FAFC")
        grid_keys.pack(fill="x", padx=12, pady=8)

        fields = [
            ("Google Gemini API Key:", "ent_gemini_key", self.config_data.get("gemini_api_key", ""), True),
            ("OpenAI API Key:", "ent_openai_key", self.config_data.get("openai_api_key", ""), True),
            ("Anthropic Claude API Key:", "ent_anthropic_key", self.config_data.get("anthropic_api_key", ""), True),
            ("Ollama Local URL:", "ent_ollama_url", self.config_data.get("ollama_url", "http://localhost:11434"), False)
        ]

        for i, (label_txt, attr_name, val, is_pwd) in enumerate(fields):
            tk.Label(grid_keys, text=label_txt, font=("Arial", 9, "bold"), fg="#E2E8F0", bg="#1E293B" if CTK_AVAILABLE else "#F8FAFC").grid(row=i, column=0, sticky="w", pady=4, padx=5)
            ent = tk.Entry(grid_keys, width=54, show="*" if is_pwd else "", bg="#0F172A" if CTK_AVAILABLE else "white", fg="#F8FAFC" if CTK_AVAILABLE else "black", insertbackground="white")
            ent.grid(row=i, column=1, sticky="w", pady=4, padx=5)
            ent.insert(0, val)
            setattr(self, attr_name, ent)

        # قسم القائمة السوداء
        box_black = ctk.CTkFrame(frame, corner_radius=8, fg_color="#1E293B" if CTK_AVAILABLE else "#F8FAFC") if CTK_AVAILABLE else tk.LabelFrame(frame, text="🚫 القائمة السوداء")
        box_black.pack(fill="x", padx=12, pady=8)

        tk.Label(box_black, text="🚫 القائمة السوداء للكليشيهات وعبارات الحشو (مفصولة بفواصل):", font=("Arial", 11, "bold"), fg="#EF4444", bg="#1E293B" if CTK_AVAILABLE else "#F8FAFC").pack(anchor="w", padx=12, pady=(10, 6))
        self.ent_blacklist = tk.Entry(box_black, width=80, bg="#0F172A" if CTK_AVAILABLE else "white", fg="#F8FAFC" if CTK_AVAILABLE else "black", insertbackground="white")
        self.ent_blacklist.pack(fill="x", padx=12, pady=(0, 12))
        self.ent_blacklist.insert(0, self.config_data.get("blacklist", ""))

        btn_save_cfg = tk.Button(frame, text="💾 حفظ جميع الإعدادات ومفاتيح النماذج في قاعدة البيانات", font=("Arial", 11, "bold"), bg="#059669", fg="white", padx=20, pady=8, command=self.save_all_settings_action, relief="flat", cursor="hand2")
        btn_save_cfg.pack(pady=16)

        return frame

    # --------------------------------------------------------------------------
    # شريط الحالة السفلي (Status Ribbon)
    # --------------------------------------------------------------------------
    def build_status_bar(self):
        bar = tk.Frame(self.main_container, bg="#0F172A", height=32)
        bar.pack(side="bottom", fill="x")

        self.status_label = tk.Label(bar, text="جاهز - RefineX Pro متصل بالنظام", font=("Arial", 9), fg="#94A3B8", bg="#0F172A")
        self.status_label.pack(side="left", padx=16)

        self.btn_cancel = tk.Button(bar, text="🛑 إلغاء المعالجة الحالية", font=("Arial", 8, "bold"), bg="#DC2626", fg="white", state="disabled", command=self.cancel_processing, relief="flat")
        self.btn_cancel.pack(side="right", padx=16, pady=2)

    # ==========================================================================
    # وظائف محرر Word وتنسيقات النصوص والهوامش والمراجع
    # ==========================================================================
    def toggle_bold(self):
        self.toggle_tag("bold")

    def toggle_italic(self):
        self.toggle_tag("italic")

    def toggle_underline(self):
        self.toggle_tag("underline")

    def toggle_strikethrough(self):
        self.toggle_tag("strikethrough")

    def toggle_tag(self, tag_name):
        try:
            sel_start = self.word_text.index(tk.SEL_FIRST)
            sel_end = self.word_text.index(tk.SEL_LAST)
            current_tags = self.word_text.tag_names(sel_start)
            if tag_name in current_tags:
                self.word_text.tag_remove(tag_name, sel_start, sel_end)
            else:
                self.word_text.tag_add(tag_name, sel_start, sel_end)
        except tk.TclError:
            pass

    def apply_font_family(self):
        f = self.font_family_var.get()
        self.text_font_family = f
        self.word_text.configure(font=(f, int(self.font_size_var.get())))

    def apply_font_size(self):
        s = int(self.font_size_var.get())
        self.text_font_size = s
        self.word_text.configure(font=(self.font_family_var.get(), s))

    def choose_text_color(self):
        c = colorchooser.askcolor(title="اختر لون الخط")[1]
        if c:
            self.text_color = c
            try:
                sel_start = self.word_text.index(tk.SEL_FIRST)
                sel_end = self.word_text.index(tk.SEL_LAST)
                tag_name = f"color_{c}"
                self.word_text.tag_configure(tag_name, foreground=c)
                self.word_text.tag_add(tag_name, sel_start, sel_end)
            except tk.TclError:
                self.word_text.configure(fg=c)

    def choose_highlight_color(self):
        c = colorchooser.askcolor(title="اختر لون تظليل النص")[1]
        if c:
            try:
                sel_start = self.word_text.index(tk.SEL_FIRST)
                sel_end = self.word_text.index(tk.SEL_LAST)
                tag_name = f"hl_{c}"
                self.word_text.tag_configure(tag_name, background=c)
                self.word_text.tag_add(tag_name, sel_start, sel_end)
            except tk.TclError:
                pass

    def choose_page_bg(self):
        c = colorchooser.askcolor(title="اختر لون خلفية الصفحة")[1]
        if c:
            self.page_bg_color = c
            self.word_text.configure(bg=c)

    def set_alignment(self, align_type):
        for a in ["align_left", "align_center", "align_right"]:
            self.word_text.tag_remove(a, "1.0", tk.END)
        self.word_text.tag_add(f"align_{align_type}", "1.0", tk.END)

    def insert_bullet_list(self):
        self.word_text.insert(tk.INSERT, "\n• عنصر قائمة نقطية جديدة")

    def insert_numbered_list(self):
        self.word_text.insert(tk.INSERT, "\n1. عنصر قائمة رقمية جديدة")

    def dialog_insert_table(self):
        dlg = tk.Toplevel(self)
        dlg.title("إدراج جدول جديد")
        dlg.geometry("320x180")
        dlg.transient(self)
        dlg.grab_set()

        tk.Label(dlg, text="عدد الصفوف:").pack(pady=4)
        ent_rows = tk.Entry(dlg)
        ent_rows.pack(pady=2)
        ent_rows.insert(0, "3")

        tk.Label(dlg, text="عدد الأعمدة:").pack(pady=4)
        ent_cols = tk.Entry(dlg)
        ent_cols.pack(pady=2)
        ent_cols.insert(0, "3")

        def on_confirm():
            try:
                r = int(ent_rows.get())
                c = int(ent_cols.get())
                table_str = "\n" + ("| " + " | ".join([f"عمود {i+1}" for i in range(c)]) + " |\n")
                table_str += ("|" + "|".join(["---" for _ in range(c)]) + "|\n")
                for row_i in range(r - 1):
                    table_str += ("| " + " | ".join([f"خلية {row_i+1}-{col_i+1}" for col_i in range(c)]) + " |\n")
                self.word_text.insert(tk.INSERT, table_str + "\n")
                dlg.destroy()
            except ValueError:
                messagebox.showerror("خطأ", "الرجاء إدخال أرقام صحيحة للصفوف والأعمدة.")

        tk.Button(dlg, text="إدراج الجدول", bg="#2563EB", fg="white", command=on_confirm).pack(pady=10)

    # --------------------------------------------------------------------------
    # الهوامش والمراجع الأكاديمية (Footnotes & Endnotes)
    # --------------------------------------------------------------------------
    def dialog_add_footnote(self):
        dlg = tk.Toplevel(self)
        dlg.title("إضافة هامش سفلي (Footnote)")
        dlg.geometry("420x240")
        dlg.transient(self)
        dlg.grab_set()

        tk.Label(dlg, text="نص الهامش السفلي / توثيق المرجع الأكاديمي:", font=("Arial", 10, "bold")).pack(pady=6)
        txt_fn = tk.Text(dlg, height=5, width=42)
        txt_fn.pack(padx=10, pady=5)

        def on_insert():
            note_content = txt_fn.get("1.0", tk.END).strip()
            if not note_content:
                return
            idx = len(self.doc_footnotes) + 1
            marker = f"[{idx}]"
            self.word_text.insert(tk.INSERT, f" {marker} ", "footnote_ref")
            self.doc_footnotes.append({"index": idx, "text": note_content, "type": "footnote"})
            self.refresh_notes_listbox()
            dlg.destroy()

        tk.Button(dlg, text="إدراج الهامش", bg="#059669", fg="white", command=on_insert).pack(pady=8)

    def dialog_add_endnote(self):
        dlg = tk.Toplevel(self)
        dlg.title("إضافة هامش ختامي (Endnote)")
        dlg.geometry("420x240")
        dlg.transient(self)
        dlg.grab_set()

        tk.Label(dlg, text="نص الهامش الختامي للمستند:", font=("Arial", 10, "bold")).pack(pady=6)
        txt_en = tk.Text(dlg, height=5, width=42)
        txt_en.pack(padx=10, pady=5)

        def on_insert():
            note_content = txt_en.get("1.0", tk.END).strip()
            if not note_content:
                return
            idx = len(self.doc_endnotes) + 1
            marker = f"(i{idx})"
            self.word_text.insert(tk.INSERT, f" {marker} ", "footnote_ref")
            self.doc_endnotes.append({"index": idx, "text": note_content, "type": "endnote"})
            self.refresh_notes_listbox()
            dlg.destroy()

        tk.Button(dlg, text="إدراج الهامش الختامي", bg="#4F46E5", fg="white", command=on_insert).pack(pady=8)

    def refresh_notes_listbox(self):
        self.lb_notes.delete(0, tk.END)
        for fn in self.doc_footnotes:
            self.lb_notes.insert(tk.END, f"📌 [هامش {fn['index']}]: {fn['text'][:28]}...")
        for en in self.doc_endnotes:
            self.lb_notes.insert(tk.END, f"📚 (ختامي {en['index']}): {en['text'][:28]}...")

    def delete_selected_note(self):
        sel = self.lb_notes.curselection()
        if not sel:
            return
        idx = sel[0]
        if idx < len(self.doc_footnotes):
            del self.doc_footnotes[idx]
        else:
            del self.doc_endnotes[idx - len(self.doc_footnotes)]
        self.refresh_notes_listbox()

    # --------------------------------------------------------------------------
    # تصميم الصفحة (Page Borders & Watermarks)
    # --------------------------------------------------------------------------
    def dialog_page_border(self):
        dlg = tk.Toplevel(self)
        dlg.title("تحديد إطار وحدود الصفحة (Page Border)")
        dlg.geometry("320x200")
        dlg.transient(self)

        tk.Label(dlg, text="اختر نمط إطار الصفحة عند التصدير:", font=("Arial", 10, "bold")).pack(pady=10)
        b_var = tk.StringVar(value=self.page_border_style)
        for val, lbl in [("none", "بدون إطار"), ("box", "إطار كلاسيكي أنيق"), ("double", "إطار أكاديمي مزدوج"), ("decorative", "إطار رسمي مزخرف")]:
            tk.Radiobutton(dlg, text=lbl, variable=b_var, value=val).pack(anchor="w", padx=20, pady=2)

        def on_apply():
            self.page_border_style = b_var.get()
            messagebox.showinfo("تم", "تم تطبيق إعدادات إطار الصفحة بنجاح.")
            dlg.destroy()

        tk.Button(dlg, text="تطبيق", bg="#2563EB", fg="white", command=on_apply).pack(pady=10)

    def dialog_watermark(self):
        dlg = tk.Toplevel(self)
        dlg.title("العلامة المائية (Watermark)")
        dlg.geometry("350x160")
        dlg.transient(self)

        tk.Label(dlg, text="نص العلامة المائية في خلفية الصفحة:", font=("Arial", 10)).pack(pady=8)
        ent_wm = tk.Entry(dlg, width=30)
        ent_wm.pack(pady=4)
        ent_wm.insert(0, self.page_watermark_text)

        def on_apply():
            self.page_watermark_text = ent_wm.get().strip()
            messagebox.showinfo("تم", f"تم تعيين العلامة المائية: '{self.page_watermark_text}'")
            dlg.destroy()

        tk.Button(dlg, text="حفظ العلامة المائية", bg="#2563EB", fg="white", command=on_apply).pack(pady=10)

    def dialog_find_replace(self):
        dlg = tk.Toplevel(self)
        dlg.title("بحث واستبدال متقدم")
        dlg.geometry("380x180")
        dlg.transient(self)

        tk.Label(dlg, text="البحث عن:").grid(row=0, column=0, padx=5, pady=5)
        ent_find = tk.Entry(dlg, width=25)
        ent_find.grid(row=0, column=1, padx=5, pady=5)

        tk.Label(dlg, text="استبدال بـ:").grid(row=1, column=0, padx=5, pady=5)
        ent_rep = tk.Entry(dlg, width=25)
        ent_rep.grid(row=1, column=1, padx=5, pady=5)

        def do_replace_all():
            target = ent_find.get()
            rep = ent_rep.get()
            if not target:
                return
            content = self.word_text.get("1.0", tk.END)
            count = content.count(target)
            new_content = content.replace(target, rep)
            self.word_text.delete("1.0", tk.END)
            self.word_text.insert("1.0", new_content)
            messagebox.showinfo("اكتمل", f"تم استبدال {count} موضعاً بنجاح.")
            dlg.destroy()

        tk.Button(dlg, text="استبدال الكل", bg="#2563EB", fg="white", command=do_replace_all).grid(row=2, column=1, pady=10)

    # --------------------------------------------------------------------------
    # التكامل الفوري بين محرر Word والذكاء الاصطناعي
    # --------------------------------------------------------------------------
    def process_selected_text_with_ai(self):
        try:
            sel_start = self.word_text.index(tk.SEL_FIRST)
            sel_end = self.word_text.index(tk.SEL_LAST)
            selected_text = self.word_text.get(sel_start, sel_end).strip()
        except tk.TclError:
            messagebox.showwarning("تنبيه", "الرجاء تحديد نص أولاً داخل محرر Word لإرساله إلى الذكاء الاصطناعي.")
            return

        if not selected_text:
            return

        self.status_label.config(text="جاري معالجة وتطهير النص المحدد بالذكاء الاصطناعي...")

        def ai_worker():
            try:
                preset = self.presets.get(self.preset_var.get(), DEFAULT_PROMPT_PRESETS["✨ تحويل بشري فائق (Humanizer 100%)"])
                sys_prompt = preset.get("system_instruction", "")
                temp = preset.get("temperature", 0.75)
                provider = self.config_data.get("selected_provider", "Google Gemini")
                model = self.config_data.get("selected_model", "gemini-2.5-flash")

                if provider == "OpenAI":
                    api_key = self.config_data.get("openai_api_key", "")
                    res = MultiModelAIClient.call_openai(api_key, model, selected_text, sys_prompt, temp)
                elif provider == "Anthropic Claude":
                    api_key = self.config_data.get("anthropic_api_key", "")
                    res = MultiModelAIClient.call_anthropic(api_key, model, selected_text, sys_prompt, temp)
                elif "ollama" in provider.lower():
                    url = self.config_data.get("ollama_url", "http://localhost:11434")
                    res = MultiModelAIClient.call_ollama(url, model, selected_text, sys_prompt, temp)
                else:
                    api_key = self.config_data.get("gemini_api_key", "")
                    res = MultiModelAIClient.call_gemini(api_key, model, selected_text, sys_prompt, temp)

                final_text, _ = sanitize_invisible_chars(res)

                def update_ui():
                    self.word_text.delete(sel_start, sel_end)
                    self.word_text.insert(sel_start, final_text)
                    self.status_label.config(text="✅ تم تطهير وأنسنة النص واستبداله في مكانه بنجاح!")
                    messagebox.showinfo("نجاح", "تمت معالجة وتطهير النص واستبداله مباشرة داخل المستند.")

                self.after(0, update_ui)
            except Exception as e:
                self.after(0, lambda err=str(e): messagebox.showerror("خطأ أثناء المعالجة", f"فشل استدعاء الذكاء الاصطناعي:\n{err}"))

        threading.Thread(target=ai_worker, daemon=True).start()

    # --------------------------------------------------------------------------
    # استيراد وتصدير المستندات (DOCX, PDF, TXT)
    # --------------------------------------------------------------------------
    def import_document_file(self):
        fpath = filedialog.askopenfilename(
            title="اختر مستند للاستيراد",
            filetypes=[("All Supported", "*.docx;*.pdf;*.txt;*.md"), ("Word Document", "*.docx"), ("PDF Document", "*.pdf"), ("Text / Markdown", "*.txt;*.md")]
        )
        if not fpath:
            return

        ext = Path(fpath).suffix.lower()
        try:
            if ext == ".docx" and DOCX_AVAILABLE:
                doc = Document(fpath)
                full_text = "\n".join([p.text for p in doc.paragraphs])
                self.word_text.delete("1.0", tk.END)
                self.word_text.insert("1.0", full_text)
            elif ext == ".pdf" and pypdf:
                reader = pypdf.PdfReader(fpath)
                full_text = "\n".join([page.extract_text() or "" for page in reader.pages])
                self.word_text.delete("1.0", tk.END)
                self.word_text.insert("1.0", full_text)
            else:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                    self.word_text.delete("1.0", tk.END)
                    self.word_text.insert("1.0", f.read())

            self.status_label.config(text=f"تم استيراد المستند: {Path(fpath).name}")
        except Exception as e:
            messagebox.showerror("خطأ في الاستيراد", f"تعذر استيراد الملف:\n{str(e)}")

    def export_word_docx(self):
        if not DOCX_AVAILABLE:
            messagebox.showerror("خطأ", "مكتبة python-docx غير مثبتة. يرجى تثبيتها عبر `pip install python-docx`")
            return

        fpath = filedialog.asksaveasfilename(
            title="حفظ المستند كملف Word",
            defaultextension=".docx",
            filetypes=[("Word Document", "*.docx")]
        )
        if not fpath:
            return

        try:
            doc = Document()
            content = self.word_text.get("1.0", tk.END).strip()

            for para_text in content.split("\n"):
                if para_text.strip():
                    doc.add_paragraph(para_text)

            if self.doc_footnotes or self.doc_endnotes:
                doc.add_page_break()
                doc.add_heading("الهوامش والمراجع الأكاديمية", level=1)
                for fn in self.doc_footnotes:
                    doc.add_paragraph(f"[{fn['index']}] {fn['text']}")
                for en in self.doc_endnotes:
                    doc.add_paragraph(f"(i{en['index']}) {en['text']}")

            doc.save(fpath)
            self.status_label.config(text=f"تم حفظ مستند Word: {Path(fpath).name}")
            messagebox.showinfo("تم الحفظ", "تم تصدير مستند Word (.docx) بنجاح.")
        except Exception as e:
            messagebox.showerror("خطأ في الحفظ", f"تعذر حفظ المستند:\n{str(e)}")

    def export_word_pdf(self):
        if not REPORTLAB_AVAILABLE:
            messagebox.showerror("خطأ", "مكتبة reportlab غير مثبتة. يرجى تثبيتها عبر `pip install reportlab`")
            return

        fpath = filedialog.asksaveasfilename(
            title="تصدير المستند كملف PDF",
            defaultextension=".pdf",
            filetypes=[("PDF Document", "*.pdf")]
        )
        if not fpath:
            return

        try:
            content = self.word_text.get("1.0", tk.END).strip()
            doc = SimpleDocTemplate(fpath, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
            styles = getSampleStyleSheet()
            normal_style = styles["Normal"]
            story = []

            for line in content.split("\n"):
                if line.strip():
                    story.append(Paragraph(line, normal_style))
                    story.append(Spacer(1, 8))

            if self.doc_footnotes:
                story.append(Spacer(1, 20))
                story.append(HRFlowable(width="100%", thickness=1, color=colors.gray))
                story.append(Paragraph("<b>الهوامش السفلية والمراجع:</b>", normal_style))
                for fn in self.doc_footnotes:
                    story.append(Paragraph(f"[{fn['index']}] {fn['text']}", normal_style))

            def add_page_decorations(canvas_obj, doc_obj):
                if self.page_watermark_text:
                    canvas_obj.saveState()
                    canvas_obj.setFont("Helvetica", 50)
                    canvas_obj.setFillColor(colors.lightgrey, alpha=0.3)
                    canvas_obj.rotate(45)
                    canvas_obj.drawString(200, 100, self.page_watermark_text)
                    canvas_obj.restoreState()

                if self.page_border_style != "none":
                    canvas_obj.saveState()
                    canvas_obj.setStrokeColor(colors.darkblue)
                    canvas_obj.setLineWidth(1.5 if self.page_border_style == "box" else 2.5)
                    canvas_obj.rect(20, 20, A4[0] - 40, A4[1] - 40)
                    canvas_obj.restoreState()

            doc.build(story, onFirstPage=add_page_decorations, onLaterPages=add_page_decorations)
            self.status_label.config(text=f"تم تصدير ملف PDF بنجاح: {Path(fpath).name}")
            messagebox.showinfo("تم التصدير", "تم تصدير ملف PDF بنجاح مع كافة الإطارات والتنسيقات.")
        except Exception as e:
            messagebox.showerror("خطأ في التصدير", f"تعذر إنشاء ملف PDF:\n{str(e)}")

    # ==========================================================================
    # وظائف الذكاء الاصطناعي والإحصاءات
    # ==========================================================================
    def copy_output_text(self):
        txt = self.txt_output.get("1.0", tk.END).strip()
        if txt:
            self.clipboard_clear()
            self.clipboard_append(txt)
            messagebox.showinfo("تم النسخ", "تم نسخ المخرجات المعالجة إلى الحافظة.")

    def send_output_to_word_editor(self):
        txt = self.txt_output.get("1.0", tk.END).strip()
        if txt:
            self.word_text.delete("1.0", tk.END)
            self.word_text.insert("1.0", txt)
            self.switch_section("word")
            messagebox.showinfo("تم الإرسال", "تم إرسال النص المعالج إلى محرر Word Studio بنجاح.")

    def refresh_diff_view(self):
        orig = self.txt_input.get("1.0", tk.END).strip()
        proc = self.txt_output.get("1.0", tk.END).strip()
        self.txt_diff_orig.delete("1.0", tk.END)
        self.txt_diff_orig.insert("1.0", orig)
        self.txt_diff_proc.delete("1.0", tk.END)
        self.txt_diff_proc.insert("1.0", proc)

    def refresh_history_table(self):
        for item in self.tree_hist.get_children():
            self.tree_hist.delete(item)
        records = self.db.get_history(50)
        for r in records:
            self.tree_hist.insert("", "end", values=(r[0], r[1], r[2], f"{r[3]}%", r[4][:60] + "..."))

    def on_history_double_click(self, event):
        sel = self.tree_hist.selection()
        if not sel:
            return
        vals = self.tree_hist.item(sel[0], "values")
        rec_id = vals[0]
        with sqlite3.connect(self.db.db_path) as conn:
            c = conn.cursor()
            c.execute("SELECT original_text, processed_text FROM history WHERE id = ?", (rec_id,))
            row = c.fetchone()
            if row:
                self.txt_input.delete("1.0", tk.END)
                self.txt_input.insert("1.0", row[0])
                self.txt_output.delete("1.0", tk.END)
                self.txt_output.insert("1.0", row[1])
                self.switch_section("ai")

    # --------------------------------------------------------------------------
    # معالجة الدفعات (Batch Mode)
    # --------------------------------------------------------------------------
    def batch_add_files(self):
        files = filedialog.askopenfilenames(
            title="اختر ملفات لمعالجتها كدفعة واحدة",
            filetypes=[("All Supported", "*.docx;*.pdf;*.txt;*.md")]
        )
        for f in files:
            sz = f"{round(os.path.getsize(f)/1024, 1)} KB"
            self.tree_batch.insert("", "end", values=(f, sz, "قيد الانتظار", "--"))

    def batch_clear(self):
        for item in self.tree_batch.get_children():
            self.tree_batch.delete(item)

    def batch_start_processing(self):
        items = self.tree_batch.get_children()
        if not items:
            messagebox.showwarning("تنبيه", "الرجاء إضافة ملفات إلى قائمة الدفعة أولاً.")
            return

        def batch_worker():
            for item in items:
                vals = self.tree_batch.item(item, "values")
                fpath = vals[0]
                self.tree_batch.item(item, values=(fpath, vals[1], "جاري المعالجة...", "--"))
                try:
                    ext = Path(fpath).suffix.lower()
                    if ext == ".docx" and DOCX_AVAILABLE:
                        d = Document(fpath)
                        text = "\n".join([p.text for p in d.paragraphs])
                    else:
                        with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                            text = f.read()

                    cleaned, _ = sanitize_invisible_chars(text)
                    m = analyze_text_metrics(cleaned)
                    self.tree_batch.item(item, values=(fpath, vals[1], "✅ مكتمل", f"{m['human_score']}%"))
                except Exception as e:
                    self.tree_batch.item(item, values=(fpath, vals[1], "❌ فشل", "--"))

            self.after(0, lambda: messagebox.showinfo("اكتملت الدفعة", "تمت معالجة جميع ملفات الدفعة بنجاح."))

        threading.Thread(target=batch_worker, daemon=True).start()

    # --------------------------------------------------------------------------
    # إدارة الإعدادات والنماذج
    # --------------------------------------------------------------------------
    def on_provider_changed(self, event=None):
        self.update_models_list()

    def update_models_list(self):
        prov = self.provider_var.get()
        prov_info = SUPPORTED_PROVIDERS.get(prov, SUPPORTED_PROVIDERS["Google Gemini"])
        models = prov_info.get("models", [])
        self.cb_model.config(values=models)
        if models:
            self.model_var.set(models[0])

    def save_all_settings_action(self):
        self.config_data["selected_provider"] = self.provider_var.get()
        self.config_data["selected_model"] = self.model_var.get()
        self.config_data["gemini_api_key"] = self.ent_gemini_key.get().strip()
        self.config_data["openai_api_key"] = self.ent_openai_key.get().strip()
        self.config_data["anthropic_api_key"] = self.ent_anthropic_key.get().strip()
        self.config_data["ollama_url"] = self.ent_ollama_url.get().strip()
        self.config_data["blacklist"] = self.ent_blacklist.get().strip()
        self.custom_blacklist = [m.strip() for m in self.config_data["blacklist"].split(",") if m.strip()]

        self.save_configuration()
        self.lbl_active_model_badge.configure(text=f"{self.config_data['selected_model']}")
        messagebox.showinfo("تم الحفظ", "تم حفظ جميع الإعدادات ومفاتيح النماذج بنجاح في قاعدة البيانات المحلية.")

    # --------------------------------------------------------------------------
    # تنفيذ المعالجة بالذكاء الاصطناعي
    # --------------------------------------------------------------------------
    def run_processing_thread(self, mode="humanize"):
        raw_text = self.txt_input.get("1.0", tk.END).strip()
        if not raw_text:
            messagebox.showwarning("تنبيه", "الرجاء إدخال نص أولاً للمعالجة.")
            return

        if mode == "humanize":
            preset = self.presets.get(self.preset_var.get(), DEFAULT_PROMPT_PRESETS["✨ تحويل بشري فائق (Humanizer 100%)"])
            sys_prompt = preset.get("system_instruction", "")
            temp = preset.get("temperature", 0.85)
        else:
            sys_prompt = "قم بتنظيف وتطهير النص من بصمات الذكاء الاصطناعي ولغة المحاماة الزائدة والتحفظ المفرط."
            temp = 0.65

        self.is_processing = True
        self.cancel_requested = False
        self.btn_cancel.config(state="normal")
        self.status_label.config(text=f"جاري المعالجة عبر {self.config_data.get('selected_model')}...")

        threading.Thread(
            target=self.execute_ai_call,
            args=(raw_text, sys_prompt, temp, self.on_main_processing_complete),
            daemon=True
        ).start()

    def execute_ai_call(self, text, system_instruction, temperature, callback):
        try:
            cleaned_invisible, inv_count = sanitize_invisible_chars(text)
            provider = self.config_data.get("selected_provider", "Google Gemini")
            model = self.config_data.get("selected_model", "gemini-2.5-flash")

            if provider == "OpenAI":
                api_key = self.config_data.get("openai_api_key", "")
                res = MultiModelAIClient.call_openai(api_key, model, cleaned_invisible, system_instruction, temperature)
            elif provider == "Anthropic Claude":
                api_key = self.config_data.get("anthropic_api_key", "")
                res = MultiModelAIClient.call_anthropic(api_key, model, cleaned_invisible, system_instruction, temperature)
            elif "ollama" in provider.lower():
                url = self.config_data.get("ollama_url", "http://localhost:11434")
                res = MultiModelAIClient.call_ollama(url, model, cleaned_invisible, system_instruction, temperature)
            else:
                api_key = self.config_data.get("gemini_api_key", "")
                res = MultiModelAIClient.call_gemini(api_key, model, cleaned_invisible, system_instruction, temperature)

            final_text, _ = sanitize_invisible_chars(res)
            metrics = analyze_text_metrics(final_text, self.custom_blacklist)

            self.db.add_history(provider, model, text, final_text, metrics["human_score"], metrics["burstiness"])

            def update_ui():
                callback(final_text)
                self.lbl_score_display.config(text=f"مؤشر الطابع البشري: {metrics['human_score']}%", fg="#10B981" if metrics['human_score'] >= 80 else "#F59E0B")
                self.lbl_burstiness.config(text=f"التنوع الإيقاعي: {metrics['burstiness']}")
                self.lbl_markers_cnt.config(text=f"كليشيهات مكتشفة: {len(metrics['ai_markers_found']) + len(metrics['legal_markers_found'])}")

            self.after(0, update_ui)
        except Exception as e:
            self.after(0, lambda err=str(e): self.on_processing_error(err))

    def on_main_processing_complete(self, result_text):
        self.is_processing = False
        self.btn_cancel.config(state="disabled")
        self.txt_output.delete("1.0", tk.END)
        self.txt_output.insert("1.0", result_text)
        self.status_label.config(text="✅ اكتملت المعالجة بنجاح! تم توليد نص بشري فائق الجودة.")

    def on_processing_error(self, err_msg):
        self.is_processing = False
        self.btn_cancel.config(state="disabled")
        self.status_label.config(text="فشلت المعالجة.")
        messagebox.showerror("خطأ أثناء المعالجة", f"تعذر إكمال العملية:\n{err_msg}")

    def cancel_processing(self):
        self.cancel_requested = True
        self.status_label.config(text="تم طلب الإلغاء...")


if __name__ == "__main__":
    app = RefineXStudio()
    app.mainloop()
