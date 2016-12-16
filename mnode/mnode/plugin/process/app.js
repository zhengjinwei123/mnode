/**
 * Created by 郑金玮 on 2016/12/16.
 * 多进程服务
 */
var ProcessPool = function () {
    this.workerList = [];
};

ProcessPool.prototype.add = function (mode, pid,id) {
    this.workerList[pid] = {
        busy: 0,
        mode: mode,
        id:id
    };
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



