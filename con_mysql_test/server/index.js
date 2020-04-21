const consql=require('./../tools/sqlconn');
const express=require('express');
const app=express();
const redis=require('redis');
const opredis=require('./../tools/op_redis');
app.use(express.json());

//api接口测试
app.get('/api',function(req,res){
    res.send({result:1,message:'成功获取到了服务器的响应'});
});

//mysql,注册，响应object,成功返回1，失败返回0
app.post('/api/register',function(req,res){
        var conn=consql.ConMysql('test');
        conn.query('insert into users set ?',{
                name:req.body.username,
                psd:req.body.psd
        },function(error,result,fields){
                if(error){
                        res.send({result:0,message:'注册失败',detail:error});
                }else{
                        res.send({result:1,message:'注册成功',detail:result});
                        console.log('add user success');
                }
        })
        conn.end();
})

//mysql,登录，响应object,失败返回0和-1，成功返回1
app.post('/api/login',function(req,res){
        var conn=consql.ConMysql('test');
        conn.query(`select name from users where name='${req.body.username}' and psd='${req.body.psd}';`
                ,function(error,result,fields){
                if(error){
                        res.send({result:-1,message:'服务出错',detail:error});
                }else{
                        if(result==''){

                                res.send({result:0,message:'用户名和密码错误'});
                        }else{
                                res.send({result:1,message:'用户名和密码正确'});
                        }
                }
        })
        conn.end();
})

//mysql,响应object,获取游记失败0，成功1
app.get('/api/tripslist/:userid/:start/:end',async function(req,res){
        let conn=consql.ConMysql('test');
        let sql=`select * from tuniu where 1=1 limit ${req.params.start},${req.params.end};`
        console.log(sql);
        conn.query(sql
        ,async function(error,result,fields){
                if(error){
                        res.send({result:0,message:'获取游记列表失败',detail:error});
                }else{
                        client=opredis.newClient();
                        for(var i=0;i<req.params.end-req.params.start;i++){
                                await opredis.ifLike(req.params.userid,result[i].id).then((res)=>{    
                                        console.log(res);
                                        if(res){
                                                result[i].iflike=true;
                                        }else{
                                                result[i].iflike=false;
                                        }
                                }).catch(err=>{
                                        console.log(err);
                                });

                        }
                        client.quit();
                        res.send({result:1,message:'获取游记列表成功',data:result});
                        console.log('get tripslist success');
                }
        })
        conn.end();
 
})

//添加喜欢
app.post('/api/addlike',function(req,res){
        let client=opredis.newClient();
        client.sadd(req.body.userid+'_like',req.body.tripid);
        client.quit();
        res.send({result:1,message:'游记'+req.body.tripid+'已经添加到'+req.body.userid+'_like'})
})

//mysql,响应object,搜索游记，失败0，成功1
app.get('/api/search/:text/:start/:end',function(req,res){
        let conn=consql.ConMysql('test');
        let sql=`select* from tuniu where name like '%${req.params.text}%' limit ${req.params.start},${req.params.end};`
        console.log(sql);
        conn.query(sql
        ,function(error,result,fields){
                if(error){
                        res.send({result:0,message:'查询失败',detail:error});
                }else{
                        res.send({result:1,message:'查询成功',data:result});
                        console.log('successed search trips');
                }
        })
        conn.end();
})

//往redis写入用户浏览历史
app.post('/api/user_history',function(req,res){
        let client=opredis.newClient();
        client.lrem(req.body.userid,0,req.body.tripid,redis.print);
        client.lpush(req.body.userid,req.body.tripid,redis.print);
        client.lrem(req.body.userid,0,100);
        client.quit();
        res.send({result:1,message:'浏览历史载入成功'});
})

//从redis中获取用户浏览历史
app.get('/api/historylist/:id/:start/:end',async function(req,res){
        let historylist=await opredis.gethistory(req.params.id,req.params.start,req.params.end);
        res.send({result:1,message:'浏览历史获取成功',data:historylist});
})

//监听端口3000
app.listen(3000,function(err){
        if(err){
            console.log(err);
            return;
        }
        console.log('serve done in 3000')
    });
