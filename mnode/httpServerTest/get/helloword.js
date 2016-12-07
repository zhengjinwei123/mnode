/**
 * Created by Administrator on 2016/12/4.
 */
exports.say = function (message, response) {
    console.log(message);
    response.end(JSON.stringify(message));
};

exports.index = function (message, response) {
    console.log(message);
    response.end(JSON.stringify(message));
};



