/**
 * Created by zhengjinwei on 2016/11/30.
 */
var Rangedate = require('rangedate');
var timeUtils = function () {
    this.init();
};

timeUtils.getInstance = (function () {
    var _inst = null;
    return function () {
        if (_inst instanceof timeUtils) {
            return _inst;
        }
        _inst = new timeUtils();
        return _inst;
    }
})();

timeUtils.prototype.init = function () {

    /**
     * 获取标准的本地日期字符串
     *
     * 由于不同的操作系统调用这个接口产生的字符串是不一样的
     * @returns {string}
     */
    Date.prototype.init = function () {
        this.year = this.getFullYear();
        this.month = this.getMonth() + 1;
        this.day = this.getDate();

        this.hour = this.getHours();
        this.minute = this.getMinutes();
        this.second = this.getSeconds();
        this.milliSecond = this.getMilliseconds();
    };

    Date.prototype.toLocaleDateString = function () {
        var month = this.getMonth() + 1;
        var day = this.getDate();
        month = month > 9 ? month.toString() : ("0" + month);
        day = day > 9 ? day.toString() : ("0" + day);
        return this.getFullYear() + "-" + month + "-" + day;
    };

    /**
     *
     * @returns {string}
     */
    Date.prototype.toLocaleString = function () {
        var month = this.getMonth() + 1;
        var day = this.getDate();
        month = month > 9 ? month.toString() : ("0" + month);
        day = day > 9 ? day.toString() : ("0" + day);
        var hourse = this.getHours();
        hourse = hourse > 9 ? hourse.toString() : ("0" + hourse);
        var minutes = this.getMinutes();
        minutes = minutes > 9 ? minutes.toString() : ("0" + minutes.toString());
        var second = this.getSeconds();
        second = second > 9 ? second.toString() : ("0" + second.toString());
        return this.getFullYear() + "-" + month + "-" + day + " " + hourse + ":" + minutes + ":" + second;
    };

    /**
     * 格式化时间 "0000-00-00 00:00:00"
     * 丢弃掉时间的小时部分
     *
     * @method  normalize
     */
    Date.prototype.normalize = function () {
        return this.toLocaleDateString() + " 00:00:00";
    };

    /**
     * 判定是否是今天
     *  大于今天的0点视为是今天
     *
     * @method isToday
     * @returns {boolean}
     */
    Date.prototype.isToday = function () {
        return this >= new Date(new Date().normalize());
    };

    /**
     * 判定是否是当前时间
     *  是今天 并且 大于等于当前时间的小时数 视为是当前小时
     * @method thisHours
     * @returns {boolean}
     */
    Date.prototype.thisHours = function () {
        return this.isToday() && (this.getHours >= new Date().getHours());
    };

    /**
     * 根据当前对象的时间获得一个新的日期
     * 这个日期为距离day天的 00:00:00
     *
     * @method otherDay
     * @param day
     * @returns {Date}
     */
    Date.prototype.otherDay = function (day) {
        return new Date(this.getFullYear(), this.getMonth(), this.getDate() + day,
            this.getHours(),
            this.getMinutes(),
            this.getSeconds(),
            this.getMilliseconds()
        );
    };

    /**
     * 根据当前日志计算差距N小时的时间戳
     *
     * @method otherHour
     * @param duration
     * @returns {Date}
     */
    Date.prototype.otherHour = function (duration) {
        return new Date(this.getTime() + (duration * 3600000));
    };

    /**
     * 根据对象的日期产生到目标点的天数集合
     *
     * @method durationDay
     * @param day
     * @returns {Array}
     */
    Date.prototype.durationDay = function (day) {
        var s = new Date(this.normalize());
        return Rangedate(s, day).map(function (data) {
            return new Date(data.normalize());
        });
    };

    /**
     * 计算日期之间的小时数
     *
     * @method durationHours
     * @param day
     * @returns {Array}
     */
    Date.prototype.durationHours = function (day) {
        var res = [];
        var max, min;
        max = this > day ? this : day;
        min = this > day ? day : this;

        var durations = max - min;
        var hours = Math.ceil(durations / 3600000);
        for (var i = 0; i < hours; i++) {
            var d = new Date(min.getTime() + (i * 3600000));
            if (d < max) {
                res.push(d);
            }
        }
        return res;
    };

    /**
     *
     * @returns {Date}
     */
    Date.prototype.toLocalDate = function () {
        var date = this;
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    };


    /**
     *
     * @returns {boolean}
     */
    Date.prototype.isSameDay = function () {
        var date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        if (this.getTime() == date.getTime()) {
            return true;
        }
        return false;
    };
};

module.exports = timeUtils.getInstance();



