const createRootCa = require('./createRootCa');
const httpProxy = require('./httpProxy');
const httpsProxy = require('./httpsProxy');

const httpsProxyDomainList = ['www.google.com.hk'];

// 创建根证书
createRootCa();

// 开启 httpProxy  端口 8000
httpProxy();

// 开启 httpsProxy 端口 8000
httpsProxy(httpsProxyDomainList);
