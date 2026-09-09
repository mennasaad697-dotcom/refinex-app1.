import React from "react";
import { HumanScoreResult } from "../types";
import { UserCheck, ShieldAlert, Sparkles, TrendingUp, Award } from "lucide-react";

interface Props {
  humanScore: HumanScoreResult;
  isProofread?: boolean;
}

export const HumanScoreGauge: React.FC<Props> = ({ humanScore, isProofread }) => {
  const { beforeScore, afterScore, label, description } = humanScore;
  const improvement = Math.max(0, afterScore - beforeScore);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white rounded-2xl p-5 border border-slate-700/60 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              مؤشر الطابع البشري الموثوق (Human-Likeness Score)
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                +{improvement}% قفزة نوعية
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              قياس درجة أصالة وتدفق النص البشري وخلوه من النبرة الآلية الرنانة
            </p>
          </div>
        </div>

        <div className="text-left">
          <span className="text-xs text-slate-300 font-medium block">الدرجة النهائية</span>
          <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
            %{afterScore}
          </span>
        </div>
      </div>

      {/* Two Compare Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Before Score */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              النص الأصلي (قبل المعالجة)
            </span>
            <span className="font-mono font-bold text-rose-300">%{beforeScore}</span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-700"
              style={{ width: `${beforeScore}%` }}
            />
          </div>
          <span className="text-[10px] text-rose-300/80 block">
            {beforeScore < 35 ? "⚠️ مشبع ببصمات آلية وديباجات تحفظ متكررة" : "نبرة غير متناسقة تحتاج تصفية"}
          </span>
        </div>

        {/* After Score */}
        <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-300 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              بعد المعالجة والتنقيح
            </span>
            <span className="font-mono font-bold text-emerald-300">%{afterScore}</span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-700"
              style={{ width: `${afterScore}%` }}
            />
          </div>
          <span className="text-[10px] text-emerald-300/90 block font-medium">
            ✓ {label}
          </span>
        </div>
      </div>

      {/* Description Footer */}
      <div className="text-xs text-slate-300 bg-slate-800/40 border border-slate-700/40 rounded-xl p-2.5 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span>{description}</span>
      </div>
    </div>
  );
};
