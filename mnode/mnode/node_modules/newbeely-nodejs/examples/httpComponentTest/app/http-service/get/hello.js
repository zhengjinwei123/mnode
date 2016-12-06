/**
 * @filename hello
 *
 * @module hello
 *
 * @author Gandalfull <orientcountry@gmail.com>
 * @version 1
 * @time 2016-02-19 10:03
 */
var Bearcat = require('bearcat');

module.exports = function () {
    return Bearcat.getBean({
        id: "api-hello",
        func: Hello,
        props: [
            {name: "app", "ref": "application"}
        ]
    });
}
function Hello() {
    this.client = Bearcat.getBean('tcp-client');
    this.client.connect();

    this.client.on('connected', function () {
        console.log("tcp 连接完成!");
    });
    this.client.socket.on('close', function () {
        console.log("tcp 连接断开!");
    });
    this.client.socket.on('message', function () {
        console.log("收到服务器消息:" + arguments);
    });
}

/**
 * http://127.0.0.1:port/hello
 *
 * @param msg
 * @param next
 */
Hello.prototype.handle = function (msg, next) {
    this.client.socket.send(0, "hello", JSON.stringify({"id": "1"}), "utf8", function () {
        console.log("发送消息完成!");
    });
    next(null, "hello newbeely!");
}

/**
 * http://127.0.0.1:port/hello/world
 *
 * @param msg
 * @param next
 */
Hello.prototype.world = function (msg, next) {
    next(null, "hello world!");
}