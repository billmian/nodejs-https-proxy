const http = require('http');
const { exec } = require('child_process');

const openOsProxy = () => {
  exec('networksetup -setwebproxy "Wi-Fi" "127.0.0.1" 8001', {});
};

const httpProxy = () => {
  openOsProxy();
  const server = http.createServer((req, res) => {
    const fakeRequest = http.request(
      {
        hostname: req.headers.host,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      response => {
        res.writeHead(response.statusCode, response.statusMessage, response.headers);
        response.on('data', chunk => {
          res.write(chunk);
        });

        response.on('end', () => {
          res.end();
        });
      }
    );

    fakeRequest.on('error', error => {
      console.log('这里检测到了fakeRequest error', error);
    });

    fakeRequest.end();
  });

  server.on('error', error => {
    console.log('这里检测到了http server error', error);
  });

  server.listen(8001);
};

module.exports = httpProxy;
