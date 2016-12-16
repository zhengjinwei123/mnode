var http = require('http');
http.Server(function(req, res) {
    res.writeHead(200);
    res.end("Process " + process.pid + " says hello");
    process.send("Process " + process.pid + " handled request");
}).listen(8089,'127.0.0.1',function(){
    console.log("Child Server Running on Process: " + process.pid);
});
