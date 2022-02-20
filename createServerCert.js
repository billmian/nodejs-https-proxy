const fs = require('fs');
const forge = require('node-forge');

function createCertificate(domain) {
  if (!domain) {
    throw Error('创建证书 domain 不能为空');
  }
  // 读取根证书 caCert 和 caKey
  const caCertPem = fs.readFileSync('./rootCa/CACert.pem', 'utf8');
  const caKeyPem = fs.readFileSync('./rootCa/CAKey.pem', 'utf8');
  const caCert = forge.pki.certificateFromPem(caCertPem);
  const caKey = forge.pki.privateKeyFromPem(caKeyPem);

  // 生成随机秘钥对
  const keys = forge.pki.rsa.generateKeyPair(2048);
  // 生成证书
  const cert = forge.pki.createCertificate();

  cert.publicKey = keys.publicKey;
  cert.serialNumber = String(Date.now());
  cert.validity.notBefore = new Date();
  cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear() - 1);
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 1);

  const attrs = [
    { name: 'commonName', value: domain },
    { name: 'countryName', value: 'CN' },
    { shortName: 'ST', value: 'sichuan' },
    { name: 'localityName', value: 'chengdu' },
    { name: 'organizationName', value: 'Myself' },
  ];

  // 颁发者设置为根证书
  cert.setSubject(attrs);
  cert.setIssuer(caCert.subject.attributes);

  // 证书设置
  cert.setExtensions([
    {
      name: 'basicConstraints',
      critical: true,
      cA: false,
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true,
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true,
    },
    {
      name: 'nsCertType',
      client: true,
      server: true,
      email: true,
      objsign: true,
      sslCA: true,
      emailCA: true,
      objCA: true,
    },
    {
      name: 'subjectAltName',
      // 这里填多个域名或者 ip
      altNames: [
        {
          type: 2, // DNS
          value: domain,
        },
      ],
    },
    {
      name: 'subjectKeyIdentifier',
    },
  ]);

  // 使用根证书签名
  cert.sign(caKey, forge.md.sha256.create());

  // 公钥 ca.crt
  fs.writeFileSync('./clientCert/clientCert.pem', forge.pki.certificateToPem(cert));
  // 私钥 ca.key.pem
  fs.writeFileSync('./clientCert/clientKey.pem', forge.pki.privateKeyToPem(keys.privateKey));
}

module.exports = createCertificate;
