/**
 * 本组件代码是copy github 上 mongooseRedisCacheComponent模块的代码
 * @filename mongooseRedisCacheComponent
 *
 * @module Component
 *
 * @author Gandalfull <orientcountry@gmail.com>
 * @version 1
 * @time 2016-02-19 10:03
 */
var FS = require('fs'),
    Redis = require('redis'),
    Logger = require('pomelo-logger').getLogger('newbeely', 'mongooseRedisCacheComponent'),
    EventEmitter = require('events').EventEmitter,
    Util = require('util'),
    Mongoose = require('mongoose'),
    Path = require('path'),
    __ = require('underscore')

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
 * mongoose + redis 结合的使用
 *
 * @class MongooseRedisCacheComponent
 * @param sid {String} 组件id
 * @param opts {*} 数据库参数配置
 * @constructor
 */
function MongooseRedisCacheComponent(sid, opts) {
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
Util.inherits(MongooseRedisCacheComponent, EventEmitter);

/**
 * 初始化组件
 *
 * @method init
 * @async
 * @for MongooseRedisCacheComponent
 * @return null
 */
MongooseRedisCacheComponent.prototype.init = function () {
    this.opts["path"] = Path.normalize(this.app.workedir + "/app/" + this.sid);

    this.schemas = {};
    /// 加载schema文件
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

    var client = Mongoose.redisClient = Redis.createClient(this.opts.redis.port || 6379, this.opts.redis.host || "127.0.0.1", {});
    this.app.set('redisClient', client);
    if (this.opts.redis.pass && this.opts.redis.pass.length > 0) {
        client.auth(this.opts.redis.pass, function (error) {
            if (error) {
                Logger.error("Redis auth failed:" + JSON.stringify(error.stack));
            }
        });
    }

    Mongoose.Query.prototype.execCache = function (callback) {
        var _this = this;
        var model = _this.model;
        var query = _this._conditions;
        var options = _this._optionsForExec(model);
        var fields = __.clone(_this._fields);
        var schemaOptions = model.schema.options;
        var expires = schemaOptions.expires || 60;
        if (!schemaOptions.redisCache && options.lean) {
            Logger.warn("Unused redis cache by findByCache!");
            return Mongoose.Query.prototype.exec().apply(_this, arguments);
        }
        var key = schemaOptions.redisCache + JSON.stringify(query) + JSON.stringify(options) + JSON.stringify(fields);

        function redisCallback(err, result) {
            var docs;
            if (err) {
                return callback(err);
            }
            if (!result) {
                return Mongoose.Query.prototype.exec.call(_this, function (err, docs) {
                    if (err) {
                        return callback(err);
                    }
                    client.set(key, JSON.stringify(docs));
                    client.expire(key, expires);
                    return callback(null, docs);
                });
            } else {
                docs = JSON.parse(result);
                Logger.debug("Redis cache data ok:" + key);
                return callback(null, docs);
            }
        };
        client.get(key, redisCallback);
        return _this;
    }
    this.emit(INITED);
}

/**
 * 启动组件
 *
 * @method start
 * @for MongooseRedisCacheComponent
 * @async
 * @return null
 */
MongooseRedisCacheComponent.prototype.start = function () {
    var user = this.opts.user || "";
    Logger.info("MongooseRedisCacheComponent " + this.sid + " is starting...");
    this.emit(STARTING);

    var url = "mongodb://" + ( user != "" ? (this.opts.user + ":" + this.opts.password + "@") : "") + this.opts.host + ":" + this.opts.port + "/" + this.opts.dbname;
    var _this = this;

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
    Logger.info("MongooseRedisCacheComponent " + this.sid + " is started!");
}

/**
 * 获取数据库连接
 *
 * @method getConnection
 * @for MongooseComponent
 */
MongooseRedisCacheComponent.prototype.getConnection = function () {
    return __.sample(this.connections);
};

/**
 *
 *
 * @method stop
 * @for MongooseRedisCacheComponent
 */
MongooseRedisCacheComponent.prototype.stop = function () {
    this.emit(STOPED);
};

module.exports = {
    id: "mongooseRedisCacheComponent",
    func: MongooseRedisCacheComponent,
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