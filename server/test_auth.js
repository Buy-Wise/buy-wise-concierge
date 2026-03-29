const http = require('http');

function test(name, method, path) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const ok = (res.statusCode === 401 || res.statusCode === 403);
        console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}: HTTP ${res.statusCode}`);
        resolve();
      });
    });
    req.on('error', e => { console.log('ERR  | ' + name + ': ' + e.message); resolve(); });
    if (method === 'POST') req.write(JSON.stringify({ orderId: 'test', rating: 5 }));
    req.end();
  });
}

(async () => {
  console.log('--- Auth Protection Tests (no token) ---');
  await test('admin/generate-pdf', 'POST', '/api/admin/generate-pdf/test');
  await test('reports/generate-auto', 'POST', '/api/reports/generate-auto');
  await test('feedback/submit', 'POST', '/api/feedback/submit');
  await test('admin/orders', 'GET', '/api/admin/orders');
  await test('admin/analytics', 'GET', '/api/admin/analytics');
  await test('admin/feedback', 'GET', '/api/admin/feedback');
  console.log('--- Health Check (should be 200) ---');
  const req = http.request({ hostname: 'localhost', port: 3000, path: '/api/health', method: 'GET' }, (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => console.log(`${res.statusCode === 200 ? 'PASS' : 'FAIL'} | health: HTTP ${res.statusCode}`));
  });
  req.end();
})();
