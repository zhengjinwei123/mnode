/**
 * Created by zhengjinwei on 2016/12/13.
 */
var EventEmitter = require("events").EventEmitter;
var Util = require("util");
var ObjUtil = require("../../utils/app").Object;
var _ = require("lodash");
var IpUtil = require("../../utils/app").IP;
var Dgram = require('dgram');

var UdpServer = function (host, port, memberShip) {
    EventEmitter.call(this);

    var argCnt = ObjUtil.count(arguments);
    if (argCnt == 0) {
        this.host = '127.0.0.1';
        this.port = 9092;
    } else if (argCnt == 1) {
        if (_.isString(arguments[0])) {
            this.host = arguments[0];
            this.port = 9092;
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

    this.server = Dgram.createSocket("udp4");

    var self = this;

    this.server.bind({
        address: this.host,
        port: this.port,
        exclusive: false //false:多进程模式共享一个端口 true:不共享
    }, function () {
        if (memberShip && _.isString(memberShip) && IpUtil.ipIp(memberShip) && (memberShip != self.host)) {
            self.server.addMembership(memberShip);
        }
    });

    this.server.on("message", function (msg, rinfo) {
        self.emit("message", msg, rinfo);
        //console.log('Received %d bytes from %s:%d\n', msg.length, rinfo.address, rinfo.port);
    });

    this.server.on("listening", function () {
        var address = self.server.address();
        self.emit("listening", address);
        //console.log("server listening "+ address.address+":"+address.port);
    });

    self.server.on('error', function (error) {
        self.server.close();
        self.emit("error", error);
    });
};

Util.inherits(UdpServer, EventEmitter);

module.exports = UdpServer;
