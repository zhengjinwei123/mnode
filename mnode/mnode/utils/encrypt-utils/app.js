/**
 *
 */

var Crypto = require('crypto');

/**
 * 加密解密类
 *
 * @class Encrypt
 * @constructor
 */
function Encrypt() {
    this.expired = 0;
}

Encrypt.getInstance = (function () {
    var _inst = null;
    return function () {
        if (_inst instanceof Encrypt) {
            return _inst;
        }
        _inst = new Encrypt();
        return _inst;
    }
})();

Encrypt.prototype.rc4Encode = function (buf, key, exp) {
    return Code(buf, 'ENCODE', key, exp || this.expired);
};

Encrypt.prototype.rc4Decode = function (buf, key) {
    return Code(buf, 'DECODE', key);
};


Encrypt.prototype.md5 = function (str, opt) {
    return MD5(str, opt);
};


Encrypt.prototype.sha1 = function (str, opt) {
    return SHA1(str, opt);
};


Encrypt.prototype.base64Encode = function (str) {
    return Base64Encode(str);
};

Encrypt.prototype.base64Decode = function (str) {
    return Base64Decode(str);
};

function Code(string, operation, key, expiry) {
    operation = operation || 'DECODE';
    key = key || 'ondae8dafbGfda0FDA';
    expiry = expiry || 30;

    // 采用 encodeURI 对字符编码
    string = encodeURI(string);

    // 时间取得
    var now = new Date().getTime() / 1000;
    // Unix 时间戳
    var timestamp = parseInt(now, 10);
    // 毫秒
    var seconds = (now - timestamp) + '';

    var fvzone_auth_key = '';
    var ckey_length = 4;
    key = MD5(key ? key : fvzone_auth_key);
    var keya = MD5(key.substr(0, 16));
    var keyb = MD5(key.substr(16, 16));
    var keyc = ckey_length ? (operation == 'DECODE' ? string.substr(0, ckey_length) : MD5(seconds).substr(-ckey_length)) : '';

    var cryptkey = keya + MD5(keya + keyc);

    if (operation == 'DECODE') {
        string = Base64Decode(string.substr(ckey_length));
    } else {
        string = (expiry ? timestamp + expiry : '0000000000') + MD5(string + keyb).substr(0, 16) + string;
    }

    // RC4 加密原始算法函数
    var result = RC4(cryptkey, string);

    if (operation == 'DECODE') {
        if ((result.substr(0, 10) == 0 || (result.substr(0, 10) - timestamp) > 0) && result.substr(10, 16) == MD5(result.substr(26) + keyb).substr(0, 16)) {
            // 对返回的结果使用 decodeURI 解码
            return decodeURI(result.substr(26));
        } else {
            return '';
        }
    } else {
        return (keyc + Base64Encode(result));
    }
}

function RC4(key, text) {
    var s = [];
    for (var i = 0; i < 256; i++) {
        s[i] = i;
    }
    var j = 0, x;
    for (i = 0; i < 256; i++) {
        j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
        x = s[i];
        s[i] = s[j];
        s[j] = x;
    }
    i = j = 0;
    var ct = [];
    for (var y = 0; y < text.length; y++) {
        i = (i + 1) % 256;
        j = (j + s[i]) % 256;
        x = s[i];
        s[i] = s[j];
        s[j] = x;
        ct.push(String.fromCharCode(text.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]));
    }
    return ct.join('');
}

function MD5(str, enc) {
    return Crypto.createHash('md5').update(str).digest(enc || 'hex');
}


function SHA1(str, enc) {
    return Crypto.createHash('sha1').update(str).digest(enc || 'hex');
}

function Base64Encode(str) {
    return new Buffer(str, 'utf8').toString('base64');
}

function Base64Decode(str) {
    return new Buffer(str, 'base64').toString('utf8');
}


Encrypt.prototype.AesEncode = function (str, key, autoPadding) {
    var cipher = Crypto.createCipheriv('aes-128-cbc', key.key, key.iv);
    if (autoPadding) {
        cipher.setAutoPadding(true);
        var bytes = [];
        bytes.push(cipher.update(str));
        bytes.push(cipher.final());
        return Buffer.concat(bytes);
    } else {
        function autoPaddingZero(data) {
            var error = null;
            var crypted = "";
            try {
                var cipher = Crypto.createCipheriv('aes-128-cbc', key.key, key.iv);
                cipher.setAutoPadding(false);
                crypted = cipher.update(data, 'utf8', 'binary');
                crypted += cipher.final('binary');
            } catch (ex) {
                error = ex.message;
            }
            return {
                error: error,
                data: Buffer.from(crypted, 'binary')
            }
        }

        var result = null;
        while (true) {
            var ret = autoPaddingZero(data);
            if (ret.error) {
                data += "\0";
            } else {
                result = ret.data;
                break;
            }
        }

        return result;
    }
};


Encrypt.prototype.AesDecode = function (str, key) {
    var decipher = Crypto.createDecipheriv('aes-128-cbc', key.key, key.iv);
    decipher.setAutoPadding(true);

    var retData = null;
    try {
        var bytes = [];
        bytes.push(decipher.update(str));
        bytes.push(decipher.final());
        retData = Buffer.concat(bytes);
    } catch (e) {
        console.error(e.message);
    }
    return retData;
};


module.exports = Encrypt.getInstance();
