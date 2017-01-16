///**
// * Created by 郑金玮 on 2016/12/12.
// * express 测试用例
// */
//var ExpressPlugin = require("../app");
//var Path = require("path");
//
//var d = new ExpressPlugin('localhost', 9095, Path.join(__dirname, "../../../../expressTest"));
//d.start(function () {
//    console.log("ready");
//});
//
//d.on('uncaughtException', function (err) {
//    console.error('Got uncaughtException', err.stack, err);
//    if (d.env() == 'development') {
//        process.exit(1);
//    }
//});