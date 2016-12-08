/**
 * Created by zhengjinwei on 2016/12/4.
 */
var WebSocketServer = require('ws').Server;
var EventEmitter = require("events").EventEmitter;
var Util = require("util");

var WebSocketS = function (host, port) {
    EventEmitter.call(this);
    this.wss = new WebSocketServer({port: port, host: host});

    var self = this;
    this.wss.on('connection', function (ws) {
        self.emit("connection");
        ws.on('message', function (message) {
            // console.log('received: %s', message);
            self.emit("message");
        });
        ws.send('something');
    });
};

Util.inherits(WebSocketS, EventEmitter);

module.exports = WebSocketS;