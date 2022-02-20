const createRootCa = require('./createRootCa');
const httpProxy = require('./httpProxy');
const httpsProxy = require('./httpsProxy');
const { exec } = require('child_process');

const httpsProxyDomainList = ['www.google.com.hk'];

const closeOsProxy = () => {
  exec('networksetup -setwebproxystate "Wi-Fi" off', {});
  exec('networksetup -setsecurewebproxystate "Wi-Fi" off', {});
};

// 开启 httpProxy  端口 8001
httpProxy();

// // 开启 httpsProxy 端口 8000
httpsProxy(httpsProxyDomainList);

process.on('SIGINT', function () {
  closeOsProxy();
  process.exit();
});
process.on('warning', e => console.warn('这里输出 warning 堆栈', e.stack));
