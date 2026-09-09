import React from "react";
import { 
  ListTree, 
  MessageSquare, 
  BarChart2, 
  Trash2, 
  Check, 
  Plus, 
  Clock, 
  Mic, 
  FileText,
  Target
} from "lucide-react";

export interface DocumentHeading {
  id: string;
  text: string;
  level: number;
}

export interface DocumentComment {
  id: string;
  author: string;
  text: string;
  selectedText: string;
  date: string;
  resolved: boolean;
}

interface WordStudioOutlineProps {
  headings: DocumentHeading[];
  comments: DocumentComment[];
  wordCount: number;
  charCount: number;
  paragraphCount: number;
  wordGoal: number;
  onSetWordGoal: (goal: number) => void;
  onJumpToHeading: (id: string) => void;
  onAddComment: (commentText: string) => void;
  onResolveComment: (id: string) => void;
  onDeleteComment: (id: string) => void;
  activeOutlineTab: "outline" | "comments" | "stats";
  setActiveOutlineTab: (tab: "outline" | "comments" | "stats") => void;
}

export const WordStudioOutline: React.FC<WordStudioOutlineProps> = ({
  headings,
  comments,
  wordCount,
  charCount,
  paragraphCount,
  wordGoal,
  onSetWordGoal,
  onJumpToHeading,
  onAddComment,
  onResolveComment,
  onDeleteComment,
  activeOutlineTab,
  setActiveOutlineTab
}) => {
  const [newCommentText, setNewCommentText] = React.useState("");
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const speakingTime = Math.max(1, Math.ceil(wordCount / 130));
  const goalProgress = wordGoal > 0 ? Math.min(100, Math.round((wordCount / wordGoal) * 100)) : 0;

  return (
    <aside aria-label="شريط المستند الجانبي" className="w-72 bg-slate-50 dark:bg-slate-850 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden text-xs">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <button
          onClick={() => setActiveOutlineTab("outline")}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 font-bold border-b-2 transition-all ${
            activeOutlineTab === "outline"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/30"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
          title="مخطط العناوين والمحتويات"
        >
          <ListTree className="w-3.5 h-3.5" />
          <span>المخطط</span>
        </button>

        <button
          onClick={() => setActiveOutlineTab("comments")}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 font-bold border-b-2 transition-all ${
            activeOutlineTab === "comments"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/30"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
          title="التعليقات والملاحظات"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>التعليقات ({comments.filter(c => !c.resolved).length})</span>
        </button>

        <button
          onClick={() => setActiveOutlineTab("stats")}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 font-bold border-b-2 transition-all ${
            activeOutlineTab === "stats"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/30"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
          title="إحصائيات وتقدم الكلمات"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>الإحصاء</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Tab 1: Outline / Headings */}
        {activeOutlineTab === "outline" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-500 pb-1 border-b border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-[11px]">هيكل المستند التلقائي (TOC)</span>
              <span className="text-[10px]">{headings.length} عنوان</span>
            </div>

            {headings.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <ListTree className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs">لم يتم العثور على عناوين رئيسية (H1, H2, H3).</p>
                <p className="text-[10px] text-slate-400">حدد نصاً واختر نمط عنوان لإدراجه في المخطط تلقائياً.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {headings.map((h, i) => (
                  <button
                    key={h.id || i}
                    onClick={() => onJumpToHeading(h.id)}
                    style={{ paddingRight: `${(h.level - 1) * 12 + 6}px` }}
                    className="w-full text-right py-1.5 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center gap-1.5 group truncate"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 group-hover:scale-125 transition-transform" />
                    <span className="truncate">{h.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Comments / Notes */}
        {activeOutlineTab === "comments" && (
          <div className="space-y-3">
            {/* Add Comment Box */}
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] block">
                إضافة تعليق / ملاحظة مراجعة:
              </span>
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="اكتب ملاحظتك على المستند..."
                className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-16"
              />
              <button
                onClick={() => {
                  if (newCommentText.trim()) {
                    onAddComment(newCommentText.trim());
                    setNewCommentText("");
                  }
                }}
                disabled={!newCommentText.trim()}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center justify-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إدراج التعليق</span>
              </button>
            </div>

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="py-6 text-center text-slate-400 space-y-1">
                <MessageSquare className="w-7 h-7 mx-auto opacity-30" />
                <p className="text-xs">لا توجد تعليقات حتى الآن</p>
              </div>
            ) : (
              <div className="space-y-2">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      comment.resolved
                        ? "bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60"
                        : "bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/50 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                        {comment.author}
                      </span>
                      <span className="text-[9px] text-slate-400">{comment.date}</span>
                    </div>

                    {comment.selectedText && (
                      <div className="my-1 text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 p-1 rounded border-r-2 border-amber-500 italic truncate">
                        "{comment.selectedText}"
                      </div>
                    )}

                    <p className="text-slate-700 dark:text-slate-300 my-1.5 leading-relaxed">
                      {comment.text}
                    </p>

                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => onResolveComment(comment.id)}
                        className={`p-1 rounded-md transition-colors ${
                          comment.resolved
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                        }`}
                        title={comment.resolved ? "إعادة فتح" : "تمت المعالجة"}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        title="حذف التعليق"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Statistics & Goal Tracker */}
        {activeOutlineTab === "stats" && (
          <div className="space-y-3">
            {/* Target Goal Progress */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  هدف الكلمات
                </span>
                <span className="text-[11px] font-bold text-blue-600">
                  {wordCount} / {wordGoal > 0 ? wordGoal : "بدون حد"}
                </span>
              </div>

              {wordGoal > 0 && (
                <div className="space-y-1">
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        goalProgress >= 100 ? "bg-emerald-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${goalProgress}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-right text-slate-400">
                    تم إنجاز {goalProgress}% من الهدف المطلوب
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500">تعديل الهدف:</span>
                <select
                  value={wordGoal}
                  onChange={(e) => onSetWordGoal(Number(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-medium"
                >
                  <option value="0">بدون هدف</option>
                  <option value="300">300 كلمة (مقال قصير)</option>
                  <option value="600">600 كلمة (مقال قياسي)</option>
                  <option value="1200">1,200 كلمة (بحث مصغر)</option>
                  <option value="2500">2,500 كلمة (ورقة علمية)</option>
                  <option value="5000">5,000 كلمة (فصل كتاب)</option>
                  <option value="10000">10,000 كلمة (أطروحة)</option>
                </select>
              </div>
            </div>

            {/* Read & Speak Time */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <Clock className="w-4 h-4 mx-auto text-amber-500" />
                <div className="font-bold text-slate-800 dark:text-slate-100">{readingTime} دقيقة</div>
                <div className="text-[10px] text-slate-400">وقت القراءة</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <Mic className="w-4 h-4 mx-auto text-indigo-500" />
                <div className="font-bold text-slate-800 dark:text-slate-100">{speakingTime} دقيقة</div>
                <div className="text-[10px] text-slate-400">وقت الإلقاء</div>
              </div>
            </div>

            {/* Detailed Count Grid */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 text-[11px] pb-1 border-b border-slate-100 dark:border-slate-800">
                إحصائيات تفصيلية:
              </h5>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                <div className="flex justify-between">
                  <span>إجمالي الكلمات:</span>
                  <strong className="text-slate-900 dark:text-white">{wordCount.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>إجمالي الحروف:</span>
                  <strong className="text-slate-900 dark:text-white">{charCount.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>الفقرات المكتوبة:</span>
                  <strong className="text-slate-900 dark:text-white">{paragraphCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span>الصفحات التقديرية:</span>
                  <strong className="text-slate-900 dark:text-white">{Math.max(1, Math.ceil(wordCount / 300))} صفحة</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
