const  dosql=require('./tools/dosql');
const  filter=require('./tools/fliter');
const https=require('https');
let url='https://trips.tuniu.com/travels/index/ajax-list?sortType=1&page=1&limit=10&_=1587035455561'
https.get(url,function(res){
    let chunks=[],
    size=0;
    res.on('data',(res)=>{
        chunks.push(res);
        size=size+res.length;
    });
    res.on('end',function(){
        console.log('数据接收完毕,开始清洗');
        let data=Buffer.concat(chunks,size);
        let json=data.toString();
        let attrlist=['id','name','authorId','viewCount','likeCount','commentCount','publishTime','picUrl','authorName','authorHeadImg'];
        let myclass=filter.fliter_class_attr(JSON.parse(json).data.rows,attrlist);
        console.log('数据清洗完毕，开始导入数据库');
        for(var i=0;i<myclass.length;i++){
            dosql.InsertMysql('insert into tuniu set ?',myclass[i],'test');
        }
        console.log('数据导入完毕');
    });
});
