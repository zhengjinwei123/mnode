/**
 * Created by zhengjinwei on 2016/12/4.
 */

function HttpConnection() {

}

HttpConnection.getInstance = (function () {
    var _inst = null;
    return function () {
        if (_inst instanceof HttpConnection) {
            return _inst;
        }
        _inst = new HttpConnection();
        return _inst;
    }
})();

HttpConnection.prototype.send = function () {

};

module.exports = HttpConnection.getInstance();





