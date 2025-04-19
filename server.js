const http = require('http');
const db = {
  movies: [
    { id: 1, title: 'Inception', year: 2010 },
    { id: 2, title: 'The Matrix', year: 1999 }
  ],
  series: [
    { id: 1, title: 'Stranger Things', seasons: 4 },
    { id: 2, title: 'Breaking Bad', seasons: 5 }
  ],
  songs: [
    { id: 1, title: 'Bohemian Rhapsody', artist: 'Queen' },
    { id: 2, title: 'Imagine', artist: 'John Lennon' }
  ]
};

const server = http.createServer((req, res) => {
  const parts = req.url.split('/').filter(part => part);
  const route = parts[0];
  const isKnownRoute = ['movies', 'series', 'songs'].includes(route);

  res.setHeader('Content-Type', 'application/json');

  if (!isKnownRoute) {
    res.statusCode = 404;
    return res.end(JSON.stringify({ error: 'Not Found' }));
  }

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
        res.end(JSON.stringify(db[route]));
      }
      else if (req.method === 'PUT') {
        const index = db[route].findIndex(item => item.id === data.id);
        if (index >= 0) {
          db[route][index] = { ...db[route][index], ...data };
          res.end(JSON.stringify(db[route]));
        } else {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Not Found' }));
        }
      }
      else if (req.method === 'DELETE') {
        db[route] = db[route].filter(item => item.id !== data.id);
        res.end(JSON.stringify(db[route]));
      }
      else {
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