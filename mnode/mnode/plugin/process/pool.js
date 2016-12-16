/**
 * Created by 郑金玮 on 2016/12/16.
 * 多进程服务
 */
var _ = require("lodash");

var ProcessPool = function () {
    this.workerList = [];
    this.taskList = [];
    this.reactorList = [];
};

ProcessPool.prototype.add = function (mode, pid, id) {
    if (mode == 'worker') {
        this.workerList.push({
            busy: 0,
            id: id
        });
    } else if (mode == 'task') {
        this.taskList.push({
            busy: 0,
            id: id
        });
    } else {
        this.reactorList.push({
            busy: 0,
            id: id
        });
    }
};

ProcessPool.prototype.sendTasking = function (cluster, msg) {
    var task = _.sample(this.taskList);
    cluster.workers[task.id].send(msg);
};

ProcessPool.prototype.sendTasked = function (worker, msg) {
    worker.send(msg.ret);
};

ProcessPool.getInstance = (function () {
    var _inst = null;
    return function () {
        if (_inst instanceof ProcessPool) {
            return _inst;
        }
        _inst = new ProcessPool();
        return _inst;
    }
})();


module.exports = ProcessPool;



