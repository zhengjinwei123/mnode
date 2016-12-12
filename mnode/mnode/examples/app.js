/**
 * Created by 郑金玮 on 2016/11/23.
 * 测试用例
 */
var Path = require('path');
var JadeLoader = require("../plugin/app").JadeLoader;
var HttpServer = require("../plugin/app").HttpServer;
var LogUtil = require("../utils/app").Logger;
var Singleton = require("../utils/app").Singleton;
var logger = Singleton.getDemon(LogUtil, Path.join(__dirname, "../config/logger.json"),Path.join(__dirname, "../logs"));
var WSocketServer = require("../plugin/app").WSServer;

JadeLoader.init(Path.join(__dirname, "../"), true, 60, function () {
    var httpS = new HttpServer(9090, "127.0.0.1", {
        filtersFunc: [
            function (message) {
                return true;
            }
        ]
    }, Path.join(__dirname, "../../httpServerTest"));

    httpS.createServer();

    httpS.on("ready", function (log) {
        logger.info("Http", log);
    });
    httpS.on("error", function (log) {
        logger.info("Http", log);
    });
    httpS.on("connect-connect", function (log) {
        logger.info("Http", log);
    });
    httpS.on("connect-error", function (log) {
        logger.info("Http", log);
    });
    httpS.on("connect-disconnect", function (log) {
        logger.info("Http", log);
    });
    httpS.on("connect-response", function (log) {
        logger.info("Http", log);
    });
    httpS.on("connect-errorcode", function (log) {
        logger.info("Http", log);
    });


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

    JadeLoader.Jader('utils').get('file-utils').readAsync("c://start_nginx-php7.bat",function(err,resp){
        console.log(err,resp)
    });

    //var HttpClient = Singleton.getDemon(JadeLoader.Jader('utils').get('httpclient-utils'),'127.0.0.1',9090,2);
    //
    //setInterval(function(){
    //    HttpClient.Post("index", "zjw",function(err,resp){
    //        console.log("http post response:",err,resp);
    //    });
    //},2000)
});

JadeLoader.on("error", function (err) {
    console.error(err);
});
JadeLoader.on("hotLoad", function (resp) {
    console.log(resp);
});


