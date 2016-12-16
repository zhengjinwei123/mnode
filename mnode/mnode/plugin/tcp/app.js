/**
 * Created by 郑金玮 on 2016/12/16.
 */
var Net = require("net");
var EventEmitter = require("events").EventEmitter;
var Util = require("util");
var FileUtil = require("../../utils/app").File;
var _ = require("lodash");

var TcpServer = function (host, port) {
    EventEmitter.call(this);
    this.host = host || '127.0.0.1';
    this.port = port || 9098;

    this.connectionList = [];

    this.encoding = 'utf8';

    this.validEncoding = ['utf8', 'hex'];

    var self = this;
    this.server = Net.createServer(function (socket) {
        self.connectionList.push(socket);

        //关闭 Nagle 算法
        self.setNoDelay(socket);
        //保活连接，避免发送失败
        self.setKeepAlive(socket, true);

        self.emit("newConnection", parseConnection(socket));

        socket.on('data', function (data) {
            self.emit("data", data);
        });
        socket.on('close', function () {
            self.emit("close", socket);
            self.clear(socket);
        });
        socket.on('end', function () {
            self.clear(socket);
        });
    });

    this.server.listen(this.port, this.host);

    this.server.on("error", function (err) {
        self.emit("error", err);
        console.log("server error", err);
    });

    this.server.on('listening', function () {
        console.log("listening ", self.server.address());
    });

    //client connect
    this.on('newConnection', function (sock) {
        console.log("newConnection", parseConnection(sock))
    });

    //client data
    this.on("data", function (data) {
        console.log("receive data:", data);
    });

};
TcpServer.prototype.clear = function (sock) {
    var index = this.connectionList.indexOf(sock);
    if (index != -1) {
        console.log("closed", parseConnection(sock));
        this.connectionList.splice(index, 1);
    }
};


TcpServer.prototype.send = function (socket, msg) {
    if (socket) {
        if (_.isString(msg)) {
            return this.sendString(socket, msg);
        } else if (_.isBuffer(msg)) {
            return this.sendBinary(socket, msg);
        }
    }
    return false;
};

TcpServer.prototype.sendBinary = function (socket, msg) {
    return socket.write(msg);
};

TcpServer.prototype.sendString = function (socket, msg, encoding) {
    var _encoding = this.encoding;
    if (this.validEncoding.indexOf(encoding) != -1) {
        _encoding = encoding;
    }

    socket.setEncoding(_encoding);
    return socket.write(msg);
};

TcpServer.prototype.pipe = function (socket, file) {
    if (FileUtil.isFile(file) && this.socketExists(socket)) {
        var ws = require('fs').createWriteStream(file);
        socket.pipe(ws);
        return true;
    }
    return false;
};
TcpServer.prototype.setKeepAlive = function (socket, tag, delay) {
    if (this.socketExists(socket)) {
        if (_.isBoolean(tag)) {
            if (delay) {
                socket.setKeepAlive(tag, delay);
            } else {
                socket.setKeepAlive(tag);
            }
        }
    }
};

TcpServer.prototype.setNoDelay = function (socket) {
    if (this.socketExists(socket)) {
        socket.setNoDelay(true);
    }
};


TcpServer.prototype.socketExists = function (socket) {
    return (this.connectionList.indexOf(socket) != -1);
};

TcpServer.prototype.timeout = function (socket, time, callback) {
    if (this.socketExists(socket) && (parseInt(time) > 0)) {
        socket.setTimeout(time, function () {
            if (_.isFunction(callback)) {
                callback();
            }
        });
    }
};

TcpServer.prototype.end = function (socket, msg) {
    if (this.socketExists(socket)) {
        socket.end(msg);
    }
};

TcpServer.prototype.address = function () {
    return this.server.address();
};

Util.inherits(TcpServer, EventEmitter);


function parseConnection(sock) {
    return {
        socket: sock,
        remoteAddress: sock.remoteAddress,
        remotePort: sock.remotePort
    }
}


module.exports = TcpServer;