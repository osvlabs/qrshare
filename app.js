#!/usr/bin/env node

'use strict';

var http = require('http');
var path = require('path');
var fs = require('fs');
var express = require('express');
var qrcode = require('qrcode-terminal');
var formidable = require('formidable');
var progress = require('progress');
var address = require('my-ip')();
var app = express();
var server;
var filePath = process.argv[2];
if (filePath === '-h') {
  console.log(`-> run qrshare to upload a file`);
  console.log(`-> run qrshare <file_path> to download a file`);
  process.exit(0);
} else if (!filePath) {
  server = http.createServer(app).listen(0, address, () => {
    console.log(`The upload url is http:\/\/${address}:${server.address().port}`);
    qrcode.generate(`http:\/\/${address}:${server.address().port}`, code => {
      console.log(code);
    });
  });
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/lib');
  app.get('/', (req, res) => {
    res.render('upload');
  });

  app.post('/', (req, res) => {
    var form = new formidable.IncomingForm();
    form.uploadDir = process.cwd();
    form.keepExtensions = true;
    var last = 0;
    var bar = new progress('uploading [:bar] :percent', {
      total: 100,
      width: 30,
      incomplete: ' '
    });
    form.on('progress', (received, expected) => {
      var tick = (Number(received) - Number(last)) / expected * 100;
      last = Number(received);
      bar.tick(tick);
    });
    form.on('file', (field, file) => {
      fs.rename(file.path, path.join(form.uploadDir, file.name));
    });
    form.on('end', () => {
      res.status(200).end();
      setTimeout(() => {
        process.exit(0);
      }, 3000);
    });
    form.parse(req);
  });
} else {
  var fileName = path.basename(filePath);
  server = http.createServer(app).listen(0, address, () => {
    console.log(`The file is >> ${fileName} <<`);
    console.log(`The download url is http:\/\/${address}:${server.address().port}`);
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
}
