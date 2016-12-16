var http = require('http');
var Util = require("util");
var SyncTask = require("./SyncTask");


var HttpServer = function (workerid) {
    SyncTask.call(this, workerid);

    var self = this;
    http.Server(function (req, res) {
        res.writeHead(200);

        self.sendTask('calcV', 1, 2, 3,function(data){
            res.end("调用进程返回：" + data);
        });
    }).listen(8089, '127.0.0.1', function () {
        console.log("Child Server Running on Process: " + process.pid);
    });
};

Util.inherits(HttpServer, SyncTask);


module.exports = HttpServer;

