const fs = require('fs');
const forge = require('node-forge');
const path = require('path');

const createRootCa = () => {
  // 创建一份随机钥匙对
  const keys = forge.pki.rsa.generateKeyPair(2048);
  // 创建证书
  const cert = forge.pki.createCertificate();

  // 使用公钥
  cert.publicKey = keys.publicKey;
  // 序列号
  cert.serialNumber = String(Date.now());
  // 设置有效日期
  cert.validity.notBefore = new Date();
  cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear() - 1);
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 2);

  // 属性设置
  const attrs = [
    { name: 'commonName', value: 'www.test.com' },
    { name: 'countryName', value: 'CN' },
    { shortName: 'ST', value: 'sichuan' },
    { name: 'localityName', value: 'chengdu' },
    { name: 'organizationName', value: 'Myself' },
  ];

  // 设置 subject
  cert.setSubject(attrs);
  // 设置颁发者
  cert.setIssuer(attrs);

  // 设置 Extensions
  // 这里不用改
  cert.setExtensions([
    {
      name: 'basicConstraints',
      critical: true,
      cA: true,
    },
    {
      name: 'keyUsage',
      critical: true,
      keyCertSign: true,
    },
    {
      name: 'subjectKeyIdentifier',
    },
  ]);

  // 用自己的私钥给 CA 根证书签名
  cert.sign(keys.privateKey, forge.md.sha256.create());

  // 公钥 ca.crt
  fs.writeFileSync(path.resolve(__dirname, './rootCa/CACert.pem'), forge.pki.certificateToPem(cert));
  // 私钥 ca.key.pem
  fs.writeFileSync(path.resolve(__dirname, './rootCa/CAKey.pem'), forge.pki.privateKeyToPem(keys.privateKey));
};

module.exports = createRootCa;
