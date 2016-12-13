/**
 * Created by 郑金玮 on 2016/12/13.
 */

var Client = require('ftp');
var _ = require("lodash");
var FileUtil = require("../app").File;
var Fs = require('fs');

var FtpUtil = function (options) {
    this.options = {
        "host": "ftp.cdn.qcloud.com",
        "user": "your-username",
        "password": "your-password"
    };
    _.extend(this.options, options);
};

FtpUtil.prototype.download = function (remotePath, localPathDir, fileName, callback) {
    if (!FileUtil.isDirectory(localPathDir)) {
        throw new Error("localPathDir must be a valid directory");
    }
    var _error = null;
    var _data = null;
    try {
        var c = new Client();
        c.connect(this.options);

        c.on('ready', function () {
            c.get(remotePath, function (err, stream) {
                if (err) {
                    c.end();
                    _error = err;
                } else {
                    stream.once('close', function () {
                        _data = FileUtil.readSync(localPathDir + "/" + fileName, 'utf-8');
                        c.end();
                    });
                    stream.pipe(Fs.createWriteStream(localPathDir + "/" + fileName));
                }
            });
        });
    } catch (e) {
        _error = e.message;
    } finally {
        callback(_error, _data);
    }
};

FtpUtil.prototype.upload = function (remotePath, localFilePath, callback) {
    if (!FileUtil.isFile(localFilePath)) {
        throw new Error("localFilePath must be a valid file path");
    }

    var _error = null;
    try {
        var c = new Client();
        c.connect(this.options);

        c.on('ready', function () {
            c.mkdir(remotePath, true, function (err) {
                if (!err) {
                    c.put(localFilePath, remotePath, function (err) {
                        c.end();
                        _error = err;
                    });
                } else {
                    c.end();
                    _error = err;
                }
            })
        });
    } catch (e) {
        _error = e.message;
    } finally {
        callback(_error);
    }
};

module.exports = FtpUtil;