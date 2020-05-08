const consql=require('./../tools/sqlconn');
const express=require('express');
const app=express();
const redis=require('redis');
const opredis=require('./../tools/op_redis');
const multer=require('multer');
const fs=require('fs');
const path=require('path');
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

//获取封面图片
app.get('/api/tripimages/:id/:index',function(req,res){
                console.log('发送'+__dirname+'\\tripimages\\'+req.params.id+'\\tripimage_'+req.params.index+'.jpg')
                res.sendFile(__dirname+'\\tripimages\\'+req.params.id+'\\tripimage_'+req.params.index+'.jpg');
                //console.log('发送'+__dirname+'\\tripimages\\'+req.params.id+'\\tripimage_0');//url: '/demoimage?timg2.png',

})

///上传图片
app.post('/api/tripimages',multer({
        dest:'tripimages'
}).array('file',9),function(req,res,next){
        console.log('接收图片');
        let files=req.files;
        //console.log(files);
        fs.exists("tripimages\\"+req.body.tripid,function(exists){
        console.log('创建目录');
        if(!exists){
                fs.mkdir("tripimages\\"+req.body.tripid,function(err){
                        if (err) {
                                return console.error(err);
                                }
                                else{
                                var newName = 'tripimages\\' +req.body.tripid+'\\'+'tripImage_'+req.body.index+ '.jpg';  
                                console.log(newName);
                                fs.rename(req.files[0].path, newName, function(err){
                                        if (err){
                                        res.send("upload  err");
                                        console.log(err)
                                        }else{
                                        res.send("uploade success");
                                        console.log('success')
                                        }
                                });
                        }
                        
                })
        }else{
                var newName = 'tripimages\\' +req.body.tripid+'\\'+'tripImage_'+req.body.index+ '.jpg';  
                console.log(newName);
                fs.rename(req.files[0].path, newName, function(err){
                        if (err){
                        res.send("upload  err");
                        console.log(err)
                        }else{
                        res.send("uploade success");
                        console.log('success')
                        }
                });

        }
        })

});

//添加游记
app.post('/api/addtrips',function(req,res){
        let conn=consql.ConMysql('test');
        //INSERT INTO insert_table (datetime, uid, content, type) VALUES (‘1’, ‘userid_1’, ‘content_1’, 1);
        let sql=`insert into trips (name,authorId,viewCount,likeCount,commentCount,publishTime,picUrl,authorName,authorHeadImg,picNum) VALUES('${req.body.name}','${req.body.authorId}','1','0','0','${req.body.publishTime}','${req.body.picUrl}','${req.body.authorName}','${req.body.authorHeadImg}','${req.body.picNum}') ;`
        console.log(sql);
        conn.query(sql
        ,async function(error,result,fields){
                if(error){
                        res.send({result:0,message:'插入游记失败',detail:error});
                }else{
                        res.send({result:1,message:'获取游记列表成功',data:result});
                        console.log('get tripslist success');
                }
        })
        conn.end();
 
})

//更新游记封面
app.post('/api/updatetrip',function(req,res){
        var conn=consql.ConMysql('test');
        conn.query(`update trips set picUrl='${req.body.picUrl}' where id='${req.body.id}';`
                ,function(error,result,fields){
                if(error){
                        res.send({result:0,message:'服务出错',detail:error});
                }else{
                        res.send({result:1,message:'更新游记封面'});
                        }
                
        })
        conn.end();
})


//mysql,登录，响应object,失败返回0和-1，成功返回1
app.post('/api/login',function(req,res){
        var conn=consql.ConMysql('test');
        conn.query(`select id from users where name='${req.body.username}' and psd='${req.body.psd}';`
                ,function(error,result,fields){
                if(error){
                        res.send({result:-1,message:'服务出错',detail:error});
                }else{
                        if(result==''){

                                res.send({result:0,message:'用户名和密码错误'});
                        }else{
                                res.send({result:1,message:'用户名和密码正确',data:result[0].id});
                        }
                }
        })
        conn.end();
})

//获取游记,失败0，成功1
app.get('/api/tripslist/:userid/:start/:end',async function(req,res){
        let conn=consql.ConMysql('test');
        let sql=`select * from trips where 1=1 limit ${req.params.start},${req.params.end};`
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

//获取用户自己的游记,失败0，成功1
app.get('/api/selftrips/:userid/:start/:end',async function(req,res){
        let conn=consql.ConMysql('test');
        let sql=`select * from trips where authorId='${req.params.userid}' limit ${req.params.start},${req.params.end};`
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
        client.sadd(req.body.userid+'_like',req.body.tripid,function(err,data){
                if(err){
                        console.log('喜欢添加失败');
                        res.send(err);
                }else{
                        console.log('喜欢添加成功');
                        res.send({result:1,message:'游记'+req.body.tripid+'已经添加到'+req.body.userid+'_like'});
                }
        });
        client.quit();    
})

//添加usertag
app.post('/api/addusertag',async function(req,res){
        let client=opredis.newClient();
        let taglist=await opredis.gettaglist(req.body.tripid);
        console.log(taglist);
        for(var i=0;i<taglist.length-1;i=i+2){
                client.zincrby('usertag_'+req.body.userid,1,taglist[i],function(err,data){
                        if(err){
                                console.log(err)
                        }else{
                                console.log(data)
                        }
                })
        }
        client.quit();    
})

//删除usertag
app.post('/api/delusertag',async function(req,res){
        let client=opredis.newClient();
        let taglist=await opredis.gettaglist(req.body.tripid);
        console.log(taglist);
        for(var i=0;i<taglist.length-1;i=i+2){
                client.zincrby('usertag_'+req.body.userid,-1,taglist[i],function(err,data){
                        if(err){
                                console.log(err)
                        }else{
                                console.log(data)
                        }
                })
        }
        client.quit();    
})

//查看usertag
app.post('/api/getusertag',function(req,res){

        let client=opredis.newClient();
        client.zrange('usertag_'+req.body.userid,0,-1,'withscores',function(err,data){
                if(err){
                        console.log(err)
                }else{
                        console.log(data)
                }
        })
})

//获取推荐列表
app.post('/api/getrecommendlist',async function(req,res){
        let getrecommendlist=await opredis.getrecommendlist(req.body.userid,req.body.start,req.body.end);
        let conn=consql.ConMysql('test');
        console.log(getrecommendlist);
        let sql=`select* from trips where id in (${getrecommendlist});`
        console.log(sql);
        conn.query(sql
        ,function(error,result,fields){
                if(error){
                        res.send({result:0,message:'推荐列表获取失败',detail:error});
                }else{
                        res.send({result:1,message:'推荐列表获取成功',data:result});
                        console.log('successed get recommendlist');
                }
        })
        conn.end();

})

//删除喜欢
app.post('/api/dellike',function(req,res){
        let client=opredis.newClient();
        client.srem(req.body.userid+'_like',req.body.tripid,function(err,data){
                if(err){
                        console.log(err);
                }else{
                        console.log(data);
                        res.send({result:1,message:'游记'+req.body.tripid+'已经从'+req.body.userid+'_like中删除'})
                }
        });
        client.quit();
        
})

//喜欢列表
app.post('/api/likelist/:start/:end',async function(req,res){
        let historylist=await opredis.getlike(req.body.id+'_like');
        let conn=consql.ConMysql('test');
        let sql=`select* from trips where id in (${historylist}) limit ${req.params.start},${req.params.end};`
        console.log(sql);
        conn.query(sql
        ,function(error,result,fields){
                if(error){
                        res.send({result:0,message:'喜欢列表获取失败',detail:error});
                }else{
                        res.send({result:1,message:'喜欢列表获取成功',data:result});
                        console.log('successed get like tripslist');
                }
        })
        conn.end();
        
})


//mysql,响应object,搜索游记，失败0，成功1
app.get('/api/search/:text/:start/:end',function(req,res){
        let conn=consql.ConMysql('test');
        let sql=`select* from trips where name like '%${req.params.text}%' limit ${req.params.start},${req.params.end};`
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

//mysql,响应object,按日期搜索游记,获取游记失败0，成功1
app.get('/api/searchbydate/:userid/:text/:start/:end',async function(req,res){
        let conn=consql.ConMysql('test');
        //select* from trips where name like '%游%' order by publishTime desc limit 0,5;
        let sql=`select * from trips where name like '%${req.params.text}%' order by publishTime desc limit ${req.params.start},${req.params.end};`
        console.log(sql);
        conn.query(sql
        ,async function(error,result,fields){
                if(error){
                        res.send({result:0,message:'获取游记列表失败',detail:error});
                }else if(result==''){
                        res.send({result:0,message:'游记列表为空'});
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

//mysql,响应object,按受欢迎程度搜索游记,获取游记失败0，成功1
app.get('/api/searchbylike/:userid/:text/:start/:end',async function(req,res){
        let conn=consql.ConMysql('test');
        //select id,name,likeCount from trips where name like '%游%' order by likeCount+0 desc limit 0,5;
        let sql=`select * from trips where name like '%${req.params.text}%' order by likeCount+0 desc limit ${req.params.start},${req.params.end};`
        console.log(sql);
        conn.query(sql
        ,async function(error,result,fields){
                if(error){
                        res.send({result:0,message:'获取游记列表失败',detail:error});
                }else if(result==''){
                        res.send({result:0,message:'游记列表为空'});
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

//mysql,响应object,按浏览量搜索游记,获取游记失败0，成功1
app.get('/api/searchbyview/:userid/:text/:start/:end',async function(req,res){
        let conn=consql.ConMysql('test');
        //select id,name,viewCount from trips where name like '%游%' order by viewCount+0 desc limit 0,5;
        let sql=`select * from trips where name like '%${req.params.text}%' order by viewCount+0 desc limit ${req.params.start},${req.params.end};`
        console.log(sql);
        conn.query(sql
        ,async function(error,result,fields){
                if(error){
                        res.send({result:0,message:'获取游记列表失败',detail:error});
                }else if(result==''){
                        res.send({result:0,message:'游记列表为空'});
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
        let historylist=await opredis.gethistory('history_'+req.params.id,req.params.start,req.params.end);
        let conn=consql.ConMysql('test');
         let sql=`select* from trips where id in (${historylist}) limit ${req.params.start},${req.params.end};`
        console.log(sql);
        conn.query(sql
        ,function(error,result,fields){
                if(error){
                        res.send({result:0,message:'浏览历史获取失败',detail:error});
                }else{
                        res.send({result:1,message:'浏览历史获取成功',data:result});
                        console.log('successed search history tripslist');
                }
        })
        conn.end();
})

//添加test
app.post('/api/addtest',function(req,res){
        let client=opredis.newClient();
        client.zadd(req.body.userid+'_test',req.body.arr,function(err,data){
                if(err){
                        console.log('添加失败');
                        res.send(err);
                }else{
                        console.log('添加成功');
                        res.send({result:1,message:'游记'+req.body.arr+'已经添加到'+req.body.userid+'_like'});
                }
        });
        client.quit();    
})
//监听端口3000
app.listen(3000,function(err){
        if(err){
            console.log(err);
            return;
        }
        console.log('serve done in 3000')
    });
