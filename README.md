# mnode
mutiple utils for nodejs

#包含各种服务组件
#### Express：封装Express web组件，实现快速创建web服务，支持原生路由规则，自动加载所有路由，支持session、cookie、静态文件请求，支持过滤器函数中间件，实现请求拦截。支持模块化，route和view分离。
`
var ExpressPlugin = require("../app");
var Path = require("path");

var d = new ExpressPlugin('localhost', 9095, Path.join(__dirname, "../../../../expressTest"));
d.start(function () {
    console.log("ready");
});
d.on('uncaughtException', function (err) {
   console.error('Got uncaughtException', err.stack, err);
   if (d.env() == 'development') {
       process.exit(1);
    }
});
`
#### Http:原生node模块创建http服务，支持https,支持过滤器函数，支持session,按请求方法将路由模块化，只支持get和post方法.
`
var HttpServer = require("../plugin/app").HttpServer;
var httpS = new HttpServer(9090, "127.0.0.1", {
        filtersFunc: [
            function (message) {
                return true;
            }
        ]
    }, Path.join(__dirname, "../../httpServerTest"));

    httpS.createServer();

    httpS.on("ready", function (data) {
        logger.info("Http", data);
    });
    httpS.on("error", function (data) {
        logger.info("Http", data);
    });
    httpS.on("connect-connect", function (data) {
        logger.info("Http", data);
    });
    httpS.on("connect-error", function (error) {
        logger.info("Http", error);
    });
    httpS.on("connect-disconnect", function (data) {
        logger.info("Http", data);
    });
    httpS.on("connect-response", function (data) {
        logger.info("Http", data);
    });
    httpS.on("connect-errorcode", function (code) {
        logger.info("Http", code);
    });
`
#### JadeLoader:热加载器服务，利用单例模式实现内容缓存存储器，外部提供set和get方法用于设置缓存，自动检测指定运行目录下的jadeContext.json文件中所指定的托管环境，加载配置中的缓存，有效减少require次数，做到清晰明了。内部有定时器按指定时间重新加载模块缓存（用户自定义缓存不重新加载）
`
var Path = require('path');
var JadeLoader = require("../plugin/app").JadeLoader;
JadeLoader.init(Path.join(__dirname, "../"), true, 60, function () {
});
JadeLoader.on("error", function (err) {
    console.error(err);
});
JadeLoader.on("hotLoad", function (resp) {
    console.log(resp);
});
`
#### Websocket:快速搭建websocket 服务
`
var Singleton = require("../utils/app").Singleton;
var wss = Singleton.getDemon(WSocketServer, "127.0.0.1", 9091);
    wss.on("message", function (msg) {
        console.log("ws:", msg);
    });
    wss.on("connection", function (socket, param) {
        socket.send("连接成功");
        console.log("连接成功", param.host)
    });

    wss.on('close', function (param) {
        console.log("客户端断开连接", param.host);
    });

    wss.once("listening", function () {
        console.log("listening");
    });
    wss.on("error", function (err) {
        console.error(err);
    });
`
