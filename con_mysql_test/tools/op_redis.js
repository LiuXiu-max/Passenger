const redis=require('redis');
function gethistory(id,start,end){
    let client=redis.createClient(6379,'127.0.0.1');
    return new Promise((resolve,reject)=>{
            client.lrange(id,start,end,function(err,data){
                    if(err){
                                reject(err);
                    }else{
                            resolve(data);
                    }
            })
            client.quit();
    })
}
function ifLike(userid,tripid){
        let client=redis.createClient(6379,'127.0.0.1');
        return new Promise((resolve,reject)=>{
                client.sismember(userid+'_like',tripid,function(err,data){
                        if(err){
                                reject(err);
                                client.quit();
                        }else{
                                resolve(data);
                                client.quit();
                        }
                })
                
        })
    }
function newClient(){
    let client=redis.createClient(6379,'127.0.0.1');
    client.on('error',function(err){
            res.send({result:0,message:'redis连接失败',detail:error});
            console.log('redis连接出错');
    });
    return client;
}
module.exports={
    gethistory,
    newClient,
    ifLike
}