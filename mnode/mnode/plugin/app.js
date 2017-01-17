/**
 * Created by 郑金玮 on 2016/12/1.
 */
module.exports = {
    "JadeLoader": require("./jadeLoader/app"),
    "HttpServer": require("./http/app"),
    "WSServer": require("./websocket/app"),
    "UdpServer": require("./udp/app"),
    "TcpServer": require("./tcp/app"),
    "MysqlRedisCache": require("./mysqlRedisCache/app")
};