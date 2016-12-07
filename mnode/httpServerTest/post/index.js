/**
 * Created by Administrator on 2016/12/4.
 */
exports.index = function (req, callback) {
    var session = req.session;
    var message = req.message;

    callback(null, message);
};



