/**
 * Created by 郑金玮 on 2016/12/2.
 */
var Redis = require("redis");
var GenericPool = require("generic-pool");
var Emitter = require("events").EventEmitter;

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
                //console.log("redis 已就绪");
            });

            client.on('error', function (err) {
                console.error('error at connect redis: %s', err.stack);
                callback(err.stack);
            });

            client.on("connect", function () {
                //console.log("redis 连接成功");
                callback(null, client);
            });
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

RedisUtil.prototype.keys = function (key, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.keys(key, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

RedisUtil.prototype.expire = function (key, expireSec, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.expire(key, expireSec, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

RedisUtil.prototype.exists = function (key, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.exists(key, function (err, res) {
            callback(err, res);
            release();
        })
    });
};
RedisUtil.prototype.hExists = function (key, ck, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.hexists(key, ck, function (err, res) {
            callback(err, res);
            release();
        })
    });
};


//支持哈希
RedisUtil.prototype.hGetAll = function (key, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.hgetall(key, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

RedisUtil.prototype.hGet = function (key, field, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.hget(key, field, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

RedisUtil.prototype.hmGet = function (key, fields, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.hmget(key, fields, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

RedisUtil.prototype.hmSet = function (key, fields, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.hmset(key, fields, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

RedisUtil.prototype.hSet = function (key, field, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.hset(key, field, function (err, res) {
            callback(err, res);
            release();
        })
    });
};


//支持字符串
RedisUtil.prototype.set = function (key, value, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.set(key, value, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

RedisUtil.prototype.get = function (key, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.get(key, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

RedisUtil.prototype.incr = function (key, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.incr(key, function (err, res) {
            callback(err, res);
            release();
        })
    });
};


//支持有序集合
RedisUtil.prototype.zAdd = function (key, score, value, callback) {
    var poolName = this.default_pool;
    var args = [key, score, value];
    this.execute(poolName, function (client, release) {
        client.zadd(args, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

/**
 *
 * @param key
 * @param datas [score,value,score2,value2]
 * @param callback
 */
RedisUtil.prototype.zMAdd = function (key, datas, callback) {
    var poolName = this.default_pool;
    var args = datas;
    args.unshift(key);
    this.execute(poolName, function (client, release) {
        client.zadd(args, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

RedisUtil.prototype.zRevRangeByScore = function (key, minScore, maxScore, withscores, limit, offset, count, callback) {
    var poolName = this.default_pool;
    if (!minScore) {
        minScore = "+inf";
    }
    if (!maxScore) {
        maxScore = "-inf";
    }
    var args = [key, maxScore, minScore];

    if (withscores) {
        args = [key, maxScore, minScore, 'WITHSCORES'];
    }
    if (limit) {
        if (!offset) {
            offset = 1;
        }
        if (count) {
            args = [key, maxScore, minScore, 'WITHSCORES', 'LIMIT', offset, count];
        } else {
            args = [key, maxScore, minScore, 'WITHSCORES', 'LIMIT', offset];
        }
    }
    this.execute(poolName, function (client, release) {
        client.zrevrangebyscore(args, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

RedisUtil.prototype.ttl = function (key, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.ttl(key, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

//支持事务
RedisUtil.prototype.multi = function (callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        callback(client.multi(), release);
    });
};
RedisUtil.prototype.exec = function (multi, release, callback) {
    multi.exec(function (err, resp) {
        release();
        callback(err, resp);
    });
};


//支持无序集合
RedisUtil.prototype.sAdd = function (key, member, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.sadd(key, member, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

RedisUtil.prototype.sIsMember = function (key, member, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.sismember(key, member, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

RedisUtil.prototype.sMembers = function (key, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.smembers(key, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

//支持队列
RedisUtil.prototype.lPush = function (key, value, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.lpush(key, value, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

RedisUtil.prototype.rPush = function (key, value, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.rpush(key, value, function (err, res) {
            callback(err, res);
            release();
        })
    });
};


RedisUtil.prototype.lRange = function (key, value, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.lrange(key, value, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

RedisUtil.prototype.rRange = function (key, value, callback) {
    var poolName = this.default_pool;
    this.execute(poolName, function (client, release) {
        client.rrange(key, value, function (err, res) {
            callback(err, res);
            release();
        })
    });
};

//清空
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

//删除
RedisUtil.prototype.del = function (key, callback) {
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

