/**
 * Created by zhengjinwei on 2017/1/18.
 * 数据落地 从redis到mysqldb
 */
var _ = require("lodash");
var Async = require("async");
var Util = require("util");

function Cache2DB(redisCfg, mysqlCfg, cacheInterval) {
    this.mysql = require("../../utils/db-mysql/app")(mysqlCfg);

    var Redis = require("../../utils/db-redis/app");
    if (_.isUndefined(redisCfg.poolCnt) ||
        _.isUndefined(redisCfg.namePrefix) ||
        _.isUndefined(redisCfg.host) ||
        _.isUndefined(redisCfg.port) ||
        _.isUndefined(redisCfg.db) ||
        _.isUndefined(redisCfg.auth)) {
        throw new TypeError("redis cfg error");
    }
    this.stat = false;
    this.redis = new Redis(parseInt(redisCfg.poolCnt), redisCfg.namePrefix, redisCfg.host, parseInt(redisCfg.port), redisCfg.db, redisCfg.auth);
    this.startCache(cacheInterval || (3 * 1000 * 60));
}

//获取所有的缓存key
Cache2DB.prototype.getCKS = function (callback) {
    this.redis.keys("updatecachelist:*", callback);
};

Cache2DB.prototype.startCache = function (cacheInterval) {
    if (cacheInterval) {
        var self = this;
        setInterval(function () {
            if (self.stat == false) {
                self.cacheRun(function (err) {
                    self.stat = false;
                });
            }
        }, cacheInterval);
    } else {
        throw new Error("cacheInterval undefined");
    }
};

Cache2DB.prototype.cacheRun = function (callback) {
    this.stat = true;
    var self = this;
    this.getCKS(function (err, cacheKeys) {
        if (!err && cacheKeys) {
            if (!_.isArray(cacheKeys)) {
                cacheKeys = [cacheKeys];
            }
            console.time("cache", "redis2db start running");
            var s = new Date();
            Async.each(cacheKeys, function (cacheKey, cb) {
                self.cache(cacheKey, cb);
            }, function (err, resp) {
                callback(err);
                console.timeEnd("cache", "redis2db cost " + (new Date() - s) + " milliseconds");
            });
        } else {
            callback(err);
        }
    });
};

Cache2DB.prototype.cache = function (key, callback) {
    var self = this;
    this.redis.lRange(key, 0, 999, function (err, list) {
        if (!err && list) {
            if (!_.isArray(list)) {
                list = [list];
            }
            if (list.length <= 0) {
                callback(null);
            } else {
                var updateList = {};
                var cnt = 0;
                _.forEach(list, function (v, k) {
                    var data = JSON.parse(v);
                    if (_.isUndefined(updateList[data['ck']])) {
                        updateList[data['ck']] = data;
                    } else {
                        updateList[data['ck']]['fields'] = _.merge(updateList[data['ck']]['fields'], data['fields']);
                    }
                    cnt++;
                });

                //sql合并
                if (cnt) {
                    var updateKeys = _.keys(updateList);
                    var sqlArray = [];
                    Async.each(updateKeys, function (key, cb) {
                        self.redis.exists(key, function (err, exists) {
                            if (!exists) {
                                console.error("cache miss key:" + key);
                                cb(null);
                            } else {
                                var fields = updateList[key]['fields'];
                                self.redis.hmGet(key, _.keys(fields), function (err, result) {
                                    if (!err && result) {
                                        var sql = parseSql(updateList[key], result);
                                        sqlArray.push(sql);
                                    }
                                    cb(null);
                                });
                            }
                        });
                    }, function (err, resp) {
                        if (!err) {
                            self.execSql(sqlArray, callback);
                        } else {
                            callback(err);
                        }
                    });
                }
            }
        } else {
            if (err) {
                console.error("cache key:" + key + " error:" + err);
            }
            callback(null);
        }
    });
};

Cache2DB.prototype.execSql = function (sqlArray, callback) {
    if (sqlArray.length) {
        var start = 0;
        var len = 20;

        var sqlGroup = [];
        while (sqlArray.length) {
            var sqls = sqlArray.splice(start, len);
            sqls = sqls.join(";");
            sqlGroup.push(sqls);
        }

        var self = this;
        Async.each(sqlGroup, function (sqls, cb) {
            self.query(sqls, [], function (err, resp) {
                if (err) {
                    console.error("execSql error:", err);
                }
                cb(null);
            });
        }, function (err, resp) {
            callback(null);
        });
    } else {
        callback(null);
    }
};

Cache2DB.prototype.query = function (sql, params, callback) {
    params = (_.isArray(params)) ? params : [];
    this.mysql.query(sql, params, {
        failed: function (err) {
            callback(err);
        },
        success: function (rows, fields) {
            callback(null, rows, fields);
        }
    })
};

function parseSql(stru, data) {
    if (data) {
        var updateFields = [];
        _.forEach(data, function (v, k) {
            updateFields.push(k + "=" + v);
        });
        if (updateFields) {
            return Util.format("update %s set %s where %s=%s", stru['tbn'], updateFields.join(","), stru['pk'], stru['pkv']);
        }
    }
    return null;
}

module.exports = Cache2DB;