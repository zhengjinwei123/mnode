#简介
    源生的 express 模块的包装组件,一般用于http api服务或者web服务.

#配置
   config/services.json

    {
        "YourName":{
            "bean":"expressComponent","host":"localhost","port":29000
        }
    }
    编写后在项目根目录内创建 app/YourName文件夹, 然后在YourName内创建 context.json 文件
   
   context.json
   
    { "name":"YourName","beans":[] }
    
   工具生成
    
    npm install newbeely-nodejs -g
    newbeely init
    
    ...
    
    {input 2:YourName}
    
   参数详解
   
    YourName: 自定义组件名称 这个名称可以在工程内任意地方使用 Bearcat.getBean('application').getComponent('YourName') 获得到组件对象.
    bean:必须指定为 expressComponent
    host:socket监听的主机地址 可以为 0.0.0.0 127.0.0.1 localhost
    port:socket监听的端口号
    
#路由编码
   这是一个源生的express的直接引用,使用方法相对就非常灵活,可以在 app.js 灵活的配置 routes, static resource 等
   使用newbeely工具生成的项目会自动在app.js内添加初始化express的实例代码
   
    var App = require('newbeely-nodejs'),
        Bearcat = require('bearcat');
    
    //var Path = require('path'),
        //Express = require("express"),
        //FS = require('fs'),
        //BodyParser = require('body-parser'),
        //CookieParser = require('cookie-parser'),
        //Session = require('express-session');
    
    App.start(function () {
        /// 加载配置文件
        App.configure("development|production", function () {
            var expressComponent = Bearcat.getBean("application").getComponent("YourName");
            var express = expressComponent.express;
    
            /// 固定使用views为 工作目录+"/views"
            //express.set('views', Path.join(expressComponent.opts.path, 'views'));
            /// 使用opts.viewEngine
            //express.set('view engine', "ejs");
            //express.use(MorganLogger('dev'));
            //express.use(BodyParser.json());
            //express.use(BodyParser.urlencoded({extended: false}));
            //express.use(CookieParser());
            //express.use(Session(expressComponent.opts.session || {
            //        secret: 'miniwar-cms',
            //        cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}, // 30 days
            //        name: 'miniwarcms'
            //    }));
    
            //express.use(Express.static(Path.join(expressComponent.opts.path, 'public')));
            //express.use(Express.static(Path.join(expressComponent.opts.path, 'staticFile')));
            //express.use(Favicon(Path.join(expressComponent.opts.path, '/public/images/favicon.ico')));
            expressComponent.loader('/', 'routes', expressComponent.opts.path);
            express.use(function (req, res) {
                res.statusCode = 404;
                res.end();
            });
        });
    });
   唯一使用的组件函数 loader ( Bearcat.getBean('application').getComponent('YourName').loader() )
   是本组件对express的路由加载和管理的一个接口 (必须调用这个接口)
   
    使用loader指定 文件夹 会自动加载该文件夹内的所有 .js文件作为访问路由 如果遇到文件夹嵌套文件夹视为下级路由
    
   路由编码规范
   
    var Hello = module.exports = {};
    var Bearcat = require('bearcat');
    
    /**
     * 使用Get方法获取数据 Example
     *
     * @param {Object} request
     * @param {Object} response
     * @example
     * <pre>
     *     Request Example:
     *         Method: GET
     *         API: /hello
     *         Params:
     *             None
     *     Response Example:
     *         "hello world"
     * </pre>
     */
    Hello.get = function (request, response) {
        if (request.query) {
            Logger.info("Request GET: [ %j ]", request.query);
        }
    
        response.end("hello world!");
    };
    
    /**
     * 使用POST方法获取数据 Example
     *
     * @param {Object} request
     * @param {Object} response
     * @example
     * <pre>
     *     Request Example:
     *         Method: POST
     *         API: /hello
     *         Params:
     *             None
     *     Response Example:
     *         "hello world"
     * </pre>
     */
    Hello.post = function (request, response) {
        if (request.body) {
            Logger.info("Request POST: [ %j ]", request.body);
        }
    
        response.end("hello world!");
    };

