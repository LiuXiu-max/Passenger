var mysql=require('mysql');
function ConMysql(database) {
    var connection=mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'1234',
        database:database,
        multipleStatements: true
    })
    return connection;
}
module.exports={
    ConMysql
}