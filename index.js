var express=require("express");
var app=express();
var ExpressPeerServer = require('peer').ExpressPeerServer;
app.use(express.static('public'))

app.get('/', function(req, res, next) { res.send('Hello world!'); });

var server =  app.listen(process.env.PORT || 8080,()=>{
    console.log("APP STARTED ON 8000");
});

var options = {
    debug: true
}
var peerserver = ExpressPeerServer(server, options);
peerserver.on('connection', function(id) { 
    console.log("client connected");
});
peerserver.on('disconnect', function(id) { 
    console.log("client disconnected");
});

app.use('/peerjs', peerserver);

