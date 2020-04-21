function fliter_class_attr(myclass,attrlist){
    console.log('筛选属性')
    for(var i=0;i<myclass.length;i++){
        for(var attr in myclass[i]){
            if(attrlist.indexOf(attr)!=-1)
            {
                if(i==0)console.log(attr+'保留')
            }else{
               delete myclass[i][attr];

            }
        }
    }
    return myclass;
}
function refliter_class_attr(myclass,attrlist){
    console.log('筛选属性')
    for(var i=0;i<myclass.length;i++){
        for(var attr in myclass[i]){
            if(attrlist.indexOf(attr)!=-1)
            {
                delete myclass[i][attr];
                if(i==0)console.log(attr+'删除')
            }
        }
    }
    return myclass;
}
module.exports={
    refliter_class_attr,
    fliter_class_attr
}

// delete myclass[i].summary;
// delete myclass[i].stamp;
// delete myclass[i].imgId;
// delete myclass[i].authorIndentity;
// delete myclass[i].bindOrder;
// delete myclass[i].bindBanner;
// delete myclass[i].bindSchedule;
// delete myclass[i].hasLike;
// var obj=[
// {
//     id:1,
//     name:'adsa',
//     age:41
// },
// {
//     id:2,
//     name:'adsa',
//     age:12
// },
// {
//     id:3,
//     name:'adsa',
//     age:21
// }]
// obj=fliter_class_attr(obj,['id','name']);
// console.log(obj);