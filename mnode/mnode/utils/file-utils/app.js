/**
 * Created by zhengjinwei on 2016/12/1.
 */
var Fs = require("fs");
var Path = require("path");

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
    var _code = (code == undefined) ? "utf-8" : code;
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


FileUtils.prototype.traverseSync = function (dirPath, depth) {
    var filesList = [];
    var _curDepth = 0;
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
        files.forEach(walk);
        function walk(file) {
            var states = Fs.statSync(path + '/' + file);
            if (states.isDirectory()) {
                if (depth) {
                    if (_curDepth >= depth) {
                        _curDepth = 0;
                        return 0;
                    }
                    _curDepth++;
                    readFile(path + '/' + file, filesList);
                } else {
                    readFile(path + '/' + file, filesList);
                }
            }
            else {
                //var obj = new Object();
                //obj.size = states.size;
                //obj.name = file;
                //obj.path = path + '/' + file;

                filesList.push({
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
    return filesList;
};

module.exports = FileUtils.getInstance();
