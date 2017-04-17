/**
 * Created 郑金玮 ff on 2016/12/16.
 * TCP 客户端
 */
var EventEmitter = require("events").EventEmitter;
var Util = require("util");
var Net = require('net');

var TcpClient = function (host, port) {
    EventEmitter.call(this);
    this.host = host || '127.0.0.1';
    this.port = port || 9098;

    var client = new Net.Socket();
    var self = this;
    client.connect(this.port, this.host, function () {
        //console.log('CONNECTED TO: ' + self.host + ':' + self.port);
        //client.write('I am Chuck Norris!');
        self.emit("connected", client);
    });


    client.on('data', function (data) {
        //console.log('DATA: ' + data);
        self.emit("data", this,data);
        //client.destroy();
    });

    client.on('close', function () {
        self.emit("close",this);
    });

};

Util.inherits(TcpClient, EventEmitter);

module.exports = TcpClient;

