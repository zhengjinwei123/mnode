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

    this.connList = [];

    var self = this;
    this.wss.on('connection', function (ws) {
        var connParam = self.parseConnection(ws);
        self.connList[connParam.host] = ws;

        self.emit("connection", ws, connParam);

        ws.on('message', function (message) {
            self.emit("message", message);
        });

        ws.on('close', function () {
            self.emit("close", connParam);
            var index = 0;
            for (var i in self.connList) {
                if (i == connParam.host) {
                    self.connList.splice(index, 1);
                    break;
                }
                index++;
            }
        });
    });
};

Util.inherits(WebSocketS, EventEmitter);

WebSocketS.prototype.broadcast = function (msg, async, callback) {
    if (async) {
        Async.each(this.connList, function (conn, cb) {
            conn.send(msg);
            cb(null);
        }, function (err, resp) {
            callback(err);
        });
    } else {
        this.connList.forEach(function (conn) {
            conn.send(msg);
        });
    }
};
//踢线所有连接
WebSocketS.prototype.kickAll = function () {
    this.connList[host].forEach(function (c) {
        c.terminate();
    });
};

WebSocketS.prototype.kick = function (host) {
    if (this.connList[host]) {
        this.connList[host].terminate();
    }
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