const path = require('path');
const fs = require('fs');
const { marked } = require('marked');

/**
 * generatePDF — Converts a report into a PDF file using Puppeteer.
 * Uses local font stack (no external network calls) to avoid hangs.
 * Saves PDF locally and returns a path for the Express static server to serve.
 * Optionally uploads to Cloudinary if properly configured.
 */
const cloudinary = require('cloudinary').v2;

// Only configure Cloudinary if the URL is valid (must contain api_key:api_secret@cloud_name)
const cloudinaryUrl = (process.env.CLOUDINARY_URL || '').trim();
const hasValidCloudinary = cloudinaryUrl.includes('@') && cloudinaryUrl.includes(':');
if (hasValidCloudinary) {
  cloudinary.config({ cloudinary_url: cloudinaryUrl });
}

const generatePDF = async (report) => {
  const outputDir = path.join(__dirname, '..', 'pdfs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const safeOrderId = (report.order_id || 'test').slice(0, 8);
  const safeCategory = (report.product_category || 'General').replace(/[^a-zA-Z0-9]/g, '_');
  const pdfName = `BuyWise-Report-${safeOrderId}-${safeCategory}`;
  const pdfPath = path.join(outputDir, `${pdfName}.pdf`);

  try {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,  // 'new' can fail on some versions; true is universal
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-background-networking',  // Prevent network activity
        '--no-first-run',
        '--no-zygote',
      ]
    });

    const page = await browser.newPage();

    // Block all external resource loading — avoids networkidle0 hanging on Google Fonts
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      // Allow: document, script, stylesheet (inline), images (base64)
      // Block: external fonts, external stylesheets, external images, xhr, fetch
      if (['font', 'media', 'websocket', 'manifest', 'other'].includes(resourceType)) {
        req.abort();
      } else if (req.url().startsWith('https://fonts.googleapis.com') || req.url().startsWith('https://fonts.gstatic.com')) {
        req.abort();  // Block Google Fonts — we use system fonts instead
      } else {
        req.continue();
      }
    });

    const htmlContent = buildReportHTML(report);

    // Use domcontentloaded — safe, no network dependency
    await page.setContent(htmlContent, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Small settle delay for any inline CSS/JS to apply
    await new Promise(resolve => setTimeout(resolve, 500));

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      timeout: 60000,
      headerTemplate: `
        <div style="width: 100%; border-bottom: 2px solid #D4AF37; padding: 8px 40px; display: flex; justify-content: space-between; align-items: center; font-family: Arial, Helvetica, sans-serif; font-size: 10px; background: white; -webkit-print-color-adjust: exact;">
          <div><strong style="color: black; font-size: 14px;">BUY</strong><strong style="color: #D4AF37; font-size: 14px;">WISE</strong></div>
          <div style="color: #666; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Premium Research Report</div>
        </div>
      `,
      footerTemplate: `
        <div style="width: 100%; border-top: 1px solid #eee; padding: 8px 40px; display: flex; justify-content: space-between; align-items: center; font-family: Arial, Helvetica, sans-serif; font-size: 8px; color: #888; background: white; -webkit-print-color-adjust: exact;">
          <div style="flex: 1;">© 2026 Buy Wise | askbuywise.vercel.app | Order: ${(report.order_id || '-').slice(0, 8).toUpperCase()}</div>
          <div style="text-align: right;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
        </div>
      `,
      margin: { top: '70px', bottom: '55px', left: '0px', right: '0px' }
    });

    await browser.close();
    console.log('[PDF] ✅ Successfully generated:', pdfPath, `(${Math.round(fs.statSync(pdfPath).size / 1024)} KB)`);

    // Try Cloudinary upload if properly configured
    if (hasValidCloudinary) {
      try {
        console.log('[PDF] Uploading to Cloudinary...');
        const uploadResult = await cloudinary.uploader.upload(pdfPath, {
          resource_type: 'raw',
          public_id: pdfName,
          folder: 'buywise_reports'
        });
        const secureUrl = uploadResult.secure_url;
        console.log('[PDF] Cloudinary Upload Success:', secureUrl);
        try { fs.unlinkSync(pdfPath); } catch (e) {}  // Clean up local file after upload
        return secureUrl;
      } catch (uploadErr) {
        console.warn('[PDF] Cloudinary upload failed, serving locally:', uploadErr.message);
      }
    }

    // Fall back to local path (served via Express static middleware at /pdfs/*)
    const localPath = `/pdfs/${pdfName}.pdf`;
    console.log('[PDF] Serving locally at:', localPath);
    return localPath;

  } catch (e) {
    console.error('[PDF] Generation Fatal Error:', e.message);
    console.error('[PDF] Stack:', e.stack?.substring(0, 500));
    throw new Error('PDF Generation failed: ' + e.message);
  }
};

const buildReportHTML = (report) => {
  // Configure marked for GFM and tables
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  const bodyHtml = marked.parse(report.formatted_report || '# Report\nNo content available.');

  const disclaimerHtml = `
    <div style="margin-top: 50px; padding: 20px; border-left: 5px solid #D4AF37; background: #fafafa; font-size: 13px; color: #555; font-style: italic; border-radius: 6px;">
      <strong style="color: #111; font-size: 14px; font-style: normal; display: block; margin-bottom: 5px;">Transparency Note:</strong>
      This intelligence report incorporates real-time market data to provide the most accurate recommendation possible at the time of generation. Because the retail market is highly dynamic, exact pricing and availability may fluctuate. Our core goal is to protect you from bad purchases and empower you to buy with total confidence and zero regret. To run a fresh analysis on any product, visit <strong style="color: #D4AF37; font-style: normal;">askbuywise.vercel.app</strong>.
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  /* System font stack — no external network calls required */
  :root { --gold: #D4AF37; --dark: #111; --text: #333; }

  * { box-sizing: border-box; }

  body {
    font-family: 'Segoe UI', Arial, Helvetica, 'Noto Sans', sans-serif;
    color: var(--text);
    background: #fff;
    padding: 0;
    margin: 0;
    line-height: 1.7;
  }

  /* Typography */
  h1, h2, h3, h4 { color: #000; margin-top: 1.5em; margin-bottom: 0.5em; page-break-after: avoid; }
  h1 { font-size: 30px; border-bottom: 3px solid var(--gold); padding-bottom: 12px; margin-top: 0; }
  h2 { font-size: 22px; color: #222; border-left: 5px solid var(--gold); padding: 10px 15px; background: #fdfaf0; }
  h3 { font-size: 18px; color: #444; }
  h4 { font-size: 16px; color: #555; }

  p { margin-bottom: 1.2em; text-align: justify; }
  strong { color: #000; font-weight: 700; }

  /* Tables */
  table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px; }
  th { background: var(--dark); color: var(--gold); padding: 12px 15px; text-align: left; font-weight: 700; border: 1px solid #333; }
  td { padding: 10px 15px; border: 1px solid #ddd; }
  tr:nth-child(even) td { background: #fafafa; }

  /* Lists */
  ul, ol { padding-left: 28px; margin-bottom: 1.4em; }
  li { margin-bottom: 8px; }
  li::marker { color: var(--gold); font-weight: bold; }

  /* Blockquotes */
  blockquote { border-left: 4px solid var(--gold); margin: 20px 0; padding: 12px 20px; background: #fffbf0; color: #555; font-style: italic; }

  /* Layout */
  .page { padding: 40px 60px; }

  /* Cover Page */
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
    background: radial-gradient(circle at center, #222 0%, #000 100%);
  }
  .cover-content { position: relative; z-index: 2; width: 80%; }
  .cover-brand { font-size: 22px; font-weight: 700; letter-spacing: 5px; margin-bottom: 40px; color: #fff; }
  .cover-brand span { color: var(--gold); }
  .cover-title { font-size: 52px; font-weight: bold; margin-bottom: 16px; letter-spacing: 2px; color: var(--gold); line-height: 1.1; }
  .cover-subtitle { font-size: 18px; color: #ccc; margin-bottom: 50px; text-transform: uppercase; letter-spacing: 2px; }
  .cover-icon { font-size: 90px; margin-bottom: 36px; }
  .cover-meta {
    background: rgba(255,255,255,0.07);
    padding: 28px;
    border-radius: 12px;
    border: 1px solid rgba(212,175,55,0.3);
  }
  .meta-item { font-size: 15px; margin: 8px 0; color: #eee; }
  .meta-item strong { color: var(--gold); font-weight: 400; margin-right: 10px; }
  .cover-footer { position: absolute; bottom: 36px; left: 0; right: 0; font-size: 13px; color: #666; font-style: italic; }

  .page-break { page-break-before: always; }

  .highlight { color: var(--gold); font-weight: bold; }
  .price-tag { background: var(--dark); color: var(--gold); padding: 2px 8px; border-radius: 4px; font-weight: bold; }

  /* Code blocks */
  code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 13px; }
  pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
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
        <div class="meta-item"><strong>Prepared for:</strong> ${report.name || 'Valued Customer'}</div>
        <div class="meta-item"><strong>Order ID:</strong> BW-${(report.order_id || '-').slice(0, 8).toUpperCase()}</div>
        <div class="meta-item"><strong>Tier:</strong> ${report.service_tier || 'PRO'}</div>
        <div class="meta-item"><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
      </div>
    </div>
    <div class="cover-footer">Generate your own smart report at <strong>askbuywise.vercel.app</strong></div>
  </div>

  <div class="page-break"></div>

  <div class="page">
    ${bodyHtml}
    ${disclaimerHtml}
  </div>
</body>
</html>`;
};

module.exports = { generatePDF };
