/**
 * @filename mongooseComponent
 *
 * @module Component
 *
 * @author Gandalfull <orientcountry@gmail.com>
 * @version 1
 * @time 2016-02-19 10:03
 */

var Mongoose = require('mongoose'),
    Logger = require('pomelo-logger').getLogger('newbeely', 'mongooseComponent'),
    Path = require('path'),
    FS = require('fs'),
    EventEmitter = require('events').EventEmitter,
    Util = require('util'),
    __ = require('underscore');

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
 * MongooseComponent
 *
 * MongoDB组件
 *
 * @class MongooseComponent
 * @param {String} sid service id
 * @param {Object} opts {}
 * <pre>
 *     opts.id   {String} component id
 *     opts.bean {String} this component bearcat id
 *     opts.host {String} mongodb hostname
 *     opts.port {Number} mongodb port
 *     opts.dbname {String} database name
 * </pre>
 * @constructor
 */
function MongooseComponent(sid, opts) {
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
    this.opts = opts;

    /**
     * App Instance
     *
     * @property app
     * @type {Object}
     */
    this.app = null;

    /**
     * Mongo Connection Pool
     *
     * @property connection
     * @type {Object}
     */
    this.connections = [];
    Logger.info("MongooseComponent created.");
}
Util.inherits(MongooseComponent, EventEmitter);

/**
 * 初始化组件
 *
 * @method init
 * @for MongooseComponent
 * @async
 * @return {Null}
 */
MongooseComponent.prototype.init = function () {
    this.opts["path"] = Path.normalize(this.app.workedir + "/app/" + this.sid);

    this.schemas = {};
    try {
        var schemas = FS.readdirSync(this.opts.path + "/schemas");
        for (var i in schemas) {
            if (!schemas.hasOwnProperty(i)) continue;
            if (Path.extname(schemas[i]) === '.js') {
                var schema = require(Path.normalize(this.opts.path + "/schemas/" + schemas[i]));
                if (schema) {
                    this.schemas[schema.name] = schema.schema;
                }
            }
        }
    } catch (e) {
        Logger.warn('Load mongoose schemas failed:' + JSON.stringify(e.stack));
    }
    /// 兼容mongooseRedisCache组件
    Mongoose.Query.prototype.execCache = Mongoose.Query.prototype.exec;
    this.emit(INITED);
}

/**
 * start
 *
 * @method start
 * @for MongooseComponent
 */
MongooseComponent.prototype.start = function () {
    var user = this.opts.user || "";
    Logger.info("MongooseComponent " + this.sid + " is starting...");
    this.emit(STARTING);
    var _this = this;
    var url = "mongodb://" + ( user !== '' ? (this.opts.user + ":" + this.opts.password + "@") : "") + this.opts.host + ":" + this.opts.port + "/" + this.opts.dbname;

    function create_connection() {
        var connection = Mongoose.createConnection(url);
        connection.on('error', function (error) {
            Logger.error("Mongodb error:" + error);
        });
        connection.once('connected', function () {
            Logger.info("Mongodb connected to :" + url);
            for (var i in _this.schemas) {
                connection.model(i, _this.schemas[i]);
            }
            _this.emit(STARTED);
        });
        connection.on('disconnected', function () {
            Logger.warn("Mongodb disconnected from : " + url);
            setTimeout(function () {
                Logger.info('Mongoose reconnect to : ' + url);
                connection.open(url);
            }, 1000);
        });
        _this.connections.push(connection);
    }

    for (var i = 0; i < (this.opts.pool || 1); i++) {
        create_connection();
    }
    Logger.info("MongooseComponent " + this.sid + " is started!");
};

/**
 * 获取数据库连接
 *
 * @method getConnection
 * @for MongooseComponent
 */
MongooseComponent.prototype.getConnection = function () {
    return __.sample(this.connections);
};

/**
 * stop
 *
 * @method stop
 * @for MongooseComponent
 */
MongooseComponent.prototype.stop = function () {
    this.emit(STOPED);
};

module.exports = {
    id: "mongooseComponent",
    func: MongooseComponent,
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