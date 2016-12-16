/**
 * Created by 郑金玮 on 2016/12/16.
 */
var cluster = require("cluster");
var ProcessPool = require("./pool");
var Settings = require("./settings");
var _ = require("lodash");
var Util = require('util');
var Task = require("./task");
var Parser = require("./parser");
var HttpServer = require("./worker");


if (cluster.isMaster) {
    var pool = ProcessPool.getInstance();

    for (var i = 0; i < Settings.task; i++) {
        cluster.fork();
    }

    for (var i = 0; i < Settings.worker; i++) {
        cluster.fork();
    }

    for (var i = 0; i < Settings.reactor; i++) {
        cluster.fork();
    }

    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });


    if (Settings.reactor > 0) {
        cluster.on('listening', function (worker, address) {
            //console.log("Worker " + worker.id + " is listening on " +
            //address.address + ":" + address.port);
        });
    }

    //cluster.setupMaster({exec: 'clusterr.js'});

    cluster.on('setup', function () {
        console.log("setup called");
    });

    Object.keys(cluster.workers).forEach(function (id) {
        cluster.workers[id].on('message', function (msg) {
            if (Parser.initPool(msg)) {
                pool.add(msg.mode, msg.pid, msg.id, cluster.workers[id]);
            } else if (Parser.tasking(msg)) {
                pool.sendTasking(cluster, msg);
                console.log("sendTasking:", msg);
            } else if (Parser.tasked(msg)) {
                pool.sendTasked(cluster.workers[msg.senderid], msg);
                console.log("sendTasked:", msg);
            }

            //console.log(msg);
        });
    });
} else {
    function onMessage() {
        process.on('message', function (msg) {
            console.log('[worker] worker' + cluster.worker.id + ' received msg:' + JSON.stringify(msg));

            if (Parser.tasking(msg)) {
                var e = Util.format("%s(%s)", msg['func'], JSON.stringify(msg['args']));
                var ret = Task(e);
                process.send({senderid: msg.senderid, ret: ret});
            }
        });
    }

    if (cluster.worker.id <= Settings.task) {
        //task 进程
        process.send({mode: 'task', pid: process.pid, id: cluster.worker.id});
        onMessage();
    } else if (cluster.worker.id > Settings.task && cluster.worker.id <= Settings.task + Settings.worker) {
        //worker进程
        process.send({mode: 'worker', pid: process.pid, id: cluster.worker.id});

        var hserver = new HttpServer(cluster.worker.id);

        process.on('message', function (msg) {
            console.log('[worker] worker' + cluster.worker.id + ' received msg:' + JSON.stringify(msg));

            if (Parser.tasking(msg)) {
                var e = Util.format("%s(%s)", msg['func'], JSON.stringify(msg['args']));
                var ret = Task(e);
                process.send({senderid: msg.senderid, ret: ret});
            }else{
                hserver.emit("return", msg);
            }
        });

    } else {
        //reactor 进程
        process.send({mode: 'reactor', pid: process.pid, id: cluster.worker.id});
        onMessage();
    }


}