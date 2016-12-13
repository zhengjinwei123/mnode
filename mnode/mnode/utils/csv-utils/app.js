/**
 * Created by 郑金玮 on 2016/12/5.
 */
var FileUtil = require("../file-utils/app");
var _ = require("lodash");

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
    var fileNameL = filePath.split(".");

    this.dataList = {};

    var content = FileUtil.readSync(filePath);
    var parseContent = content.split("\r\n");
    if (parseContent.length >= 2) {
        var t = parseContent.splice(parseContent.length - 1, 1);//去掉最后一行，因为最后一行无效
        var del = parseContent.splice(0, 2);//去掉前两行，第一行是说明，第二行是键名
        var keyStr = del[1];
        var keyList = keyStr.split(",");

        //按照键来处理数据
        if (key != undefined && _.isString(key)) {
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

                for (var j = 0, jLen = valList.length; j < jLen; ++j) {
                    this.dataList[valList[kIndex]] = this.dataList[valList[kIndex]] || {};
                    this.dataList[valList[kIndex]][keyList[j]] = this.dataList[valList[kIndex]][keyList[j]] || valList[j];
                }
            }
        } else {
            //没有键,直接转换为数组
            this.dataList = [];
            for (var i = 0, len = parseContent.length; i < len; ++i) {
                var valList = parseContent[i].split(",");
                var _rowData = {};
                for (var j = 0, jLen = valList.length; j < jLen; ++j) {
                    _rowData[keyList[j]] = _rowData[keyList[j]] || valList[j];
                }
                this.dataList.push(_rowData);
            }
        }
    } else {
        throw new Error("csv file content is null");
    }

    FileUtil.writeSync(fileNameL[0] + ".json", JSON.stringify(this.dataList));
};


module.exports = CsvFileUtil.getInstance();