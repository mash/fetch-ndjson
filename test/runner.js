const { once } = require('events');
const puppeteer = require('puppeteer');
const test = require('tape');
async function sleep(msec) {
  return new Promise((resolve) => setTimeout(resolve, msec));
}

const tests = [
  {
    pathname: '/api',
    handler: (res) => {
      res.writeHead(200, { 'Content-Type': 'application/x-ndjson' });
      res.write(`{"a":1}\n`);
      res.write(`{"b":2}`);
      res.end();
    },
    expected: ['pathname=/api', 'done=false, value={"a":1}', 'done=false, value={"b":2}', 'done=true, value=undefined'],
  },
  {
    pathname: '/api2',
    handler: (res) => {
      res.writeHead(200, { 'Content-Type': 'application/x-ndjson' });
      res.write(`{"a":1}\n`);
      res.write(`{"b":2}\n`);
      res.end();
    },
    expected: [
      'pathname=/api2',
      'done=false, value={"a":1}',
      'done=false, value={"b":2}',
      'done=true, value=undefined',
    ],
  },
  {
    pathname: '/500',
    handler: (res) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.write(`{"error":"Internal Server Error"}`);
      res.end();
    },
    expected: [
      'pathname=/500',
      'Failed to load resource: the server responded with a status of 500 (Internal Server Error)',
      'Content-Type=application/json',
      'res.status=500'
    ],
  } 
];

const testserver = require('./server');
const server = testserver(tests);

test('/api', function (t) {
  t.plan(tests.length);
  (async function () {
    let port = process.env.PORT || 8080;
    server.listen(port);
    await once(server, 'listening');

    const puppet = await puppeteer.launch({});
    const browserPage = await puppet.newPage();

    let logs = [];
    browserPage.on('console', (msg) => {
      console.log(`console.${msg.type()} ${msg.text()}`);
      logs.push(msg.text());
    });

    for (const test of tests) {
      logs = [];
      await browserPage.goto(`http://localhost:${port}#${test.pathname}`, { waitUntil: 'networkidle0' });
      await sleep(1000);
      t.deepEqual(logs, test.expected, test.pathname);
    }

    await puppet.close();
    server.close();
  })();
});
