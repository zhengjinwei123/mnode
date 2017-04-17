var EventEmitter = require("events").EventEmitter;
var Util = require("util");
var _ = require("lodash");

var SyncTask = function (workerid) {
    EventEmitter.call(this);
    this.workerid = workerid;
};

Util.inherits(SyncTask, EventEmitter);

SyncTask.prototype.sendTask = function (msgID, data, callback) {
    process.send({
        msgid: msgID,
        workerid: this.workerid,
        data: data
    });

    this.on("return", function (data) {
        callback(data);
    });

};

module.exports = SyncTask;
