var http = require('http');
var EventEmitter = require("events").EventEmitter;
var Util = require("util");

var HttpServer = function (workerid) {
    EventEmitter.call(this);

    this.workerid = workerid;

    var self = this;
    http.Server(function (req, res) {
        res.writeHead(200);

        process.send({
            func: 'calcV',
            args: [1, 2, 3],
            senderid: self.workerid
        });


        self.on("return", function (data) {
            console.log("data:", data);

            res.end("调用进程返回：" + data);
            //res.end("Process " + process.pid + " says hello");
        });

        //process.send("Process " + process.pid + " handled request");
    }).listen(8089, '127.0.0.1', function () {
        console.log("Child Server Running on Process: " + process.pid);
    });
};

Util.inherits(HttpServer, EventEmitter);


module.exports = HttpServer;

