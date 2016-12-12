/**
 * Created by 郑金玮 on 2016/12/7.
 */
var Session = function (sid) {
    this.dataMap = {};
    this.sid = sid;//session id
    this.genTime = new Date(); //生成时间
};

Session.prototype.set = function (k, d) {
    this.dataMap[k] = d;
};

Session.prototype.get = function (k) {
    return (this.dataMap[k] || undefined);
};

module.exports = Session;


