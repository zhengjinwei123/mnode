/**
 * Created by zhengjinwei on 2017/1/16.
 * mysql-redis 缓存 模型化插件
 * 解决操作mysql的复杂度和速率，利用redis作为缓存，redis定时落地到mysql
 */
var XmlParser = require("../../utils/xml-parser/app");
var FileUtil = require("../../utils/file-utils/app");

var mysqlRedisCache = function (xmlPath) {
    if (FileUtil.isFile(xmlPath)) {
        throw new Error(xmlPath + " file not exits");
    }
    this.xmlPath = xmlPath;

    this.genDBCode();
};

mysqlRedisCache.prototype.genDBCode = function () {
    XmlParser(this.xmlPath, function (err, results) {
        
    });
};



