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
            if (msg['mode'] && msg['pid'] && msg['id']) {
                pool.add(msg.mode, msg.pid, msg.id, cluster.workers[id]);
            } else if (Parser.task(msg)) {
                pool.sendTask(cluster, msg);
            }
        });
    });
} else {
    process.on('message', function (msg) {
        console.log('[worker] worker' + cluster.worker.id + ' received msg:' + msg);

        if (Parser.task(msg)) {
            var e = Util.format("%s(%s)", msg['func'], JSON.stringify(msg['args']));
            Task(e);
        }
    });

    if (cluster.worker.id <= Settings.task) {
        //task 进程
        process.send({mode: 'task', pid: process.pid, id: cluster.worker.id});

    } else if (cluster.worker.id > Settings.task && cluster.worker.id <= Settings.task + Settings.worker) {
        //worker进程
        process.send({mode: 'worker', pid: process.pid, id: cluster.worker.id});

        require("./worker");
    } else {
        //reactor 进程
        process.send({mode: 'reactor', pid: process.pid, id: cluster.worker.id});
    }

    setTimeout(function () {
        process.send({
            func: 'calcV',
            args: [1, 2, 3]
        });
    }, 1000)
}