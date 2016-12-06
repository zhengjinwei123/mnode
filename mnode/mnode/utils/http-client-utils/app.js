/**
 * Created by zhengjinwei on 2016/12/4.
 */
var Http = require('http');
var Qs = require('querystring');
var Crypto = require('crypto');
var ObjUtils = require("../app").Object;
var _ = require("lodash");

function HttpUtils(host, port) {
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
}

HttpUtils.prototype.Get = function (route, host, port, data, cb) {
    var argCnt = arguments.count();
    if (argCnt == 3) {
        host = this.host;
        port = this.port;
    }

    if (host == null || port == null) {
        throw new Error("HttpUtils::Get invalid args");
    }

    this.send(route, host, port, "GET", data, cb);
};

HttpUtils.prototype.Post = function (route, host, port, data, cb) {
    var argCnt = arguments.count();
    if (argCnt == 3) {
        host = this.host;
        port = this.port;
    }

    if (host == null || port == null) {
        throw new Error("HttpUtils::Get invalid args");
    }
    this.send(route, host, port, "POST", data, cb);
};

HttpUtils.prototype.send = function (route, host, port, method, data, cb) {
    var opt = {
        host: host,
        port: port,
        method: method,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    opt.path = "/" + route;
    var body = [];
    var timeoutEvent = null;
    var g_res = null;
    var req = Http.request(opt, function (res) {
        //console.log('STATUS: ' + res.statusCode);
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
    }, 30000);

    req.write(Qs.stringify(data));
    req.end();
};

module.exports = HttpUtils;

