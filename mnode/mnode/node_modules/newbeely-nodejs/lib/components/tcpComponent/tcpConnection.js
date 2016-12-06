var Logger = require('pomelo-logger').getLogger('newbeely', "tcpComponent");
var EventEmitter = require('events').EventEmitter;
var Util = require('util');

var Working = 2;

var Closed = 5;

var S_HEAD = 0;
var S_BODY = 1;


/**
 *
 * @param socket
 * @param encrypts
 * @constructor
 */
function TcpConnection(socket, encrypts) {
    EventEmitter.call(this);

    this.sid = socket.remoteAddress + "" + socket.remotePort;

    this.socket = socket;

    this.state = Working;

    this.protocol = null;

    this.encrypts = encrypts;

    this.socketState = S_HEAD;
    this.headBuffer = new Buffer(4);
    this.packageBuffer = null;
    this.reciveSize = 0;

    this.socket.once('close', this.emit.bind(this, 'close'));
    this.socket.once('end', this.emit.bind(this, 'close'));
    this.socket.on('error', this.emit.bind(this, 'error'));

    this.socket.on('data', MsgProcesser.bind(null, this));

    this.socket.setTimeout(5000, this.emit.bind(this, 'timeout'));

    Logger.debug("new tcp connection by " + this.sid);
}
Util.inherits(TcpConnection, EventEmitter);

/**
 *
 * @param type
 * @param reqid
 * @param route
 * @param msg
 * @param encode
 * @param cb
 */
TcpConnection.prototype.send = function (type, reqid, route, msg, encode, cb) {
    if (this.socket && this.state == Working) {
        var _this = this;
        this.protocol.encode(JSON.stringify({
            route: route,
            reqid: reqid,
            body: msg
        }), this.encrypts, function (error, data) {
            data = new Buffer(data);
            var length = data ? data.length : 0;
            var packages = new Buffer(length + 4);
            var index = 0;
            packages[index++] = type & 0xff;
            packages[index++] = (length >> 16) & 0xff;
            packages[index++] = (length >> 8) & 0xff;
            packages[index++] = length & 0xff;
            data.copy(packages, 4, 0, length);

            _this.socket.write(packages, encode, cb);
        });
    }
};

/**
 *
 * @param reson
 */
TcpConnection.prototype.kick = function (reson) {
    this.send(0, 0, "kick", reson, "utf8", this.disconnect.bind(this));
};


/**
 *
 */
TcpConnection.prototype.disconnect = function () {
    if (this.state !== Closed) {
        this.socket.destroy();
        this.state = Closed;
    }
    Logger.debug("TcpConnection.disconnect by " + this.sid);
};

/**
 *
 * @param connection
 * @param chunk
 * @returns {*}
 * @constructor
 */
function MsgProcesser(connection, chunk) {
    var offset = 0;
    if (connection.socketState == S_HEAD) {
        chunk.copy(connection.headBuffer, 0, 0, 4);
        offset = 4;
        var packageSize = 0;
        for (var i = 1; i < 4; i++) {
            if (i > 1) {
                packageSize <<= 8;
            }
            packageSize += connection.headBuffer.readUInt8(i);
        }
        connection.packageBuffer = new Buffer(packageSize);
        connection.reciveSize = 0;

        connection.socketState = S_BODY;
    }
    if (connection.socketState == S_BODY) {
        chunk.copy(connection.packageBuffer, connection.reciveSize, offset, chunk.length);
        connection.reciveSize += (chunk.length - offset);
    }
    if (connection.packageBuffer.length == connection.reciveSize) {
        var message = connection.packageBuffer;
        connection.protocol.decode(message, connection.encrypts, function (error, data) {
            if (error) {
                Logger.error("message decode error:" + error);
                return;
            }
            try {
                data = JSON.parse(data);
                connection.emit('message', data);
            } catch (e) {
                Logger.warn("message format error!");
            }
        });
        connection.socketState = S_HEAD;
    }
}

module.exports = {
    id: "tcp-connection",
    func: TcpConnection,
    scope: "prototype",
    args: [
        {name: "socket", type: "Object"},
        {name: "encrypts", type: "String"}
    ],
    "props": [
        {name: "protocol", "ref": "protocol"}
    ]
};