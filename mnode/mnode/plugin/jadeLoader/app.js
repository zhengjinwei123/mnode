/**
 * Created by 郑金玮 on 2016/11/30.
 * email: 2538698032@qq.com
 * jadeLoader 热数据存储器
 */
var ArrayUtils = require("../../utils/app").Array;
var Singleton = require("../../utils/app").Singleton;
var FileUtils = require("../../utils/app").File;
var Path = require("path");
var Fs = require("fs");
var EventEmitter = require("events").EventEmitter;
var Util = require("util");
var TimerUtils = require("../../utils/app").Timer;
var Async = require("async");

function JadeLoader() {
    EventEmitter.call(this);
    this.userKey = "user-doc-" + (new Date().getTime());
    process.on("uncaughtException", function (err) {
        console.error("hehe:", err.stack);
        process.exit(1);
    });
}

Util.inherits(JadeLoader, EventEmitter);

JadeLoader.prototype.init = function (rootPath, hot, hotSecond, callback) {
    if (!Fs.existsSync(rootPath)) {
        throw new Error("JadeLoader::init" + rootPath + " is not a valid directory");
    }

    var _hot = hot ? hot : false;
    this.hotSecond = 1000 * (hotSecond ? hotSecond : (6 * 60));//6分钟
    this.mapList = [];

    var fileList = FileUtils.traverseSync(rootPath);

    var self = this;
    for (var i in fileList) {
        if (fileList[i].ext && fileList[i].name.toLowerCase() == "jadecontext.json") {
            try {
                var fileName = fileList[i].path;
                var content = JSON.parse(FileUtils.readSync(fileName));
                if (content['scan-dir'] == undefined) {
                    continue;
                }
                if (content['scan-dir'] == true) {
                    var dirName = Path.join(fileName, "../");
                    var _dirFileList = FileUtils.traverseSync(dirName);

                    var _pList = dirName.split(/[/|\\]/);
                    var $pK = _pList[_pList.length - 2];//获取 父文件夹名称
                    _dirFileList.forEach(function (f) {
                        if (f.name.toLowerCase() == "app.js") {
                            var _p = f.path;
                            var _T = _p.split("/");
                            var _lastDirName = _T[_T.length - 2];
                            var _lastDirPath = Path.join(_p, "../");

                            if (dirName != _lastDirPath) {
                                var cacheName = Path.resolve(_p);
                                cacheName = cacheName.replace(/\\/g, '/');

                                if (!self.mapList[$pK]) {
                                    self.mapList[$pK] = [];
                                }
                                self.mapList[$pK][_lastDirName] = {
                                    'hot': _hot,
                                    'app': require(cacheName),
                                    'path': cacheName,
                                    'key': _lastDirName,
                                    'parentKey': $pK
                                };
                            }
                        }
                    });
                } else {
                    var _scanList = content['scan-dir-list'];
                    var _curFileDir = Path.join(fileName, "../");//当前文件所属文件夹
                    var _pList = _curFileDir.split(/[/|\\]/);
                    var $pK = _pList[_pList.length - 2];

                    _scanList.forEach(function (o) {
                        var _dirName = o['dir-name'];
                        var _appName = o['app-name'];
                        var _isHot = o['hot'];

                        if (_hot == false && _isHot) {
                            _hot = _isHot;
                        }

                        var _moduleFilePath = Path.join(_curFileDir, "/", _dirName, "/", _appName);
                        _moduleFilePath = Path.resolve(_moduleFilePath);
                        var _cache = _moduleFilePath.replace(/\\/g, "/");

                        if (!Fs.existsSync(_cache)) {
                            throw new Error("_moduleFilePath:" + _cache + "not exists");
                        }

                        if (!self.mapList[$pK]) {
                            self.mapList[$pK] = [];
                        }

                        var _m = require(_cache);
                        self.mapList[$pK][_dirName] = {
                            'hot': _isHot,
                            'app': _m,
                            'path': _cache,
                            'key': _dirName,
                            'parentKey': $pK
                        };

                    });
                }
            } catch (e) {
                throw new Error("JadeLoader::init " + fileList[i].file + " is not a valid file" + e.message);
            }
        }
    }

    if (_hot) {
        setInterval(function () {
            self.hotLoad();
        }, self.hotSecond);
    }
    callback();
};

JadeLoader.prototype.hotLoad = function () {
    Singleton.getDemon(TimerUtils);
    this.emit("hotLoad", "hotLoad module start.");
    var self = this;
    Async.each(this.mapList, function (itemList, callback) {
        Async.each(itemList, function (item, cb) {
            var _hot = item.hot;
            if (!_hot) {
                cb(null);
            }
            var _path = item.path;
            var _key = item.key;
            var _pKey = item.parentKey;

            if (_pKey == self.userKey) {
                cb(null);
            }

            if (!Fs.existsSync(_path)) {
                cb("JadeLoader::hotLoad," + _path + " is not exists");
            }
            delete require.cache[_path];
            self.mapList[_pKey][_key].app = require(_path);
            cb(null);
        }, function (err, resp) {
            callback(err);
        });
    }, function (err, resp) {
        if (err) {
            self.emit("error", "hotLoad module error," + err);
        } else {
            self.emit("hotLoad", "hotLoad module finish,cost " + Singleton.getDemon(TimerUtils).end() + " milliSecond");
        }
    });
};


JadeLoader.prototype.Jader = function (pKey) {
    if (!arguments[0]) {
        pKey = this.userKey;
    }
    if (this.mapList[pKey]) {
        this.pKey = pKey;
    } else {
        this.emit("error", "JadeLoader::Jader " + pKey + " is invalid");
    }
    return this;
};

/**
 * 用这个方法导出模块对应的对象 当然要确保你需要的是一个对象
 * @param key
 * @returns {*}
 */
JadeLoader.prototype.getInstance = function (key) {
    var _module = this.get(key);
    if (_module) {
        return Singleton.getDemon(_module);
    }
    return null;
};

/**
 * 导出你需要的模块
 * @param key
 * @returns {*}
 */
JadeLoader.prototype.get = function (key) {
    if (this.pKey) {
        if (this.mapList[this.pKey][key]) {
            var tKey = this.pKey;
            this.pKey = null;
            if (tKey == this.userKey) {
                return this.mapList[tKey][key];
            } else {
                return this.mapList[tKey][key].app;
            }
        }
    } else {
        if (this.mapList[this.userKey]) {
            if (this.mapList[this.userKey][key]) {
                return this.mapList[this.userKey][key];
            }
        }
        this.emit("error", "JadeLoader::Jader,please call Jader(pKey).get(key)");
    }
    return null;
};

JadeLoader.prototype.set = function (key, doc) {
    if (!this.mapList[this.userKey]) {
        this.mapList[this.userKey] = [];
    }
    this.mapList[this.userKey][key] = doc;
};

module.exports = Singleton.getInstance(JadeLoader);