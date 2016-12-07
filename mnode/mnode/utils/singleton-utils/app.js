/**
 * Created by zhengjinwei on 2016/11/30.
 * 单例生成器
 */

var Singleton = (function () {
    var _inst = [];
    return {
        getDemon: function (obj) {
            var arg = arguments;
            return new obj(arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7], arg[8], arg[9], arg[10]);
        },
        getInstance: function (obj) {
            var _d = new obj();
            var clsName = _d.__proto__.constructor.name;
            delete _d;
            if (_inst[clsName]) {
                return _inst[clsName];
            }
            var a = arguments;
            _inst[clsName] = new obj(a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10]);
            return _inst[clsName];
        }
    }
})();

module.exports = Singleton;
