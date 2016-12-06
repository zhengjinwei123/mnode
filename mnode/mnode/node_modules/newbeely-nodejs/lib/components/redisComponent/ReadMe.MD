#简介
    redis数据库组件

#配置
   config/services.json

    {
        "YourName":{
            "bean":"redisComponent","host":"localhost","port":6379,"auth_pass":""
        }
    }
    编写后在项目根目录内创建 app/YourName文件夹, 然后在YourName内创建 context.json
   
   context.json
   
    { "name":"YourName","beans":[] }
    
   工具生成
    
    npm install newbeely-nodejs -g
    newbeely init
    
    ...
    
    {input 5:YourName}
    
   参数详解
   
    YourName: 自定义组件名称 这个名称可以在工程内任意地方使用 Bearcat.getBean('application').getComponent('YourName') 获得到组件对象.
    bean:必须指定为expressComponent
    host:数据库地址
    port:数据库服务端口号
    auth_pass:认证用户密码
    
#使用实例

   这个组件提供了两个外部接口 execute and command
   
    var redisComponent = Bearcat.getBean('application').getBean('YourName');
    redisComponent.execute(function (client, release) {
        client.set("test", "hello!", function (error, state) {
            console.log("redis set test:hello!", error, state);
            release();
            don();
        });
    });
    
    redisComponent.command('get', 'test', function (error, value) {
        console.log("redis command get test", value);
        done();
    });

#Bearcat的context.json的应用
    这个组件不像mongooseComponent提供了一个schemas文件夹 让用户可以直接编码数据库逻辑. 但是可以通过bearcat的context.json来配置一套这个流程.
    创建 app/YourName/dao-logic 文件夹
    修改 app/YourName/context.json
    
    { "name":"YourName","scan":'dao-logic' }
    
    上面这行代码生效后会自动加载 app/YourName/dao-logic/目录内的js脚本 当然这里的js脚本必须符合bearcat导出规则: 可以看下如下实例
    
    var Bearcat = require('bearcat');
    
    function Tools() {
    
    }
    
    Tools.prototype.getID = function (key, value, cb) {
        Bearcat.getBean('application').getComponent('YourName').command('set', key, value, cb);
    };
    
    Tools.prototype.check = function (key, cb) {
        Bearcat.getBean('application').getComponent('YourName').command('get', key, cb);
    };
    
    module.exports = {
        id: "redis-tools",
        func: Tools
    };
    
    完成以上代码后即可在任意位置使用 Bearcat.getBean(""redis-tools").getID()
    这样即可实现数据库提取逻辑统一代码规范化.