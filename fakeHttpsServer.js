const https = require('https');
const fs = require('fs');
const createCertificate = require('./createServerCert');

const fakeHttpsServer = (port, domain) => {
  createCertificate(domain);

  const options = {
    key: fs.readFileSync('./clientCert/clientKey.pem'),
    cert: fs.readFileSync('./clientCert/clientCert.pem'),
  };

  const server = https.createServer(options, (req, res) => {
    const reqOptions = {
      hostname: req.headers.host,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const request = https.request(reqOptions, response => {
      res.writeHead(response.statusCode, response.statusMessage, response.headers);

      response.on('data', chunk => {
        res.write(chunk);
      });

      response.on('end', () => {
        res.end();
      });
    });

    // 如果没有这一条，请求不会截止，就会超时 https://github.com/nodejs/node-v0.x-archive/blob/3c91a7ae10f0ccabe4550c77189813f8d95785b0/lib/http.js#L1623-1627
    request.end();

    request.on('error', error => {
      console.log('这里输出 error:', error);
    });
  });

  server.listen(port);
};

module.exports = fakeHttpsServer;
