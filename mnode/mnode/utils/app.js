/**
 * Created by 郑金玮 on 2016/11/30.
 */
module.exports = {
    "Singleton": require("./singleton-utils/app"),
    "Object": require("./obj-utils/app"),
    "File": require("./file-utils/app"),
    "Time": require("./time-utils/app"),
    "Timer": require("./timer-utils/app"),
    "WS": require("./websocket-client-utils/app"),
    "Http": require("./httpclient-utils/app"),
    "Mysql": require("./db-mysql/app"),
    "Redis": require("./db-redis/app"),
    "Encrypt": require("./encrypt-utils/app"),
    "Logger": require("./logger-utils/app"),
    "IP": require("./ip-utils/app"),
    "UdpClient": require("./udp-utils/app"),
    "Csv": require("./csv-utils/app"),
    "Ftp": require("./ftp-utils/app"),
    "Mongoose": require("./db-mongodb/app")
};

