const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { addUserConnection, addAdminConnection } = require('../utils/sseService');

// SSE endpoint for user — streams order status updates
router.get('/user/:userId', verifyToken, (req, res) => {
  // Verify user can only subscribe to their own events
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // Disable nginx buffering
  });

  // Send initial heartbeat
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`);

  addUserConnection(req.params.userId, res);

  // Heartbeat every 30 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'HEARTBEAT' })}\n\n`);
  }, 30000);

  req.on('close', () => clearInterval(heartbeat));
});

// SSE endpoint for admin — streams all order events
router.get('/admin', verifyToken, isAdmin, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`);

  addAdminConnection(res);

  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'HEARTBEAT' })}\n\n`);
  }, 30000);

  req.on('close', () => clearInterval(heartbeat));
});

module.exports = router;
