/**
 * Created by 郑金玮 on 2016/12/16.
 */
var EventEmitter = require("events").EventEmitter;
var Util = require("util");
var ObjUtil = require("../../utils/app").Object;

var SyncTask = function (workerid) {
    EventEmitter.call(this);

    this.workerid = workerid;
    console.log("workerid", workerid);
};

Util.inherits(SyncTask, EventEmitter);


SyncTask.prototype.sendTask = function (funcName) {
    var args = [];

    var argCnt = ObjUtil.count(arguments);

    var func = arguments[argCnt - 1];
    for (var i in arguments) {
        if (i != 0 && (i != (argCnt - 1))) {
            args.push(arguments[i]);
        }
    }

    process.send({
        func: funcName,
        args: args,
        senderid: this.workerid
    });

    this.on("return", function (data) {
        func(data);
    });

};

module.exports = SyncTask;
