import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from "docx";
import { DetailedAnalysisResult, ProcessingStats } from "../types";

export interface WordExportOptions {
  inputText: string;
  outputText: string;
  stats?: ProcessingStats | null;
  analysis?: DetailedAnalysisResult | null;
  isProofread?: boolean;
  filename?: string;
}

/**
 * تصدير تقرير معالجة وتدقيق النصوص كملف Word رسمي (.docx) منسق باحترافية
 */
export async function exportReportToWord(options: WordExportOptions): Promise<boolean> {
  const {
    inputText,
    outputText,
    stats,
    analysis,
    isProofread = false,
    filename = `تقرير-${isProofread ? "تدقيق-لغوي" : "تنظيف-نصوص"}.docx`
  } = options;

  try {
    const origWords = inputText ? inputText.trim().split(/\s+/).length : 0;
    const cleanWords = outputText ? outputText.trim().split(/\s+/).length : 0;
    const dateStr = new Date().toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Title
            new Paragraph({
              text: isProofread ? "تقرير التدقيق والتحسين اللغوي والنحوي" : "تقرير تنظيف النصوص وتطهير بصمات AI والمحاماة",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.RIGHT,
              spacing: { after: 200 },
            }),

            // Metadata info
            new Paragraph({
              children: [
                new TextRun({ text: `تاريخ التقرير: ${dateStr} | `, bold: true }),
                new TextRun({ text: `النموذج: ${stats?.modelUsed || "Gemini"} | ` }),
                new TextRun({ text: `النوع: ${isProofread ? "تدقيق نحوي وإملائي" : "تنظيف بصمات AI وديباجات المحاماة"}` })
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 300 }
            }),

            // KPI Table
            new Paragraph({
              text: "ملخص الأداء والإحصائيات:",
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.RIGHT,
              spacing: { after: 150 }
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "النص المنظف", bold: true })], alignment: AlignmentType.CENTER })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "النص الأصلي", bold: true })], alignment: AlignmentType.CENTER })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "العلامات المخفية", bold: true })], alignment: AlignmentType.CENTER })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "إجمالي الشوائب", bold: true })], alignment: AlignmentType.CENTER })],
                    }),
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: `${cleanWords} كلمة (${outputText.length} حرف)`, alignment: AlignmentType.CENTER })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: `${origWords} كلمة (${inputText.length} حرف)`, alignment: AlignmentType.CENTER })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: `${stats?.invisibleCharsRemoved || analysis?.invisibleCount || 0}`, alignment: AlignmentType.CENTER })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: `${analysis?.totalIssues || 0}`, alignment: AlignmentType.CENTER })],
                    }),
                  ]
                })
              ]
            }),

            new Paragraph({ text: "", spacing: { after: 300 } }),

            // Final Output Heading
            new Paragraph({
              text: "النص النهائي المعتمد (النسخة البشرية المنقحة):",
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.RIGHT,
              spacing: { after: 150 }
            }),

            // The Clean Text Paragraphs
            ...outputText.split("\n").map(line =>
              new Paragraph({
                text: line,
                alignment: AlignmentType.RIGHT,
                spacing: { after: 120, line: 360 }
              })
            ),

            new Paragraph({ text: "", spacing: { after: 300 } }),

            // Original Text for reference
            new Paragraph({
              text: "النص الأصلي (للمقارنة والرجوع):",
              heading: HeadingLevel.HEADING_3,
              alignment: AlignmentType.RIGHT,
              spacing: { after: 150 }
            }),

            ...inputText.split("\n").map(line =>
              new Paragraph({
                text: line,
                alignment: AlignmentType.RIGHT,
                spacing: { after: 100 },
                style: "Quote"
              })
            ),
          ]
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("Failed to export Word doc:", err);
    alert("حدث خطأ أثناء تصدير ملف Word. يرجى المحاولة مرة أخرى.");
    return false;
  }
}
