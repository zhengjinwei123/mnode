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
        self.setKeepAlive(socket, true, 3000);

        self.emit("newConnection", parseConnection(socket));

        var buffers = [];
        socket.on('data', function (buffer) {
            buffers.push(buffer);
            checkPacket(buffers, socket, function (msg, connection) {
                self.emit("data", connection, msg);
            });
        });
        socket.on('close', function () {
            self.emit("close", parseConnection(socket));
            self.clear(socket);
        });
        socket.on('end', function () {
            self.clear(socket);
        });
    });

    this.server.listen(this.port, this.host);

    this.server.on("error", function (err) {
        self.emit("error", err);
    });

    this.server.on('listening', function () {
        self.emit("listening", self.server.address());
    });
};
Util.inherits(TcpServer, EventEmitter);

function msgPack(msgId, data) {
    var msgStr = JSON.stringify(data);

    // datelen + route + msglen + msgStr
    var headerlen = 2 + 2 + 2;
    var msglen = Buffer.byteLength(msgStr);
    var datalen = headerlen + msglen;

    var buf = new Buffer(datalen);
    var wirtePos = 0;
    buf.writeUInt16BE(datalen, wirtePos);	// datalen
    wirtePos += 2;
    buf.writeUInt16BE(msgId, wirtePos);	// reqid
    wirtePos += 2;
    buf.writeUInt16BE(msglen, wirtePos);	// msglen
    wirtePos += 2;
    buf.write(msgStr, wirtePos);
    return buf;
}

function checkPacket(buffers, connection, handler) {
    if (buffers.length == 0) {
        return false;
    }
    function mergeLeadingBuffersUntilLengthReach(n) {
        var buf0 = buffers.shift();
        while (buf0.length < n) {
            if (buffers.length == 0) {
                buffers.unshift(buf0);
                return false;
            }
            var buf1 = buffers.shift();
            var buf0_1 = new Buffer(buf0.length + buf1.length);
            buf0.copy(buf0_1);
            buf1.copy(buf0_1, buf0.length);
            buf0 = buf0_1;
        }
        return buf0;
    }

    // merge leading buffers until it's length reach data length
    var buf = mergeLeadingBuffersUntilLengthReach(2);
    if (buf === false) {
        return false;
    }
    // data len
    var datalen = buf.readUInt16BE(0);
    if (datalen == 0) {
        return false;
    }
    buffers.unshift(buf);
    buf = mergeLeadingBuffersUntilLengthReach(datalen);
    if (buf === false) {
        return false;
    }

    try {
        var wirtePos = 0;
        var datalen = buf.readUInt16BE(wirtePos);
        wirtePos += 2;
        var route = buf.readUInt16BE(wirtePos);
        wirtePos += 2;
        var msglen = buf.readUInt16BE(wirtePos);
        wirtePos += 2;
        var str = buf.toString("utf8", wirtePos, datalen);
    } catch (e) {

    }
    if (buf.length > datalen) {
        buffers.unshift(buf.slice(datalen));
    }
    handler({msgId: route, msg: str}, connection);
    if (buffers.length > 0) {
        checkPacket(buffers, connection, handler);
    }
    return;
}

TcpServer.prototype.clear = function (sock) {
    var index = this.connectionList.indexOf(sock);
    if (index != -1) {
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

function parseConnection(sock) {
    return {
        socket: sock,
        host: sock.remoteAddress,
        port: sock.remotePort
    }
}
module.exports = TcpServer;