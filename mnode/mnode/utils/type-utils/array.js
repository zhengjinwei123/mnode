/**
 * Created by zhengjinwei on 2016/11/30.
 */
function ArrayUtils() {
    this.init();
}

ArrayUtils.getInstance = (function () {
    var _inst = null;
    return function () {
        if (_inst instanceof ArrayUtils) {
            return _inst;
        }
        _inst = new ArrayUtils();
        return _inst;
    }
})();

ArrayUtils.prototype.init = function () {
    Array.prototype.isArray = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };
};
module.exports = ArrayUtils.getInstance();