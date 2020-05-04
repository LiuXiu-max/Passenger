// pages/publish/publish.js
const app = getApp()
const post_fetch = require('../../utils/post_fetch.js')
const getdate = require('../../utils/getDate.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgcount:0,
    imgLists:[],
    editortext:''
  },
  upload(imgLists, insertId, index, length) {
    let that=this;
    wx.uploadFile({
      url: 'http://localhost:3000/api/tripimages',
      filePath: imgLists[index],
      name: 'file',
      header: {
        'Content-Type': 'multipart/form-data'
      },
      formData: {
        "tripid": insertId,
        "index": index
      },
      success: function (res) {
        index++;
        if (index == length) {
          console.log('上传成功')
        } else {
          that.upload(imgLists, insertId, index, length);
        }
      },
      fail: function (e) {
        console.log('fail' + e.stack);
      },
      complete:function(e){

      }
    })
  },
  uploadbutton(){
    let imgLists = this.data.imgLists;
    let length=imgLists.length;
    let index=0;
    var date = getdate(Date.parse(new Date()));
    if (this.data.editortext!=''&&this.data.imgLists!='') {
      post_fetch('addtrips', {
        "name": this.data.editortext,
        "authorId": wx.getStorageSync("userId"),
        "publishTime": date,
        "picUrl": "",
        "picNum": imgLists.length,
        "authorName": app.globalData.userInfo.nickName,
        "authorHeadImg": app.globalData.userInfo.avatarUrl
      }).then(res => {
        if (res.data.result) {
          let insertId = res.data.data.insertId;
          console.log(insertId);
          console.log(imgLists);
          this.upload(imgLists, insertId, index, length);
          post_fetch('updatetrip',{
            "picUrl": "http://localhost:3000/api/tripimages/" + insertId+"/0",
            "id": insertId
          })
        } else {
          wx.showModal({
            title: '发布失败',
            content: res.data.message,
            showCancel: false
          })
        }
      })
    } else {
      if(this.data.imgLists!=''){
        wx.showModal({
          title: '出问题了',
          content: '游记没有内容',
          showCancel: false
        })
      }else{
        wx.showModal({
          title: '出问题了',
          content: '至少一张图做封面',
          showCancel: false
        })
      }

    }

  },
  inputing(e){
    this.setData({ editortext: e.detail.text});
    console.log(this.data.editortext);
  },
  scopeimage(e){
    let imgLists = this.data.imgLists;
    let index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: imgLists[index],
      urls: imgLists 
    })
    
  },
  delimage(e){
    let imgLists = this.data.imgLists;
    let index = e.currentTarget.dataset.index;
    imgLists.splice(index, 1);
    this.setData({ imgLists, imgcount:this.data.imgcount-1 });
  },
  uploadimage(){
    var that=this;
    if (that.data.imgcount<9){
      wx.chooseImage({
        count: 9 - that.data.imgcount,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: function (res) {
          var tempPaths = res.tempFilePaths;
          let length = tempPaths.length;
          let tempList = that.data.imgLists.concat(tempPaths);
          that.setData({ imgLists: tempList, imgcount: that.data.imgcount + length })
        },
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.globalData.userInfo);
      },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})