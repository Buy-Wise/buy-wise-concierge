const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVICE_HOST,
  port: process.env.EMAIL_SERVICE_PORT,
  secure: true, 
  auth: {
    user: process.env.EMAIL_SERVICE_USER,
    pass: process.env.EMAIL_SERVICE_PASS,
  },
});

const sendOrderConfirmedEmail = async (order, user) => {
  const mailOptions = {
    from: `"Buy Wise Team" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: user.email,
    subject: `Order Confirmed — Buy Wise #${order.id.slice(0, 8).toUpperCase()}`,
    text: `Hi ${user.name},

Your order has been confirmed!

Order ID: BW-${order.id.slice(0, 8).toUpperCase()}
Product: ${order.product_category}
Plan: ${order.service_tier}
Amount: ₹${(order.amount / 100).toFixed(2)}

We're generating your research report now. 
You'll receive another email when it's ready.

Track your order: ${process.env.FRONTEND_URL}/dashboard

— Buy Wise Team`,
  };
  try { return await transporter.sendMail(mailOptions); } catch(e) { console.log('Email silenced:', e.message); return null; }
};

const sendReportReadyEmail = async (order, user) => {
  const mailOptions = {
    from: `"Buy Wise Team" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: user.email,
    subject: `Your Buy Wise Report is Ready 📥`,
    text: `Hi ${user.name},

Great news! Your research report is ready.

Product: ${order.product_category}
Order: BW-${order.id.slice(0, 8).toUpperCase()}

👇 Download your report:
${process.env.FRONTEND_URL}/dashboard

Your report is also saved in your dashboard for future access.

Questions? Reply to this email or WhatsApp us: ${process.env.ADMIN_WHATSAPP_NUMBER}

— Buy Wise Team`,
  };
  try { return await transporter.sendMail(mailOptions); } catch(e) { console.log('Email silenced:', e.message); return null; }
};

const sendGenerationFailedEmail = async (order, user) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  const userMailOptions = {
    from: `"Buy Wise Team" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: user.email,
    subject: `Action Required — Report Generation Issue`,
    text: `Hi ${user.name},

We encountered an issue generating your report for Order #BW-${order.id.slice(0, 8).toUpperCase()}.

Your payment is completely safe.

We're looking into this and will either fix it within 2 hours or process a full refund automatically.

We apologize for the inconvenience.

— Buy Wise Team`,
  };
  
  const adminMailOptions = {
    from: `"Buy Wise System" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: adminEmail,
    subject: `FAILED GENERATION ALERT - Order BW-${order.id.slice(0, 8).toUpperCase()}`,
    text: `Generation failed for order ${order.id}. User: ${user.email}. Please login to admin and retry or refund.`
  };
  
  try {
    await transporter.sendMail(userMailOptions);
    return await transporter.sendMail(adminMailOptions);
  } catch(e) { console.log('Email silenced:', e.message); return null; }
};

const sendAdminNewOrderEmail = async (order, user) => {
  const mailOptions = {
    from: `"Buy Wise System" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🔔 New Order: ${order.product_category} - ${order.service_tier} - ₹${(order.amount / 100).toFixed(2)}`,
    text: `New order received!
    
User: ${user.name} (${user.email})
Order ID: BW-${order.id.slice(0, 8).toUpperCase()}
Tier: ${order.service_tier}
Category: ${order.product_category}

View in dashboard: ${process.env.FRONTEND_URL}/admin`,
  };
  try { return await transporter.sendMail(mailOptions); } catch(e) { console.log('Email silenced:', e.message); return null; }
};

module.exports = {
  sendOrderConfirmedEmail,
  sendReportReadyEmail,
  sendGenerationFailedEmail,
  sendAdminNewOrderEmail
};
