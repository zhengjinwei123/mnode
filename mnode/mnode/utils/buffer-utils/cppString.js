/**
 * Created by 郑金玮 on 2016/12/16.
 */
var _ = require("lodash");
function CppString(str, len) {
    if (!_.isString(str)) {
        throw new Error("str must be a string value");
    }
    if (!_.isNumber()) {
        throw new Error("len must be a number value");
    }
    if (len <= 0) {
        throw new Error("len is invalid");
    }
    this.str = "";
    if (str.length > len - 1) {
        this.str = str.slice(0, len - 1);
    } else {
        this.str = str;
    }
    this.str += "\0";

    this.byteLen = len;
    this.buffer = new Buffer(this.byteLen);
    this.length = this.buffer.length;

    this.process();
}

CppString.prototype.toString = function (encoding) {
    return this.buffer.toString(encoding || 'utf-8');
};

CppString.prototype.getLength = function () {
    return this.buffer.length;
};

CppString.prototype.process = function () {
    this.buffer.fill(0);
    this.buffer.write(this.str);
};

module.exports = CppString;