/**
 * Created by zhengjinwei on 2016/12/4.
 */
exports.index = function (req, callback) {
    var session = req.session;
    var message = req.message;

    console.log(session.user);
    session.user = "zhengjinwei";

    console.log(session.get('a'));
    session.set('a', 'zjw');

    console.log(session.sid);

    callback(null, message);
};



