const http = require('http');

function check(url, options = {}) {
  return new Promise((resolve) => {
    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, length: body.length });
        }
      });
    });
    req.on('error', err => resolve({ error: err.message }));
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  console.log('--- 1. Testing /hardware-lab Page ---');
  const pageRes = await check('http://localhost:3000/hardware-lab');
  console.log('Page HTTP Status:', pageRes.status, 'HTML bytes:', pageRes.length);

  console.log('\n--- 2. Testing Next.js /api/hardware/devices ---');
  const nextDevRes = await check('http://localhost:3000/api/hardware/devices');
  console.log('Next Devices Status:', nextDevRes.status, 'Device count:', nextDevRes.data?.devices?.length);

  console.log('\n--- 3. Testing FastAPI /api/hardware/devices ---');
  const fastDevRes = await check('http://127.0.0.1:8000/api/hardware/devices');
  console.log('FastAPI Status:', fastDevRes.status, 'Device count:', fastDevRes.data?.devices?.length);

  console.log('\n--- 4. Testing MinGW g++ & size.exe Compilation API ---');
  const payload = JSON.stringify({
    deviceId: 'arduino-uno',
    action: 'run',
    files: {
      'main.cpp': 'void setup() { Serial.begin(9600); Serial.println("TEST_HARDWARE_OK"); } void loop() { Serial.println("TICK"); }'
    }
  });

  const compileRes = await check('http://localhost:3000/api/hardware/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    body: payload
  });
  console.log('Compile Success:', compileRes.data?.success);
  console.log('Memory Usage:', compileRes.data?.memoryUsage);
  console.log('Simulation Output:\n', compileRes.data?.stdout);
}

run();
