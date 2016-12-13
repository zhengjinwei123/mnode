/**
 * Created by 郑金玮 on 2016/12/13.
 */
function cppString(str, len) {

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

cppString.prototype.toString = function () {
    return this.buffer.toString();
}

cppString.prototype.getLength = function () {
    return this.buffer.length;
};

cppString.prototype.process = function () {
    this.buffer.fill(0);
    this.buffer.write(this.str);
    /*for(var i=this.str.length;i < this.buffer.length;i++){
     this.buffer[i] = 0x00;
     }*/
};


function cppNum(num, intType) {

    this.num = num;

    this.buffer = null;
    this.value = null;
    this.numArray = null;
    this.byteLen = null;
    this.intType = intType;

    switch (this.intType) {
        case "uint8":
            this.numArray = new Uint8Array([num]);
            this.byteLen = 1;
            break;
        case "uint16":
            this.numArray = new Uint16Array([num]);
            this.byteLen = 2;
            break;
        case "uint32":
            this.numArray = new Uint32Array([num]);
            this.byteLen = 4;
            break;
        case "int8":
            this.numArray = new Int8Array([num]);
            this.byteLen = 1;
            break;
        case "int16":
            this.numArray = new Int16Array([num]);
            this.byteLen = 2;
            break;
        case "int32":
            this.numArray = new Int32Array([num]);
            this.byteLen = 4;
            break;
        default:
            break;
    }
    this.process();
}


cppNum.prototype.process = function () {

    this.value = this.numArray[0];
    this.buffer = new Buffer(this.byteLen);
    this.buffer.fill(0);//clear all the buffer

    switch (this.intType) {
        case "uint8"://uint8
            this.buffer.writeUInt8(this.value, 0);//little endian （按小端对齐）
            break;
        case "uint16"://uint16
            this.buffer.writeUInt16LE(this.value, 0);//little endian （按小端对齐）
            break;
        case "uint32"://uint32
            this.buffer.writeUInt32LE(this.value, 0);//little endian （按小端对齐）
            break;
        case "int8"://int8
            this.buffer.writeInt8(this.value, 0);//little endian （按小端对齐）
            break;
        case "int16"://int16
            this.buffer.writeInt16LE(this.value, 0);//little endian （按小端对齐）
            break;
        case "int32"://int32
            this.buffer.writeInt32LE(this.value, 0);//little endian （按小端对齐）
            break;
        default:
            break;
    }
};

module.exports = {
    cppNum: cppNum,
    cppString: cppString
};


