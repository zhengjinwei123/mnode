"use strict";

var mysql = require('mysql'),
    exception = require('../exception/app');

var queryTimeLimit = 500; // milliseconds
function MysqlObj(config) {
    console.log(null, "Create mysql connection " + config.host + ':' + config.port + '|DB:' + config.database);
    var pool = mysql.createPool({
        host: config.host || '127.0.0.1',
        port: config.port || 3306,
        user: config.user,
        password: config.password,
        database: config.database,
        charset: config.charset || 'UTF8_GENERAL_CI',
        dateStrings: true,
        supportBigNumbers: true,
        bigNumberStrings: true,
        debug: false,
        connectTimeout: 10000,
        acquireTimeout: 10000,
        waitForConnections: true,
        connectionLimit: config.connectionLimit || 3,
        queueLimit: 0
    });

    function slowLog(info, caller, time) {
        var logmsg = [info, ' query by: ', caller.func, ':', caller.line].join('');
        logmsg = ['Slow query, takes', time, 'ms', config.host + ':' + config.port, logmsg].join(' ');
        console.log(null, logmsg);
    }

    var self = {
        query: function (sql, params, next) {
            if (!pool) {
                next.failed(config.host + ':' + config.port + ' Mysql pool err');
                return;
            }

            var caller = exception.caller();
            var poolTimeBegin = new Date().getTime();

            pool.getConnection(function (err, connection) {
                if (err) {
                    next.failed(config.host + ':' + config.port + ' Mysql getConnection err:' + err.message);
                    return;
                }

                var poolTimeEnd = new Date().getTime();
                if (poolTimeEnd - poolTimeBegin > queryTimeLimit) {
                    slowLog('pool time', caller, poolTimeEnd - poolTimeBegin);
                }

                if (config.syslog && sql.search(/^\s*select|^\s*set\*names/i) == -1) {
                    var logmsg = ['query by: ', caller.func, ':', caller.line, '[', sql, ']', JSON.stringify(params)].join('');
                    console.log(null, logmsg);
                }

                var beginTime = new Date().getTime();
                connection.query(sql, params, function (err, results, fields) {
                    var endTime = new Date().getTime();
                    if (endTime - beginTime > queryTimeLimit) {
                        slowLog(['query time [', sql, ']', JSON.stringify(params)].join(''), caller, endTime - beginTime);
                    }
                    if (err) {
                        console.error(null, err + '[' + sql + ']' + JSON.stringify(params));
                        next.failed(config.host + ':' + config.port + ' ' + err.message);
                    } else {
                        next.success(results, fields);
                    }
                    connection.release();
                });
            });
        },
        close: function (next) {
            if (pool) {
                pool.end(function (err) {
                    if (err) {
                        console.error(err);
                    }
                    console.log(null, "Close mysql connection " + config.host + ':' + config.port + '|DB:' + config.database);
                });
            }
            next();
        }
    };
    return self;
}

module.exports = MysqlObj;




