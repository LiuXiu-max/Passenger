var mysql=require('mysql');
function QueryMysql(sqlcode,database) {
    var connection=mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'1234',
        database:database
    })
    connection.connect();
    connection.query(sqlcode,function(error,result,fields){
        if(error){
            console.log(error);
        }else{

            console.log(result);
        }
    });
    connection.end();
}
function InsertMysql(sqlcode,item,database) {
    var errornum=0;
    var connection=mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'1234',
        database:database
    })
    connection.connect();
    connection.query(sqlcode,item,function(error,result,fields){
        if(error){

            console.log(error);

    }
});
    connection.end();
    return errornum;
}
module.exports={
    QueryMysql,
    InsertMysql,
}