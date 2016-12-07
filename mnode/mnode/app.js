/**
 * Created by zhengjinwei on 2016/11/23.
 */
var Path = require('path');
var Pomelo = require('pomelo-logger');
Pomelo.configure(Path.join(__dirname, './config/logger.json'));
var Logger = Pomelo.getLogger('jadeLoader', __filename, process.pid);
var JadeLoader = require("./plugin/app").JadeLoader;

//JadeLoader.init(Path.join(__dirname, "./"), true,1);

//JadeLoader.set("m",{a:1,b:2});
//var m = JadeLoader.Jader().get("m");
//console.log(m);


//var Timer =  JadeLoader.Jader('utils').get('timer-utils');
//var d = new Timer();
//console.log(d.end());


/**************httpServer 测试********************/
var HttpServer = require("./plugin/app").HttpServer;

var httpS = new HttpServer(9090, "127.0.0.1", null, Path.join(__dirname, "../httpServerTest"));

httpS.createServer();



