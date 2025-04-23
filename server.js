const http = require('http');
const fs = require('fs');
const path = require('path');
const { initDataFile, readData, writeData } = require('./datahandler');

// Initialize file on startup
initDataFile();

const server = http.createServer((req, res) => {
  const parts = req.url.split('/').filter(Boolean);
  const route = parts[0];

  if (req.url === '/' && req.method === 'GET') {
    const htmlPath = path.join(__dirname, 'index.html');
    fs.readFile(htmlPath, (err, data) => {
      res.setHeader('Content-Type', 'text/html');
      res.end(data);
    });
    return;
  }

  const isKnownRoute = ['movies', 'series', 'songs'].includes(route);
  res.setHeader('Content-Type', 'application/json');

  if (!isKnownRoute) {
    res.statusCode = 404;
    return res.end(JSON.stringify({ error: 'Not Found' }));
  }

  let db = readData();

  if (req.method === 'GET') {
    res.end(JSON.stringify(db[route]));
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const data = body ? JSON.parse(body) : {};

      if (req.method === 'POST') {
        data.id = db[route].length + 1;
        db[route].push(data);
        writeData(db);
        res.end(JSON.stringify(db[route]));
      } else if (req.method === 'PUT') {
        const index = db[route].findIndex(item => item.id === data.id);
        if (index >= 0) {
          db[route][index] = { ...db[route][index], ...data };
          writeData(db);
          res.end(JSON.stringify(db[route]));
        } else {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Not Found' }));
        }
      } else if (req.method === 'DELETE') {
        db[route] = db[route].filter(item => item.id !== data.id);
        writeData(db);
        res.end(JSON.stringify(db[route]));
      } else {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      }
    } catch (e) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Bad Request' }));
    }
  });
});

server.listen(3000, () => console.log('Server running on port 3000'));
