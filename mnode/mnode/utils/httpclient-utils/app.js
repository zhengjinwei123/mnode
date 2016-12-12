/**
 * Created by 郑金玮 on 2016/12/4.
 */
var Http = require('http');
var Qs = require('querystring');
var Crypto = require('crypto');
var ObjUtils = require("../obj-utils/app");
var _ = require("lodash");


var HEADER_FORM = 1, HEADER_JSON = 2;

function HttpUtils(host, port, headerType) {
    if (arguments[0] && arguments[1]) {
        if (_.isNumber(host) && _.isString(port)) {
            var _tmp = host;
            host = port;
            port = _tmp;
        }
        this.host = host;
        this.port = port;
    } else {
        this.host = "127.0.0.1";
        this.port = 8082;
    }
    if (arguments[2] == undefined) {
        this.headerType = HEADER_FORM;
    } else {
        if ((headerType != HEADER_FORM) && (headerType != HEADER_JSON)) {
            throw new EvalError("headerType must be 1(for form) or 2(for json)");
        }
        this.headerType = headerType;
    }
}

HttpUtils.prototype.header = function (data) {
    if (this.headerType == HEADER_FORM) {
        return {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        }
    } else if (this.headerType == HEADER_JSON) {
        return {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }
};

HttpUtils.prototype.parseData = function (data) {
    if (this.headerType == HEADER_FORM) {
        return Qs.stringify(data);
    } else if (this.headerType == HEADER_JSON) {
        return JSON.stringify(data);
    }
};

HttpUtils.prototype.Get = function (route, host, port, data, cb) {
    var argCnt = ObjUtils.count(arguments);
    if (argCnt < 3) {
        throw new Error("HttpUtils:Get parameters error");
    }

    var _host = null, _port = null, _data, _callback;
    if (argCnt == 3) {
        _host = this.host;
        _port = this.port;
        _data = host;
        _callback = port;
    }

    if (_host == null || _port == null) {
        throw new Error("HttpUtils::Get invalid args");
    }
    this.send(route, _host, _port, "GET", _data, _callback);
};

HttpUtils.prototype.Post = function (route, host, port, data, cb) {
    var argCnt = ObjUtils.count(arguments);
    if (argCnt < 3) {
        throw new Error("HttpUtils:post parameters error");
    }

    var _host = null, _port = null, _data, _callback;
    if (argCnt == 3) {
        _host = this.host;
        _port = this.port;
        _data = host;
        _callback = port;
    }

    if (_host == null || _port == null) {
        throw new Error("HttpUtils::Get invalid args");
    }

    this.send(route, _host, _port, "POST", _data, _callback);
};

HttpUtils.prototype.send = function (route, host, port, method, data, cb) {

    var _data = this.parseData(data);
    var opt = {
        host: host,
        port: port,
        method: method,
        headers: this.header(_data)
    };

    opt.path = "/" + route;
    var body = [];
    var timeoutEvent = null;
    var g_res = null;
    var req = Http.request(opt, function (res) {
        if (res.statusCode != 200) {
            cb("status error:" + res.statusCode);
            return;
        }
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        g_res = res;
        res.on('data', function (d) {
            clearTimeout(timeoutEvent);
            body.push(d);
        });
        res.on('end', function () {
            clearTimeout(timeoutEvent);
            var bufferFromServer = Buffer.concat(body);
            cb(null, bufferFromServer.toString());
        });

        res.on("abort", function () {
            console.error("res abort");
        });
    });

    req.on('error', function (e) {
        cb(true);
        console.error("Got error: " + e.message);
    });
    req.on("timeout", function () {
        if (g_res) {
            g_res.emit("abort");
        }
        req.abort();
    });

    timeoutEvent = setTimeout(function () {
        req.emit("timeout");
    }, 60000);

    req.write(_data);
    req.end();
};

module.exports = HttpUtils;

