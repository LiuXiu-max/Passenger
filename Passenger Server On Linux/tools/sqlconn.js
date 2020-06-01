var mysql=require('mysql');
function ConMysql(database) {
    var connection=mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'@LiuKunKun123456',
        database:database,
        multipleStatements: true
    })
    return connection;
}
module.exports={
    ConMysql
}