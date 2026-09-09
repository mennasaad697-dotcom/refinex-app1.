import React from "react";
import { DetailedAnalysisResult, ProcessingStats } from "../types";
import { Sparkles, FileText, CheckCircle2, ShieldCheck, Scale, EyeOff } from "lucide-react";

interface Props {
  inputText: string;
  outputText: string;
  stats: ProcessingStats | null;
  analysis: DetailedAnalysisResult | null;
  isProofread?: boolean;
}

export const ReportPDFView: React.FC<Props> = ({
  inputText,
  outputText,
  stats,
  analysis,
  isProofread
}) => {
  const inputWords = inputText ? inputText.trim().split(/\s+/).length : 0;
  const outputWords = outputText ? outputText.trim().split(/\s+/).length : 0;
  const dateStr = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = new Date().toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div
      id="pdf-report-container"
      className="p-8 bg-white text-slate-900 max-w-4xl mx-auto space-y-6 rounded-none font-sans"
      dir="rtl"
    >
      {/* Header */}
      <div className="border-b-2 border-slate-900 pb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-600 text-white rounded-lg inline-block">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              تقرير {isProofread ? "التحسين والتدقيق اللغوي" : "تنظيف النصوص وتطهير بصمات AI"}
            </h1>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            نظام متقدم لتنظيف النصوص، إزالة بصمات الذكاء الاصطناعي، لغة المحاماة، والعلامات المخفية
          </p>
        </div>

        <div className="text-left text-xs text-slate-600 space-y-0.5 font-mono">
          <div>التاريخ: <strong className="text-slate-900">{dateStr}</strong></div>
          <div>الوقت: <strong className="text-slate-900">{timeStr}</strong></div>
          <div>النموذج: <strong className="text-slate-900">{stats?.modelUsed || "Gemini"}</strong></div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="border border-slate-300 p-3 rounded-lg bg-slate-50">
          <span className="text-[11px] text-slate-600 block font-medium">النص الأصلي</span>
          <strong className="text-base text-slate-900 block mt-0.5">{inputWords} كلمة</strong>
          <span className="text-[10px] text-slate-500 font-mono">({inputText.length} حرف)</span>
        </div>

        <div className="border border-blue-200 p-3 rounded-lg bg-blue-50/50">
          <span className="text-[11px] text-blue-800 block font-medium">بعد المعالجة</span>
          <strong className="text-base text-blue-900 block mt-0.5">{outputWords} كلمة</strong>
          <span className="text-[10px] text-blue-700 font-mono">({outputText.length} حرف)</span>
        </div>

        <div className="border border-purple-200 p-3 rounded-lg bg-purple-50/50">
          <span className="text-[11px] text-purple-800 block font-medium">العلامات المخفية المزالة</span>
          <strong className="text-base text-purple-900 block mt-0.5">{stats?.invisibleCharsRemoved || analysis?.invisibleCount || 0}</strong>
          <span className="text-[10px] text-purple-700">رموز ومسافات صفرية</span>
        </div>

        <div className="border border-emerald-200 p-3 rounded-lg bg-emerald-50/50">
          <span className="text-[11px] text-emerald-800 block font-medium">إجمالي الشوائب المعالجة</span>
          <strong className="text-base text-emerald-900 block mt-0.5">{analysis?.totalIssues || 0}</strong>
          <span className="text-[10px] text-emerald-700">عنصر مفكك ومصحح</span>
        </div>
      </div>

      {/* Issue Distribution Table */}
      {analysis && analysis.chartData.length > 0 && (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>توزيع الشوائب والأخطاء المكتشفة</span>
            <span className="text-slate-600 font-normal">المجموع: {analysis.totalIssues} مشكلة</span>
          </div>
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="py-2 px-3">نوع المشكلة</th>
                <th className="py-2 px-3">العدد المكتشف</th>
                <th className="py-2 px-3">النسبة</th>
                <th className="py-2 px-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analysis.chartData.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-3 font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-slate-900">{item.count}</td>
                  <td className="py-2 px-3 font-mono text-slate-700">%{item.percentage}</td>
                  <td className="py-2 px-3 text-emerald-600 font-bold">تم التطهير والتفكيك ✓</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Final Cleaned Text Section */}
      <div className="border-t-2 border-slate-900 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            النص المنظف والنهائي (النسخة البشرية المعتمدة)
          </h2>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            خالٍ تماماً من بصمات AI والعلامات المخفية
          </span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
          {outputText || "لا يوجد نص منظف متاح."}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>وثيقة معتمدة ومطهرة من العلامات المائية الاصطناعية</span>
        </div>
        <span>تم التصدير بواسطة منظف وباحث بصمات الذكاء الاصطناعي</span>
      </div>
    </div>
  );
};
