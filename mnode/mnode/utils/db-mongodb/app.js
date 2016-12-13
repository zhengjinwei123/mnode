/**
 * Created by 郑金玮 on 2016/12/13.
 */
var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
var poolModule = require('generic-pool');
var Util = require("util");
var Emitter = require("events").EventEmitter;

var MongodbUtil = function (host, port, db, userOption) {
    Emitter.call(this);

    this.host = host || '127.0.0.1';
    this.port = port || 27017;
    this.db = db;
    this.dbUrl = null;

    if (userOption == undefined) {
        this.dbUrl = Util.format("mongodb://%s:%d/%s", this.host, this.port, db);
    } else {
        if (userOption['user'] && userOption['password']) {
            this.dbUrl = Util.format("mongodb://%s:%s@%s:%d/%s", userOption.user, userOption.password, this.host, this.port, db);
        }
    }

    if (this.dbUrl == null) {
        throw new Error("args error");
    }

    var self = this;
    self.connected = false;
    this.pool = poolModule.Pool({
        name: 'mongoose',
        create: function (callback) {
            //var server_options = {'auto_reconnect': false, poolSize: 1};
            var conn = Mongoose.createConnection(self.dbUrl);
            conn.on('error', function (error) {
                console.error(error);
                callback(error);
            });

            conn.once('connected', function () {
                // console.log(connected);
                callback(null, conn);
            });

            conn.on('disconnected', function () {
                console.error('disconnected');
            });
        },
        destroy: function (db) {
            db.close();
        },
        max: 20,
        idleTimeoutMillis: 30000,
        log: false
    });
};

MongodbUtil.prototype.exec = function (callback) {
    var self = this;
    this.pool.acquire(function (err, client) {
        var release = function () {
            self.pool.release(client);
        };
        if (!err) {
            callback(null, client, release);
        } else {
            release();
            callback(err.stack);
        }
    }, 0);
};

MongodbUtil.prototype.model = function (schemeTable, modelName, callback) {
    // if (!this.connected) {
    //     throw new Error("db lose connect");
    // }
    var SchemaOption = {};
    var Schema = new Mongoose.Schema(schemeTable, SchemaOption);
    this.exec(function (err, client, release) {
        if (!err) {
            callback(null, client.model(modelName, Schema), release);
        } else {
            callback(err);
        }
    });
};


module.exports = MongodbUtil;


/*****
 * 测试用例
 */
var d = new MongodbUtil("localhost", 27017, 'mydb');

var t = {
    name: {type: String},
    age: {type: Number}
};
d.model(t, 'student', function (err, model, release) {
    console.log(err);
    model.find().exec(function(err,doc){
        console.log(err,doc);
        release();
    });
});