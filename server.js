var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;
// var sassMiddleware = require('node-sass-middleware');
// var path = require('path');

// var srcPath = __dirname + '/public/scss';
// var destPath = __dirname + '/public/styles';
// app.use(sassMiddleware({
//     src: srcPath,
//     dest: destPath,
//     debug: true,
//     outputStyle: 'expanded'
//   }));
app.use(express.static('public'));

app.get('/', function(req, res, next) { res.send('Hello world!'); });

var server = app.listen(process.env.PORT || 8080,function(err,data){
    console.log("server up and running");
});

var options = {
    debug: true
}

var peerserver = ExpressPeerServer(server, options);

app.use('/api', peerserver);


