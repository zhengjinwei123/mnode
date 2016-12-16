/**
 * Created by zhengjinwei on 2016/12/16.
 */
function Parser() {
    return {
        tasking: function (msg) {
            return (msg['func'] && msg['args'] && msg['senderid']);
        },
        tasked: function (msg) {
            return (msg['senderid'] && msg['ret']);
        },
        initPool:function(msg){
            return (msg['mode'] && msg['pid'] && msg['id']);
        }
    }
};

module.exports = Parser();