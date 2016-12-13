/**
 * Created by 郑金玮 on 2016/12/1.
 */
var Fs = require("fs");
var Path = require("path");
var _ = require("lodash");

function FileUtils() {

}

FileUtils.getInstance = (function () {
    var _inst = null;
    return function () {
        if (_inst instanceof FileUtils) {
            return _inst;
        }
        _inst = new FileUtils();
        return _inst;
    }
})();

FileUtils.prototype.readSync = function (filePath, code) {
    var _content = null;
    var _code = (code == undefined) ? "utf-8" : code;
    try {
        _content = Fs.readFileSync(filePath, _code);
    } catch (e) {
        throw new Error(__filename, e.message);
    }
    return _content;
};
FileUtils.prototype.readAsync = function (filePath, code, cb) {
    var _code = null;
    if (_.isFunction(code)) {
        cb = code;
        _code = "utf-8";
    } else {
        _code = (code == undefined) ? "utf-8" : code;
    }
    Fs.readFile(filePath, _code, function (err, buf) {
        cb(err, buf);
    });
};

FileUtils.prototype.writeAsync = function (filePath, text, cb) {
    Fs.writeFile(filePath, text, function (err) {
        cb(err);
    });
};

FileUtils.prototype.writeSync = function (filePath, text) {
    var err = null;
    try {
        err = Fs.writeFileSync(filePath, text);
    } catch (e) {
        throw new Error(e.message);
    }
    return err;
};

FileUtils.prototype.isDirectory = function (path) {
    if (!this.isExists(path)) {
        throw new Error(path + " not exists");
    }
    var states = Fs.statSync(path);
    return states.isDirectory();
};

FileUtils.prototype.isExists = function (path) {
    return Fs.existsSync(path);
};

//文件变动时间
FileUtils.prototype.mtime = function (path) {
    if (!this.isFile(path)) {
        throw new Error(path + " is not a file");
    }
    var stat = Fs.statSync(path);
    return stat.mtime;
};

FileUtils.prototype.isFile = function (path) {
    if (!this.isExists(path)) {
        throw new Error(path + " not exists");
    }
    var states = Fs.statSync(path);
    return !states.isDirectory();
};

FileUtils.prototype.createDirectory = function (dirPath) {
    if (!Fs.existsSync(dirPath)) {
        Fs.mkdirSync(dirPath);
    }
};
FileUtils.prototype.createFile = function (filePathName) {
    if (!Fs.existsSync(filePathName)) {
        Fs.mkdirSync(filePathName);
    }
};


FileUtils.prototype.traverseSync = function (dirPath) {
    var filesList = [];

    var getExt = function (fileName) {
        var fileList = fileName.split(".");
        return fileList[fileList.length - 1];
    };

    var getFileRawName = function (fileName) {
        var fileList = fileName.split(".");
        return fileList[fileList.length - 2];
    };

    function readFile(path, filesList) {
        var files = Fs.readdirSync(path);
        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];
            var states = Fs.statSync(path + '/' + file);
            if (states.isDirectory()) {
                readFile(path + '/' + file, filesList);
            } else {
                filesList.push({
                    mtime: states.mtime,
                    size: states.size,
                    name: file,
                    path: path + '/' + file,
                    ext: getExt(file),
                    rawName: getFileRawName(file)
                });
            }
        }
    }

    readFile(dirPath, filesList);
    //console.log(filesList);
    return filesList;
};

module.exports = FileUtils.getInstance();
