var EventEmitter = require("events").EventEmitter;
var Util = require("util");
var _ = require("lodash");

var SyncTask = function (workerid) {
    EventEmitter.call(this);
    this.workerid = workerid;
    this.listener = null;
    this.state = false;
};

Util.inherits(SyncTask, EventEmitter);

SyncTask.prototype.sendTask = function (msgID, data, callback) {
    this.state = true;
    process.send({
        msgid: msgID,
        workerid: this.workerid,
        data: data
    });

    this.listener = callback;

    var self = this;
    this.on("return", function (data) {
        //self.removeAllListeners();
        self.removeListener("return", self.listener);
        self.state = false;
        callback(data);
    });
};

SyncTask.prototype.taskEnable = function () {
    return (this.state == false);
};


module.exports = SyncTask;
