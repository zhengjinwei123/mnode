/**
 * Created by zhengjinwei on 2016/12/1.
 */

function ObjUtils() {
    this.init();
};

ObjUtils.getInstance = (function () {
    var _inst = null;
    return function () {
        if (_inst instanceof ObjUtils) {
            return _inst;
        }
        _inst = new ObjUtils();
        return _inst;
    }
})();

ObjUtils.prototype.init = function () {
    Object.prototype.count = function () {
        var count = 0;
        for (var property in this) {
            if (Object.prototype.hasOwnProperty.call(this, property)) {
                count++;
            }
        }
        return count;
    };
};

ObjUtils.prototype.create = function (obj) {
    var arg = arguments;
    return new obj(arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7], arg[8], arg[9], arg[10]);
};

module.exports = ObjUtils.getInstance();
