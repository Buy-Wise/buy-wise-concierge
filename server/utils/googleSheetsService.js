/**
 * Google Sheets Service
 * Syncs order data with Google Sheets for admin tracking.
 * Gated behind SHEETS_SYNC_ENABLED env var.
 */

const isEnabled = () => process.env.SHEETS_SYNC_ENABLED === 'true';

let sheetsClient = null;

const getClient = async () => {
  if (sheetsClient) return sheetsClient;
  
  try {
    const { google } = require('googleapis');
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    return sheetsClient;
  } catch (e) {
    console.error('[SHEETS] Failed to initialize:', e.message);
    return null;
  }
};

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

const appendOrder = async (order, user, report = {}) => {
  if (!isEnabled()) return;
  try {
    const sheets = await getClient();
    if (!sheets) return;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Orders!A:N',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          order.id,
          new Date(order.created_at).toLocaleString('en-IN'),
          user.name || '',
          user.email || '',
          user.phone_whatsapp || '',
          order.product_category || '',
          order.service_tier || '',
          (order.amount || 0) / 100,
          order.status || '',
          order.razorpay_payment_id || '',
          order.delivered_at ? new Date(order.delivered_at).toLocaleString('en-IN') : '',
          report.pdf_url || '',
          '',
          ''
        ]]
      }
    });
    console.log(`[SHEETS] Appended order ${order.id}`);
  } catch (e) {
    console.error('[SHEETS] appendOrder error:', e.message);
  }
};

const updateOrderStatus = async (orderId, status, deliveredAt = null) => {
  if (!isEnabled()) return;
  try {
    const sheets = await getClient();
    if (!sheets) return;

    // Get all values to find the row
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Orders!A:N'
    });
    const rows = res.data.values || [];
    const rowIdx = rows.findIndex(r => r[0] === orderId);
    if (rowIdx === -1) return;

    // Update status (column I = index 8) and delivered_at (column K = index 10)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Orders!I${rowIdx + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[status]] }
    });

    if (deliveredAt) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Orders!K${rowIdx + 1}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[new Date(deliveredAt).toLocaleString('en-IN')]] }
      });
    }
    console.log(`[SHEETS] Updated order ${orderId} status to ${status}`);
  } catch (e) {
    console.error('[SHEETS] updateOrderStatus error:', e.message);
  }
};

const appendFeedback = async (orderId, feedback) => {
  if (!isEnabled()) return;
  try {
    const sheets = await getClient();
    if (!sheets) return;

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Orders!A:N'
    });
    const rows = res.data.values || [];
    const rowIdx = rows.findIndex(r => r[0] === orderId);
    if (rowIdx === -1) return;

    const feedbackText = `${feedback.rating}★ | ${feedback.comments || ''}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Orders!N${rowIdx + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[feedbackText]] }
    });
    console.log(`[SHEETS] Appended feedback for order ${orderId}`);
  } catch (e) {
    console.error('[SHEETS] appendFeedback error:', e.message);
  }
};

const testConnection = async () => {
  try {
    const sheets = await getClient();
    if (!sheets) return { success: false, error: 'Client initialization failed' };

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Orders!A1:N1'
    });
    return { success: true, headers: res.data.values?.[0] || [] };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

const setupHeaders = async () => {
  try {
    const sheets = await getClient();
    if (!sheets) return { success: false, error: 'Client initialization failed' };

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Orders!A1:N1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Order ID', 'Date', 'Customer', 'Email', 'Phone', 'Product', 'Plan', 'Amount (₹)', 'Status', 'Payment ID', 'Delivered At', 'Report URL', 'Notes', 'Feedback']]
      }
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

const syncAllOrders = async (db) => {
  if (!isEnabled()) return { synced: 0, failed: 0, error: 'Sheets sync disabled' };
  try {
    const sheets = await getClient();
    if (!sheets) return { synced: 0, failed: 0, error: 'Client initialization failed' };

    const result = await db.query(`
      SELECT o.*, u.name, u.email, u.phone_whatsapp, r.pdf_url
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN reports r ON o.id = r.order_id
      ORDER BY o.created_at DESC
      LIMIT 100
    `);

    // Clear existing and re-write
    await setupHeaders();
    
    if (result.rows.length === 0) return { synced: 0, failed: 0 };

    const values = result.rows.map(o => [
      o.id,
      new Date(o.created_at).toLocaleString('en-IN'),
      o.name || '',
      o.email || '',
      o.phone_whatsapp || '',
      o.product_category || '',
      o.service_tier || '',
      (o.amount || 0) / 100,
      o.status || '',
      o.razorpay_payment_id || '',
      o.delivered_at ? new Date(o.delivered_at).toLocaleString('en-IN') : '',
      o.pdf_url || '',
      '',
      ''
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Orders!A:N',
      valueInputOption: 'RAW',
      requestBody: { values }
    });

    return { synced: result.rows.length, failed: 0 };
  } catch (e) {
    console.error('[SHEETS] syncAllOrders error:', e.message);
    return { synced: 0, failed: 0, error: e.message };
  }
};

module.exports = { appendOrder, updateOrderStatus, appendFeedback, testConnection, setupHeaders, syncAllOrders, isEnabled };
