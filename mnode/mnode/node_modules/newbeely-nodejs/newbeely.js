/**
 * @filename newbeely
 *
 * @module newbeely
 *
 * @author Gandalfull <orientcountry@gmail.com>
 * @version 1
 * @time 2016-02-19 10:03
 */
var Newbeely = module.exports = {},
    Bearcat = require('bearcat'),
    Path = require('path');

/**
 * 初始化配置
 *
 *@method _init
 */
Newbeely._init = function () {
    var args = ParseArgs(process.argv);
    this.options = {
        basedir: __dirname,
        workedir: this.workedir || Path.join(__dirname, "/../../"),
        env: args.env || process.env.NODE_ENV || "development",
        main: args.main,
        configs: args.configs || process.env.NODE_CONFIG || "services.json",
        log4js: args.log4js || process.env.NODE_LOG || "log4js.json"
    }
    this.componets = require(Path.join(this.options.workedir, "/config/", this.options.configs))[this.options.env];
    var contexts = [];
    var hots = [];

    contexts.push(require.resolve(Path.join(this.options.basedir, "/context.json")));
    contexts.push(require.resolve(Path.join(this.options.workedir, "/context.json")));

    for (var i in this.componets) {
        contexts.push(require.resolve(Path.join(this.options.workedir, "/app/", i, "/context.json")));
    }

    Bearcat.createApp(contexts, {BEARCAT_HOT: "on", BEARCAT_HPATH: hots});
}

/**
 * 启动框架
 *
 * @method start
 * @param workdir
 * @param cb
 */
Newbeely.start = function (workdir, cb) {
    if (typeof workdir == 'function') {
        cb = workdir;
    } else {
        this.workedir = workdir;
    }
    var _this = this;
    this._init();
    Bearcat.start(function () {
        var application = Bearcat.getBean('application');
        for (var i in _this.options) {
            application.set(i, _this.options[i], true);
        }
        application.init(_this.componets);
        if (typeof cb === 'function') {
            cb();
        }
        application.start();
    });
}

/**
 * 根据环境配置
 *
 * @method configure
 *
 * @param env {String} "development|production"
 * @param fn {function} callback
 */
Newbeely.configure = function (env, fn) {
    var envs = env.split(/[|]/);
    if (envs.indexOf(this.options.env) !== -1) {
        if (typeof fn === 'function') {
            fn();
        }
    }
}

/**
 *
 * @param args
 * @returns {{}}
 * @constructor
 */
var ParseArgs = function (args) {
    var argsMap = {};
    var mainPos = 1;

    while (args[mainPos].indexOf('--') > 0) {
        mainPos++;
    }
    argsMap.main = args[mainPos];

    for (var i = (mainPos + 1); i < args.length; i++) {
        var arg = args[i];
        var sep = arg.indexOf('=');
        var key = arg.slice(0, sep);
        var value = arg.slice(sep + 1);
        if (!isNaN(Number(value)) && (value.indexOf('.') < 0)) {
            value = Number(value);
        }
        argsMap[key] = value;
    }
    return argsMap;
};