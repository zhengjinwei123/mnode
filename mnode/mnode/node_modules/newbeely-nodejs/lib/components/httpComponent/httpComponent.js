/**
 * @filename httpComponent
 *
 * @module Component
 *
 * @author Gandalfull <orientcountry@gmail.com>
 * @version 1
 * @time 2016-02-19 10:03
 */

var Http = require('http'),
    Https = require('https'),
    Bearcat = require('bearcat'),
    Url = require('url'),
    QS = require('querystring'),
    Logger = require('pomelo-logger').getLogger("newbeely", "httpComponent"),
    FS = require('fs'),
    Path = require('path'),
    __ = require('underscore'),
    EventEmitter = require('events').EventEmitter,
    Util = require('util')

/**
 * @event INITED
 * @type {string}
 */
var INITED = "inited";

/**
 * @event STARTING
 * @type {string}
 */
var STARTING = "starting";

/**
 * @event STARTED
 * @type {string}
 */
var STARTED = "started";

/**
 * @event STOPED
 * @type {string}
 */
var STOPED = 'stoped';

var ReqID = 0;

/**
 * HttpComponent
 *
 * Http 协议服务组件
 *
 * @class HttpComponent
 * @param {String} sid service id
 * @param {Object} opts
 * <pre>
 *     opts.id   {String} component id
 *     opts.bean {String} this component bearcat id
 *     opts.host {String} service address
 *     opts.port {Number} service listen port
 *     opts.ssl  {Object | Boolean} use ssl info: false or object{ pem:"file.pem", cert:"file.cert" }
 *     opts.method {String} "post" or "get" or "post|get"
 *     opts.req_timeout {Number} request timeout
 * </pre>
 * @constructor
 * @interface
 */
function HttpComponent(sid, opts) {
    EventEmitter.call(this);

    /**
     * sid
     *
     * @property sid
     * @type {String}
     */
    this.sid = sid;

    /**
     * opts
     *
     * @property opts
     * @type {Object}
     */
    this.opts = opts || {};

    /**
     * App Instance
     *
     * @property app
     * @type {Object}
     */
    this.app = null;

    /**
     * listener
     *
     * @property linstener
     * @type {Object}
     */
    this.linstener = null;

    /**
     * protocol
     *
     * @property protocol
     * @type {Object}
     */
    this.protocol = null;

    /**
     * 过滤函数数组
     *
     * @property filters
     * @type {Array}
     */
    this.filters = [];

    /**
     * 访问方法过滤
     *
     * @property methods
     * @type {Array}
     */
    this.methods = [];

    /**
     * 路由缓存
     *
     * @property routers
     * @type {Object}
     */
    this.routers = {};

    /**
     * 链接容器
     *
     * @property routers
     * @type {Object}
     */
    this.sessions = {};

    Logger.info("HttpComponent will start at " + JSON.stringify(this.opts));
}
Util.inherits(HttpComponent, EventEmitter);

/**
 * 初始化组件
 *
 * @method init
 * @for HttpComponent
 * @async
 * @return {Null}
 */
HttpComponent.prototype.init = function () {
    this.opts["path"] = Path.join(this.app.workedir, "/app/", this.sid);
    this.methods = this.opts.method ? this.opts.method.split(/[|]/) : ['post'];
    if (this.opts.ssl) {
        var sslOptions = {
            key: FS.readFileSync(Path.join(this.opts.path, "/", this.opts.ssl.pem)),
            cert: FS.readFileSync(Path.join(this.opts.path, "/", this.opts.ssl.cert))
        };
        this.linstener = Https.createServer(sslOptions, ProcessMessage.bind(null, this));
    } else {
        this.linstener = Http.createServer(ProcessMessage.bind(null, this));
    }
    var self = this;

    ///=================================================================================================================
    try {
        if (this.methods.indexOf('post') !== -1) {
            var files = FS.readdirSync(Path.join(this.opts.path, "/post"));
            this.routers["post"] = {};
            __.each(files, function (element, index, list) {
                if( Path.extname(element) == '.js'){
                    self.routers['post'][Path.basename(element, '.js')] = require(Path.join(self.opts.path, "/post/", element))();
                }
            });
        }
    } catch (e) {
        Logger.warn("no such file or directory:" + Path.join(this.opts.path, "/post"));
    }

    try {
        if (this.methods.indexOf('get') !== -1) {
            var files = FS.readdirSync(Path.join(this.opts.path, "/get"));
            this.routers["get"] = {};
            __.each(files, function (element, index, list) {
                if( Path.extname(element) == '.js'){
                    self.routers['get'][Path.basename(element, '.js')] = require(Path.join(self.opts.path, "/get/", element))();
                }
            });
        }
    } catch (e) {
        Logger.warn("no such file or directory:" + Path.join(this.opts.path, "/get") + e.stack);
    }
    ///=================================================================================================================;
    this.on('connection', function (connection) {

        self.sessions[connection.cid] = connection;

        connection.on('disconnect', function () {
            delete self.sessions[connection.cid];
        });

        connection.on('error', function (error) {
            connection.disconnect(error.toString());
        });
    });
    this.on('message', function (msg, connection) {
        Logger.info("Request msg from connection [" + connection.cid + "] : " + JSON.stringify(msg));
        var router = self.routers[msg.method.toLowerCase()];
        if (router) {
            var paths = msg.route.split(/[./]/);
            var obj = router[paths[0]];
            if (obj) {
                if (typeof obj[paths[1]] === 'function') {
                    obj[paths[1]](msg, function (error, result) {
                        if (error) {
                            connection.errorCode(error.toString(), error.status || 500);
                            return;
                        }
                        connection.send(result);
                    });
                    return;
                }
                if (typeof obj["handle"] === 'function') {
                    obj['handle'](msg, function (error, result) {
                        if (error) {
                            connection.errorCode(error.toString(), error.status || 500);
                            return;
                        }
                        connection.send(result);
                    });
                    return;
                }
            }
        }
        connection.disconnect("no router.");
    });

    this.emit(INITED);
}

/**
 * start
 *
 * @method start
 * @for HttpComponent
 */
HttpComponent.prototype.start = function () {
    this.emit(STARTING);
    Logger.info("HttpComponent " + this.sid + " is starting...");

    this.linstener.listen(this.opts.port, this.opts.host);

    Logger.info("HttpComponent " + this.sid + " was started.");
    this.emit(STARTED);
}

/**
 * stop
 *
 * @method stop
 * @for HttpComponent
 */
HttpComponent.prototype.stop = function () {
    this.linstener.stop();
    this.emit(STOPED);
}

/**
 * 配置过滤函数
 *
 * @method filter
 * @param {Function} cb
 * @async
 * @for HttpComponent
 */
HttpComponent.prototype.filter = function (cb) {
    this.filters.push(cb);
};

module.exports = {
    id: "httpComponent",
    func: HttpComponent,
    init: "init",
    scope: "prototype",
    args: [
        {name: "sid", "type": "String"},
        {name: "opts", type: "Object"}
    ],
    "props": [
        {name: "protocol", "ref": "protocol"},
        {name: "app", "ref": "application"}
    ]
};

/**
 * 消息处理函数
 *
 * @method ProcessMessage
 * @param {Object} server
 * @param {Object} request
 * @param {Object} response
 */
var ProcessMessage = function (server, request, response) {

    var connection = Bearcat.getBean('httpConnection', ReqID++, response, server.opts.protocol || "");
    if (!connection) {
        var message = Process_request(request);
        Logger.error("Create connection failed:" + JSON.stringify(message));
        response.statusCode = 500;
        response.end();
        return;
    }
    server.emit('connection', connection);

    var bytes = [];
    request.addListener('data', function (chunk) {
        bytes.push(chunk);
    });

    request.addListener('end', function () {
        server.protocol.decode(Buffer.concat(bytes), server.opts.protocol || "", function (error, data) {
            if (error) {
                connection.disconnect("Procotol format error!");
                return;
            }
            var message = Process_request(request);
            try {
                message.body = JSON.parse(data);
            } catch (exception) {
                message.body = data;
            }
            if (server.methods.indexOf(message.method.toLowerCase()) == -1) {
                connection.disconnect("Does`t support!");
                return;
            }

            for (var i = 0; i < server.filters.length; i++) {
                if (typeof server.filters[i] == 'function') {
                    var info = server.filters[i](message);
                    if (info) {
                        connection.disconnect(info);
                        return;
                    }
                }
            }
            server.emit('message', message, connection);
        });
    });
};

/**
 * 处理请求消息头协议
 *
 * @method Process_request
 * @param request
 * @returns {Object}
 * <pre>
 *   {
 *      httpVersion: string,
 *      route: string,
 *      params: object,
 *      method: string,
 *      statusCode: number,
 *      headers: (*|req.headers|{Content-Type}|headers|{Cache-Control, ETag}|options.headers),
 *      remoteAddress: string
 *   }
 * </pre>
 */
var Process_request = function (request) {
    var url = Url.parse(request.url);
    return {
        httpVersion: request.httpVersion,
        route: url.pathname.slice(1, url.pathname.length),
        params: QS.parse(url.query),
        method: request.method,
        statusCode: request.statusCode,
        headers: request.headers,
        remoteAddress: Bearcat.getBean('utils').getClientIP(request)
    };
};
