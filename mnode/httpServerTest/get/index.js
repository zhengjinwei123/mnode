/**
 * Created by Administrator on 2016/12/4.
 */
exports.index = function (req, callback) {
    var session = req.session;
    var message = req.message;

    // console.log(session.get('a'));
    // session.set("a",1);
    //
    // console.log(session.b);
    // session.b = 1;
    callback(null, message);
};



