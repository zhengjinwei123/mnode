/**
 * Created by 郑金玮 on 2016/12/8.
 * 日志管理器
 */

var Pomelo = require('pomelo-logger');
var FileUtil = require("../file-utils/app");
var _ = require("lodash");
var Path = require("path");

var LoggerUtils = function (configPath, logPath) {
    this.loggers = {};

    this.openList = {
        "debug": true,
        "warn": true,
        "fatal": true,
        "info": true,
        "error": true
    };

    if (!FileUtil.isExists(configPath) || !FileUtil.isExists(logPath)) {
        throw new Error(configPath + " is not a valid path");
    } else {
        var configContent = FileUtil.readSync(configPath);
        var _exception = null;
        try {
            configContent = JSON.parse(configContent);
        } catch (e) {
            _exception = e.message;
        } finally {
            if (!_exception) {

                if (configContent['appenders'] == undefined) {
                    this.exit("appenders not exists");
                }
                var appenders = configContent['appenders'];
                var self = this;

                var index = 0;

                var categoryList = [];
                appenders.forEach(function (appender) {
                    if (appender['type'] && appender['type'] == "file") {
                        var fileName = appender['filename'];
                        var category = appender['category'];

                        if ((fileName != undefined) && (category != undefined)) {
                            configContent['appenders'][index]['filename'] = Path.join(logPath, "/", fileName).replace([/\\/], "/");
                            categoryList.push(category);
                        }
                    } else if (appender['type'] && appender['type'] == "console") {
                        if (configContent['openLog']['console'] != undefined && configContent['openLog']['console'] == false) {
                            configContent['appenders'].splice(index, 1);
                            configContent['replaceConsole'] = false;
                        }
                    }
                    index++
                });
                //var configTemp = configPath.split(".");
                //FileUtil.writeSync(configTemp[0] + "-tmp.json", JSON.stringify(configContent));
                Pomelo.configure(configContent);
                categoryList.forEach(function (c) {
                    self.loggers[c] = Pomelo.getLogger(c);
                });

                if (configContent['openLog']) {
                    var o = configContent['openLog'];
                    for (var k in this.openList) {
                        if (o[k] != undefined && (typeof o[k] == 'boolean')) {
                            this.openList[k] = o[k];
                        }
                    }
                }
            } else {
                this.exit(_exception);
            }
        }
    }
};

LoggerUtils.getInstance = (function () {
    var inst = null;
    return function (configPath, logPath) {
        if (inst instanceof LoggerUtils) {
            return inst;
        }
        inst = new LoggerUtils(configPath, logPath);
        return inst;
    }
})();

LoggerUtils.prototype.exit = function (reason) {
    console.error(reason);
    process.exit(1);
};

LoggerUtils.prototype.log = function (args) {
    var index = 0;
    var str = "";
    for (var i in args) {
        if (index == 0) {
            index++;
            continue;
        } else {
            var o = args[i];
            _.isString(o) && (str += o);
            (_.isObject(o) || _.isArray(o)) && (str += JSON.stringify(o));
            _.isNumber(o) && (str += o.toString());
            _.isBoolean(o) && ((o == true) ? (str += 'true') : (str += 'false'));
        }
        str += "  ";
    }
    return str;
};

LoggerUtils.prototype.debug = function (category) {
    if (this.openList.debug) {
        this.loggers[category] && this.loggers[category].debug(this.log(arguments));
    }
};
LoggerUtils.prototype.fatal = function (category) {
    if (this.openList.fatal) {
        this.loggers[category] && this.loggers[category].fatal(this.log(arguments));
    }
};
LoggerUtils.prototype.info = function (category) {
    if (this.openList.info) {
        this.loggers[category] && this.loggers[category].info(this.log(arguments));
    }
};
LoggerUtils.prototype.warn = function (category) {
    if (this.openList.warn) {
        this.loggers[category] && this.loggers[category].warn(this.log(arguments));
    }
};
LoggerUtils.prototype.error = function (category) {
    if (this.openList.error) {
        this.loggers[category] && this.loggers[category].error(this.log(arguments));
    }
};

module.exports = LoggerUtils;

