import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { DetailedAnalysisResult } from "../types";
import { BarChart3, PieChart as PieIcon, ShieldAlert, Sparkles, Scale, EyeOff, CheckCircle2 } from "lucide-react";

interface Props {
  analysis: DetailedAnalysisResult;
  isProofread?: boolean;
}

export const IssueDistributionChart: React.FC<Props> = ({ analysis, isProofread }) => {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  if (!analysis || analysis.totalIssues === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-700">النص سليم وخالٍ من الأخطاء أو الشوائب البارزة</p>
        <p className="text-xs text-slate-400 mt-1">لم يتم رصد بصمات AI رنانة أو عبارات محاماة أو علامات مخفية.</p>
      </div>
    );
  }

  const chartData = analysis.chartData;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs font-sans border border-slate-700">
          <div className="font-bold flex items-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.name}</span>
          </div>
          <div className="text-slate-300">
            العدد المكتشف: <strong className="text-white">{data.count}</strong>
          </div>
          <div className="text-slate-300">
            النسبة من الإجمالي: <strong className="text-white">%{data.percentage}</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            تحليل وتوزيع أنواع الشوائب والأخطاء المكتشفة ({analysis.totalIssues} إجمالي)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            مخطط بياني يوضح نسب بصمات الذكاء الاصطناعي، لغة المحاماة، العلامات المخفية، والأخطاء اللغوية
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartType("bar")}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1 ${
              chartType === "bar"
                ? "bg-white text-blue-700 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            أعمدة
          </button>
          <button
            type="button"
            onClick={() => setChartType("pie")}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1 ${
              chartType === "pie"
                ? "bg-white text-blue-700 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            دائري
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-rose-50/70 border border-rose-200/70 rounded-xl p-2.5">
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold mb-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              بصمات AI
            </span>
            <span>{analysis.aiMarkersCount}</span>
          </div>
          <div className="w-full bg-rose-200/50 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full"
              style={{ width: `${analysis.totalIssues > 0 ? (analysis.aiMarkersCount / analysis.totalIssues) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-2.5">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold mb-1">
            <span className="flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              لغة محاماة
            </span>
            <span>{analysis.legalMarkersCount}</span>
          </div>
          <div className="w-full bg-amber-200/50 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${analysis.totalIssues > 0 ? (analysis.legalMarkersCount / analysis.totalIssues) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-purple-50/70 border border-purple-200/70 rounded-xl p-2.5">
          <div className="flex items-center justify-between text-purple-800 text-xs font-semibold mb-1">
            <span className="flex items-center gap-1">
              <EyeOff className="w-3.5 h-3.5" />
              علامات مخفية
            </span>
            <span>{analysis.invisibleCount}</span>
          </div>
          <div className="w-full bg-purple-200/50 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full"
              style={{ width: `${analysis.totalIssues > 0 ? (analysis.invisibleCount / analysis.totalIssues) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-2.5">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold mb-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              تدقيق لغوي ونحوي
            </span>
            <span>{analysis.grammarFixesCount}</span>
          </div>
          <div className="w-full bg-emerald-200/50 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${analysis.totalIssues > 0 ? (analysis.grammarFixesCount / analysis.totalIssues) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 11 }}
                interval={0}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                allowDecimals={false}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={75}
                innerRadius={38}
                paddingAngle={3}
                label={({ name, percentage }) => `${name} (%${percentage})`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-pie-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-xs text-slate-700">{value}</span>}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
