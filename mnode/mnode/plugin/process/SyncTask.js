/**
 * Created by 郑金玮 on 2016/12/16.
 */
var EventEmitter = require("events").EventEmitter;
var Util = require("util");
//var ObjUtil = require("../../utils/app").Object;
var _ = require("lodash");

var SyncTask = function (workerid) {
    EventEmitter.call(this);

    this.workerid = workerid;
    console.log("workerid", workerid);
};

Util.inherits(SyncTask, EventEmitter);


SyncTask.prototype.sendTask = function (funcName) {
    //var argCnt = ObjUtil.count(arguments);

    var args = [];

    var func = null;
    for (var i in arguments) {
        if (i != 0) {
            if (_.isFunction(arguments[i])) {
                func(arguments[i]);
            } else {
                args.push(arguments[i]);
            }
        }
    }

    process.send({
        func: funcName,
        args: args,
        senderid: this.workerid
    });

    if (func) {
        this.on("return", function (data) {
            func(data);
        });
    }
};

module.exports = SyncTask;
