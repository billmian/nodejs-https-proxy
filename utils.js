const { exec } = require('child_process');

const checkIsPortOccupied = port => {
  let isPortOccupied = false;
  exec(`lsof -i:${port}`, (error, stdout, stderr) => {
    if (stdout !== '') {
      isPortOccupied = true;
    }
  });
  return isPortOccupied;
};
const findUnusedPort = () => {
  for (let i = 8001; i < 9000; i++) {
    const isPortOccupied = checkIsPortOccupied(i);
    if (!isPortOccupied) {
      return i;
    }
  }
  throw new Error('用于创建 fakeHttpServer 的 8001 ～ 9000 端口被占用完了');
};

module.exports = { checkIsPortOccupied, findUnusedPort };
