/**
 * Created by zhengjinwei on 2016/12/4.
 */
var EventEmitter = require('events').EventEmitter,
    Util = require('util');

var Protocol = require("./protocol");

var STATE_INITED = 0;
var STATE_CLOSED = 1;


function HttpConnection(cid, socket, encrypts, server) {
    EventEmitter.call(this);

    this.cid = cid; //连接id
    this.socket = socket; //response
    this.encrypts = encrypts; //加密字符串 "rc4|base64"

    this.createTime = new Date();

    this.init();

    this.server = server;

    this.server.emit("connect-connect", "New connection " + cid + " from " + (socket.connection ? socket.connection.remoteAddress : "unknown address"));
}

Util.inherits(HttpConnection, EventEmitter);

HttpConnection.prototype.init = function () {
    this.socket.on('error', this.emit.bind(this, 'error'));
    this.socket.on('close', this.emit.bind(this, 'disconnect'));
    this.socket.on('finish', this.emit.bind(this, 'disconnect'));

    this.socket.on('message', this.emit.bind(this, 'message'));

    var self = this;
    this.on('error', function (error) {
        self.server.emit("connect-error", "Connection " + self.cid + " has an error :" + error.stack);
    });

    this.on('disconnect', function () {
        self.server.emit("connect-disconnect", "Connection " + self.cid + " disconnected  time-consumed:" + (new Date() - self.createTime));
        self.state = STATE_CLOSED;
    });

    this.on('message', function (func, msg) {
        func(msg, function (err, resp) {
            if (err) {
                self.errorCode(resp, 201);
            } else {
                self.send(resp, 200);
            }
        });
    });

    this.state = STATE_INITED;
};

HttpConnection.prototype.send = function (msg, status) {
    if (this.state !== STATE_INITED) {
        this.server.emit("connect-error", 'Bad connection state:' + this.state);
        return;
    }
    var _this = this;
    _this.socket.statusCode = status || 200;
    if (!msg) {
        _this.socket.end();
        return;
    }
    var strBuf = typeof msg === 'object' ? JSON.stringify(msg) : msg.toString("binary");
    this.server.emit("connect-response", "Response message to connection [" + this.cid + "] " + strBuf.length + " : " + strBuf);
    
    Protocol.encode(strBuf, this.encrypts, function (error, data) {
        _this.socket.end(data);
    })
};

HttpConnection.prototype.disconnect = function (reason) {
    this.errorCode(reason, 504);
};

HttpConnection.prototype.errorCode = function (code, status) {
    if (this.state !== STATE_CLOSED) {
        this.server.emit("connect-errorcode", "This connection will be disconnect by: " + code);
        this.send({error: code}, status || 405);
    }
};

module.exports = HttpConnection;





