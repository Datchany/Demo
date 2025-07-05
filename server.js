const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  console.log(`Requested URL: ${req.url}`);
  console.log(`Method: ${req.method}`);

  // Serve form + messages
  if (req.url === '/' && req.method === 'GET') {
    fs.readFile('message.txt', 'utf-8', (err, data) => {
      const messages = data ? data.split('\n').filter(Boolean).reverse() : [];

      res.setHeader('Content-Type', 'text/html');
      res.write(`
        <html>
          <head><title>Message Board</title></head>
          <body>
            <h2>Messages:</h2>
            <ul>
              ${messages.map(msg => `<li>${msg}</li>`).join('')}
            </ul>

            <hr />

            <form action="/message" method="POST">
              <input type="text" name="message" placeholder="Enter message" required />
              <button type="submit">Submit</button>
            </form>
          </body>
        </html>
      `);
      return res.end();
    });
  }

  // Save message
  else if (req.url === '/message' && req.method === 'POST') {
    const body = [];

    req.on('data', chunk => body.push(chunk));

    req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString(); // message=hello+world
      const message = parsedBody.split('=')[1].replace(/\+/g, ' ');

      // Append the new message to the file
      fs.appendFile('message.txt', message + '\n', (err) => {
        if (err) {
          console.error('Error appending to file:', err);
        }

        // Redirect to homepage
        res.statusCode = 302;
        res.setHeader('Location', '/');
        return res.end();
      });
    });
  }

  // 404 Page
  else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1>Page Not Found</h1>');
  }
});

server.listen(5000, () => {
  console.log('✅ Server running at http://localhost:5000');
});
