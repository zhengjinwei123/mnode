/**
 * Created by zhengjinwei on 2016/12/9.
 * 简单队列类
 */

var QueueUtil = function () {
    this.queue = [];
};

QueueUtil.prototype.push = function (d) {
    this.queue.unshift(d);
};
QueueUtil.prototype.pop = function () {
    return this.queue.pop();
};
QueueUtil.prototype.length = function () {
    return this.queue.length;
};

module.exports = QueueUtil;

//var q = new QueueUtil();
//q.push(1);
//q.push(2);
//q.push(3);
//console.log(q.queue);
//
//console.log(q.pop());
//console.log(q.pop());
//console.log(q.pop());