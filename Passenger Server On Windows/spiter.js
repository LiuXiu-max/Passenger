const  dosql=require('./tools/dosql');
const  filter=require('./tools/fliter');
const https=require('https');
for(var i=11;i<=20;i++){
    let url=`https://trips.tuniu.com/travels/index/ajax-list?sortType=1&page=${i}&limit=10&_=1587035455561`;
    console.log(url);
    https.get(url,function(res){
        let chunks=[],
        size=0;
        res.on('data',(res)=>{
            chunks.push(res);
            size=size+res.length;
        });
        res.on('end',function(i){
            console.log('导入数据接收完毕,开始清洗');
            let data=Buffer.concat(chunks,size);
            let json=data.toString();
            let attrlist=['id','name','authorId','viewCount','likeCount','commentCount','publishTime','picUrl','authorName','authorHeadImg'];
            let myclass=filter.fliter_class_attr(JSON.parse(json).data.rows,attrlist);
            console.log('数据清洗完毕，开始导入数据库');
            for(var i=0;i<myclass.length;i++){
                dosql.InsertMysql('insert into trips set ?',myclass[i],'test');
            }
            console.log('数据导入完毕');
        });
    });
}
// create table trips (id int(10) not null auto_increment,name varchar(255),authorId varchar(16),viewCount varchar(16),likeCount varchar(16),commentCount varchar(16),publishTime varchar(50),picUrl varchar(255),authorName varchar(255),authorHeadImg varchar(255),picNum int(2),primary key ('id'));

