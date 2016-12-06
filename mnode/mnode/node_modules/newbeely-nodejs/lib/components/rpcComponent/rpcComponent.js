/**
 * @filename rpcComponent
 *
 * @module Component
 *
 * @author Gandalfull <orientcountry@gmail.com>
 * @version 1
 * @time 2016-02-19 10:03
 */
var Redis = require('redis'),
    EventEmitter = require('events').EventEmitter,
    Util = require('util'),
    Logger = require('pomelo-logger').getLogger("newbeely", "rpcComponent"),
    FS = require('fs'),
    Path = require('path');

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
 * 远程调用
 *
 * @class RPCComponent
 * @param sid
 * @param opts
 * @constructor
 */
function RPCComponent(sid, opts) {
    EventEmitter.call(this);

    /**
     * sid
     *
     * @property sid
     * @type {String}
     */
    this.sid = sid;

    /**
     * opts 数据库连接配置对象
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

    this.remotes = {};

    this.redisClient = null;

    Logger.info("RPCComponent will start at " + JSON.stringify(this.opts));
}
Util.inherits(RPCComponent, EventEmitter);

/**
 *
 */
RPCComponent.prototype.init = function () {
    this.opts["path"] = Path.join(this.app.workedir, "app", this.sid);

    try {
        var files = FS.readdirSync(Path.join(this.opts.path, 'remote'));
        for (var i in files) {
            if (Path.extname(files[i]) != '.js') {
                continue;
            }
            this.remotes[Path.basename(files[i])] = require(Path.join(this.opts.path, "remote", files[i]));
        }
        var _this = this;
        FS.watch(Path.join(this.opts.path, 'remote'), function (event, filename) {
            Logger.debug("modify remote script " + filename + " #" + event);
            if (Path.extname(filename) != '.js') {
                return;
            }
            if (event == 'change') {
                _this.remotes[Path.basename(filename)] = require(Path.join(_this.opts.path, "remote", filename));
            }
        });
    } catch (e) {
        Logger.error(e);
    }
}

/**
 *
 */
RPCComponent.prototype.start = function () {
    this.opts.redis = this.opts.redis || {};
    this.redisClient = Redis.createClient(this.opts.redis.port || 6379, this.opts.redis.host || "127.0.0.1", this.opts.options || {});
    var _this = this;
    this.redisClient.on('connect', function () {
        Logger.debug("connection to redis by %j", _this.opts.redis);
    });

    this.redisClient.set('cluster#' + process.pid.toString(), this.opts.model);
    this.redisClient.expire('cluster#' + process.pid.toString(), 5);

    this.redisClient.subscribe("rpc-call#" + this.sid + "#" + process.pid.toString());
    this.redisClient.subscribe("rpc-result#" + this.sid + "#" + process.pid.toString());

    this.redisClient.on('message', this.__process.bind(this));
    this.redisClient.on("error", function (error) {
        Logger.error(error);
    });
}

/**
 *
 */
RPCComponent.prototype.stop = function () {

}

/**
 *
 * @param channel
 * @param message
 * @private
 */
RPCComponent.prototype.__process = function (channel, message) {
    if (channel !== ("rpc-call#" + this.sid + "#" + process.pid.toString())) {
        Logger.error("rpc channel error by " + channel + " # " + message);
        return;
    }
    try {
        var jsobj = JSON.parse(message);
        if (!jsobj.channel || !jsobj.rid) {
            throw new Error("rpc call no channel :" + channel + " msg:" + message);
        }
        if (!jsobj.route) {
            this.redisClient.publish(jsobj.channel, JSON.stringify({rid: jsobj.rid, error: "no route."}));
            return;
        }
        var routes = jsobj.route.split('.');
        if (routes.length !== 2 || !this.remotes[routes[0]] || typeof this.remotes[routes[0]][routes[1]] !== 'function') {
            this.redisClient.publish(jsobj.channel, JSON.stringify({rid: jsobj.rid, error: "no route."}));
            return;
        }
        var msg = this.remotes[routes[0]][routes[1]].apply(null, jsobj.args || []);
        if (!msg) {
            msg = {
                error: "remote error!"
            };
        }
        msg.rid = jsobj.rid;
        this.redisClient.publish(jsobj.channel, JSON.stringify(msg));
    } catch (e) {
        Logger.error(e);
    }
}

module.exports = {
    id: "rpcComponent",
    func: RPCComponent,
    init: "init",
    scope: "prototype",
    args: [
        {name: "sid", "type": "String"},
        {name: "opts", type: "Object"}
    ],
    "props": [
        {name: "app", "ref": "application"}
    ]
};
