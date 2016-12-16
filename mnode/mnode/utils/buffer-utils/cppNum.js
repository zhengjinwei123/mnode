/**
 * Created 郑金玮 on 2016/12/16.
 */
function CppNum(num, intType, endianType) {
    this.num = num;

    this.buffer = null;
    this.value = null;
    this.numArray = null;
    this.byteLen = null;
    this.intType = intType;

    var validEndians = ['B', 'b', 'L', 'l'];
    this.endianType = (validEndians.indexOf(endianType) == -1) ? 'L' : endianType.toUpperCase();

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
        case 'int64':
            this.numArray = [0];
            this.byteLen = 8;
            break;
        default:
            break;
    }
    this.process();
}

CppNum.prototype.toString = function (encoding) {
    if (this.buffer == null) {
        throw new Error("buffer is null");
    }
    return this.buffer.toString(encoding || 'utf8');
};

CppNum.prototype.toInteger = function (encoding, radix) {
    if (radix < 2 || radix > 36) {
        throw new Error("radix must be between 2 to 36");
    }
    return parseInt(this.toString(encoding), radix || 16)
};

CppNum.prototype.process = function () {
    this.value = this.numArray[0];
    this.buffer = new Buffer(this.byteLen);
    this.buffer.fill(0);//clear all the buffer

    if (this.endianType == 'L') {
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
            case 'int64':
                const MAX_UINT32 = 0xFFFFFFFF;
                const big = ~~(this.num / MAX_UINT32);
                const low = (this.num % MAX_UINT32) - big;
                this.buffer.writeUInt32BE(big, 0);
                this.buffer.writeUInt32BE(low, 4);
                //console.log(parseInt(this.buffer.toString('hex'), 16))
                break;
            default:
                break;
        }
    } else {
        switch (this.intType) {
            case "uint8"://uint8
                this.buffer.writeUInt8(this.value, 0);//little endian （按小端对齐）
                break;
            case "uint16"://uint16
                this.buffer.writeUInt16BE(this.value, 0);//little endian （按小端对齐）
                break;
            case "uint32"://uint32
                this.buffer.writeUInt32BE(this.value, 0);//little endian （按小端对齐）
                break;
            case "int8"://int8
                this.buffer.writeInt8(this.value, 0);//little endian （按小端对齐）
                break;
            case "int16"://int16
                this.buffer.writeInt16BE(this.value, 0);//little endian （按小端对齐）
                break;
            case "int32"://int32
                this.buffer.writeInt32BE(this.value, 0);//little endian （按小端对齐）
                break;
            case 'int64':
                const _MAX_UINT32 = 0xFFFFFFFF;
                const _big = ~~(this.num / _MAX_UINT32);
                const _low = (this.num % _MAX_UINT32) - _big;
                this.buffer.writeUInt32BE(_big, 0);
                this.buffer.writeUInt32BE(_low, 4);
                break;
            default:
                break;
        }
    }

    //console.log(parseInt(this.toInteger('hex',16)))
};


//var d = new CppNum(20000,'int8');


module.exports = CppNum;