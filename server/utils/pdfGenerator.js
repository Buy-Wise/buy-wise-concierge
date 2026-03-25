const path = require('path');
const fs = require('fs');

/**
 * generatePDF — Converts a report into a PDF file using Puppeteer.
 * Returns the file path of the generated PDF.
 * @param {object} report - Report data including formatted_report, name, product_category etc.
 * @returns {string} - Path to the generated PDF
 */
const generatePDF = async (report) => {
  // Ensure output dir exists
  const outputDir = path.join(__dirname, '..', 'pdfs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath = path.join(outputDir, `report_${report.order_id || Date.now()}.pdf`);

  try {
    // Attempt to use Puppeteer (may not be available in all envs)
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    const htmlContent = buildReportHTML(report);
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });

    await browser.close();
  } catch (e) {
    console.warn('[PDF] Puppeteer failed, writing mock PDF:', e.message);
    // Write a placeholder text file named as .pdf for dev purposes
    fs.writeFileSync(pdfPath, `Buy Wise Report\n\n${report.formatted_report || ''}`);
  }

  return `/pdfs/report_${report.order_id || Date.now()}.pdf`;
};

const buildReportHTML = (report) => {
  const md = report.formatted_report || '';
  // Convert simple markdown to HTML (headings, bold, lists)
  const body = md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n/g, '<br/>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Arial', sans-serif; color: #111; background: #fff; padding: 0; margin: 0; }
  .header { background: #000; color: #D4AF37; padding: 32px 40px; display: flex; justify-content: space-between; align-items: center; }
  .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; }
  .header .subtitle { font-size: 13px; color: #aaa; }
  .content { padding: 40px; }
  h1, h2, h3 { color: #000; }
  h2 { border-bottom: 2px solid #D4AF37; padding-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #000; color: #D4AF37; padding: 10px 14px; text-align: left; }
  td { padding: 10px 14px; border-bottom: 1px solid #eee; }
  tr:nth-child(even) td { background: #f9f9f9; }
  .footer { background: #000; color: #888; text-align: center; padding: 20px; font-size: 12px; }
  .gold { color: #D4AF37; }
  ul { list-style: disc; margin-left: 24px; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>BUY<span class="gold">WISE</span></h1>
      <div class="subtitle">Smart Buy Report</div>
    </div>
    <div style="text-align:right; font-size:13px; color:#aaa;">
      <div>Order: ${report.order_id || '-'}</div>
      <div>Generated: ${new Date().toLocaleDateString('en-IN')}</div>
      <div>Customer: ${report.name || '-'}</div>
    </div>
  </div>

  <div class="content">
    ${body}
  </div>

  <div class="footer">
    Researched by Buy Wise | buywiseindia.com &bull; Questions? WhatsApp us at your support number &bull; Report ID: ${report.order_id || '-'}
  </div>
</body>
</html>`;
};

module.exports = { generatePDF };
