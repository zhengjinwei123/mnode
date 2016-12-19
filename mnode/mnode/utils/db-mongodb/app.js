/**
 * Created by 郑金玮 on 2016/12/13.
 */
var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
var poolModule = require('generic-pool');
var Util = require("util");
var Emitter = require("events").EventEmitter;
var FileUtil = require("../file-utils/app");
var Path = require("path");
var _ = require("lodash");

var MongodbUtil = function (host, port, db, userOption, runPath) {
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

    this.runPath = runPath || Path.join(__dirname, "/schemas");

    var _error = null;
    try {
        if (!FileUtil.isExists(this.runPath)) {
            FileUtil.createDirectory(this.runPath);
            var templateContent = FileUtil.readSync(Path.join(__dirname, "/template.js"));
            FileUtil.writeSync(Path.join(this.runPath, "/demon.js"), templateContent);
        }
    } catch (e) {
        _error = e.message;
    } finally {
        if (_error) {
            console.error(_error);
            process.exit(1);
        }
    }

    var self = this;
    self.connected = false;
    this.pool = poolModule.Pool({
        name: 'mongoose',
        create: function (callback) {
            var conn = Mongoose.createConnection(self.dbUrl);
            conn.on('error', function (error) {
                callback(error);
            });

            conn.once('connected', function () {
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

    this.exec(function (err, client, release) {
        if (err) {
            self.emit("error", err);
        } else {
            self.emit("connect", {port: this.port, host: this.host});

            self.runList = {};
            self.modelName = null;
            self.loadSchema();

            release();
        }
    });
};

Util.inherits(MongodbUtil,Emitter);

MongodbUtil.prototype.loadSchema = function () {
    var schemaFileList = FileUtil.traverseSync(this.runPath);

    var self = this;
    schemaFileList.forEach(function (f) {
        var scheme = require(f.path);
        if (scheme['table'] && scheme['schema']) {
            self.runList[scheme.table] = self.runList[scheme.table] || scheme.schema;
        }
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

MongodbUtil.prototype.schema = function (modelName) {
    if (this.runList[modelName]) {
        this.modelName = modelName;
        return this;
    } else {
        throw new Error(modelName + " is not undefine");
    }
};

MongodbUtil.prototype.model = function (callback) {
    if (this.modelName == null) {
        callback("please call schema method first");
    } else {
        var self = this;
        this.exec(function (err, client, release) {
            if (!err) {
                callback(null, client.model(self.modelName, self.runList[self.modelName]), release);
            } else {
                callback(err);
            }
        });
    }
};

module.exports = MongodbUtil;

