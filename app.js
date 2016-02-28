#!/usr/bin/env node

'use strict';

var os = require('os');
var http = require('http');
var path = require('path');
var express = require('express');
var qrcode = require('qrcode-terminal');
var ifaces = os.networkInterfaces();
var wlan = ifaces['wlan0'] || ifaces['Wi-Fi'];
var address = wlan.filter(ad => ad.family === 'IPv4')[0].address;
var app = express();
var filePath = process.argv[2];
if (!filePath) {
  console.log(`-> run qrshare <file_path>`);
  process.exit(0);
}
var fileName = path.basename(filePath);
var server = http.createServer(app).listen(0, address, () => {
  console.log(`The file is >> ${fileName} <<`);
  console.log(`The url is http:\/\/${address}:${server.address().port}`);
  qrcode.generate(`http:\/\/${address}:${server.address().port}`, code => {
    console.log(code);
  });
});

app.get('/', (req, res, next) => {
  res.download(filePath, fileName, (err) => {
    if (err) {
      console.log('Cant find the file!');
      res.end('Cant find the file!');
    }
    setTimeout(() => {
      console.log('Done!');
      process.exit(0);
    }, 3000);
  });
});
