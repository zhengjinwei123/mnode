/**
 * @filename udpComponent
 *
 * @module Component
 *
 * @author Gandalfull <orientcountry@gmail.com>
 * @version 1
 * @time 2016-02-19 10:03
 */
'use strict';

var Dgram = require('dgram'),
    Bearcat = require('bearcat'),
    Url = require('url'),
    QS = require('querystring'),
    Logger = require('pomelo-logger').getLogger("newbeely", "udpComponent"),
    FS = require('fs'),
    Path = require('path'),
    __ = require('underscore'),
    EventEmitter = require('events').EventEmitter,
    Util = require('util')

module.exports = {};

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
 * UDPComponent
 *
 * UDP 协议服务组件
 *
 * @class UDPComponent
 * @param {String} sid service id
 * @param {Object} opts
 * <pre>
 *     opts.id   {String} component id
 *     opts.bean {String} this component bearcat id
 *     opts.host {String} service address
 *     opts.port {Number} service listen port
 * </pre>
 * @constructor
 * @interface
 */
function UDPComponent(sid, opts) {
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

    this.server = null;

    this.routers = {};
}

Util.inherits(UDPComponent, EventEmitter);

/**
 * 初始化组件
 *
 * @method init
 * @for UDPComponent
 * @async
 * @return {Null}
 */
UDPComponent.prototype.init = function () {
    this.opts["path"] = Path.join(this.app.workedir, "/app/", this.sid);
    try {
        var self = this;
        var files = FS.readdirSync(Path.join(this.opts.path, "/handle"));
        __.each(files, function (element, index, list) {
            if (Path.extname(element) == '.js') {
                self.routers[Path.basename(element, '.js')] = require(Path.join(self.opts.path, "/handle/", element));
            }
        });
    } catch (e) {
        console.log(e);
        Logger.warn("no such file or directory:" + Path.join(this.opts.path, "/handle"));
    }
};

/**
 * 组件启动 --由服务框架调用
 *
 * @method start
 * @for UDPComponent
 */
UDPComponent.prototype.start = function () {
    this.emit(STARTING);
    Logger.info("UDPComponent " + this.sid + " is starting...");
    this.server = Dgram.createSocket('udp4');

    this.server.on('error', function (error) {
        Logger.error("udp dgram has error:" + error);
    });
    this.server.on('listening', function () {
        Logger.info("listening udp socket!");
    });
    this.server.bind({
        address: this.opts.host || "localhost",
        port: this.opts.port,
        exclusive: true
    });
    var that = this;
    this.server.on('message', function (msg, rinfo) {
        msg = JSON.parse(msg);
        if (that.routers && that.routers[msg.type]) {
            that.routers[msg.type].handle(msg, rinfo);
        } else {
            Logger.warn("un listen route %j", msg);
        }
    });
    Logger.info("UDPComponent " + this.sid + " is started!");
    this.emit(STARTED);
}


module.exports = {
    id: "udpComponent",
    func: UDPComponent,
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

