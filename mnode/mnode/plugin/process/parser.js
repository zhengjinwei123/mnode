/**
 * Created by zhengjinwei on 2016/12/16.
 */
function Parser() {
    return {
        task: function (msg) {
            return (msg['func'] && msg['args']);
        }
    }
};

module.exports = Parser();