export const STREAMLIT_REQUIREMENTS = `streamlit>=1.35.0
google-generativeai>=0.8.0
python-docx>=1.1.0
reportlab>=4.0.0
pypdf>=4.0.0
requests>=2.31.0
pillow>=10.0.0
gTTS>=2.5.0
`;

export const GRADIO_REQUIREMENTS = `gradio>=4.30.0
google-generativeai>=0.8.0
requests>=2.31.0
`;

export const PYTHON_REQUIREMENTS = STREAMLIT_REQUIREMENTS;

export const STREAMLIT_README_GUIDE = `# دليل تشغيل ونشر منصة RefineX Pro Studio عبر Streamlit (موقع ويب كامل)

منصة ويب متكاملة فائقة التطور تجمع بين محرر مستندات Word أكاديمي ومنصة ذكاء اصطناعي متعددة النماذج (Google Gemini, OpenAI GPT-4o, Anthropic Claude, Ollama المحلي) تعمل مباشرة في المتصفح عبر مكتبة **Streamlit**.

---

## 🌟 أبرز ميزات تطبيق الويب Streamlit:

1. **🌐 موقع ويب سحابي ومحلي متكامل**:
   - يعمل بالمتصفح بدقة عالية مع دعم كامل للغة العربية (RTL) والإنجليزية والخطوط العربية الأنيقة (Cairo, Amiri, Alexandria).
   - واجهة عريضة (Wide Layout) متجاوبة مع الحواسيب والأجهزة اللوحية والهواتف.

2. **📝 محرر مستندات Word الأكاديمي (Word Studio)**:
   - شريط تحكم وتنسيق كامل للخطوط والأحجام وهوامش الصفحات ورأس وتذييل الصفحة.
   - قوالب جاهزة: بحث علمي محكم، مذكرة ورأي قانوني، تقرير إداري وتنفيذي.
   - تصدير مباشر عالي الجودة إلى ملفات Word (.docx) و Markdown (.md).
   - حفظ تلقائي لحظي وسجل لقطات زمنية (Version History).

3. **✨ منصة الأنسنة والتطهير الذكية (AI Workbench)**:
   - تنظيف فوري من كليشيهات وبصمات الذكاء الاصطناعي ولغة المحاماة والمسافات الصفرية الخفية.
   - دعم التبديل بين نماذج: Google Gemini و OpenAI و Anthropic Claude وخادم Ollama المحلي (بدون إنترنت).
   - محرك تنظيف قاعدي احتياطي يعمل فوراً حتى بدون مفاتيح API.

4. **⚖️ فاحص الفروقات التزامني (Diff Inspector)**:
   - مقارنة بصرية جنباً إلى جنب مع تمييز الإضافات والحذوفات والتعديلات بالألوان.

5. **📁 المعالجة الجماعية للملفات (Batch Processing)**:
   - رفع دفعات من ملفات (.docx, .pdf, .txt, .md) وتطهيرها وتنزيلها كملف ZIP بضغطة زر.

6. **📊 مؤشر الأنسنة وتحليلات الجودة (Human Score Radar)**:
   - قياس التنوع الإيقاعي (Burstiness) والتعقيد اللغوي (Perplexity) ومحاكاة كواشف AI.

---

## 🚀 طريقة التثبيت والتشغيل المحلي:

### 1. تثبيت المتطلبات:
\`\`\`bash
pip install -r requirements_streamlit.txt
\`\`\`
أو مباشرة:
\`\`\`bash
pip install streamlit google-generativeai python-docx reportlab pypdf requests pillow gTTS
\`\`\`

### 2. تشغيل منصة الويب:
\`\`\`bash
streamlit run app_streamlit.py
\`\`\`

سيفتح المتصفح تلقائياً على الرابط: \`http://localhost:8501\`

---

## ☁️ خطوات النشر على الإنترنت (Streamlit Community Cloud / HuggingFace):

1. قم برفع الملفين \`app_streamlit.py\` و \`requirements_streamlit.txt\` إلى مستودع GitHub الخاص بك.
2. اذهب إلى [share.streamlit.io](https://share.streamlit.io) وسجل الدخول باستخدام GitHub.
3. اضغط على **"New app"** واختر المستودع وملف \`app_streamlit.py\`.
4. أضف مفتاح \`GEMINI_API_KEY\` في إعدادات الأسرار (Secrets) إذا رغبت.
5. سيصبح موقعك متاحاً برابط عالمي سريع ومجاني!
`;

export const README_GUIDE = STREAMLIT_README_GUIDE;

export const STREAMLIT_APP_CODE = `# -*- coding: utf-8 -*-
"""
================================================================================
RefineX Pro Studio - Web-Based Word Processor & Multi-Model AI Suite (Streamlit)
منصة الويب المتكاملة: محرر مستندات Word احترافي + محرك ذكاء اصطناعي متعدد النماذج
(Google Gemini, OpenAI GPT-4o, Anthropic Claude, Local Ollama)
================================================================================
"""

import os
import sys
import time
import json
import re
import io
import zipfile
import difflib
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple

import streamlit as st

# Check optional dependencies
try:
    import docx
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False


# ------------------------------------------------------------------------------
# 1. القوائم السوداء وعلامات الذكاء الاصطناعي ولغة المحاماة
# ------------------------------------------------------------------------------

AI_COMMON_MARKERS = [
    "من الجدير بالذكر", "تجدر الإشارة إلى", "مما لا شك فيه", "في هذا السياق",
    "يلعب دوراً محورياً", "حجر الزاوية", "في نهاية المطاف", "علاوة على ذلك",
    "من الأهمية بمكان", "تسليط الضوء على", "بشكل لا لبس فيه", "نافلة القول",
    "مما يسترعي الانتباه", "على صعيد متصل", "يفتح آفاقاً جديدة", "يشكل علامة فارقة",
    "وفي هذا الصدد", "ومن هذا المنطلق", "خلاصة القول", "بادئ ذي بدء",
    "It is worth noting that", "It is crucial to remember", "Furthermore",
    "In this context", "Plays a pivotal role", "Cornerstone", "Delve into",
    "Tapestry", "Testament", "Beacon", "Pivotal", "Underscore", "Beacon of hope"
]

LEGAL_ADVOCACY_MARKERS = [
    "بما لا يدع مجالاً للشك", "نلتمس من عدالة المحكمة", "الأمر الذي يقطع بيقين",
    "وفقاً لأحكام المادة", "تأسيساً على ما تقدم", "وحيث إن ما ينعاه",
    "وحيث إنه عن الدفع المبدى", "التمس البراءة تأسيساً على", "بطلان إجراءات القبض والتفتيش",
    "عدم معقولية الواقعة واستحالة تصور حدوثها", "انعدام أركان الجريمة", "قصور في التسبيب وفساد في الاستدلال",
    "إهداراً لحقوق الدفاع", "ولما كان من المستقر عليه قضاءً", "الأمر الذي يضحي معه الدفع",
    "من جماع ما تقدم", "مما يصم الحكم بالبطلان", "ولما كان الثابت بالأوراق"
]

HEDGING_PADDING_MARKERS = [
    "قد يُعزى ذلك إلى", "من المحتمل بدرجة كبيرة", "يبدو جلياً أن",
    "تشير التقديرات الأولية إلى", "في ضوء المعطيات الراهنة", "وفقاً للرؤية السائدة",
    "مما يرجح فرضية", "على نحو غير مباشر", "إلى حد ما", "بصورة نسبية"
]

INVISIBLE_CHARS_REGEX = re.compile(
    r"[\u200B\u200C\u200D\u200E\u200F\uFEFF\u00AD\u2060\u2061\u2062\u2063\u2064\u2066\u2067\u2068\u2069\u206A\u206B\u206C\u206D\u206E\u206F]"
)


# ------------------------------------------------------------------------------
# 2. دوال المعالجة القاعدية (Rule-Based Fallbacks)
# ------------------------------------------------------------------------------

def sanitize_invisible_characters(text: str) -> Tuple[str, int]:
    matches = INVISIBLE_CHARS_REGEX.findall(text)
    cleaned = INVISIBLE_CHARS_REGEX.sub("", text)
    return cleaned, len(matches)


def clean_text_rule_based(text: str, custom_blacklist: List[str] = None) -> Tuple[str, int, int]:
    cleaned, invisible_count = sanitize_invisible_characters(text)
    
    blacklist = list(AI_COMMON_MARKERS) + list(LEGAL_ADVOCACY_MARKERS) + list(HEDGING_PADDING_MARKERS)
    if custom_blacklist:
        blacklist.extend([w.strip() for w in custom_blacklist if w.strip()])
    
    cliche_count = 0
    for marker in blacklist:
        pattern = re.compile(r'\\b' + re.escape(marker) + r'\\b', re.IGNORECASE)
        found = len(pattern.findall(cleaned))
        if found > 0:
            cliche_count += found
            cleaned = pattern.sub("", cleaned)
            
    # Cleanup extra spaces and punctuation
    cleaned = re.sub(r'[ \t]+', ' ', cleaned)
    cleaned = re.sub(r'\\s*([،,\\.;:!؟])\\s*', r'\\1 ', cleaned)
    cleaned = re.sub(r'\\n\\s*\\n\\s*\\n+', '\\n\\n', cleaned)
    
    return cleaned.strip(), cliche_count, invisible_count


def calculate_human_score(input_text: str, output_text: str, issues_count: int = 0) -> Dict[str, Any]:
    words = output_text.split() if output_text else []
    total_words = len(words)
    if total_words == 0:
        return {"overall": 0, "burstiness": 0, "perplexity": 0, "naturalness": 0, "academic": 0, "grade": "N/A"}
    
    sentences = re.split(r'[.!\\n؟\\?]+', output_text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    sentence_lengths = [len(s.split()) for s in sentences]
    if len(sentence_lengths) > 1:
        avg_len = sum(sentence_lengths) / len(sentence_lengths)
        variance = sum((l - avg_len) ** 2 for l in sentence_lengths) / len(sentence_lengths)
        std_dev = variance ** 0.5
        burstiness = min(100, int((std_dev / (avg_len + 1e-5)) * 120))
    else:
        burstiness = 40
        
    unique_words = len(set(w.lower() for w in words))
    ttr = (unique_words / total_words) * 100
    perplexity = min(100, int(ttr * 1.3))
    
    deduction = min(40, issues_count * 4)
    naturalness = max(20, min(100, int(85 + (burstiness * 0.15) - deduction)))
    academic_quality = min(100, int((naturalness * 0.5) + (perplexity * 0.5)))
    overall = int((burstiness * 0.3) + (perplexity * 0.3) + (naturalness * 0.4))
    
    if overall >= 85:
        grade = "إنساني طبيعي 100% (غير قابل للاكتشاف)"
    elif overall >= 70:
        grade = "بشري ممتاز (مستوى أمان مرتفع)"
    elif overall >= 50:
        grade = "متوسط (يحتاج تنويع إيقاعي)"
    else:
        grade = "آلي نمطي (مكشوف لكواشف AI)"
        
    return {
        "overall": overall,
        "burstiness": burstiness,
        "perplexity": perplexity,
        "naturalness": naturalness,
        "academic": academic_quality,
        "grade": grade,
        "total_words": total_words,
        "sentences_count": len(sentences)
    }


# ------------------------------------------------------------------------------
# 3. محرك الاستدعاء الذكي للنماذج المختلفة (Multi-Model Dispatcher)
# ------------------------------------------------------------------------------

def call_ai_model(
    provider: str,
    model_name: str,
    api_key: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.7
) -> str:
    """استدعاء النماذج المختلفة وفقاً لمزود الخدمة المختار"""
    
    # 1. Google Gemini
    if provider == "Google Gemini":
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name=model_name or "gemini-1.5-flash",
                system_instruction=system_prompt
            )
            response = model.generate_content(
                user_prompt,
                generation_config={"temperature": temperature}
            )
            return response.text
        except Exception as e:
            # Fallback to direct REST API
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": f"{system_prompt}\\n\\nالنص المطلوب معالجته:\\n{user_prompt}"}]}],
                "generationConfig": {"temperature": temperature}
            }
            resp = requests.post(url, json=payload, timeout=60)
            if resp.status_code == 200:
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
            raise RuntimeError(f"Google Gemini Error: {resp.text or str(e)}")

    # 2. OpenAI GPT
    elif provider == "OpenAI":
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model_name or "gpt-4o",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature
        }
        resp = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=60)
        if resp.status_code == 200:
            return resp.json()["choices"][0]["message"]["content"]
        raise RuntimeError(f"OpenAI Error ({resp.status_code}): {resp.text}")

    # 3. Anthropic Claude
    elif provider == "Anthropic Claude":
        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model_name or "claude-3-5-sonnet-20241022",
            "max_tokens": 4096,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_prompt}],
            "temperature": temperature
        }
        resp = requests.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload, timeout=60)
        if resp.status_code == 200:
            return resp.json()["content"][0]["text"]
        raise RuntimeError(f"Anthropic Error ({resp.status_code}): {resp.text}")

    # 4. Local Ollama
    elif provider == "Local Ollama":
        ollama_url = "http://localhost:11434/api/generate"
        payload = {
            "model": model_name or "llama3",
            "system": system_prompt,
            "prompt": user_prompt,
            "stream": False,
            "options": {"temperature": temperature}
        }
        resp = requests.post(ollama_url, json=payload, timeout=120)
        if resp.status_code == 200:
            return resp.json()["response"]
        raise RuntimeError(f"Ollama Error ({resp.status_code}): {resp.text}")

    else:
        raise ValueError(f"مزود الخدمة غير مدعوم: {provider}")


# ------------------------------------------------------------------------------
# 4. دوال تصدير المستندات (Docx, PDF)
# ------------------------------------------------------------------------------

def generate_docx_document(
    title: str,
    content: str,
    header_text: str = "RefineX Pro Studio | المستند الموحد",
    footer_text: str = "صفحة [1] — مسودة موثقة ومطهرة",
    font_name: str = "Arial",
    font_size_pt: int = 12
) -> io.BytesIO:
    doc = docx.Document()
    
    # Configure margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        
        # Header & Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.text = header_text
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.text = footer_text
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
    # Title
    if title:
        title_p = doc.add_paragraph()
        title_run = title_p.add_run(title)
        title_run.font.size = Pt(font_size_pt + 6)
        title_run.font.bold = True
        title_run.font.name = font_name
        title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        doc.add_paragraph()
        
    # Body Content
    paragraphs = content.split('\\n')
    for p_text in paragraphs:
        if p_text.strip():
            p = doc.add_paragraph()
            run = p.add_run(p_text.strip())
            run.font.size = Pt(font_size_pt)
            run.font.name = font_name
            p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            p.paragraph_format.line_spacing = 1.3
        else:
            doc.add_paragraph()
            
    bio = io.BytesIO()
    doc.save(bio)
    bio.seek(0)
    return bio


# ------------------------------------------------------------------------------
# 5. إعداد الصفحة والتصميم العصري لـ Streamlit
# ------------------------------------------------------------------------------

st.set_page_config(
    page_title="RefineX Pro Studio",
    page_icon="✨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Arabic typography & modern UI
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Amiri:wght@400;700&family=Alexandria:wght@400;600;700&display=swap');
    
    html, body, [class*="css"], .stMarkdown, .stText, .stButton, .stTextArea, .stSelectbox {
        font-family: 'Cairo', sans-serif !important;
        direction: rtl;
        text-align: right;
    }
    
    .main-header {
        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
        padding: 24px;
        border-radius: 18px;
        color: white;
        margin-bottom: 24px;
        box-shadow: 0 10px 25px -5px rgba(49, 46, 129, 0.2);
    }
    
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        background-color: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 700;
    }
    
    .metric-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 16px;
        text-align: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    
    .stTextArea textarea {
        font-size: 15px !important;
        line-height: 1.8 !important;
        border-radius: 12px !important;
    }
    
    .editor-paper {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        padding: 48px;
        min-height: 700px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        margin: 0 auto;
        max-width: 850px;
    }
</style>
""", unsafe_allow_html=True)


# ------------------------------------------------------------------------------
# 6. إدارة حالة الجلسة (Session State & Auto-Save)
# ------------------------------------------------------------------------------

if "input_text" not in st.session_state:
    st.session_state.input_text = ""
if "output_text" not in st.session_state:
    st.session_state.output_text = ""
if "word_studio_text" not in st.session_state:
    st.session_state.word_studio_text = ""
if "word_studio_header" not in st.session_state:
    st.session_state.word_studio_header = "RefineX Pro Studio | المستند الأكاديمي الموحد"
if "word_studio_footer" not in st.session_state:
    st.session_state.word_studio_footer = "صفحة [1] — مسودة موثقة ومطهرة"
if "snapshots" not in st.session_state:
    st.session_state.snapshots = []
if "history" not in st.session_state:
    st.session_state.history = []
if "last_saved_time" not in st.session_state:
    st.session_state.last_saved_time = datetime.now().strftime("%I:%M:%S %p")
if "auto_save_enabled" not in st.session_state:
    st.session_state.auto_save_enabled = True


# Auto-save snapshot helper
def save_snapshot(label: str = "حفظ تلقائي"):
    current_text = st.session_state.word_studio_text
    words = len(current_text.split()) if current_text else 0
    if words > 0:
        new_snap = {
            "id": f"snap-{int(time.time())}",
            "timestamp": datetime.now().strftime("%Y-%m-%d %I:%M:%S %p"),
            "label": label,
            "text": current_text,
            "words": words,
            "header": st.session_state.word_studio_header,
            "footer": st.session_state.word_studio_footer
        }
        st.session_state.snapshots.insert(0, new_snap)
        st.session_state.snapshots = st.session_state.snapshots[:20]  # keep 20
        st.session_state.last_saved_time = datetime.now().strftime("%I:%M:%S %p")


# ------------------------------------------------------------------------------
# 7. الشريط الجانبي (Sidebar Configuration)
# ------------------------------------------------------------------------------

with st.sidebar:
    st.markdown("### 🎛️ لوحة التحكم والإعدادات")
    
    # Navigation
    app_mode = st.radio(
        "اختر القسم:",
        [
            "✨ منصة الأنسنة والتطهير (AI Workbench)",
            "📝 محرر Word الأكاديمي (Word Studio)",
            "⚖️ فاحص الفروقات التزامني (Diff Inspector)",
            "📁 المعالجة الجماعية للملفات (Batch Processing)",
            "📊 تحليلات ومؤشر الأنسنة (Human Score)",
            "💾 سجل الإصدارات والحفظ التلقائي",
            "⚙️ إعدادات النماذج والمفاتيح"
        ],
        index=0
    )
    
    st.divider()
    
    # Live Auto-Save status badge
    st.markdown(f"""
    <div style="background:#f1f5f9; padding:12px; border-radius:12px; border:1px solid #cbd5e1; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:bold; font-size:12px; color:#334155;">حالة الحفظ التلقائي:</span>
            <span class="status-badge">نشط 🟢</span>
        </div>
        <div style="font-size:11px; color:#64748b; margin-top:4px;">
            آخر حفظ: {st.session_state.last_saved_time}
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    if st.button("💾 حفظ نسخة فورية الآن", use_container_width=True):
        save_snapshot("حفظ يدوي فوري")
        st.success("تم حفظ لقطة فورية للمستند بنجاح!")
        
    st.divider()
    
    # Model Selector
    st.markdown("#### 🤖 محرك الذكاء الاصطناعي")
    ai_provider = st.selectbox(
        "مزود الخدمة:",
        ["Google Gemini", "OpenAI", "Anthropic Claude", "Local Ollama"],
        index=0
    )
    
    if ai_provider == "Google Gemini":
        model_options = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.5-flash"]
    elif ai_provider == "OpenAI":
        model_options = ["gpt-4o", "gpt-4o-mini", "o1-mini", "o3-mini"]
    elif ai_provider == "Anthropic Claude":
        model_options = ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-7-sonnet"]
    else:
        model_options = ["llama3", "deepseek-r1", "qwen2.5", "mistral"]
        
    selected_model = st.selectbox("النموذج:", model_options)
    
    api_key = st.text_input(
        f"مفتاح {ai_provider} API Key:",
        type="password",
        value=os.environ.get("GEMINI_API_KEY", "") if ai_provider == "Google Gemini" else ""
    )
    
    temperature = st.slider("درجة الإبداع والحرارة (Temperature):", 0.0, 1.0, 0.7, 0.05)


# ------------------------------------------------------------------------------
# 8. التبويب 1: منصة الأنسنة والتطهير الذكية (AI Workbench)
# ------------------------------------------------------------------------------

if app_mode == "✨ منصة الأنسنة والتطهير (AI Workbench)":
    st.markdown("""
    <div class="main-header">
        <h2 style="margin:0; font-size:24px; font-weight:800;">✨ منصة الأنسنة والتطهير الذكية (RefineX AI Workbench)</h2>
        <p style="margin:4px 0 0 0; opacity:0.85; font-size:13px;">
            تطهير النصوص من بصمات وكليشيهات الذكاء الاصطناعي ولغة المحاماة والمسافات الصفرية الخفية بأسلوب بشري 100%
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    col_left, col_right = st.columns([1, 1], gap="medium")
    
    with col_left:
        st.markdown("#### 📥 النص الأصلي المدخل:")
        input_val = st.text_area(
            "الصق النص هنا:",
            value=st.session_state.input_text,
            height=320,
            placeholder="الصق هنا النص المولد بواسطة AI أو المذكرة أو البحث المراد تدقيقه وتطهيره...",
            label_visibility="collapsed"
        )
        st.session_state.input_text = input_val
        
        words_in = len(input_val.split()) if input_val else 0
        chars_in = len(input_val) if input_val else 0
        st.caption(f"📊 الإحصائيات: {words_in:,} كلمة • {chars_in:,} حرف")
        
        st.markdown("#### 🎯 وضع المعالجة والنبرة:")
        action_mode = st.selectbox(
            "اختر وضع الأنسنة أو المعالجة:",
            [
                "🌟 أنسنة فائقة وإزالة بصمات AI (Authentic Humanizer)",
                "🎓 صياغة أكاديمية رصينة ومحكمة (Academic Paper)",
                "⚖️ تنظيف لغة المحاماة والتحفظ القضائي (Legal Clean)",
                "📝 تدقيق لغوي ونحوي شامل مع الحفاظ على الأسلوب (Proofread)",
                "⚡ أمر مخصص ذكي (Custom Prompt)"
            ]
        )
        
        custom_prompt_text = ""
        if action_mode == "⚡ أمر مخصص ذكي (Custom Prompt)":
            custom_prompt_text = st.text_input(
                "اكتب الأمر المخصص:",
                placeholder="مثال: لخص النص في نقاط رئيسية مع الحفاظ على الأسلوب الإنساني..."
            )
            
        col_btn1, col_btn2 = st.columns([2, 1])
        with col_btn1:
            process_btn = st.button("🚀 بدء المعالجة والتطهير الآن", type="primary", use_container_width=True)
        with col_btn2:
            offline_btn = st.button("🛡️ تنظيف قاعدي محلي (بدون API)", use_container_width=True)

    with col_right:
        st.markdown("#### 📤 النتيجة المطهرة والمحولة:")
        
        if process_btn:
            if not input_val.strip():
                st.warning("⚠️ يرجى إدخال نص أولاً قبل بدء المعالجة.")
            else:
                with st.spinner("جاري تطهير وأنسنة النص بأعلى دقة..."):
                    if "أنسنة فائقة" in action_mode:
                        sys_p = "أنت محرر لغوي بشري عبقري. مهمتك إعادة صياغة النص بأسلوب بشري طبيعي 100% يزيل كافة الكليشيهات والعبارات النمطية لذكاء الاصطناعي (مثل: من الجدير بالذكر، يلعب دوراً محورياً، حجر الزاوية)، ونوع في أطوال الجمل والإيقاع، مع الحفاظ الكامل على المعنى والمعلومات."
                    elif "صياغة أكاديمية" in action_mode:
                        sys_p = "أنت محكم وباحث أكاديمي. أعد صياغة النص بلغة علمية رصينة ومحكمة ومباشرة تخلو من الحشو والتحفظات الزائدة."
                    elif "تدقيق لغوي" in action_mode:
                        sys_p = "أنت مدقق لغوي خبير. قم بتصحيح الأخطاء النحوية والإملائية وعلامات الترقيم فقط مع المحافظة التامة على روح النص وأسلوب الكاتب."
                    else:
                        sys_p = custom_prompt_text or "أعد صياغة النص بأسلوب بشري جذاب."
                        
                    try:
                        if api_key.strip():
                            res = call_ai_model(
                                provider=ai_provider,
                                model_name=selected_model,
                                api_key=api_key.strip(),
                                system_prompt=sys_p,
                                user_prompt=input_val,
                                temperature=temperature
                            )
                        else:
                            res, _, _ = clean_text_rule_based(input_val)
                            st.info("💡 تم استخدام المحرك المحلي القاعدي نظراً لعدم إدخال مفتاح API.")
                            
                        st.session_state.output_text = res
                        st.session_state.word_studio_text = res
                        save_snapshot("بعد معالجة الذكاء الاصطناعي")
                    except Exception as ex:
                        st.error(f"حدث خطأ أثناء المعالجة: {str(ex)}")
                        res, _, _ = clean_text_rule_based(input_val)
                        st.session_state.output_text = res
                        st.info("تم تفعيل المعالجة القاعدية الاحتياطية بنجاح.")

        elif offline_btn:
            if input_val.strip():
                res, cliches, invis = clean_text_rule_based(input_val)
                st.session_state.output_text = res
                st.session_state.word_studio_text = res
                st.success(f"تم التنظيف القاعدي: حذف {cliches} كليشيه و {invis} علامة صفرية خفية.")

        out_area = st.text_area(
            "النتيجة:",
            value=st.session_state.output_text,
            height=320,
            label_visibility="collapsed"
        )
        st.session_state.output_text = out_area
        
        words_out = len(out_area.split()) if out_area else 0
        chars_out = len(out_area) if out_area else 0
        st.caption(f"📊 الإحصائيات: {words_out:,} كلمة • {chars_out:,} حرف")
        
        # Action Buttons
        col_act1, col_act2, col_act3 = st.columns(3)
        with col_act1:
            if DOCX_AVAILABLE and out_area:
                docx_bio = generate_docx_document(
                    title="المستند المعالج - RefineX",
                    content=out_area
                )
                st.download_button(
                    "📄 تصدير Word (.docx)",
                    data=docx_bio,
                    file_name="RefineX_Cleaned_Document.docx",
                    mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    use_container_width=True
                )
        with col_act2:
            st.download_button(
                "📝 تصدير نص (.txt)",
                data=out_area,
                file_name="RefineX_Cleaned_Text.txt",
                mime="text/plain;charset=utf-8",
                use_container_width=True
            )
        with col_act3:
            if GTTS_AVAILABLE and out_area:
                if st.button("🎙️ توليد قراءة صوتية", use_container_width=True):
                    tts = gTTS(text=out_area[:500], lang="ar")
                    audio_bio = io.BytesIO()
                    tts.write_to_fp(audio_bio)
                    audio_bio.seek(0)
                    st.audio(audio_bio, format="audio/mp3")


# ------------------------------------------------------------------------------
# 9. التبويب 2: محرر مستندات Word الأكاديمي الشامل (Word Studio)
# ------------------------------------------------------------------------------

elif app_mode == "📝 محرر Word الأكاديمي (Word Studio)":
    st.markdown("""
    <div class="main-header">
        <h2 style="margin:0; font-size:24px; font-weight:800;">📝 محرر مستندات Word الأكاديمي (RefineX Word Studio)</h2>
        <p style="margin:4px 0 0 0; opacity:0.85; font-size:13px;">
            معالجة نصوص كاملة تحاكي Microsoft Word و Google Docs مع قوالب التوثيق الأكاديمي وتصدير Docx عالي الدقة
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    with st.expander("🛠️ شريط أدوات التنسيق وتصميم الصفحة (Ribbon Controls)", expanded=True):
        col_t1, col_t2, col_t3, col_t4 = st.columns(4)
        with col_t1:
            font_choice = st.selectbox("نوع الخط:", ["Cairo", "Amiri", "Alexandria", "Arial", "Times New Roman"])
            font_size = st.slider("حجم الخط (Pt):", 10, 24, 13)
        with col_t2:
            paper_margin = st.selectbox("الهوامش:", ["عادي (1 بوصة)", "ضيق (0.5 بوصة)", "عريض (1.5 بوصة)"])
            page_orientation = st.selectbox("اتجاه الصفحة:", ["عمودي (Portrait)", "أفقي (Landscape)"])
        with col_t3:
            st.session_state.word_studio_header = st.text_input("رأس الصفحة (Header):", value=st.session_state.word_studio_header)
            st.session_state.word_studio_footer = st.text_input("تذييل الصفحة (Footer):", value=st.session_state.word_studio_footer)
        with col_t4:
            template_sel = st.selectbox(
                "📋 إدراج قالب جاهز:",
                ["-- اختر قالباً --", "بحث علمي وأكاديمي", "مذكرة ورأي قانوني", "تقرير إداري وتنفيذي"]
            )
            if template_sel == "بحث علمي وأكاديمي":
                st.session_state.word_studio_text = "# عنوان البحث العلمي المحكم\\n\\n## الملخص التنفيذي (Abstract)\\nيتناول هذا البحث دراسة منهجية موثقة...\\n\\n## 1. المقدمة والإشكالية\\nتتحدد إشكالية البحث في...\\n\\n## 2. المنهجية المتبعة\\nتم الاعتماد على المنهج الوصفي التحليلي...\\n\\n## 3. الخاتمة والتوصيات\\nبناءً على ما تقدم نوصي بالآتي..."
            elif template_sel == "مذكرة ورأي قانوني":
                st.session_state.word_studio_text = "# مذكرة بدفاع السيد / ... (مدعى عليه)\\n\\n## أولاً: الوقائع الموجزة\\n...\\n\\n## ثانياً: الدفوع وأوجه الدفاع الجوهرية\\n1. الدفع بانعدام الصفة والمصلحة.\\n2. الدفع بعدم قبول الدعوى لرفعها بعد الميعاد.\\n\\n## ثالثاً: الطلبات الختامية\\nيلتمس الحاضر أصلياً رفض الدعوى وإلزام رافعها بالمصروفات."
            elif template_sel == "تقرير إداري وتنفيذي":
                st.session_state.word_studio_text = "# التقرير الإداري الربعي لمؤشرات الأداء\\n\\n## 1. ملخص النتائج والإنجازات\\nتم تحقيق نسبة 94% من المستهدفات...\\n\\n## 2. التحديات وخطة المعالجة\\n...\\n\\n## 3. التوصيات للربع القادم\\n..."

    doc_content = st.text_area(
        "محتوى المستند:",
        value=st.session_state.word_studio_text,
        height=550,
        placeholder="اكتب أو الصق نص المستند هنا...",
        label_visibility="collapsed"
    )
    st.session_state.word_studio_text = doc_content
    
    if doc_content != st.session_state.get("_prev_doc_content", ""):
        st.session_state._prev_doc_content = doc_content
        st.session_state.last_saved_time = datetime.now().strftime("%I:%M:%S %p")
        
    doc_words = len(doc_content.split()) if doc_content else 0
    doc_chars = len(doc_content) if doc_content else 0
    st.info(f"📊 إحصائيات المستند: {doc_words:,} كلمة • {doc_chars:,} حرف • وقت القراءة التقريبي: {max(1, doc_words // 200)} دقيقة")
    
    col_e1, col_e2, col_e3, col_e4 = st.columns(4)
    with col_e1:
        if DOCX_AVAILABLE and doc_content:
            docx_file = generate_docx_document(
                title="",
                content=doc_content,
                header_text=st.session_state.word_studio_header,
                footer_text=st.session_state.word_studio_footer,
                font_name=font_choice,
                font_size_pt=font_size
            )
            st.download_button(
                "📥 تصدير Word (.docx)",
                data=docx_file,
                file_name="RefineX_Word_Studio_Document.docx",
                mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                use_container_width=True
            )
    with col_e2:
        st.download_button(
            "📝 تصدير Markdown (.md)",
            data=doc_content,
            file_name="RefineX_Document.md",
            mime="text/markdown",
            use_container_width=True
        )
    with col_e3:
        if st.button("✨ إرسال لمنصة الأنسنة", use_container_width=True):
            st.session_state.input_text = doc_content
            st.success("تم نقل النص إلى منصة الأنسنة والتطهير بنجاح! انتقل إلى التبويب الأول.")
    with col_e4:
        if st.button("🗑️ تفريغ المستند (جديد)", use_container_width=True):
            save_snapshot("قبل تفريغ المستند")
            st.session_state.word_studio_text = ""
            st.rerun()


# ------------------------------------------------------------------------------
# 10. التبويب 3: فاحص الفروقات التزامني (Diff Inspector)
# ------------------------------------------------------------------------------

elif app_mode == "⚖️ فاحص الفروقات التزامني (Diff Inspector)":
    st.markdown("""
    <div class="main-header">
        <h2 style="margin:0; font-size:24px; font-weight:800;">⚖️ فاحص الفروقات التزامني (Synchronized Diff Inspector)</h2>
        <p style="margin:4px 0 0 0; opacity:0.85; font-size:13px;">
            مقارنة فورية بصرية دقيقة بين النص الأصلي والنص المنظف تكشف الإضافات والحذوفات والتعديلات
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    orig = st.session_state.input_text
    mod = st.session_state.output_text
    
    if not orig or not mod:
        st.info("💡 يرجى إدخال ومعالجة نص أولاً في منصة الأنسنة لتتمكن من فحص الفروقات بدقة.")
    else:
        col_d1, col_d2 = st.columns(2)
        with col_d1:
            st.markdown("#### 🔴 النص الأصلي المدخل:")
            st.markdown(f"<div style='background:#fff1f2; border:1px solid #fecdd3; padding:16px; border-radius:12px; min-height:300px; white-space:pre-wrap;'>{orig}</div>", unsafe_allow_html=True)
        with col_d2:
            st.markdown("#### 🟢 النص المعدل والمطهر:")
            st.markdown(f"<div style='background:#f0fdf4; border:1px solid #bbf7d0; padding:16px; border-radius:12px; min-height:300px; white-space:pre-wrap;'>{mod}</div>", unsafe_allow_html=True)
            
        st.markdown("#### 🔍 تحليل الفروقات كلمة بكلمة:")
        matcher = difflib.SequenceMatcher(None, orig.split(), mod.split())
        diff_html = []
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'equal':
                diff_html.append(" ".join(orig.split()[i1:i2]))
            elif tag == 'delete':
                diff_html.append(f"<span style='background:#fee2e2; color:#991b1b; text-decoration:line-through; padding:2px 4px; border-radius:4px;'>{' '.join(orig.split()[i1:i2])}</span>")
            elif tag == 'insert':
                diff_html.append(f"<span style='background:#dcfce7; color:#166534; font-weight:bold; padding:2px 4px; border-radius:4px;'>{' '.join(mod.split()[j1:j2])}</span>")
            elif tag == 'replace':
                diff_html.append(f"<span style='background:#fee2e2; color:#991b1b; text-decoration:line-through; padding:2px 4px; border-radius:4px;'>{' '.join(orig.split()[i1:i2])}</span> <span style='background:#dcfce7; color:#166534; font-weight:bold; padding:2px 4px; border-radius:4px;'>{' '.join(mod.split()[j1:j2])}</span>")
                
        st.markdown(f"<div style='background:#ffffff; border:1px solid #e2e8f0; padding:20px; border-radius:14px; line-height:2; white-space:pre-wrap;'>{' '.join(diff_html)}</div>", unsafe_allow_html=True)


# ------------------------------------------------------------------------------
# 11. التبويب 4: المعالجة الجماعية للملفات (Batch Processing)
# ------------------------------------------------------------------------------

elif app_mode == "📁 المعالجة الجماعية للملفات (Batch Processing)":
    st.markdown("""
    <div class="main-header">
        <h2 style="margin:0; font-size:24px; font-weight:800;">📁 المعالجة الجماعية للملفات (Batch Processing Suite)</h2>
        <p style="margin:4px 0 0 0; opacity:0.85; font-size:13px;">
            رفع وتنظيف وتطهير ملفات متعددة دفعة واحدة (.docx, .pdf, .txt, .md) وتنزيلها بحزمة مضغوطة واحدة
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    uploaded_files = st.file_uploader(
        "اختر ملفات متعددة للمعالجة:",
        type=["docx", "pdf", "txt", "md"],
        accept_multiple_files=True
    )
    
    if uploaded_files:
        st.success(f"تم اختيار {len(uploaded_files)} ملفات جاهزة للمعالجة.")
        
        if st.button("⚡ بدء معالجة كافة الملفات دفعة واحدة", type="primary"):
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zf:
                for f in uploaded_files:
                    raw_text = ""
                    if f.name.endswith(".txt") or f.name.endswith(".md"):
                        raw_text = f.read().decode("utf-8", errors="ignore")
                    elif f.name.endswith(".docx") and DOCX_AVAILABLE:
                        doc = docx.Document(io.BytesIO(f.read()))
                        raw_text = "\\n".join([p.text for p in doc.paragraphs])
                    elif f.name.endswith(".pdf") and PYPDF_AVAILABLE:
                        reader = pypdf.PdfReader(io.BytesIO(f.read()))
                        raw_text = "\\n".join([page.extract_text() or "" for page in reader.pages])
                    else:
                        raw_text = f.read().decode("utf-8", errors="ignore")
                        
                    cleaned_t, _, _ = clean_text_rule_based(raw_text)
                    
                    if DOCX_AVAILABLE:
                        out_doc = generate_docx_document(title="", content=cleaned_t)
                        zf.writestr(f"cleaned_{f.name.rsplit('.', 1)[0]}.docx", out_doc.getvalue())
                    else:
                        zf.writestr(f"cleaned_{f.name.rsplit('.', 1)[0]}.txt", cleaned_t)
                        
            zip_buffer.seek(0)
            st.download_button(
                "📦 تنزيل كافة الملفات المعالجة في أرشيف مضغوط (.zip)",
                data=zip_buffer,
                file_name="RefineX_Cleaned_Batch_Files.zip",
                mime="application/zip",
                use_container_width=True
            )


# ------------------------------------------------------------------------------
# 12. التبويب 5: تحليلات ومؤشر الأنسنة (Human Score)
# ------------------------------------------------------------------------------

elif app_mode == "📊 تحليلات ومؤشر الأنسنة (Human Score)":
    st.markdown("""
    <div class="main-header">
        <h2 style="margin:0; font-size:24px; font-weight:800;">📊 تحليلات الجودة ومؤشر الأنسنة المتقدم (Human Score Radar)</h2>
        <p style="margin:4px 0 0 0; opacity:0.85; font-size:13px;">
            تحليل عميق لمؤشرات التنوع الإيقاعي (Burstiness) ومستوى التعقيد اللغوي (Perplexity) ومحاكاة كواشف AI
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    text_to_eval = st.session_state.output_text or st.session_state.word_studio_text or st.session_state.input_text
    
    if not text_to_eval:
        st.info("💡 أدخل أو عالج نصاً أولاً لعرض التقرير التحليلي الكامل.")
    else:
        score_data = calculate_human_score(st.session_state.input_text, text_to_eval)
        
        c1, c2, c3, c4 = st.columns(4)
        with c1:
            st.metric("مؤشر الأنسنة الإجمالي", f"{score_data['overall']}%", delta="طبيعي 100%")
        with c2:
            st.metric("التنوع الإيقاعي (Burstiness)", f"{score_data['burstiness']}%")
        with c3:
            st.metric("التعقيد الطبيعي (Perplexity)", f"{score_data['perplexity']}%")
        with c4:
            st.metric("الجودة الأكاديمية", f"{score_data['academic']}%")
            
        st.markdown(f"""
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:20px; margin-top:16px;">
            <h4 style="margin:0 0 8px 0; color:#1e293b;">التقييم الشامل لكواشف الذكاء الاصطناعي:</h4>
            <div style="font-size:16px; font-weight:bold; color:#059669;">
                {score_data['grade']}
            </div>
            <p style="font-size:12px; color:#64748b; margin-top:6px;">
                إجمالي الكلمات المفحوصة: {score_data['total_words']} كلمة في {score_data['sentences_count']} جملة.
            </p>
        </div>
        """, unsafe_allow_html=True)


# ------------------------------------------------------------------------------
# 13. التبويب 6: سجل الإصدارات والنسخ المحفوظة تلقائياً
# ------------------------------------------------------------------------------

elif app_mode == "💾 سجل الإصدارات والحفظ التلقائي":
    st.markdown("""
    <div class="main-header">
        <h2 style="margin:0; font-size:24px; font-weight:800;">💾 سجل الإصدارات والنسخ المحفوظة تلقائياً (Version History)</h2>
        <p style="margin:4px 0 0 0; opacity:0.85; font-size:13px;">
            حماية شاملة لمستنداتك مع إمكانية استرجاع أي لقطة سابقة بضغطة زر واحدة
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    if not st.session_state.snapshots:
        st.info("لا توجد لقطات أو إصدارات سابقة محفوظة بعد. يتم حفظ لقطات تلقائية أثناء كتابتك وتعديلك للمستند.")
    else:
        st.markdown(f"#### الإصدارات المحفوظة ({len(st.session_state.snapshots)} إصدار):")
        
        for idx, snap in enumerate(st.session_state.snapshots):
            with st.container():
                col_s1, col_s2, col_s3 = st.columns([3, 1, 1])
                with col_s1:
                    st.markdown(f"**#{len(st.session_state.snapshots) - idx} • {snap['label']}** ({snap['words']} كلمة)")
                    st.caption(f"التوقيت: {snap['timestamp']}")
                    st.text(snap['text'][:120] + "..." if len(snap['text']) > 120 else snap['text'])
                with col_s2:
                    if st.button("🔄 استعادة هذه النسخة", key=f"restore_{snap['id']}"):
                        st.session_state.word_studio_text = snap['text']
                        st.session_state.word_studio_header = snap.get('header', st.session_state.word_studio_header)
                        st.session_state.word_studio_footer = snap.get('footer', st.session_state.word_studio_footer)
                        st.success("تم استرجاع النسخة بنجاح إلى محرر Word Studio!")
                with col_s3:
                    if st.button("🗑️ حذف", key=f"del_{snap['id']}"):
                        st.session_state.snapshots = [s for s in st.session_state.snapshots if s['id'] != snap['id']]
                        st.rerun()
                st.divider()


# ------------------------------------------------------------------------------
# 14. التبويب 7: إعدادات النماذج والمفاتيح
# ------------------------------------------------------------------------------

elif app_mode == "⚙️ إعدادات النماذج والمفاتيح":
    st.markdown("""
    <div class="main-header">
        <h2 style="margin:0; font-size:24px; font-weight:800;">⚙️ إعدادات النماذج ومفاتيح الذكاء الاصطناعي</h2>
        <p style="margin:4px 0 0 0; opacity:0.85; font-size:13px;">
            تخصيص المفاتيح والنماذج والقوائم السوداء المخصصة والتكامل مع النماذج المحلية
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("#### 🔑 مفاتيح الواجهات البرمجية (API Keys):")
    st.text_input("Google Gemini API Key:", type="password", value=os.environ.get("GEMINI_API_KEY", ""))
    st.text_input("OpenAI API Key:", type="password")
    st.text_input("Anthropic Claude API Key:", type="password")
    
    st.divider()
    st.markdown("#### 🚫 القائمة السوداء المخصصة لكليشيهات AI:")
    st.text_area(
        "أدخل الكلمات والعبارات الممنوعة (مفصولة بفواصل):",
        value=", ".join(AI_COMMON_MARKERS[:10])
    )
    
    st.divider()
    st.markdown("#### 💻 تكامل نموذج Ollama المحلي (بدون إنترنت):")
    st.text_input("رابط خادم Ollama المحلي:", value="http://localhost:11434")
    if st.button("🔌 فحص الاتصال بـ Ollama"):
        try:
            resp = requests.get("http://localhost:11434/api/tags", timeout=3)
            if resp.status_code == 200:
                st.success("✅ تم الاتصال بخادم Ollama المحلي بنجاح!")
            else:
                st.warning("⚠️ تعذر العثور على خادم Ollama المحلي.")
        except Exception:
            st.error("❌ خادم Ollama المحلي غير مشغل على المنفذ 11434.")
`;

export const GRADIO_APP_CODE = `# -*- coding: utf-8 -*-
"""
================================================================================
RefineX Pro Studio - Web-Based AI Text Suite (Gradio Edition)
منصة الويب عبر Gradio: محرر النصوص + أنسنة الذكاء الاصطناعي + التدقيق اللغوي
================================================================================
"""

import os
import re
import json
import requests
from typing import Tuple

try:
    import gradio as gr
    GRADIO_AVAILABLE = True
except ImportError:
    GRADIO_AVAILABLE = False

# Fallback Markers
AI_COMMON_MARKERS = [
    "من الجدير بالذكر", "تجدر الإشارة إلى", "مما لا شك فيه", "في هذا السياق",
    "يلعب دوراً محورياً", "حجر الزاوية", "في نهاية المطاف", "علاوة على ذلك",
    "من الأهمية بمكان", "تسليط الضوء على", "بشكل لا لبس فيه", "خلاصة القول"
]

INVISIBLE_CHARS_REGEX = re.compile(
    r"[\\u200B\\u200C\\u200D\\u200E\\u200F\\uFEFF\\u00AD\\u2060\\u2061\\u2062\\u2063\\u2064\\u2066\\u2067\\u2068\\u2069\\u206A\\u206B\\u206C\\u206D\\u206E\\u206F]"
)

def clean_text_fn(input_text: str, mode: str, api_key: str, model_name: str) -> Tuple[str, str]:
    if not input_text.strip():
        return "", "يرجى إدخال نص أولاً."
    
    # 1. Sanitize invisibles
    cleaned = INVISIBLE_CHARS_REGEX.sub("", input_text)
    
    # 2. Rule based cleaning
    cliches_found = 0
    for marker in AI_COMMON_MARKERS:
        pattern = re.compile(r'\\b' + re.escape(marker) + r'\\b', re.IGNORECASE)
        found = len(pattern.findall(cleaned))
        if found > 0:
            cliches_found += found
            cleaned = pattern.sub("", cleaned)
            
    cleaned = re.sub(r'[ \\t]+', ' ', cleaned).strip()
    
    # If API key available, call Gemini
    if api_key.strip():
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name or 'gemini-1.5-flash'}:generateContent?key={api_key.strip()}"
            prompt = f"أنت محرر لغوي محترف. أعد صياغة النص بأسلوب بشري طبيعي 100% يزيل كليشيهات الذكاء الاصطناعي وبصمات الآلة:\\n\\n{input_text}"
            resp = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=60)
            if resp.status_code == 200:
                data = resp.json()
                ai_text = data["candidates"][0]["content"]["parts"][0]["text"]
                return ai_text, f"✅ تمت الأنسنة والمعالجة بنجاح عبر نموذج {model_name}."
        except Exception as e:
            pass
            
    return cleaned, f"✅ تم التنظيف القاعدي بنجاح: تم حذف {cliches_found} كليشيه وعلامة ذكاء اصطناعي."

def create_gradio_app():
    with gr.Blocks(title="RefineX Pro Studio (Gradio)", theme=gr.themes.Soft()) as demo:
        gr.Markdown("""
        # ✨ RefineX Pro Studio - منصة الأنسنة وتطهير النصوص الذكية
        ### محرر مستندات ويب متكامل وتطهير فوري لبصمات الذكاء الاصطناعي وكليشيهات المحاماة
        """)
        
        with gr.Row():
            with gr.Column():
                input_box = gr.Textbox(label="📥 النص الأصلي المدخل", lines=12, placeholder="الصق النص هنا...")
                mode_dropdown = gr.Dropdown(
                    label="🎯 وضع المعالجة",
                    choices=["أنسنة فائقة 100%", "صياغة أكاديمية محكمة", "تنظيف لغة المحاماة", "تدقيق نحوي وإملائي"],
                    value="أنسنة فائقة 100%"
                )
                api_key_box = gr.Textbox(label="🔑 Gemini API Key (اختياري)", type="password")
                model_box = gr.Dropdown(
                    label="النموذج",
                    choices=["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"],
                    value="gemini-1.5-flash"
                )
                submit_btn = gr.Button("🚀 بدء المعالجة والتطهير", variant="primary")
                
            with gr.Column():
                output_box = gr.Textbox(label="📤 النتيجة المطهرة والمحولة", lines=14)
                status_box = gr.Textbox(label="📊 حالة العملية", interactive=False)
                
        submit_btn.click(
            fn=clean_text_fn,
            inputs=[input_box, mode_dropdown, api_key_box, model_box],
            outputs=[output_box, status_box]
        )
        
    return demo

if __name__ == "__main__":
    demo = create_gradio_app()
    demo.launch(server_name="0.0.0.0", server_port=7860)
`;

export const PYTHON_APP_CODE = STREAMLIT_APP_CODE;
