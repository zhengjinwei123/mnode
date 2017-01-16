/**
 * Created by zhengjinwei on 2017/1/16.
 */
var ParseString = require('xml2js').parseString;
var Iconv = require('iconv-lite');


//用于解决xml中的注释不合法导致解析出错的bug
function prettyXml(xml) {
    xml = xml.replace(/<!--(.*?)-->/g, "");
    return xml;
}

function parse(xmlFilePath, callback) {
    var mainProtoXml = FileUtil.readSync(xmlFilePath, 'binary');
    var buf = new Buffer(mainProtoXml, 'binary');
    var str = Iconv.decode(buf, 'GBK');
    ParseString(prettyXml(str), {explicitArray: false, ignoreAttrs: false}, function (err, result) {
        if (!err) {
            callback(null, result);
        } else {
            callback(err);
        }
    });
}

module.exports = parse;