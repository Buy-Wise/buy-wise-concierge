const path = require('path');
const fs = require('fs');
const { marked } = require('marked');

/**
 * generatePDF — Converts a report into a PDF file using Puppeteer.
 * Uploads to Cloudinary and returns the secure URL.
 */
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
});

const generatePDF = async (report) => {
  const outputDir = path.join(__dirname, '..', 'pdfs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfName = `BuyWise-Report-${(report.order_id || 'test').slice(0,8)}-${(report.product_category || 'Gen').replace(/\s+/g, '_')}`;
  const pdfPath = path.join(outputDir, `${pdfName}.pdf`);

  try {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ 
      headless: 'new', 
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none', '--disable-font-subpixel-positioning'] 
    });
    const page = await browser.newPage();

    const htmlContent = buildReportHTML(report);
    
    // Set content and wait for fonts and resources
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Ensure fonts are loaded before printing
    await page.evaluateHandle('document.fonts.ready');

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      timeout: 120000, 
      headerTemplate: `
        <div style="width: 100%; border-bottom: 2px solid #D4AF37; padding: 10px 40px; display: flex; justify-content: space-between; align-items: center; font-family: 'Inter', sans-serif; font-size: 10px; background: white; -webkit-print-color-adjust: exact;">
          <div><strong style="color: black; font-size: 14px;">BUY</strong><strong style="color: #D4AF37; font-size: 14px;">WISE</strong></div>
          <div style="color: #666; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Premium Research Report</div>
        </div>
      `,
      footerTemplate: `
        <div style="width: 100%; border-top: 1px solid #eee; padding: 10px 40px; display: flex; justify-content: space-between; align-items: center; font-family: 'Inter', sans-serif; font-size: 8px; color: #888; background: white; -webkit-print-color-adjust: exact;">
          <div style="flex: 1;">&copy; 2025 Buy Wise | askbuywise.vercel.app | ID: ${report.order_id || '-'}</div>
          <div style="text-align: right;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
        </div>
      `,
      margin: { top: '80px', bottom: '60px', left: '0px', right: '0px' } // No margins for full page control in HTML
    });

    await browser.close();
    console.log('[PDF] Successfully generated:', pdfPath);
    
    let secureUrl = '';
    const hasCloudinary = process.env.CLOUDINARY_URL && process.env.CLOUDINARY_URL.includes('@');
    
    if (hasCloudinary) {
      try {
        console.log('[PDF] Uploading to Cloudinary...');
        const uploadResult = await cloudinary.uploader.upload(pdfPath, {
          resource_type: "raw",
          public_id: pdfName,
          folder: "buywise_reports"
        });
        secureUrl = uploadResult.secure_url;
        console.log('[PDF] Cloudinary Upload Success:', secureUrl);
        try { fs.unlinkSync(pdfPath); } catch (e) {}
      } catch (uploadErr) {
        console.warn('[PDF] Cloudinary Upload Failed, falling back to local:', uploadErr.message);
        secureUrl = `/pdfs/${pdfName}.pdf`;
      }
    } else {
      console.warn('[PDF] Valid CLOUDINARY_URL not found, using local path');
      secureUrl = `/pdfs/${pdfName}.pdf`;
    }
    
    return secureUrl;

  } catch (e) {
    console.error('[PDF] Generation Fatal Error:', e.message);
    throw new Error('PDF Generation failed: ' + e.message);
  }
};

const buildReportHTML = (report) => {
  // Use marked for better markdown parsing
  // Configure marked for GFM and tables
  marked.setOptions({
    gfm: true,
    breaks: true,
    tables: true
  });

  const bodyHtml = marked.parse(report.formatted_report || '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Noto+Sans+Tamil:wght@400;700&family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet">
<style>
  :root { --gold: #D4AF37; --dark: #111; --text: #333; }
  
  body { 
    font-family: 'Inter', 'Noto Sans Tamil', 'Noto Sans Devanagari', sans-serif; 
    color: var(--text); 
    background: #fff; 
    padding: 0; 
    margin: 0; 
    line-height: 1.7; 
  }

  /* Typography */
  h1, h2, h3, h4 { color: #000; margin-top: 1.5em; margin-bottom: 0.5em; page-break-after: avoid; }
  h1 { font-size: 32px; border-bottom: 3px solid var(--gold); padding-bottom: 12px; margin-top: 0; }
  h2 { font-size: 24px; color: #222; border-left: 5px solid var(--gold); padding-left: 15px; background: #fdfaf0; padding: 10px 15px; }
  h3 { font-size: 20px; color: #444; }
  
  p { margin-bottom: 1.2em; text-align: justify; }
  
  strong { color: #000; font-weight: 700; }

  /* Tables */
  table { width: 100%; border-collapse: collapse; margin: 30px 0; font-size: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
  th { background: var(--dark); color: var(--gold); padding: 15px; text-align: left; font-weight: 700; border: 1px solid #333; }
  td { padding: 12px 15px; border: 1px solid #eee; }
  tr:nth-child(even) td { background: #fafafa; }
  
  /* Lists */
  ul, ol { padding-left: 30px; margin-bottom: 1.5em; }
  li { margin-bottom: 10px; }
  li::marker { color: var(--gold); font-weight: bold; }

  /* Layout */
  .page { padding: 40px 60px; }
  
  /* Cover Page Styles */
  .cover-page { 
    height: 100vh; 
    background: var(--dark);
    color: #fff;
    display: flex; 
    flex-direction: column; 
    justify-content: center; 
    align-items: center; 
    text-align: center; 
    position: relative;
    overflow: hidden;
  }
  .cover-page::before {
    content: '';
    position: absolute;
    top: 0; right: 0; bottom: 0; left: 0;
    background: radial-gradient(circle at center, #222 0%, #000 100%);
    z-index: 1;
  }
  .cover-content { position: relative; z-index: 2; width: 80%; }
  .cover-brand { font-size: 24px; font-weight: 700; letter-spacing: 5px; margin-bottom: 50px; color: #fff; }
  .cover-brand span { color: var(--gold); }
  .cover-title { font-size: 56px; font-weight: bold; margin-bottom: 20px; letter-spacing: 3px; color: var(--gold); line-height: 1.1; }
  .cover-subtitle { font-size: 20px; color: #ccc; margin-bottom: 60px; text-transform: uppercase; letter-spacing: 2px; }
  .cover-icon { font-size: 100px; margin-bottom: 40px; filter: drop-shadow(0 0 20px var(--gold)); opacity: 0.9; }
  .cover-meta { 
    background: rgba(255,255,255,0.05); 
    padding: 30px; 
    border-radius: 15px; 
    border: 1px solid rgba(212, 175, 55, 0.3);
    backdrop-filter: blur(5px);
  }
  .meta-item { font-size: 16px; margin: 10px 0; color: #eee; }
  .meta-item strong { color: var(--gold); font-weight: 400; margin-right: 10px; }
  .cover-footer { position: absolute; bottom: 40px; left: 0; right: 0; font-size: 14px; color: #666; font-style: italic; z-index: 2; }
  
  .page-break { page-break-before: always; }
  
  /* Recommendation Cards Simulation */
  .recommendation {
    border: 1px solid #eee;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 25px;
    background: #fff;
    border-left: 6px solid var(--gold);
  }

  /* Utility */
  .highlight { color: var(--gold); font-weight: bold; }
  .price-tag { background: var(--dark); color: var(--gold); padding: 2px 8px; border-radius: 4px; font-weight: bold; }
</style>
</head>
<body>
  <div class="cover-page">
    <div class="cover-content">
      <div class="cover-brand">BUY<span>WISE</span></div>
      <div class="cover-icon">📋</div>
      <div class="cover-title">SMART BUY<br/>RESEARCH REPORT</div>
      <div class="cover-subtitle">${report.product_category || 'Product Analysis'}</div>
      
      <div class="cover-meta">
        <div class="meta-item"><strong>சிபார்சு செய்யப்படுபவர்:</strong> ${report.name || 'Valued Customer'}</div>
        <div class="meta-item"><strong>Order ID:</strong> BW-${(report.order_id || '-').slice(0,8).toUpperCase()}</div>
        <div class="meta-item"><strong>Tier:</strong> ${report.service_tier || 'PRO'}</div>
        <div class="meta-item"><strong>தேதி:</strong> ${new Date().toLocaleDateString('ta-IN')}</div>
      </div>
    </div>
    <div class="cover-footer">பயனாளிக்கு ஏற்ற சிறந்த தேர்வுகள் - Buy Wise மூலம் வழங்கப்படுகிறது</div>
  </div>
  
  <div class="page-break"></div>
  
  <div class="page">
    ${bodyHtml}
  </div>
</body>
</html>`;
};

module.exports = { generatePDF };
