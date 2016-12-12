/**
 * Created by 郑金玮 on 2016/12/2.
 */
var mysql = require("mysql");
var _ = require("lodash");

var MysqlUtils = function () {
    this.settings = {
        host: "127.0.0.1",
        user: "root",
        password: "root",
        database: "user",
        port: 3306
    };
};
MysqlUtils.getInstance = (function () {
    var _inst = null;
    return function () {
        if (_inst instanceof MysqlUtils) {
            return _inst;
        }
        _inst = new MysqlUtils();
        return _inst;
    }
})();


MysqlUtils.prototype.init = function (settings) {
    if (!_.isObject(settings)) {
        throw new Error("MysqlUtils::init" + settings + " must be object type value");
    }


    _.extend(this.settings, settings);

    this.pool = mysql.createPool({
        host: this.settings.host,
        user: this.settings.user,
        password: this.settings.password,
        database: this.settings.db,
        port: this.settings.port
    });
};


MysqlUtils.prototype.query = function (sql, callback) {
    this.pool.getConnection(function (err, conn) {
        if (err) {
            callback(err, null, null);
        } else {
            conn.query(sql, function (err, values, fields) {
                //释放连接
                conn.release();
                //事件驱动回调
                callback(err, values, fields);
            });
        }
    });
};

module.exports = MysqlUtils;

