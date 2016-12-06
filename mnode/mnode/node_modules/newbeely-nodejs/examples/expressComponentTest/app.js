var App = require('../../newbeely'),
    Express = require("express"),
    Bearcat = require('bearcat');

App.start(__dirname, function () {
    var expressComponent = Bearcat.getBean("application").getComponent('express-service');
    var express = expressComponent.express;
    express.use(function (req, res) {
        res.statusCode = 200;
        res.send("Hello newbeely from expressComponent!");
    });
});