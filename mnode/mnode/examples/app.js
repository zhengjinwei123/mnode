/**
 * Created by 郑金玮 on 2016/11/23.
 * 测试用例
 */
var Path = require('path');
var JadeLoader = require("../plugin/app").JadeLoader;
var HttpServer = require("../plugin/app").HttpServer;
var LogUtil = require("../utils/app").Logger;
var Singleton = require("../utils/app").Singleton;
var logger = Singleton.getDemon(LogUtil, Path.join(__dirname, "../config/logger.json"), Path.join(__dirname, "../logs"));
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


    /**
     * 测试websocket
     */
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

    JadeLoader.Jader('utils').get('file-utils').readAsync("c://start_nginx-php7.bat", function (err, resp) {
        console.log(err, resp)
    });

    /**
     * 测试httpclient
     */
    var HttpClient = Singleton.getDemon(JadeLoader.Jader('utils').get('httpclient-utils'), '127.0.0.1', 9090, 2);
    setInterval(function () {
        HttpClient.Post("index", "zjw", function (err, resp) {
            console.log("http post response:", err, resp);
        });
    }, 2000);


    /**
     * 测试 udpserver
     * @type {exports.UdpServer|*}
     */
    var UdpServer = require("../plugin/app").UdpServer;
    var d = new UdpServer();
    d.on('listening', function (address) {
        console.log("server listening " + address.address + ":" + address.port);
    });
    d.on('message', function (msg, rinfo) {
        console.log('Received %d bytes msg:%s from %s:%d\n', msg.length, msg, rinfo.address, rinfo.port);
    });
    d.on('error', function (error) {
        console.error(error.stack);
    });

    setInterval(function () {
        console.log("--------start send data by udp protocal----------------");
        var UdpClient = require("../utils/app").UdpClient;
        var messgae = new UdpClient("127.0.0.1", 9092);

        //messgae.push_string("zhengjinwei", 20);
        //messgae.push_string("male", 10);
        //messgae.push_string("my name is zhengjinwei", 100);
        //messgae.push_int32(212121212);

        messgae.send("zhengjinwei");
    }, 1000);


    /**
     * 测试Date
     */
    console.log(new Date().normalize())
});

JadeLoader.on("error", function (err) {
    console.error(err);
});
JadeLoader.on("hotLoad", function (resp) {
    console.log(resp);
});


