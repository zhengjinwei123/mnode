/**
 * Created by 郑金玮 on 2016/12/2.
 */
var Redis = require("redis");
var GenericPool = require("generic-pool");

function createRedisPool(poolName, host, port, auth) {
    return GenericPool.Pool({
        name: poolName,
        create: function (callback) {
            var client = Redis.createClient(port, host);
            if (auth) {
                client.auth(auth, function (err, res) {
                    if (!err) {
                        console.log("redis 授权成功!");
                    } else {
                        console.log("redis 授权失败!");
                    }
                });
            }

            client.on("ready", function () {
                console.log("redis 已就绪");
            });

            client.on('error', function (err) {
                console.error('error at connect redis: %s', err.stack);
            });

            client.on("connect", function () {
                console.log("redis 连接成功");
            });

            callback(null, client);
        },
        destroy: function (client) {
            client.quit();
        }, //当超时则释放连接
        max: 10,   //最大连接数
        idleTimeoutMillis: 5000,  //超时时间
        log: false //是否显示日志
    });
}

function RedisUtil(poolCnt, namePrefix, host, port, db, auth) {
    this.pools = [];
    this.db = db;
    this.host = host;
    this.port = port;
    this.auth = auth;

    var cnt = poolCnt ? poolCnt : 1;
    var prefix = namePrefix ? namePrefix : 'pool';

    for (var i = 1; i <= cnt; i++) {
        var _name = prefix + '_' + i;
        this.pools[_name] = createRedisPool(_name, host, port, auth);
    }

    this.default_pool = "default_pool";
    this.pools[this.default_pool] = createRedisPool(this.default_pool, host, port, auth);
}

RedisUtil.prototype.keys = function (callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.keys("*", function (err, res) {
            callback(err, res);
            release();
        })
    });
};

RedisUtil.prototype.flushAll = function (callback) {
    var poolName = null;
    if (arguments[1] != undefined) {
        poolName = arguments[0];
    } else {
        poolName = this.default_pool;
    }

    this.execute(poolName, function (client, release) {
        client.flushdb(function (err, res) {
            callback(err, res);
            release();
        })
    });
};

RedisUtil.prototype.delKey = function (key, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.del(key, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

RedisUtil.prototype.execute = function (poolName, cb) {
    if ((typeof poolName == 'function') &&
        (typeof poolName === 'string')) {
        var temp = poolName;
        poolName = cb;
        cb = temp;
    }

    var pool = this.pools[poolName];
    if (!pool) {
        console.error('invalid poolname', poolName);
    }

    var self = this;
    pool.acquire(function (err, client) {
        var release = function () {
            pool.release(client);
        };

        if (!err) {
            client.select(self.db, function (err, resp) {
                if (err) {
                    console.error('error at execute select db: %s', err);
                    release();
                } else {
                    cb(client, release);
                }
            });
        } else {
            console.error('error at execute command: %s', err.stack);
            release();
        }
    }, 0);
};

module.exports = RedisUtil;

