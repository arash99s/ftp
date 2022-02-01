// Quick start, create an active ftp server.
const FtpSrv = require('ftp-srv');

const port=21;
const ftpServer = new FtpSrv({
    url: "ftp://127.0.0.1:" + port,
    anonymous: true
});

ftpServer.on('login', (data, resolve, reject) => { 
    return resolve({ root:"D:\\term7\\network2\\project\\Server\\public" }); 
});

ftpServer.listen().then(() => { 
    console.log('Ftp server is starting...')
});