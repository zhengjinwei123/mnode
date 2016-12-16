/**
 * Created by 郑金玮 on 2016/12/16.
 * 简单堆栈类
 */

var Stack = function () {
    this.list = [];
};

Stack.prototype.push = function (d) {
    this.list.push(d)
};

Stack.prototype.pop = function () {
    return this.list.pop()
};

module.exports = Stack;
