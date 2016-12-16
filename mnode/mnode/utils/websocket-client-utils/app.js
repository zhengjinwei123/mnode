/**
 * Created by 郑金玮 on 2016/12/4.
 */
var WebSocket = require('ws');
var Util = require("util");
var Events = require("events");//EventEmitter通过events模块来访问

function WS(ip, port) {
    Events.EventEmitter.call(this);
    var address = "ws://" + ip + ":" + port;
    this.ws = new WebSocket(address);
    this.opened = false;
    var self = this;
    this.ws.on('open', function () {
        self.opened = true;
    });
    this.ws.on('message', function (data, flags) {
        // flags.binary will be set if a binary data is received.
        // flags.masked will be set if the data was masked.
        //console.log("data called");
        self.emit('data', data);
    });
    this.ws.on('close', function () {
        self.emit('close');
        self.opened = false;
    });
}
Util.inherits(WS, Events.EventEmitter);//使这个类继承EventEmitter

WS.prototype.close = function () {
    this.ww.close();
};

WS.prototype.send = function (msg) {
    if (this.opened && this.ws) {
        this.ws.send(msg);
        return true;
    }
    return false;
};

module.exports = WS;