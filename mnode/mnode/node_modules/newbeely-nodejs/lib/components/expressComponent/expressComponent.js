/**
 * @filename expressComponent
 *
 * @module Component
 *
 * @author Gandalfull <orientcountry@gmail.com>
 * @version 1
 * @time 2016-02-19 10:03
 */

var Express = require('express'),
    Path = require('path'),
    FS = require('fs'),
    Logger = require('pomelo-logger').getLogger('newbeely', 'expressComponent'),
    EventEmitter = require('events').EventEmitter,
    Util = require('util'),
    UploadFile = require("multer")({dest: 'uploads/'});

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


/**
 * ExpressComponent
 *
 * Express组件
 *
 * @class expressComponent
 * @param {String} sid 服务id
 * @param {Object} opts services.json内对组件配置的数据
 *     opts.id   {String} component id
 *     opts.bean {String} this component bearcat id
 *     opts.host {String} service address
 *     opts.port {Number} service listen port
 *     opts.ssl  {Object | Boolean} use ssl info: false or object{ pem:"file.pem", cert:"file.cert" }
 *     opts.method {String} "post" or "get" or "post|get"
 *     opts.req_timeout {Number} request timeout
 * @constructor
 */
function ExpressComponent(sid, opts) {
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
     * Express Instance
     *
     * @property express
     * @type {Object}
     */
    this.express = Express();
}

Util.inherits(ExpressComponent, EventEmitter);

/**
 * 初始化组件
 *
 * @method init
 * @for expressComponent
 * @async
 * @return {Null}
 */
ExpressComponent.prototype.init = function () {
    this.opts["path"] = Path.join(this.app.workedir, "/app/", this.sid);
    this.emit(INITED);
}

/**
 *
 * @param root
 * @param route
 * @param path
 */
ExpressComponent.prototype.loader = function (root, route, path) {
    var dir = Path.join(path, "/" + route + "/");
    Logger.info("load route file by:" + dir);
    var files = FS.readdirSync(dir);
    for (var i in files) {
        var extname = Path.extname(files[i]);
        if (extname == '') {
            this.loader(root + files[i] + "/", files[i], dir);
        }
        if (extname == '.js') {
            var mod = require(Path.join(dir, files[i]));
            var routes = Express.Router();
            if (typeof mod.get == 'function') {
                routes.get('/', mod.get);
            }
            if (typeof mod.post == 'function') {
                routes.post('/', mod.post);
            }
            if (typeof mod.postFile == 'function') {
                routes.post('/', UploadFile.any(), mod.postFile);
            }
            if (typeof mod.put == 'function') {
                routes.put('/', mod.put);
            }
            if (typeof mod.delete == 'function') {
                routes.delete('/', mod.delete);
            }
            this.express.use(root + Path.basename(files[i], '.js') + "/", routes);
        }
    }
}

/**
 * 组件启动 --由服务框架调用
 *
 * @method start
 * @for expressComponent
 */
ExpressComponent.prototype.start = function () {
    var that = this;
    that.emit(STARTING);
    Logger.info("ExpressComponent " + that.sid + " is starting...");
    that.express.listen(that.opts.port, that.opts.host, function () {
        Logger.info("ExpressComponent [ %s ] is started listening on [ %s:%s ]...", that.opts.id, that.opts.host, that.opts.port);
    });
    Logger.info("ExpressComponent " + that.sid + " is started!");
    that.emit(STARTED);
}

/**
 * 停止组件
 *
 * @method stop
 * @for expressComponent
 */
ExpressComponent.prototype.stop = function () {
    this.express.stop();
    this.emit(STOPED);
}

/**
 * 提供express外部使用的set接口包装
 *
 * @method set
 * @param key {String}
 * @param value {*}
 */
ExpressComponent.prototype.set = function (key, value) {
    this.express.set(key, value);
}

/**
 * 提供外部可配置的express use接口包装
 *
 * @method use
 * @param key
 * @param value
 */
ExpressComponent.prototype.use = function (key, value) {
    if (typeof key == 'function') {
        this.express.use(key);
        return;
    }
    this.express.use(key, value);
}

module.exports = {
    id: "expressComponent",
    func: ExpressComponent,
    init: "init",
    scope: "prototype",
    args: [
        {name: "sid", "type": "String"},
        {name: "opts", type: "Object"}
    ],
    "props": [
        {name: "encrypt", "ref": "encrypt"},
        {name: "app", "ref": "application"}
    ]
};