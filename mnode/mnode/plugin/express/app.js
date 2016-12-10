/**
 * Created by zhengjinwei on 2016/12/10.
 */
var Express = require("express");
var _ = require("lodash");
var Http = require('http');
var Path = require("path");
var Ejs = require("ejs");
var MorganLogger = require('morgan'),
    BodyParser = require('body-parser'),
    CookieParser = require('cookie-parser'),
    Session = require('express-session');
var ObjUtil = require("../../utils/app").Object;
var FileUtil = require("../../utils/app").File;
var EventEmitter = require("events").EventEmitter;
var Util = require("util");


var ExpressPlugin = function (host, port, path) {
    EventEmitter.call(this);

    var argsCnt = ObjUtil.count(arguments);
    if (argsCnt < 2) {
        if (argsCnt == 0) {
            this.host = '127.0.0.1';
            this.port = '8080';
        } else if (argsCnt == 1) {
            if (_.isString(arguments[0])) {
                this.host = arguments[0];
                this.port = '8080';
            } else if (_.isNumber(arguments[0])) {
                this.port = arguments[0];
                this.host = '127.0.0.1';
            } else {
                throw new TypeError("invalid args,you must be specify a number(port) and a string(host)");
            }
        }
    } else {
        if (_.isNumber(host) && _.isString(port)) {
            this.host = port;
            this.port = host;
        } else {
            if (!_.isNumber(port) && _.isString(host)) {
                throw new TypeError("invalid args,you must be specify a number(port) and a string(host)");
            } else {
                this.host = host;
                this.port = port;
            }
        }
    }

    if(!FileUtil.isExists(path)){
        try{
            FileUtil.createDirectory(path);
        }catch(e){
            console.error(e.message);
        }finally {

        }
    }


    var viewPath = Path.join(path,'/views');
    this.routePath  = Path.join(path,"/routes");
    var publicPath = Path.join(path,"/public");
    var staticPath = Path.join(path,'/static');

    var imagesPath = Path.join(path,"/public/images");
    var jsPath = Path.join(path,"/public/javascripts");
    var stylePath = Path.join(path,"/public/stylesheets");
    
    FileUtil.createDirectory(viewPath);
    FileUtil.createDirectory(this.routePath);
    FileUtil.createDirectory(publicPath);
    FileUtil.createDirectory(staticPath);
    FileUtil.createDirectory(imagesPath);
    FileUtil.createDirectory(jsPath);
    FileUtil.createDirectory(stylePath);
    
    var jsTemplate = FileUtil.readSync(Path.join(__dirname,"/template.js"));
    FileUtil.writeSync(Path.join(this.routePath,"/index.js"),jsTemplate);
    
    var viewTemplate = FileUtil.readSync(Path.join(__dirname,'/template.ejs'));
    FileUtil.writeSync(Path.join(viewPath,"/index.ejs"),viewTemplate);

    var cssTemplate = FileUtil.readSync(Path.join(__dirname,'/template.css'));
    FileUtil.writeSync(Path.join(stylePath,"/style.css"),cssTemplate);

    this.path = path;
    this.app = Express();
};
Util.inherits(ExpressPlugin,EventEmitter);

ExpressPlugin.prototype.loadRoutes = function(routePath){
    var routesFiles = FileUtil.traverseSync(routePath);
    var self = this;
    routesFiles.forEach(function(f){
        var extraPath = f.path.replace(routePath,"");
        var route = require(f.path);
        var routeName = extraPath.replace('.js',"");
        self.app.use(routeName, route);
    });
};

ExpressPlugin.prototype.start = function () {
    var self = this;
    Http.createServer(this.app).listen(this.port, function () {
        self.emit('ready');
    });

    self.on('ready',function(){

        self.app.set('views', Path.join(self.path, 'views'));
        self.app.set('view engine', "ejs");
        self.app.use(MorganLogger('dev'));
        self.app.use(BodyParser.json());
        self.app.use(BodyParser.urlencoded({extended: false}));
        self.app.use(CookieParser());

        self.app.use(Session({
            secret: 'express-secret',
            cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}, // 30 days
            name: 'expressSecret'
        }));

        self.loadRoutes(self.routePath);

        self.app.use(Express.static(Path.join(this.path, 'public')));
        self.app.use(Express.static(Path.join(this.path, 'static')));

        self.app.use(function (req, res, next) {
            var url = req.originalUrl;
            if (url == '/login') {
                if (req.session && req.session.user) {
                    return res.redirect("/index");
                } else {
                    return next(null);
                }
            }
            if (!req.session || !req.session.user) {

                if (url.indexOf("checksum_client") != -1 || url.indexOf("checksum_client") != -1) {
                    next(null);
                } else {
                    res.redirect("/login");
                }

            } else {
                next();
            }
        });

        self.app.use(function (req, res) {
            res.statusCode = 404;
            res.end();
        });

        if (self.app.get('env') == 'development') {
            process.on('uncaughtException', function (err) {
                console.error(' Caught exception: ', err.stack, ' error: ', err);
                process.exit(1);
            });
        }
    });
};

var d = new ExpressPlugin('localhost',9095,Path.join(__dirname,"../../../expressTest"));
d.start();
