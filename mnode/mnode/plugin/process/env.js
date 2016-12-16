/**
 * Created by 郑金玮 on 2016/12/16.
 */
var cluster = require("cluster");
var ProcessPool = require("./app");
var Settings = require("./settings");

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

    Object.keys(cluster.workers).forEach(function (id) {
        cluster.workers[id].on('message', function (msg) {
            //console.log("master get msg from worker" + id, msg);
            //cluster.workers[id].send(msg)
            if (msg['mode'] && msg['pid'] && msg['id']) {
                pool.add(msg.pid, msg.mode, msg.id);
                console.log(msg);
            }
        });
    });
} else {
    process.on('message', function (msg) {
        console.log('[worker] worker' + cluster.worker.id + ' received msg:' + msg);
        //process.send(msg);
    });

    if (cluster.worker.id <= Settings.task) {
        //task 进程
        process.send({mode: 'task', pid: process.pid,id:cluster.worker.id});
    } else if (cluster.worker.id > Settings.task && cluster.worker.id <= Settings.task + Settings.worker) {
        //worker进程
        process.send({mode: 'worker', pid: process.pid,id:cluster.worker.id});
    } else {
        //reactor 进程
        process.send({mode: 'reactor', pid: process.pid,id:cluster.worker.id});
    }
}