/**
 * Created by ff on 2016/12/16.
 */


var calcV = function () {
    var args = arguments[0];

    var ret = 0;
    for (var i = 0; i < args.length; i++) {
        ret += args[i];
    }
    return ret;
};

var Task = function () {
    return eval(arguments[0]);
};


module.exports = Task;
