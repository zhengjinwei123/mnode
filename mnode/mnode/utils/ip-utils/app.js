/**
 * Created by zhengjinwei on 2016/12/4.
 */

function IpUtils() {

}

IpUtils.getInstance = (function () {
    var _inst = null;
    return function () {
        if (_inst instanceof IpUtils) {
            return _inst;
        }
        _inst = new IpUtils();
        return _inst;
    }
})();


IpUtils.prototype.getClientIP = function (req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.headers['remote-host'] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket && req.connection.socket.remoteAddress) ||
        "";
    ip = ip.substring(ip.lastIndexOf(":") + 1, ip.length);
    return ip;
};

IpUtils.prototype.ipIp = function isIp(ipvalue) {
    return this.isIPv4(ipvalue) || this.isIPv6(ipvalue);
};


IpUtils.prototype.isIPv4 = function isIPv4(ipvalue) {
    var re = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    return re.test(ipvalue);
};


IpUtils.prototype.isIPv6 = function isIPv6(ipvalue) {
    return ipvalue.match(/:/g).length <= 7 && /::/.test(ipvalue) ? /^([\da-f]{1,4}(:|::)){1,6}[\da-f]{1,4}$/i.test(ipvalue) : /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i.test(ipvalue);
};

module.exports = IpUtils.getInstance();

