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


var ExpressPlugin = function (host, port, path) {
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

    if (!FileUtil.isDirectory(path)) {
        throw new Error(path + " must be valid directory")
    }


    this.app = Express();
};

ExpressPlugin.prototype.start = function () {
    this.app.set('views', Path.join(this.path, 'views'));
    this.app.set('view engine', "ejs");
    this.app.use(MorganLogger('dev'));
    this.app.use(BodyParser.json());
    this.app.use(BodyParser.urlencoded({extended: false}));
    this.app.use(CookieParser());


    this.app.use(Session({
        secret: 'express-secret',
        cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}, // 30 days
        name: 'expressSecret'
    }));

    this.app.use(Express.static(Path.join(this.path, 'public')));
    this.app.use(Express.static(Path.join(this.path, 'staticFile')));

    this.app.use(function (req, res, next) {
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

    this.app.use(function (req, res) {
        res.statusCode = 404;
        res.end();
    });

    if (this.app.get('env') == 'development') {
        process.on('uncaughtException', function (err) {
            console.error(' Caught exception: ', err.stack, ' error: ', err);
            process.exit(1);
        });
    }
};