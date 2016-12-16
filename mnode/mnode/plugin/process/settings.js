/**
 * Created by 郑金玮 on 2016/12/16.
 * 多进程配置
 */
module.exports = {
    task: 2,//任务进程
    worker: 4,//工作进程
    reactor: 2//维护连接的进程,不是服务不会启用
};