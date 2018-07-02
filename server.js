var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;

app.use(express.static('public'))

app.get('/', function(req, res, next) { res.send('Hello world!'); });

var server = app.listen(process.env.PORT || 8080,function(err,data){
    console.log("server up and running");
});

var options = {
    debug: true
}

var peerserver = ExpressPeerServer(server, options);

app.use('/api', peerserver);


