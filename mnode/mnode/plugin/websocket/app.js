/**
 * Created by 郑金玮 on 2016/12/4.
 */
var WebSocketServer = require('ws').Server;
var EventEmitter = require("events").EventEmitter;
var Util = require("util");
var Async = require("async");
var ObjUtil = require("../../utils/app").Object;
var _ = require("lodash");
var IpUtil = require("../../utils/app").IP;

var WebSocketS = function (host, port) {
    EventEmitter.call(this);

    var argCnt = ObjUtil.count(arguments);
    if (argCnt == 0) {
        this.host = '127.0.0.1';
        this.port = 9091;
    } else if (argCnt == 1) {
        if (_.isString(arguments[0])) {
            this.host = arguments[0];
            this.port = 9091;
        } else if (_.isNumber(arguments[0])) {
            this.host = '127.0.0.1';
            this.port = arguments[0];
        } else {
            throw new Error("args error,you must be specify a string for host and a number for port");
        }
    } else {
        if (_.isString(arguments[0]) && _.isNumber(arguments[1])) {
            this.host = arguments[0];
            this.port = arguments[1];
        } else if (_.isString(arguments[1]) && _.isNumber(arguments[0])) {
            this.host = arguments[1];
            this.port = arguments[0];
        } else {
            throw new Error("args error");
        }
    }

    if (!IpUtil.ipIp(this.host)) {
        throw new Error("invalid host args");
    }
    if (this.port <= 1024) {
        throw new Error("invalid port args");
    }

    this.wss = new WebSocketServer({port: this.port, host: this.host});

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