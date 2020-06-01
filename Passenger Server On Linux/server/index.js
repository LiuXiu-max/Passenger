const consql=require('./../tools/sqlconn');
const express=require('express');
const app=express();
const redis=require('redis');
const opredis=require('./../tools/op_redis');
const multer=require('multer');
const fs=require('fs');
const  join = require('path').join;
const path=require('path');
const https = require("https");
var async = require("async");
app.use(express.json());

// Configuare https
const httpsOption = {
    key : fs.readFileSync("./https/2_www.liuxiu.xyz.key"),
    cert: fs.readFileSync("./https/1_www.liuxiu.xyz_bundle.crt")
}
app.get('/',(req,res)=>{
    res.send('hello')
})
app.get('/demoimage',function(req,res){
    
    for(var key in req.query)
    {
        res.sendFile(__dirname+'/demoimage'+'/'+key);
        console.log('发送'+__dirname+'/demoimage'+'/'+key);//url: '/demoimage?timg2.png',
    }
  
})
//api接口测试
app.get('/api',function(req,res){
    res.send({result:1,message:'成功获取到了服务器的响应'});
});

//mysql,注册，响应object,成功返回1，失败返回0
app.post('/api/register',function(req,res){
        var conn=consql.ConMysql('Passenger');
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
                console.log('发送'+__dirname+'/tripimages/'+req.params.id+'/tripImage_'+req.params.index+'.jpg')
                res.sendFile(__dirname+'/tripimages/'+req.params.id+'/tripImage_'+req.params.index+'.jpg');
               
})

///上传图片
app.post('/api/tripimages',multer({
        dest:'tripimages'
}).array('file',9),function(req,res,next){
        console.log('接收图片');
        let files=req.files;
        //console.log(files);
        fs.exists("tripimages/"+req.body.tripid,function(exists){
        console.log('创建目录');
        if(!exists){
                fs.mkdir("tripimages/"+req.body.tripid,function(err){
                        if (err) {
                                return console.error(err);
                                }
                                else{
                                var newName = 'tripimages/' +req.body.tripid+'/'+'tripImage_'+req.body.index+ '.jpg';  
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
                var newName = 'tripimages/' +req.body.tripid+'/'+'tripImage_'+req.body.index+ '.jpg';  
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

//获取图片地址数组
app.get('/api/imageurls/:tripId',function(req,res){
        let startPath=__dirname+'/tripimages/'+req.params.tripId;
        let result=[];
        if(fs.existsSync(startPath)){
                let files=fs.readdirSync(startPath);
                files.forEach((val,index) => {
                let fPath=join(startPath,val);
                let stats=fs.statSync(fPath);
                if(stats.isFile()) {
                        let imageurl='https://www.liuxiu.xyz/api/getimage/'+req.params.tripId+'/'+val;
                        result.push(imageurl);
                        };
                });
                res.send({result:1,message:'图片地址获取成功',data:result})
                //@url=http://localhost:3000/api/getimage/31281327/tripImage_0.jpg
        }else{
                res.send({result:0,message:'图片路径不存在，没有该游记的图片文件夹'})
        }
})

//获取一张图片
app.get('/api/getimage/:tripId/:tripName',function(req,res){
        let imagepath=__dirname+'/tripimages/'+req.params.tripId+'/'+req.params.tripName;
        res.sendFile(imagepath);
        console.log('发送图片'+imagepath);
})

//添加游记
app.post('/api/addtrips',function(req,res){
        let conn=consql.ConMysql('Passenger');
        //INSERT INTO insert_table (datetime, uid, content, type) VALUES (‘1’, ‘userid_1’, ‘content_1’, 1);
        let sql=`insert into trips (name,authorId,viewCount,likeCount,commentCount,publishTime,picUrl,authorName,authorHeadImg,picNum,sourse,summary) VALUES('${req.body.name}','${req.body.authorId}','1','0','0','${req.body.publishTime}','${req.body.picUrl}','${req.body.authorName}','${req.body.authorHeadImg}','${req.body.picNum}','${req.body.sourse}','${req.body.summary}') ;`
        console.log(sql);
        conn.query(sql
        ,function(error,result,fields){
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
        var conn=consql.ConMysql('Passenger');
        conn.query(`update trips set picUrl='${req.body.picUrl}' where id='${req.body.id}';`
                ,function(error,result,fields){
                if(error){
                        res.send({result:0,message:'服务出错',detail:error});
                }else{
                        res.send({result:1,message:'游记封面已更新'});
                        }
                
        })
        conn.end();
})

//mysql,登录，响应object,失败返回0和-1，成功返回1
app.post('/api/login',function(req,res){
        var conn=consql.ConMysql('Passenger');
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



app.get('/api/tripslist/:userid/:start/:end',function(req,res,next){
        let conn=consql.ConMysql('Passenger');
        let sql=`select * from trips where 1=1 limit ${req.params.start},${req.params.end};`
        console.log(sql);
        conn.query(sql,function(error,result,fields){
                if(error){
                        res.send({result:0,message:'获取游记列表失败',detail:error});
                }else{
                        req.data=result;
                        next();
                }
        })
        conn.end();
},async function(req,res){
        let result=req.data;
        client=opredis.newClient();
        for(var i=0;i<result.length;i++){
                await opredis.ifLike(req.params.userid,result[i].id).then((res)=>{    
                        console.log(res);
                        console.log(req.data[i]);
                        if(res){
                                result[i]['iflike']=true;
                        }else{
                                result[i]['iflike']=false;
                        }
                }).catch(err=>{
                        console.log(err);
                });

        }
        client.quit();
        res.send({result:1,message:'获取游记列表成功',data:result});
        console.log('get tripslist success');

})

//获取一条游记,失败0，成功1
app.get('/api/tripdetail/:userid/:tripid',async function(req,res){
        let conn=consql.ConMysql('Passenger');
        let sql=`select * from trips where id='${req.params.tripid}';`
        console.log(sql);
        conn.query(sql
        ,async function(error,result,fields){
                if(error){
                        res.send({result:0,message:'获取游记列表失败',detail:error});
                }else{
                        client=opredis.newClient();
                                await opredis.ifLike(req.params.userid,result[0].id).then((res)=>{    
                                        console.log(res);
                                        if(res){
                                                result[0].iflike=true;
                                        }else{
                                                result[0].iflike=false;
                                        }
                                }).catch(err=>{
                                        console.log(err);
                                });
                        client.quit();
                        res.send({result:1,message:'获取游记细节成功',data:result});
                        console.log('get tripdetail success');
                }
        })
        conn.end();
})

//获取用户自己的游记,失败0，成功1
app.get('/api/selftrips/:userid/:start/:end',async function(req,res){
        let conn=consql.ConMysql('Passenger');
        let sql=`select * from trips where authorId='${req.params.userid}' limit ${req.params.start},${req.params.end};`
        console.log(sql);
        conn.query(sql
        ,async function(error,result,fields){
                if(error){
                        res.send({result:0,message:'获取游记列表失败',detail:error});
                }else if(result==''){
                        res.send({result:0,message:'游记列表为空'});
                }else{
                        client=opredis.newClient();
                        console.log(result.length);
                        let length=result.length;
                        if(length>=req.params.end-req.params.start){
                                length=req.params.end-req.params.start;
                        }
                        for(var i=0;i<length;i++){
                                await opredis.ifLike(req.params.userid,result[i].id).then((res)=>{  
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

//添加usertag
app.post('/api/addusertag',async function(req,res){
        let client=opredis.newClient();
        let taglist=await opredis.gettaglist(req.body.tripid);
        console.log(taglist);
        for(var i=0;i<taglist.length-1;i=i+2){
                client.zincrby('usertag_'+req.body.userid,1,taglist[i],function(err,data){
                        if(err){
                                 console.log({result:0,message:'给用户添加标签失败',data:err});
                        }else{
                                  console.log({result:1,message:'给用户添加标签成功',data:data});
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
                                console.log({result:0,message:'给用户删除标签失败',data:err});
                        }else{
                                 console.log({result:1,message:'给用户删除标签成功',data:data});
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
        let conn=consql.ConMysql('Passenger');
        let sql=`select* from trips where id in (${getrecommendlist});`
        console.log(sql);
        conn.query(sql
        ,async function(error,result,fields){
                if(error){
                        res.send({result:0,message:'推荐列表获取失败',detail:error});
                }else{
                        client=opredis.newClient();
                        for(var i=0;i<result.length;i++){
                                await opredis.ifLike(req.body.userid,result[i].id).then((res)=>{    
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
                        res.send({result:1,message:'推荐列表获取成功',data:result});
                        console.log('successed get recommendlist');
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
        let conn=consql.ConMysql('Passenger');
        let sql=`select* from trips where id in (${historylist}) limit ${req.params.start},${req.params.end};`
        console.log(sql);
        conn.query(sql
        ,function(error,result,fields){
                if(error){
                        res.send({result:0,message:'喜欢列表获取失败',detail:error});
                }else{
                        for(var i=0;i<result.length;i++){
                                result[i].iflike=true;
                        }
                        res.send({result:1,message:'喜欢列表获取成功',data:result});
                        console.log('successed get like tripslist');
                }
        })
        conn.end();
})

//mysql,响应object,搜索游记，失败0，成功1
app.get('/api/search/:text/:start/:end',function(req,res){
        let conn=consql.ConMysql('Passenger');
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
        let conn=consql.ConMysql('Passenger');
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
                        for(var i=0;i<result.length;i++){
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
        let conn=consql.ConMysql('Passenger');
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
                        for(var i=0;i<result.length;i++){
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
        let conn=consql.ConMysql('Passenger');
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
                        for(var i=0;i<result.length;i++){
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
app.post('/api/scan_history',function(req,res){
        let client=opredis.newClient();
        client.lrem(req.body.userid+'_scan_history',0,req.body.tripid,redis.print);//删除原有的tripid,防止重复，count=0
        // count > 0 : 从表头开始向表尾搜索，移除与 VALUE 相等的元素，数量为 COUNT 。
        // count < 0 : 从表尾开始向表头搜索，移除与 VALUE 相等的元素，数量为 COUNT 的绝对值。
        // count = 0 : 移除表中所有与 VALUE 相等的值。
        client.lpush(req.body.userid+'_scan_history',req.body.tripid,redis.print);
        client.ltrim(req.body.userid+'_scan_history',0,100);//最多保留100个
        client.quit();
        res.send({result:1,message:'浏览历史载入成功'});
})

//从redis中获取用户浏览历史
app.get('/api/historylist/:id/:start/:end',async function(req,res){
        let historylist=await opredis.gethistory(req.params.id+'_scan_history',req.params.start,req.params.end);
        let conn=consql.ConMysql('Passenger');
         let sql=`select* from trips where id in (${historylist}) limit ${req.params.start},${req.params.end};`
        console.log(sql);
        conn.query(sql
        ,async function(error,result,fields){
                if(error){
                        res.send({result:0,message:'浏览历史获取失败',detail:error});
                }else if(result==''){
                        res.send({result:0,message:'浏览历史为空'});
                }else{
                        client=opredis.newClient();
                        for(var i=0;i<result.length;i++){
                                await opredis.ifLike(req.params.id,result[i].id).then((res)=>{    
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
                        res.send({result:1,message:'浏览历史获取成功',data:result});
                        console.log('successed get history trip list');
                }
        })
        conn.end();
})

//从redis中获取用户搜索历史
app.get('/api/get_search_history/:id',async function(req,res){
        let search_historylist=await opredis.gethistory(req.params.id+'_search_history',0,-1);
        res.send({result:1,message:'搜索历史获取成功',data:search_historylist})
})

//往redis写入用户搜索历史
app.post('/api/add_search_history',function(req,res){
        let client=opredis.newClient();
        client.lrem(req.body.userid+'_search_history',0,req.body.searchItem,redis.print);
        client.lpush(req.body.userid+'_search_history',req.body.searchItem,redis.print);
        client.ltrim(req.body.userid+'_search_history',0,4);
        client.quit();
        res.send({result:1,message:'搜索历史--'+req.body.searchItem+'--添加成功'});
})

//删除用户搜索历史
app.post('/api/del_search_history',function(req,res){
        let client=opredis.newClient();
        client.lrem(req.body.userid+'_search_history',0,req.body.searchItem,redis.print);
        client.quit();
        res.send({result:1,message:'搜索历史--'+req.body.searchItem+'--删除成功'});
})

//清空搜索历史
app.post('/api/empty_search_history',function(req,res){
        let client=opredis.newClient();
        client.ltrim(req.body.userid+'_search_history',1,0);
        client.quit();
        res.send({result:1,message:'清空搜索历史成功'});
})

//修改密码
app.post('/api/changepsd',function(req,res){
        let conn=consql.ConMysql('Passenger');
         let sql=`update users set psd='${req.body.newpsd}' where id='${req.body.id}' and psd='${req.body.oldpsd}';`
        console.log(sql);
        conn.query(sql
                ,function(error,result,fields){
                        if(error){
                                res.send({result:0,message:'服务器错误',detail:error});
                        }else if(result.affectedRows==1){
                                console.log(result)
                                res.send({result:1,message:'修改成功',detail:result});
                        }else if(result.affectedRows==0){
                                res.send({result:0,message:'密码错误',detail:result});
                        }else{
                                res.send({result:0,message:'未知错误',detail:result});
                        }
                })
        conn.end();
})

//删除游记
function deleteFolder(imgpath) {
        let files = [];
                if( fs.existsSync(imgpath) ) {
                        files = fs.readdirSync(imgpath);
                        files.forEach(function(file,index){
                        let curPath=path.join(imgpath,file);
                        console.log(curPath)
                        if(fs.statSync(curPath).isDirectory()) {
                                deleteFolder(curPath);
                        } else {
                                fs.unlinkSync(curPath);
                        }
                        });
                        fs.rmdirSync(imgpath);
                }
        }
app.post('/api/deltrip',function(req,res){
        let conn=consql.ConMysql('Passenger');
        //INSERT INTO insert_table (datetime, uid, content, type) VALUES (‘1’, ‘userid_1’, ‘content_1’, 1);
        let sql=`delete from trips where id='${req.body.tripid}'`
        console.log(sql);
        conn.query(sql
        ,function(error,result,fields){
                if(error){
                        res.send({result:0,message:'服务器错误',detail:error});
                }else if(result.affectedRows==1){
                        let imgpath=path.join(__dirname,'tripimages',req.body.tripid);
                        deleteFolder(imgpath);
                        res.send({result:1,message:'删除成功',detail:result});
                }else if(result.affectedRows==0){
                        let imgpath=path.join(__dirname,'tripimages',req.body.tripid);
                        console.log(imgpath);
                        deleteFolder(imgpath);
                        res.send({result:0,message:'游记不存在',detail:result});
                }else{
                        res.send({result:0,message:'未知错误',detail:result});
                }
        })
        conn.end();
        
})

//获取评论
app.get('/api/getcommits/:id/:start/:end',async function(req,res){
        let conn=consql.ConMysql('Passenger');
         let sql=`select* from commits where tripId='${req.params.id}' limit ${req.params.start},${req.params.end};`
        console.log(sql);
        conn.query(sql
        ,async function(error,result,fields){
                if(error){
                        res.send({result:0,message:'评论获取失败',detail:error});
                }else if(result==''){
                        res.send({result:0,message:'评论为空'});
                }else{
                        res.send({result:1,message:'评论获取成功',data:result});
                        console.log('get commits success');

                }
        })
        conn.end();
})

//发表评论
app.post('/api/putcommits',function(req,res){
        let conn=consql.ConMysql('Passenger');
        console.log("before");
        let sql=`insert into commits (userId,tripId,content,time,nickName,avatarUrl) VALUES('${req.body.userId}','${req.body.tripId}','${req.body.content}','${req.body.time}','${req.body.nickName}','${req.body.avatarUrl}') ;`
        console.log("after");
        console.log(sql);
        conn.query(sql
        ,function(error,result,fields){
                if(error){
                        res.send({result:0,message:'发表评论失败',detail:error});
                }else{
                        res.send({result:1,message:'发表评论成功',data:result});
                        console.log('come up with commits success');
                }
        })
        conn.end();

})

//删除评论
app.post('/api/delcommits',async function(req,res){
        let conn=consql.ConMysql('Passenger');
        let sql=`delete from commits where comId='${req.body.comId}'`
        console.log(sql);
        conn.query(sql
        ,function(error,result,fields){
                if(error){
                        res.send({result:0,message:'服务器错误',detail:error});
                }else if(result.affectedRows==1){
                        res.send({result:1,message:'评论删除成功',detail:result});
                }else if(result.affectedRows==0){
                        res.send({result:0,message:'评论不存在',detail:result});
                }else{
                        res.send({result:0,message:'未知错误',detail:result});
                }
        })
        conn.end();
})

//监听端口443
https.createServer(httpsOption, app).listen(443,function(err){
        if(err){
            console.log(err);
            return;
        }
    console.log('https node service started 443');
});