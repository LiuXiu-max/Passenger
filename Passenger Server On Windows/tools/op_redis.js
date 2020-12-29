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
function getlike(id){
        let client=redis.createClient(6379,'127.0.0.1');
        return new Promise((resolve,reject)=>{
                client.smembers(id,function(err,data){
                        if(err){
                                    reject(err);
                        }else{
                                resolve(data);
                        }
                })
                client.quit();
        })
    }

function gettaglist(id){
        let client=redis.createClient(6379,'127.0.0.1');
        return new Promise((resolve,reject)=>{
                client.zrange('triptag_'+id,0,-1,'withscores',function(err,data){
                        if(err){
                                    reject(err);
                        }else{
                                resolve(data);
                        }
                })
                client.quit();
        })
    }


    function getusertaglist(id){
        let client=redis.createClient(6379,'127.0.0.1');
        return new Promise((resolve,reject)=>{
                client.zrange('usertag_'+id,0,-1,'withscores',function(err,data){
                        if(err){
                                    reject(err);
                        }else{
                                resolve(data);
                        }
                })
                client.quit();
        })
    }
    function getrecommendlist(id,start,end){
        let client=redis.createClient(6379,'127.0.0.1');
        return new Promise((resolve,reject)=>{
                client.zrevrange('recommend_'+id,start,end,function(err,data){
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
           //res.send({result:0,message:'redis连接失败',detail:error});
            console.log(err);
    });
    return client;
}
module.exports={
        getrecommendlist,
        getusertaglist,
        gettaglist,
        gethistory,
        newClient,
        ifLike,
        getlike
}