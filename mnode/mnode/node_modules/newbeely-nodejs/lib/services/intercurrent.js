/**
 * @filename intercurrent
 *
 * @module intercurrent
 *
 * @author Gandalfull <orientcountry@gmail.com>
 * @version 1
 * @time 2016-02-19 10:03
 */
module.exports = {
    id: "intercurrent",
    func: Intercurrent,
    props: [
        {name: "app", ref: "application"}
    ]
}
var CP = require('child_process');
var Path = require('path');
var FS = require('fs');
var Async = require('async');
var Logger = require('pomelo-logger').getLogger('newbeely', 'intercurrent');

/**
 *
 * @constructor
 */
function Intercurrent() {
    /**
     *
     * @type {string|string|string|string|string|string|*}
     */
    this.$id = module.exports.id;

    /**
     *
     * @type {null}
     */
    this.app = null;
}

var inc = 0;

/**
 * 启动一个进程去执行逻辑运算
 *
 * @param code function
 * @param params Array to function args
 * @param cb callback
 */
Intercurrent.prototype.async = function (code, params, cb) {
    this.workerdir = Path.join(this.app.workedir, '.intercurrent');
    if (!FS.existsSync(this.workerdir)) {
        FS.mkdirSync(this.workerdir);
    }

    var _this = this;
    var script_name = "cp-" + inc++ + ".js";

    function process_main() {
        process.on('message', function (msg) {
            process.send(domain.apply(null, Array.prototype.slice.call(msg, 0)));
        });
    }

    Async.waterfall([
        function (fn) {
            FS.writeFile(Path.join(_this.workerdir, script_name), "var domain  = " + code.toString() + ";\n\r" + "var main=" + process_main.toString() + ";\n\r" + "main();", function (error) {
                fn(error);
            });
        }, function (fn) {
            var cp = CP.fork(Path.join(_this.workerdir, script_name));
            cp.send(params);
            cp.once('message', function (data) {
                cb(null, data);
                fn();
                cp.kill();
            });
        }, function () {
            FS.unlink(Path.join(_this.workerdir, script_name), function (error) {
                if (error) {
                    Logger.error(error);
                }
            });
        }
    ], function (error) {
        if (error) {
            cb(error);
        }
    });
}
