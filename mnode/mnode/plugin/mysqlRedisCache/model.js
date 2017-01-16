/**
 * Created by zhengjinwei on 2017/1/16.
 * 数据模型模板生成器
 */
var _ = require("lodash");
var Async = require("async");
var Util = require("util");

function Model(fields, primaryKey) {
    if (!_.isObject(fields)) {
        throw new TypeError("fields is error");
    }
    this.fields = fields;//字段
    this.updateFields = {};
    this.pk = primaryKey || null;//主键
    this.tableName = "";
    this.tablePrefix = "t_";

    this.mysql = null;
    this.redis = null;

    this.mode = 'c';//d || c      查询类型 d:直接操作mysql  c:缓存
}

Model.prototype.setTableName = function (n) {
    this.tableName = n;
};

Model.prototype.getTableName = function () {
    return this.tableName;
};

Model.prototype.initFields = function (fields) {
    this.fields = fields;
};

Model.prototype.getFullTableName = function () {
    return this.tablePrefix + this.tableName;
};


// 获取主键值
Model.prototype.getPKV = function () {
    if (this.pk) {
        return this.getField(this.pk);
    }
    return null;
};

// 设置主键值
Model.prototype.setPKV = function (pkv) {
    if (this.pk) {
        this.setField(this.pk, pkv);
    }
};

// 获取缓存键名
Model.prototype.getCK = function (pkV) {
    if (_.isUndefined(pkV)) {
        pkV = this.getPKV();
    }
    return this.tableName + ":" + pkV;
};


Model.prototype.byD = function () {
    this.mode = 'd';
};
Model.prototype.byC = function () {
    this.mode = 'c';
};

Model.prototype.setField = function (field, value) {
    if (!_.isUndefined(this.fields[field])) {
        this.fields[field] = value;
        this.updateFields[field] = value;
    }
};
Model.prototype.getField = function (field) {
    if (!_.isUndefined(this.fields[field])) {
        return this.fields[field];
    }
    return null;
};

Model.prototype.getFields = function () {
    return this.fields;
};

Model.prototype.getFieldChanged = function () {
    return this.updateFields;
};
Model.prototype.init_field_changed = function () {
    this.updateFields = [];
};

Model.prototype.setMysql = function (cfg) {
    this.mysql = require("../../utils/db-mysql/app")(cfg);
};

Model.prototype.setRedis = function (cfg) {
    var Redis = require("../../utils/db-redis/app");
    if (_.isUndefined(cfg.poolCnt) ||
        _.isUndefined(cfg.namePrefix) ||
        _.isUndefined(cfg.host) ||
        _.isUndefined(cfg.port) ||
        _.isUndefined(cfg.db) ||
        _.isUndefined(cfg.auth)) {
        throw new TypeError("redis cfg error");
    }
    this.redis = new Redis(cfg.poolCnt, cfg.namePrefix, cfg.host, cfg.port, cfg.db, cfg.auth);
};

Model.prototype.check = function () {
    if (!this.mysql || !this.redis) {
        return false;
    }
    return true;
};


Model.prototype.find = function (pKV) {
    var argsCnt = _.keys(arguments).length;
    var columns,expire,callback = null;
    if (argsCnt == 2) {
        columns = "*";
        expire = 86400;
        callback = arguments[1];
    } else if (argsCnt == 3) {
        columns = "*";
        expire =  86400;
        callback = arguments[2];
    } else {
        columns = arguments[1];
        expire =  arguments[2];
        callback = arguments[3];
    }

    var self = this;

    if (!this.check()) {
        callback("please init connection")
    } else {
        if ((this.mode === 'c') && this.pk) {
            var results = null;
            Async.waterfall([
                function (cb) {
                    self.redis.exists(self.getCK(pKV), function (err,exists) {
                        if (!exists) {
                            cb("key:" + self.getCK(pKV) + " not exists");
                        } else {
                            if (columns === "*") {
                                self.redis.hGetAll(self.getCK(pKV), function (err, resp) {
                                    results = resp;
                                    cb(err);
                                });
                            } else {
                                columns = _.isArray(columns) ? columns : [columns];
                                self.redis.hmGet(self.getCK(pKV), columns, function (err, resp) {
                                    results = resp;
                                    cb(err);
                                });
                            }
                        }
                    });
                },
                function (cb) {
                    self.redis.expire(self.getCK(pKV), expire, function (err, resp) {
                        cb(err);
                    })
                }
            ], function (err, resp) {
                if (err || _.isEmpty(results)) {
                    var selFields = [];
                    if (columns === "*") {
                        selFields = "*";
                    } else {
                        selFields = columns.join(",");
                    }

                    var sql = Util.format("SELECT %s FROM %s WHERE %s=%s LIMIT 1", selFields, self.getFullTableName(), self.pk, pKV);

                    self.query(sql, [], function (err, results, fields) {
                        if (!err && (!_.isEmpty(results))) {
                            self.initFields(results[0]);
                            callback(err, self);
                        } else {
                            callback(err, null);
                        }
                    });
                } else {
                    self.initFields(results);
                    callback(err, self);
                }
            });
        } else {
            var selFields = [];
            if (columns === "*") {
                selFields = "*";
            } else {
                selFields = columns.join(",");
            }

            var sql = Util.format("SELECT %s FROM %s WHERE %s=%s LIMIT 1", selFields, this.getFullTableName(), this.pk, pKV);
            this.query(sql, [], function (err, results, fields) {
                if (!err && (!_.isEmpty(results))) {
                    self.initFields(results[0]);
                    callback(err, self);
                } else {
                    callback(err, results);
                }
            });
        }
    }
};

Model.prototype.insert = function (callback) {
    
};

Model.prototype.update = function (callback) {

};

Model.prototype.delete = function (callback) {

};


Model.prototype.query = function (sql, params, callback) {
    params = (_.isArray(params)) ? params : [];
    if (!this.mysql) {
        throw new Error("please call setMysql");
    }
    this.mysql.query(sql, params, {
        failed: function (err) {
            callback(err);
        },
        success: function (rows, fields) {
            callback(null, rows, fields);
        }
    })
};

module.exports = Model;



