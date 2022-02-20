const http = require('http');
const { exec } = require('child_process');

const openOsProxy = () => {
  exec('networksetup -setwebproxy "Wi-Fi" "127.0.0.1" 8000', {});
};
const closeOsProxy = () => {
  exec('networksetup -setwebproxystate "Wi-Fi" off', {});
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
    closeOsProxy();
  });
  // 监听到 ctrl + c 退出
  process.on('SIGINT', function () {
    server.close();
    closeOsProxy();
    process.exit();
  });

  server.listen(8000);
};

module.exports = httpProxy;
