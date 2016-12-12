/**
 * Created by 郑金玮 on 2016/12/5.
 */
var FileUtil = require("../file-utils/app");

var CsvFileUtil = function () {

};
CsvFileUtil.getInstance = (function () {
    var _inst = null;
    return function () {
        if (_inst instanceof CsvFileUtil) {
            return _inst;
        }
        _inst = new CsvFileUtil();
        return _inst;
    }
})();

CsvFileUtil.prototype.parse = function (filePath, key) {
    if (!FileUtil.isFile(filePath)) {
        throw new Error(filePath + " is not a valid file");
    }

    if (typeof key !== "string") {
        throw new Error(key + " must be string value");
    }

    var fileNameL = filePath.split(".");

    this.dataList = {};

    var content = FileUtil.readSync(filePath);
    var parseContent = content.split("\r\n");
    if (parseContent.length > 2) {
        parseContent.splice(parseContent.length - 1, 1);
        var del = parseContent.splice(0, 2);
        var keyStr = del[1];
        var keyList = keyStr.split(",");

        var kIsValid = false;
        var kIndex = 0;
        for (var i = 0, len = keyList.length; i < len; i++) {
            if (keyList[i] == key) {
                kIsValid = true;
                kIndex = i;
            }
        }
        if (!kIsValid) {
            throw new Error(key + " is not exists");
        }

        for (var i = 0, len = parseContent.length; i < len; ++i) {
            var valList = parseContent[i].split(",");

            //console.log(valList);
            for (var j = 0, jLen = valList.length; j < jLen; ++j) {
                //console.log(valList[j]);
                this.dataList[valList[kIndex]] = this.dataList[valList[kIndex]] || {};
                this.dataList[valList[kIndex]][keyList[j]] = this.dataList[valList[kIndex]][keyList[j]] || valList[j];
            }

        }
    }

    FileUtil.writeSync(fileNameL[0] + ".json", JSON.stringify(this.dataList));
};


module.exports = CsvFileUtil.getInstance();