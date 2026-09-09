import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface PDFExportOptions {
  elementId: string;
  filename?: string;
  title?: string;
}

/**
 * تصدير تقرير معالجة وتنظيف وتدقيق النص كملف PDF منظم وعالي الدقة باستخدام jsPDF و html2canvas
 */
export async function exportReportToPDF(options: PDFExportOptions): Promise<boolean> {
  const { elementId, filename = "تقرير-معالجة-وتنظيف-النص.pdf" } = options;
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    alert("تعذر العثور على محتوى التقرير للطباعة.");
    return false;
  }

  try {
    // Generate high-resolution canvas from DOM element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: element.scrollWidth,
    });

    const imgData = canvas.toDataURL("image/png");

    // Standard A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate height of image in PDF mm
    const imgHeightInPdf = (canvasHeight * pdfWidth) / canvasWidth;

    let heightLeft = imgHeightInPdf;
    let position = 0;

    // First page
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeightInPdf, undefined, "FAST");
    heightLeft -= pdfHeight;

    // Subsequent pages if long document
    while (heightLeft > 0) {
      position = heightLeft - imgHeightInPdf;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeightInPdf, undefined, "FAST");
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error("PDF generation failed:", error);
    alert("حدث خطأ أثناء إنشاء وتصدير ملف PDF. يرجى المحاولة مرة أخرى.");
    return false;
  }
}
