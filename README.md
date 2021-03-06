# mnode
> Node.js 服务组件和各种工具包，包括各类服务组件:</br>
> express,http,websocket,tcp,udp,热加载器等。</br>
> 包括各种日常工具包和算法库:</br>
> 日期操作,文件处理，数据库连接池(redis,mysql,mongodb),xml文件解析，csv文件解析，xml生成sql脚本，各类协议通信客户端(tcp,udp,http,websocket,ftp),</br>
> buffer,日志处理，单例生成器等。

### `所有组件和工具都经过实例测试通过`


## 服务组件
#### Express：封装Express web组件，实现快速创建web服务，支持原生路由规则，自动加载所有路由，支持session、cookie、静态文件请求，支持过滤器函数中间件，实现请求拦截。支持模块化，route和view分离,详细参考: [ExpressPlugin](https://github.com/zhengjinwei123/mnode/tree/master/mnode/mnode/plugin/express)
``` javascript
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
```
#### Http:原生node模块创建http服务，支持https,支持过滤器函数，支持session,按请求方法将路由模块化，只支持get和post方法.详细参考: [httpPlugin](https://github.com/zhengjinwei123/mnode/tree/master/mnode/mnode/plugin/http)
``` javascript
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
```
#### JadeLoader:热加载器服务，利用单例模式实现内容缓存存储器，外部提供set和get方法用于设置缓存，自动检测指定运行目录下的jadeContext.json文件中所指定的托管环境，加载配置中的缓存，有效减少require次数，做到清晰明了。内部有定时器按指定时间重新加载模块缓存（用户自定义缓存不重新加载  详情参考：[JadeLoader](https://github.com/zhengjinwei123/mnode/tree/master/mnode/mnode/plugin/jadeLoader)
``` javascript
var Path = require('path');
var JadeLoader = require("../plugin/app").JadeLoader;
JadeLoader.init(Path.join(__dirname, "../"), true, 60, function () {
    //此处加载您的代码
});
JadeLoader.on("error", function (err) {
    console.error(err);
});
JadeLoader.on("hotLoad", function (resp) {
    console.log(resp);
});
```
#### Websocket:快速搭建websocket 服务,详情参考：[websocket](https://github.com/zhengjinwei123/mnode/tree/master/mnode/mnode/plugin/websocket)
``` javascript
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
```

#### UDP 和 Tcp 服务，详情参考：[UDP](https://github.com/zhengjinwei123/mnode/tree/master/mnode/mnode/plugin/udp) -[TCP](https://github.com/zhengjinwei123/mnode/tree/master/mnode/mnode/plugin/tcp)

``` javascript
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
```

## utils 工具包
> 内部包括各种日常编码工具，协助快速开发，避免重复造轮子 </br>

[utils](https://github.com/zhengjinwei123/mnode/tree/master/mnode/mnode/utils)


* buffer-utils                          buffer处理包
* csv-utils                             csv转json
* db-mongodb                            mongodb 模块化客户端，经过实际项目验证
* db-mysql                              mysql客户端，经过实际项目验证
* db_redis                              redis客户端
* encrypt-utils                         加密包
* exception                             异常处理
* file-utils                            文件处理
* ftp-utils                             ftp上传下载
* httpclient-utils                      http客户端
* ip-utils                              ip地址校验
* logger                                日志处理
* logger-utils                          基于pomelo-logger的日志处理
* obj-utils                             对象方法
* queue-utils                           队列
* Singleton-utils                      单例生成器
* stack-utils                          堆栈
* tcp-utils                            tcp客户端
* udp-utils                            udp客户端
* time-utils                           时间处理
* websocket-client-utils               ws客户端
* xml-parser                           xml解析


