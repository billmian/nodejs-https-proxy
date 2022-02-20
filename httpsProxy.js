const http = require('http');
const { exec } = require('child_process');
const net = require('net');
const url = require('url');
const { findUnusedPort } = require('./utils');
const fakeHttpsServer = require('./fakeHttpsServer');

const openOsProxy = () => {
  exec('networksetup -setsecurewebproxy "Wi-Fi" "127.0.0.1" 8000', {});
};


// 不同域名创建的不同服务器在这里
const domainPortMap = {};

const httpsProxy = httpsProxyDomainList => {
  const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  });

  server.listen(8000);
  openOsProxy();

  server.on('connect', (clientRequest, clientSocket, head) => {
    const protocol = clientRequest.connection?.encrypted ? 'https:' : 'http:';

    clientSocket.on('error', error => {
      // console.log('这里输出 clientSocket 的 error:', error);
      clientSocket.destroy();
    });

    const { port = 443, hostname } = url.parse(`${protocol}//${clientRequest.url}`);
    console.log('🚀 ~ 监听到了 connect 事件', hostname);

    let targetSocket;
    if (httpsProxyDomainList.includes(hostname)) {
      console.log('这里监听到了', hostname);
      let targetPort;

      if (domainPortMap[hostname]) {
        targetPort = domainPortMap[hostname];
      } else {
        targetPort = findUnusedPort();
        domainPortMap[hostname] = targetPort;
        fakeHttpsServer(targetPort, hostname);
      }

      targetSocket = net.connect(targetPort, '127.0.0.1', () => {
        console.log('这里是 fake 服务器连接成功了');
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n' + 'Proxy-agent: nodejs-proxy\r\n' + '\r\n');
        targetSocket.write(head);
      });
    } else {
      // 不需要代理的都走隧道代理
      targetSocket = net.connect(port, hostname, () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n' + 'Proxy-agent: nodejs-proxy\r\n' + '\r\n');
        targetSocket.write(head);
      });
    }

    targetSocket.on('data', function (chunk) {
      clientSocket.write(chunk);
    });

    clientSocket.on('data', function (chunk) {
      targetSocket.write(chunk);
    });

    clientSocket.on('close', () => {
      // console.log('clientSocket close===========');
      targetSocket.end();
    });

    clientSocket.on('error', () => {
      // console.log('clientSocket error===========');
      targetSocket.end();
    });

    targetSocket.on('close', () => {
      clientSocket.end();
    });

    targetSocket.on('error', error => {
      console.log('error', error);
      clientSocket.write(`HTTP/${clientRequest.httpVersion} 500 Connection error\r\n\r\n`);
      clientSocket.end();
    });
  });

  server.on('close', () => {
    console.log('这里监测到了退出');
  });

  server.on('error', error => {
    console.log('https proxy 检测到了 error', error);
  });
};


module.exports = httpsProxy;
