CREATE DATABASE IF NOT EXISTS `jade_db` character set utf8 collate utf8_general_ci;
USE `jade_db`-- ------------------ 
-- 用户表
-- ------------------
CREATE TABLE IF NOT EXISTS `t_user` (
	`roleid` bigint(20) AUTO_INCREMENT COMMENT '唯一ID',
	`rolename` varchar(32) COMMENT '玩家名',
	`create_tm` int(10) NOT NULL DEFAULT 0 COMMENT '创建时间',
	`serverid` int(10) NOT NULL DEFAULT 0 COMMENT '服ID',
	`channelid` int(8) NOT NULL DEFAULT 0 COMMENT '渠道ID',
	`lastupdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
	PRIMARY KEY (roleid),
	KEY `inx_rolename`(`rolename`) USING BTREE,
	UNIQUE KEY `uni_serverid_channelid`(`serverid`,`channelid`) USING BTREE
)ENGINE=InnoDB AUTO_INCREMENT=1 ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8 DEFAULT CHARSET=latin1;

-- ------------------ 
-- 用户表1
-- ------------------
CREATE TABLE IF NOT EXISTS `t_user1` (
	`roleid` bigint(20) COMMENT '唯一ID',
	`rolename` varchar(32) COMMENT '玩家名',
	`create_tm` int(10) NOT NULL DEFAULT 0 COMMENT '创建时间',
	`serverid` int(10) NOT NULL DEFAULT 0 COMMENT '服ID',
	`channelid` int(8) NOT NULL DEFAULT 0 COMMENT '渠道ID',
	`lastupdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
	PRIMARY KEY (roleid),
	KEY `inx_rolename`(`rolename`) USING BTREE,
	UNIQUE KEY `uni_serverid_channelid`(`serverid`,`channelid`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ------------------ 
-- 用户表
-- ------------------
CREATE TABLE IF NOT EXISTS `t1_user` (
	`roleid` bigint(20) COMMENT '唯一ID',
	`rolename` varchar(32) COMMENT '玩家名',
	`create_tm` int(10) NOT NULL DEFAULT 0 COMMENT '创建时间',
	`serverid` int(10) NOT NULL DEFAULT 0 COMMENT '服ID',
	`channelid` int(8) NOT NULL DEFAULT 0 COMMENT '渠道ID',
	`lastupdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
	PRIMARY KEY (roleid),
	KEY `inx_rolename`(`rolename`) USING BTREE,
	UNIQUE KEY `uni_serverid_channelid`(`serverid`,`channelid`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ------------------ 
-- 用户表1
-- ------------------
CREATE TABLE IF NOT EXISTS `t1_user1` (
	`roleid` bigint(20) COMMENT '唯一ID',
	`rolename` varchar(32) COMMENT '玩家名',
	`create_tm` int(10) NOT NULL DEFAULT 0 COMMENT '创建时间',
	`serverid` int(10) NOT NULL DEFAULT 0 COMMENT '服ID',
	`channelid` int(8) NOT NULL DEFAULT 0 COMMENT '渠道ID',
	`lastupdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
	PRIMARY KEY (roleid),
	KEY `inx_rolename`(`rolename`) USING BTREE,
	UNIQUE KEY `uni_serverid_channelid`(`serverid`,`channelid`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=latin1;

