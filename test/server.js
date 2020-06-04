const http = require('http');
const util = require('util');
const fs = require('fs');
const path = require('path');

const basePath = 'test';

const testserver = function (tests) {
  return http.createServer(function (req, res) {
    let url = new URL(req.url, 'http://localhost');
    console.log(`req url=${url}`);

    for (const test of tests) {
      if (test.pathname === url.pathname) {
        test.handler(res);
        return;
      }
    }

    if (url.pathname === '/api') {
      return;
    }
    let file = url.pathname.substr(1) || 'index.html';
    console.log(`reading file=${file}`);
    // Don't do this in production :)
    fs.readFile(path.join(basePath, file), 'utf8', function (err, content) {
      if (err) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(content);
      res.end();
    });
  });
};

module.exports = testserver;
