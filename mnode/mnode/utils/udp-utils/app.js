/**
 * Created by 郑金玮 on 2016/12/13.
 */
var CppNum = require("../app").Buffer.CppNum;
var CppString = require("./app").Buffer.CppString;
var Dgram = require("dgram");

function UdpClient(host, port) {
    this.listBuffer = new Array();

    this.length = 0;

    this.port = port || "127.0.0.1";
    this.host = host || 9092;
}

UdpClient.prototype.push_uint8 = function (value) {
    var uint8Value = new CppNum(value, "uint8");
    this.listBuffer.push(uint8Value.buffer);
    this.length += uint8Value.byteLen;
};
UdpClient.prototype.push_int8 = function (value) {
    var int8Value = new CppNum(value, "int8");
    this.listBuffer.push(int8Value.buffer);
    this.length += int8Value.byteLen;
};
UdpClient.prototype.push_uint16 = function (value) {
    var uint16Value = new CppNum(value, "uint16");
    this.listBuffer.push(uint16Value.buffer);
    this.length += uint16Value.byteLen;
};
UdpClient.prototype.push_int16 = function (value) {
    var int16Value = new CppNum(value, "int16");
    this.listBuffer.push(int16Value.buffer);
    this.length += int16Value.byteLen;
};
UdpClient.prototype.push_uint32 = function (value) {
    var uint32Value = new CppNum(value, "uint32");
    this.listBuffer.push(uint32Value.buffer);
    this.length += uint32Value.byteLen;
};
UdpClient.prototype.push_int32 = function (value) {
    var int32Value = new CppNum(value, "int32");
    this.listBuffer.push(int32Value.buffer);
    this.length += int32Value.byteLen;
};

UdpClient.prototype.push_string = function (strValue, len) {
    var strValue = new CppString(strValue, len);
    this.listBuffer.push(strValue.buffer);
    this.length += strValue.byteLen;
};

UdpClient.prototype.push_char = function (strValue) {
    var strValue = new CppString(strValue, 2);
    this.listBuffer.push(strValue.buffer);
    this.length += strValue.byteLen;
};

UdpClient.prototype.send = function (str) {
    if (this.listBuffer.length > 0) {
        var socket = Dgram.createSocket("udp4");
        socket.bind(function () {
            socket.setBroadcast(true);
        });
        var buffer = Buffer.concat(this.listBuffer);
        socket.send(buffer, 0, this.length, this.port, this.host, function (err, bytes) {
            socket.close();
        });
    } else {
        if (str != undefined) {
            var socket = Dgram.createSocket("udp4");
            socket.bind(function () {
                socket.setBroadcast(true);
            });
            var buffer = new Buffer(str.toString());
            this.length = buffer.length;
            socket.send(buffer, 0, this.length, this.port, this.host, function (err, bytes) {
                socket.close();
            });
        }
    }
};

module.exports = UdpClient;