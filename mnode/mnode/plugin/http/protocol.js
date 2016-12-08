var Zlib = require('zlib');
var Async = require('async');
var Logger = require('pomelo-logger').getLogger('Http', 'protocol');
var _ = require('lodash');
var Encrypt = require("../../utils/app").Encrypt;

/**
 * 消息解析协议
 *
 * @class protocol
 * @constructor
 */
function Protocol() {

    var encrypt = null;
    var rc4key = "";
}

Protocol.getInstance = (function () {
    var _inst = null;
    return function () {
        if (_inst instanceof Protocol) {
            return _inst;
        }
        _inst = new Protocol();
        return _inst;
    }
})();
/**
 * 解码协议
 *
 * @method decode
 * @for protocol
 * @param buf 消息提
 * @param protocols 协议类型 { base64 | zlib | googleprotocolbuf | cr4 }
 * @returns {*}
 */
Protocol.prototype.decode = function (buf, protocols, cb) {
    var s = protocols.split('|');
    s = _.compact(s);
    if (s.length == 0) {
        cb(null, buf);
        return;
    }
    var recived_buf = buf;
    var _this = this;
    Async.eachSeries(s, function (item, next) {
        if (item == 'zlib') {
            Zlib.unzip(new Buffer(recived_buf, 'binary'), function (error, bytes) {
                if (error) {
                    Logger.error("解码压缩文件错误:" + error);
                }
                recived_buf = bytes;
                next(error);
            });
        } else if (item == "base64") {
            recived_buf = Encrypt.base64Decode(recived_buf.toString());
            next(null);
        } else if (item = "rc4") {
            recived_buf = Encrypt.rc4Decode(recived_buf, "rc4key");
            next(null);
        } else {
            next(null);
        }
    }, function (error) {
        if (error) {
            Logger.error("protocol.prototype.decode error:" + error);
            cb(error, "");
            return;
        }
        cb(null, recived_buf);
    });
};

/**
 * 编码协议
 *
 * @method encode
 * @for protocol
 * @param buf 消息提
 * @param protocols 协议类型 { base64 | zlib | googleprotocolbuf | cr4}
 * @returns {*}
 */
Protocol.prototype.encode = function (buf, protocols, cb) {
    var bytes_buf = buf;
    var s = protocols.split('|');
    s = s.reverse();
    s = _.compact(s);
    if (s.length == 0) {
        cb(null, bytes_buf);
        return;
    }
    var _this = this;
    Async.eachSeries(s, function (item, next) {
        if (item == 'zlib') {
            Zlib.gzip(new Buffer(bytes_buf, "utf8").toString("binary"), function (error, bytes) {
                if (error) {
                    next(error);
                    return;
                }
                bytes_buf = bytes;
                next(null);
            });
        } else if (item == 'base64') {
            bytes_buf = Encrypt.base64Encode(bytes_buf.toString("binary"));
            next(null);
        } else if (item == 'rc4') {
            bytes_buf = Encrypt.rc4Encode(bytes_buf, "rc4key");
            next(null);
        } else {
            next(null);
        }
    }, function (error) {
        if (error) {
            Logger.error("protocol.prototype.decode error:" + error);
            cb(null, "");
            return;
        }
        cb(null, bytes_buf);
    });
};

module.exports = Protocol.getInstance();