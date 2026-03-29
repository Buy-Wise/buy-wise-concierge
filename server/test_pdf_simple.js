const { generatePDF } = require('./utils/pdfGenerator');
require('dotenv').config({ path: '../.env' });

async function testPDF() {
  try {
    console.log('Testing PDF Generation...');
    const result = await generatePDF({
      id: 'test-order-' + Date.now(),
      product_category: 'LAPTOP',
      service_tier: 'PRO'
    }, 'Sample Research Data for testing PDF generation.');
    console.log('Success! PDF URL:', result);
  } catch (err) {
    console.error('PDF Generation Failed:', err.message);
  } finally {
    process.exit();
  }
}

testPDF();
