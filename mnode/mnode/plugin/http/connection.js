/**
 * Created by zhengjinwei on 2016/12/4.
 */
var EventEmitter = require('events').EventEmitter,
    Util = require('util'),
    Logger = require('pomelo-logger').getLogger('Http', 'httpConnection');

var Protocol = require("./protocol");

var STATE_INITED = 0;
var STATE_CLOSED = 1;


function HttpConnection(cid, socket, encrypts) {
    EventEmitter.call(this);

    this.cid = cid; //连接id
    this.socket = socket; //response
    this.encrypts = encrypts; //加密字符串 "rc4|base64"

    this.createTime = new Date();

    this.init();

    Logger.info("New connection " + cid + " from " + (socket.connection ? socket.connection.remoteAddress : "unknown address"));
}

Util.inherits(HttpConnection, EventEmitter);

HttpConnection.prototype.init = function () {
    this.socket.on('error', this.emit.bind(this, 'error'));
    this.socket.on('close', this.emit.bind(this, 'disconnect'));
    this.socket.on('finish', this.emit.bind(this, 'disconnect'));

    this.socket.on('message', this.emit.bind(this, 'message'));

    var self = this;
    this.on('error', function (error) {
        Logger.warn("Connection " + self.cid + " has an error :" + error.stack);
    });

    this.on('disconnect', function () {
        Logger.info("Connection " + self.cid + " disconnected  time-consumed:" + (new Date() - self.createTime));
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
        Logger.warn('Bad connection state:' + this.state);
        return;
    }
    var _this = this;
    _this.socket.statusCode = status || 200;
    if (!msg) {
        _this.socket.end();
        return;
    }
    var strBuf = typeof msg === 'object' ? JSON.stringify(msg) : msg.toString("binary");
    Logger.info("Response message to connection [" + this.cid + "] " + strBuf.length + " : " + strBuf);

    Protocol.encode(strBuf, this.encrypts, function (error, data) {
        _this.socket.end(data);
    })
};

HttpConnection.prototype.disconnect = function (reason) {
    this.errorCode(reason, 504);
};

HttpConnection.prototype.errorCode = function (code, status) {
    if (this.state !== STATE_CLOSED) {
        Logger.debug("This connection will be disconnect by: " + code);
        this.send({error: code}, status || 405);
    }
};

module.exports = HttpConnection;





