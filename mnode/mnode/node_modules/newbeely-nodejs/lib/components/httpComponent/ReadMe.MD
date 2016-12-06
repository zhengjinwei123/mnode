#简介
    源生的 node js http模块的包装组件,一般用于http api服务.

#配置
   config/services.json

    {
        "YourName":{
            "bean":"httpComponent","host":"localhost","port":29000,"ssl":false,"protocol":"","method":"get|post"
        }
    }
    编写后在项目根目录内创建 app/YourName文件夹, 然后在YourName内创建 context.json 文件 和 get & post 文件夹
   
   context.json
   
    { "name":"YourName","beans":[] }
    
   工具生成
    
    npm install newbeely-nodejs -g
    newbeely init
    
    ...
    
    {input 1:YourName}
    
   参数详解
   
    YourName: 自定义组件名称 这个名称可以在工程内任意地方使用 Bearcat.getBean('application').getComponent('YourName') 获得到组件对象.
    bean:必须指定为 httpComponent
    host:socket监听的主机地址 可以为 0.0.0.0 127.0.0.1 localhost
    port:socket监听的端口号
    ssl:是否使用openssl协议 false or { pem:"pem",cert:"cert" } 后者证书需要放在 app/YourName目录内
    protocol:协议 可选协议 base64 zip rc4 配置格式为 base64|zip|rc4
    method:http协议支持的类型 get post 对应的路由文件夹放置在 app/YourName/get & app/YourName/post 内
    
#路由编码
   
   路由位置 
    
    app/YourName/get & app/YourName/post 目录内 对应的http协议get访问 app/YourName/get文件夹内的脚本 post同理.
   
   路由规范
   
    在app/YourName/get目录内创建js脚本文件 文件名为http url的一个路由节点 例如 hello.js 服务编码完成后即可访问 http://localhost:port/hello
   代码规范实例:
    
    var Bearcat = require('bearcat');
    module.exports = function () {
        return Bearcat.getBean({
            id: "YourName-get-hello",
            func: Hello
        });
    }
    function Hello(){}
    
    /// 规范的一级路由 上面所述的 http://localhost:port/hello 的逻辑处理方法
    Hello.prototype.handle = function (msg, next) {
        console.log(msg);
        next(null,"hello");
    }
    
    /// 规范的二级路由 实例: http://localhost:port/hello/world
    Hello.prototype.world = function (msg, next){
        console.log(msg);
        next(null,"hello world.");
    }
   Message详解
   
    {
        httpVersion:"",
        route:"",
        method:"",
        statusCode:"",
        headers:"",
        params:{},
        body:{},
        remoteAddress:""
    }
    params: http url 中传递的参数列表(已转化为JSON object) 例如 http://localhost:port/hello?param1=1&param2=2 转化后的 params={"param1":"1","param2":2}
    body: http协议的消息体 推荐使用json object 可以使用 protocol 内的加密协议加密压缩
    
   消息返回函数 next
   
    第一个参数为错误内容 一旦有错误内容 客户端会收到一个 http status code 为 error.status 的值(默认500).
    第二个参数为消息内容 内容会自动按照 protocol协议的逆顺序加密或压缩 加密完成后response给客户端. 完成后连接断开.