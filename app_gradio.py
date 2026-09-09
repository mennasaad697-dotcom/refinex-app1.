# -*- coding: utf-8 -*-
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
    r"[\u200B\u200C\u200D\u200E\u200F\uFEFF\u00AD\u2060\u2061\u2062\u2063\u2064\u2066\u2067\u2068\u2069\u206A\u206B\u206C\u206D\u206E\u206F]"
)

def clean_text_fn(input_text: str, mode: str, api_key: str, model_name: str) -> Tuple[str, str]:
    if not input_text.strip():
        return "", "يرجى إدخال نص أولاً."
    
    # 1. Sanitize invisibles
    cleaned = INVISIBLE_CHARS_REGEX.sub("", input_text)
    
    # 2. Rule based cleaning
    cliches_found = 0
    for marker in AI_COMMON_MARKERS:
        pattern = re.compile(r'\b' + re.escape(marker) + r'\b', re.IGNORECASE)
        found = len(pattern.findall(cleaned))
        if found > 0:
            cliches_found += found
            cleaned = pattern.sub("", cleaned)
            
    cleaned = re.sub(r'[ \t]+', ' ', cleaned).strip()
    
    # If API key available, call Gemini
    if api_key.strip():
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name or 'gemini-1.5-flash'}:generateContent?key={api_key.strip()}"
            prompt = f"أنت محرر لغوي محترف. أعد صياغة النص بأسلوب بشري طبيعي 100% يزيل كليشيهات الذكاء الاصطناعي وبصمات الآلة:\n\n{input_text}"
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
