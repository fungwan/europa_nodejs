/**
 * Created by fengyun on 2014/12/17.
 */
//about Mysql database
exports.slave1Config = {
    connectionLimit : 10000,
    host            : '121.40.188.109',
    user            : 'root',
    password        : '123123',
    database        :'teacher_platform_d1',
    port            : 3306
};

exports.slave2Config = {
    connectionLimit : 10000,
    host            : '127.0.0.1',
    user            : 'root',
    password        : '123123',
    database        :'teacher_platform_d1',
    port            : 3306
};