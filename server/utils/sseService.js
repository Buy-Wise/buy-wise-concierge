/**
 * SSE Broadcaster Service
 * Manages Server-Sent Events connections for realtime updates
 */
const userConnections = new Map(); // userId → [res, ...]
const adminConnections = new Set(); // Set of res objects

const addUserConnection = (userId, res) => {
  if (!userConnections.has(userId)) userConnections.set(userId, []);
  userConnections.get(userId).push(res);
  res.on('close', () => removeUserConnection(userId, res));
};

const addAdminConnection = (res) => {
  adminConnections.add(res);
  res.on('close', () => adminConnections.delete(res));
};

const removeUserConnection = (userId, res) => {
  const conns = userConnections.get(userId);
  if (!conns) return;
  const idx = conns.indexOf(res);
  if (idx !== -1) conns.splice(idx, 1);
  if (conns.length === 0) userConnections.delete(userId);
};

const sendEvent = (res, data) => {
  try {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  } catch (e) {
    // Connection broken
  }
};

const broadcastToUser = (userId, event) => {
  const conns = userConnections.get(userId);
  if (!conns) return;
  conns.forEach(res => sendEvent(res, event));
};

const broadcastToAllAdmins = (event) => {
  adminConnections.forEach(res => sendEvent(res, event));
};

// Convenience: broadcast to both user and all admins
const broadcastOrderUpdate = (userId, event) => {
  broadcastToUser(userId, event);
  broadcastToAllAdmins(event);
};

module.exports = {
  addUserConnection,
  addAdminConnection,
  broadcastToUser,
  broadcastToAllAdmins,
  broadcastOrderUpdate
};
