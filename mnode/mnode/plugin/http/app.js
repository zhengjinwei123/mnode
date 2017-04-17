/**
 * Created by 郑金玮 on 2016/12/4.
 */
var Http = require("http");
var Https = require("https");
var Fs = require("fs");
var Url = require('url');
var IpUtils = require("../../utils/ip-utils/app");
var Qs = require('querystring');
var FileUtils = require("../../utils/app").File;
var Path = require("path");
var EventEmitter = require("events").EventEmitter;
var Util = require("util");
var _ = require("lodash");
var Protocol = require("./protocol");
var Encrypt = require("../../utils/app").Encrypt;
var HttpConnection = require("./connection");
var Singleton = require("../../utils/app").Singleton;
var Session = require("./session");
var UUID = require("node-uuid");
var Async = require("async");
var IpUtil = require("../../utils/app").IP;
var SyncTask = require("./SyncTask.js");

function HttpServer(bindPort, bindHost, opts, serverRootPath, session, workerid) {
    EventEmitter.call(this);
    SyncTask.call(this, workerid);

    this.host = bindHost;
    this.port = bindPort;

    if (!FileUtils.isDirectory(serverRootPath)) {
        throw new Error(serverRootPath + " must be a valid directory");
    }
    //服务运行目录
    this.runPath = serverRootPath;

    if (!this.host) {
        this.host = "127.0.0.1";
    }
    if (!this.port) {
        this.port = 8182;
    }

    if (!IpUtil.ipIp(this.host)) {
        throw new Error("host must be a valid ip address");
    }
    if (!(_.isNumber(this.port) && (this.port > 1024))) {
        throw new Error("port is invalid");
    }

    this.opts = {
        key: null,
        ca: [],
        cert: null,
        protocols: "",//协议加密
        filtersFunc: [] //过滤器
    };

    this.methods = ["get", "post"];

    if (opts) {
        if (typeof opts !== "object") {
            throw new Error(opts + " must be object");
        }

        if (opts['key'] && opts['cert']) {
            if (!FileUtils.isFile(opts.key)) {
                throw new Error("opts.key must a valid file path");
            }
            if (!FileUtils.isFile(opts.cert)) {
                throw new Error("opts.cert must a valid file path");
            }
            this.opts.key = Fs.readFileSync(opts.key);
            this.opts.cert = Fs.readFileSync(opts.cert);
        }

        if (opts['ca']) {
            if (!FileUtils.isFile(opts.ca)) {
                throw new Error("opts.ca must a valid file path");
            }
            this.opts.ca.push(Fs.readFileSync(opts.ca))
        }
        if (opts['protocols'] && _.isString(opts['protocols'])) {
            this.opts.protocols = opts['protocols'];
        }
        if (opts['filtersFunc'] && _.isArray(opts['filtersFunc'])) {
            this.opts.filtersFunc = opts['filtersFunc'];
        }
    }

    //创建文件夹 /get  /post
    FileUtils.createDirectory(Path.resolve(this.runPath + "/" + "get"));
    FileUtils.createDirectory(Path.resolve(this.runPath + "/" + "post"));

    var template = FileUtils.readSync(Path.resolve(Path.join(__dirname, "/template.js")));

    var _file1 = Path.resolve(this.runPath + "/" + "post" + "/index.js");
    if (!FileUtils.isExists(_file1)) {
        FileUtils.writeSync(_file1, template);
    }

    var _file2 = Path.resolve(this.runPath + "/" + "get" + "/index.js");
    if (!FileUtils.isExists(_file2)) {
        FileUtils.writeSync(_file2, template);
    }

    //路由缓存
    this.routes = {
        "get": [],
        "post": []
    };
    var routeGetList = FileUtils.traverseSync(Path.resolve(this.runPath + "/" + "get"), 2);
    var routePostList = FileUtils.traverseSync(Path.resolve(this.runPath + "/" + "post"), 2);

    var self = this;
    routeGetList.forEach(function (route) {
        var _path = Path.resolve(route.path);
        self.routes.get[route.rawName] = require(_path);
    });

    routePostList.forEach(function (route) {
        var _path = Path.resolve(route.path);
        self.routes.post[route.rawName] = require(_path);
    });

    //监听器
    this.listener = null;

    if (opts['skey']) {
        if (!_.isString(opts['skey'])) {
            throw new TypeError("skey must be string value");
        }
        if (opts['skey'].length != 16) {
            throw new EvalError("skey's length must be 16");
        }

        opts['skey'] = new Buffer(opts['skey']).toString('binary')
    }

    this.skey = {
        crypt_key: opts['skey'] || new Buffer("OiGvNhTbD90KKLlk").toString('binary'), //16位
        iv: new Buffer('rtDSSANva98n1ery').toString('binary') //16位
    };


    this.cidIndex = 0; //连接id计数

    session = session ? session : {};
    if (!(_.isObject(session))) {
        throw new Error("sesson must be object value,example {name:'',secret:'',maxAge:60000}");
    }

    this.sessionOpts = {
        name: (session['name'] || "mySID").toString(),
        secret: (session['secret'] || 'secret').toString(),
        maxAge: parseInt(session['maxAge'.toLowerCase()] || (30 * 3600 * 1000))
    };

    if (this.sessionOpts.maxAge < (60 * 1000)) {
        throw new Error("session.maxAge must be bigger than 60000");
    }

    this.sessions = []; //session 记录
    this.sessionLifeCycle();
}

Util.inherits(HttpServer, EventEmitter);
Util.inherits(HttpServer, SyncTask);

HttpServer.prototype.create = function (callback) {
    if (this.opts.key) {
        this.listener = Https.createServer(this.opts, function (req, res) {
            callback(req, res);
        }).listen(this.port, this.host);
    } else {
        this.listener = Http.createServer(function (req, res) {
            callback(req, res);
        }).listen(this.port, this.host);
    }
    this.emit("ready", this.port);
};

HttpServer.prototype.createServer = function () {
    var self = this;
    this.create(function (request, response) {
        var bytes = [];
        request.on('data', function (chunk) {
            bytes.push(chunk);
        });
        request.on('end', function () {
            var connection = Singleton.getDemon(HttpConnection, ++self.cidIndex, response, self.opts.protocols, self);

            response.emit('connection', connection);
            var buf = Buffer.concat(bytes);

            self.protocolProcess(buf, self.opts.protocols || "", function (err, data) {
                if (err) {
                    connection.disconnect("Protocol format error!");

                    self.emit("error", "Protocol format error!");
                } else {
                    var message = processRequest(request);

                    var e = null;
                    if (self.methods.indexOf(message.method.toLowerCase()) == -1) {

                        self.emit("error", "does not support " + message.method + " method");
                        e = {msg: Util.format("server does not support %s request method", message.method)};
                    }
                    try {
                        message.body = JSON.parse(data);
                    } catch (exception) {
                        message.body = data;
                    } finally {
                        if (e) {
                            connection.disconnect(Util.format("error:%s", e.msg));
                        } else {
                            self.processMessage(message, response, connection);
                        }
                    }
                }
            });
        });
    });
};
HttpServer.prototype.protocolProcess = function (buff, protocol, callback) {
    Protocol.decode(buff, protocol, function (err, resp) {
        callback(err, resp);
    })
};
HttpServer.prototype.getReqModule = function (route) {
    if (route.indexOf("/") == -1) {
        return {
            "module": (route === '') ? 'index' : route,
            "func": "index"
        };
    }
    var _list = route.split("/");
    return {
        "module": _list[0],
        "func": _list[1]
    };
};

HttpServer.prototype.getUUID = function () {
    return Encrypt.md5(UUID.v1() + this.sessionOpts.secret);
};

HttpServer.prototype.getSession = function (message, response) {
    var ssid = null;
    if (message.headers['cookie']) {
        var cookieList = message.headers['cookie'].split(";");
        if (cookieList.length) {
            for (var i = 0, len = cookieList.length; i < len; i++) {
                var parts = cookieList[i].split('=');
                if (parts.length) {
                    if (parts[0].trim() == this.sessionOpts.name) {
                        ssid = parts[1];
                        break;
                    }
                }
            }
        }
    }
    if (ssid == null) {
        ssid = this.getUUID();
        this.sessions[ssid] = Singleton.getDemon(Session, ssid);
        response.setHeader("Set-Cookie", [this.sessionOpts.name + "=" + ssid]);
    } else {
        if (this.sessions[ssid] == null) {
            this.sessions[ssid] = Singleton.getDemon(Session, ssid);
        }
    }

    return this.sessions[ssid];
};

//session 生命周期处理
HttpServer.prototype.sessionLifeCycle = function () {
    var self = this;
    var now = new Date();
    setInterval(function () {
        self.sessions.forEach(function (session) {
            if (parseInt(now - session.genTime) > self.sessionOpts.maxAge) {
                var sid = session.sid;
                delete session;
                session = null;
                self.sessions[sid] = null;
            }
        });
    }, 10 * 60 * 1000);//每10分钟处理一次
};

HttpServer.prototype.processMessage = function (message, response, connection) {
    var _routeName = message.method.toLowerCase();

    var _routesList = null;
    if (_routeName === "get") {
        _routesList = this.routes.get;
    } else if (_routeName === "post") {
        _routesList = this.routes.post;
    }

    if (_routesList != null) {
        var route = message.route;
        var _module = this.getReqModule(route);

        if (_routesList[_module.module] == undefined) {
            connection.disconnect("unknown route");
            return;
        }

        if (_routesList[_module.module][_module.func] == undefined) {
            connection.disconnect("unknown route");
            return;
        }

        if (this.opts.filtersFunc.length) {
            var retCode = true;
            this.opts.filtersFunc.forEach(function (func) {
                if (_.isFunction(func)) {
                    retCode = retCode && func(message);
                }
            });

            if (!retCode) {
                connection.disconnect("invalid request");
                return;
            }
        }

        var req = {
            message: message,
            session: this.getSession(message, response)
        };
        response.emit('message', _routesList[_module.module][_module.func], req);
    } else {
        connection.disconnect("un support the method");
    }
};

var processRequest = function (request) {
    var url = Url.parse(request.url);
    return {
        httpVersion: request.httpVersion,
        route: url.pathname.slice(1, url.pathname.length),
        params: Qs.parse(url.query),
        method: request.method,
        statusCode: request.statusCode,
        headers: request.headers,
        remoteAddress: IpUtils.getClientIP(request)
    };
};


module.exports = HttpServer;