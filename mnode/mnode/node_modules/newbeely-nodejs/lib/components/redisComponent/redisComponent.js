/**
 * @filename redisComponent
 *
 * @module Component
 *
 * @author Gandalfull <orientcountry@gmail.com>
 * @version 1
 * @time 2016-02-19 10:03
 */

var FS = require('fs'),
    Redis = require('redis'),
    Logger = require('pomelo-logger').getLogger('newbeely', 'mongooseComponent'),
    GenericPool = require('generic-pool'),
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

/**
 * RedisComponent
 *
 * Redis 数据库连接组件
 *
 * @class RedisComponent
 * @param {String} sid
 * @param {Object} opts
 * @constructor
 */
function RedisComponent(sid, opts) {
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

    /**
     * Redis Connection Pool 数据库连接池
     *
     * @property pool
     * @type {Object}
     */
    this.pool = {};

    Logger.info("RedisComponent created.");
}

Util.inherits(RedisComponent, EventEmitter);

/**
 * init 在类初始化时调用
 *
 * @method init
 * @for RedisComponent
 * @async
 * @return {Null}
 */
RedisComponent.prototype.init = function () {
    var config = this.opts;

    if (!config || typeof config !== "object" || !config.host || !config.port) {
        Logger.debug('createRedis config is NOT valid!');
        return;
    }

    var opts = {};
    if (config.proxy) {
        opts.no_ready_check = config.proxy;
        if (config.auth_pass) {
            opts.auth_pass = config.auth_pass;
        }
        if (config.debug_mode) {
            opts.debug_mode = config.debug_mode;
        }
        if (config.encoding) {
            opts.encoding = config.encoding;
        }
        if (config.return_buffers) {
            opts.return_buffers = config.return_buffers;
        }

        var client = Redis.createClient(config.port, config.host, opts);
        client.on('error', function (err) {
            Logger.error('Connect to Redis Failed: %s', err.stack);
        });
        this.pool.client = client;
        this.pool.proxy = true;
    } else {
        opts.no_ready_check = true;
        if (config.auth_pass) {
            opts.auth_pass = config.auth_pass;
        }
        if (config.debug_mode) {
            opts.debug_mode = config.debug_mode;
        }
        if (config.encoding) {
            opts.encoding = config.encoding;
        }

        this.pool.client = GenericPool.Pool({
            name: this.sid,
            dbIndex: 0,
            create: function (cb) {
                var client = Redis.createClient(config.port, config.host, opts);
                client.on('error', function (err) {
                    Logger.error('Connect to Redis Failed: %s', err.stack);
                });
                cb(null, client);
            },
            destroy: function (client) {
                if (client) {
                    client.quit();
                }
            },
            max: 1000,
            idleTimeoutMillis: 30000,
            log: false
        });
        this.pool.proxy = false;
    }

    if (config.auth_pass) {
        this.pool.auth_pass = config.auth_pass;
    }
    this.emit(INITED);
}

/**
 * start
 *
 * @method start
 * @for RedisComponent
 */
RedisComponent.prototype.start = function () {
    Logger.info("RedisComponent " + this.sid + " is starting...");
    this.emit(STARTING);


    Logger.info("RedisComponent " + this.sid + " is started!");
    this.emit(STARTED);
}

/**
 * stop
 *
 * @method stop
 * @for RedisComponent
 */
RedisComponent.prototype.stop = function () {
    this.emit(STOPED);
};

/**
 * 获取数据库连接
 *
 * @method execute
 * @param {Function} execb 回调函数
 * @async
 * @for RedisComponent
 */
RedisComponent.prototype.execute = function (execb) {
    var that = this;
    if (!this.pool) {
        execb(null);
        console.error('Get Connections From Redis Pool [ %s ] Failed !');
        return;
    }
    if (this.pool.proxy) {
        execb(this.pool.client, function () {
        });
    } else {
        this.pool.client.acquire(function (err, client) {
            var release = function () {
                that.pool.client.release(client);
            };
            if (err) {
                console.error('Procceed Redis Commond Failed With Errors: %s', err.stack);
                release();
            } else {
                if (that.pool.auth_pass) {
                    client.auth(that.pool.auth_pass, function () {
                        execb(client, release);
                    });
                } else {
                    execb(client, release);
                }
            }
        }, 0);
    }
};

/**
 * 命令行方式执行数据库命令
 *
 * @async
 * @method: command [command args callback]
 * @for RedisComponent
 */
RedisComponent.prototype.command = function () {
    if (arguments.length <= 1) {
        Logger.error('RedisComponent.command mast has 2 argument!');
        return;
    }
    var command = arguments[0];
    var callback = typeof arguments[arguments.length - 1] == 'function' ? arguments[arguments.length - 1] : function () {
    };
    var args = Array.prototype.slice.call(arguments, 1, arguments.length - 1);
    this.execute(function (client, release) {
        var cb = function () {
            callback.apply(null, arguments);
            release();
        }
        client[command].apply(client, args.concat([cb]));
    });
}

module.exports = {
    id: "redisComponent",
    func: RedisComponent,
    init: "init",
    scope: "prototype",
    args: [
        {name: "sid", type: "String", value: "test-redis-001"},
        {name: "opts", type: "Object", value: {"host": "localhost", "port": 6379, "pass": ""}}
    ],
    props: [
        {name: "app", ref: "application"}
    ]
};