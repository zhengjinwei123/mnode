/**
 * Created by zhengjinwei on 2016/12/4.
 */
var WebSocketServer = require('ws').Server;
var EventEmitter = require("events").EventEmitter;
var Util = require("util");
var Async = require("async");

var WebSocketS = function (host, port) {
    EventEmitter.call(this);
    this.wss = new WebSocketServer({port: port, host: host});

    var self = this;
    this.wss.on('connection', function (ws) {
        var connParam = self.parseConnection(ws);

        self.emit("connection", ws, connParam);

        ws.on('message', function (message) {
            self.emit("message", message);
        });

        ws.on('close', function () {
            self.emit("close", connParam);
        });
    });

    this.wss.on("error", function (error) {
        self.emit("error", error);
    });
    this.wss.once("listening", function () {
        self.emit("listening");
    });
};

Util.inherits(WebSocketS, EventEmitter);

WebSocketS.prototype.broadcast = function (msg, async, callback) {
    if (async) {
        Async.each(this.wss.clients, function (conn, cb) {
            conn.send(msg);
            cb(null);
        }, function (err, resp) {
            callback(err);
        });
    } else {
        this.wss.clients.forEach(function (conn) {
            conn.send(msg);
        });
    }
};
//踢线所有连接
WebSocketS.prototype.kickAll = function () {
    this.wss.clients.forEach(function (c) {
        c.terminate();
    });
};


WebSocketS.prototype.parseConnection = function (socket) {
    return {
        httpVersion: socket.upgradeReq.httpVersion,
        url: socket.upgradeReq.url,
        statusCode: socket.upgradeReq.statusCode,
        method: socket.upgradeReq.method,
        rawHeaders: socket.upgradeReq.rawHeaders,
        headers: socket.upgradeReq.headers,
        host: socket.upgradeReq.headers.host.split(":")[0]
    }
};

module.exports = WebSocketS;