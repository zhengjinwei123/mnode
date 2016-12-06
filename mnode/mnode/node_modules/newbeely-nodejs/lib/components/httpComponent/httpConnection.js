/**
 * @filename httpConnection
 *
 * @module Component
 *
 * @author Guofeng.Ding <dingguofeng@zplay.cn>
 * @version 1
 * @time 2015-10-10 14:03
 */

var EventEmitter = require('events').EventEmitter,
    Util = require('util'),
    Logger = require('pomelo-logger').getLogger('newbeely', 'httpConnection');

var ST_INITED = 0;
var ST_CLOSED = 1;

/**
 * Connection
 *
 * Http服务连接组件
 *
 * @class HttpComponent.Connection
 * @param {String} id 连接id
 * @param {Object} socket response对象
 * @param {Object} protocols 协议
 * @constructor
 */
function Connection(id, socket, protocols) {
    EventEmitter.call(this);

    /**
     * 连接id
     *
     * @property id
     * @type {String}
     */
    this.cid = id;

    /**
     * http response对象
     *
     * @property socket
     * @type {Object}
     */
    this.socket = socket;

    /**
     * 协议编解码对象
     *
     * @property protocol
     * @type {Object}
     */
    this.protocol = null;

    /**
     * 加密方法
     *
     * @property encrypts
     * @type {Object}
     */
    this.encrypts = protocols;

    /**
     * 连接开始时间
     * @type {Date}
     * @private
     */
    this.__createTime = new Date();

    Logger.info("New connection " + id + " from " + (socket.connection ? socket.connection.remoteAddress : "unknown"));
}
Util.inherits(Connection, EventEmitter);

/**
 * 组件自动初始化
 *
 * @method init
 * @for HttpComponent.Connection
 * @return {Null}
 */
Connection.prototype.init = function () {
    this.socket.on('error', this.emit.bind(this, 'error'));
    this.socket.on('close', this.emit.bind(this, 'disconnect'));
    this.socket.on('finish', this.emit.bind(this, 'disconnect'));

    this.on('error', function (error) {
        Logger.warn("Connection " + this.cid + " has an error :" + error.stack + "");
    });
    var _this = this;
    this.on('disconnect', function () {
        Logger.info("Connection " + this.cid + " disconnected  time-consumed:" + (new Date() - _this.__createTime));
        _this.state = ST_CLOSED;
    });

    this.state = ST_INITED;
};

/**
 * 发送消息
 *
 * @method send
 * @for HttpComponent.Connection
 * @param msg {*}
 * @return {Null}
 */
Connection.prototype.send = function (msg, status) {
    if (this.state !== ST_INITED) {
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

    this.protocol.encode(strBuf, this.encrypts, function (error, data) {
        _this.socket.end(data);
    })
};

/**
 * 断开连接
 *
 * @method disconnect
 * @for HttpComponent.Connection
 * @param reason {String} 断开连接原因
 * @return {Null}
 */
Connection.prototype.disconnect = function (reason) {
    this.errorCode(reason, 504);
};

/**
 * 错误消息
 *
 * @method: errorCode
 * @param code 错误代码
 * @param status 指定错误status值 默认405
 */
Connection.prototype.errorCode = function (code, status) {
    if (this.state !== ST_CLOSED) {
        Logger.debug("This connection will be disconnect by: " + code);
        this.send({error: code}, status || 405);
    }
}

module.exports = {
    id: "httpConnection",
    func: Connection,
    scope: "prototype",
    init: "init",
    args: [
        {name: "id", type: "Number"},
        {name: "socket", type: "Object"},
        {name: "protocols", type: "String"}
    ],
    props: [
        {name: "protocol", "ref": "protocol"}
    ]
};