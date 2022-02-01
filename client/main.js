var express = require( 'express');
var path = require( 'path');
var app = express();
var net = require('net');
var formidable = require('formidable');
var fs = require('fs');
//var Client = require('ftp');
const { hostname } = require('os');
const ftp = require("basic-ftp");
var mv = require('mv');
const client = new ftp.Client();


async function connect_ftp(){
  try {
    await client.access({
        host: "127.0.0.1",
        user: "very",
        password: "password",
        secure: false
    })
  }catch(err) {
    console.log(err)
  }
}


async function ftp_list() {
    try {
        var files = await client.list()
        var result = ""
        for(var file of files) {
          result += String(file.name) + "&"
        }
        return result
    }
    catch(err) {
        console.log(err)
    }
    client.close()
}

async function ftp_upload(path , filename) {
  try {
      console.log(path , " -> " , filename)
      await client.uploadFrom(path, filename)
  }
  catch(err) {
      console.log(err)
  }
}

async function ftp_download(path , serverfile) {
  try {
      console.log(serverfile , " -> " , path)
      await client.downloadTo(path, serverfile)
  }
  catch(err) {
      console.log(err)
  }
}

async function ftp_cd(folder_name) {
  try {
      await client.cd(folder_name) 
      //console.log(await ftp_list())
  }
  catch(err) { // file need to download
      console.log(err)
      await ftp_download('Download/'+folder_name , folder_name)
      return false
  }
  return true
}

app.get('/', function (req, res) {
   console.log(path.resolve())
   connect_ftp().then(()=>{
    res.redirect('/dir')
   })
})

app.get('/home', function (req, res) {
  console.log("home")
  res.sendFile('index.html', {root:path.resolve()})
})

app.get('/dir', function (req, res) {
  console.log("dir")
  ftp_list().then((value)=>{
    console.log(value)
    res.redirect('/home?'+value);
  });
})

app.get('/cd', function (req, res) {
  console.log("cd " + req.query.cd)
  ftp_cd(req.query.cd).then((flag)=>{
    if (flag)
      res.redirect('/dir');
    else{ // file downloaded and send
      res.sendFile(path.resolve()+'/Download/'+req.query.cd)
    }
  })
})
app.post('/upload', function (req, res) {
  var form = new formidable.IncomingForm();
  form.multiples = true;
  form.maxFileSize = 50 * 1024 * 1024; //  
  form.parse(req, async (err, fields, files) => {
    console.log(files.xfile.originalFilename)
    if (err) {
      console.log("Error parsing the files");
      return res.status(400).json({
        status: "Fail",
        message: "There was an error parsing the files",
        error: err,
      }); 
    }
    if(files.xfile.originalFilename == "")
      return
    var oldpath = files.xfile.filepath;
    var newpath = "C:\\Users\\Arash\\AppData\\Local\\Temp\\"+files.xfile.originalFilename;
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        console.log("file renamed")
      })
      await sleep(3000)
      await ftp_upload(newpath , files.xfile.originalFilename)

      fs.unlink(newpath, (err) => {
        if (err) throw err;
        console.log('temp file was deleted');
      });
      
  });
  res.redirect('/home');
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}