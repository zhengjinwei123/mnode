/**
 * Created by zhengjinwei on 2017/5/8.
 */
var Nodemailer = require("nodemailer");
var SmtpTransport = require('nodemailer-smtp-transport');
var _ = require("lodash");

function EmailUtil(options) {
    options = options || {};

    this.mailOptions = {
        from: "jade <2538698032@qq.com>", // 发件地址
        to: "2538698032@qq.com", // 收件列表
        subject: "Hello world", // 标题
        html: "<b>thanks a for visiting!</b> 世界，你好！", // html 内容
        attachments: []  // [{filename:'',path:""},{filename:"",path:""}] //附件
    };
    this.mailOptions = _.extend(this.mailOptions, options);
}

EmailUtil.prototype.sendQQ = function (account, password, callback) {
    // 开启一个 SMTP 连接池
    var transport = Nodemailer.createTransport(SmtpTransport({
        service: 'QQ',
        host: "smtp.qq.com", // 主机
        secure: true, // 使用 SSL
        port: 465, // SMTP 端口
        auth: {
            user: account, // 账号 如：123@qq.com
            pass: password // 密码
        }
    }));

    transport.sendMail(this.mailOptions, function (error, response) {
        transport.close(); // 如果没用，关闭连接池
        callback(error, response);
    });
};

module.exports = EmailUtil;