module.exports=(url,data)=>{
  return new Promise((resolve,reject)=>{
    wx.request({
      url: 'http://localhost:3000/api/'+url,
      data:data,
      success:resolve,
      fail:reject
    })
  })
}