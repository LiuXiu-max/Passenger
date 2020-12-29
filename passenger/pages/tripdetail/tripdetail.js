// pages/tripdetail/tripdetail.js
const app = getApp()
const post_fetch = require('../../utils/post_fetch.js')
const fetch = require('../../utils/fetch.js')
const getdate = require('../../utils/getDate.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    commlist: [],
    userId:'',
    tripId: 31255686 ,
    tripdetail:'',
    imagelist:[],
    ifimage:false,
    commitcon:'',
    pageStart: 0,
    pageEnd: 5,
    committag:false
  },
  tapHeart() {
    const tripdetail = this.data.tripdetail;
    if (tripdetail.iflike) {
      tripdetail.iflike = false;
      post_fetch('dellike', { "userid": wx.getStorageSync("userId"), "tripid": tripdetail.id }).then(res => {
        console.log(res.data)
      })
      this.setData({ tripdetail });
    } else {
      tripdetail.iflike = true;
      post_fetch('addlike', { "userid": wx.getStorageSync("userId"), "tripid": tripdetail.id }).then(res => {
        console.log(res.data)
        this.setData({ tripdetail });
      })

    }

  },
  go_commit() {
    let commlist=this.data.commlist;
    let comitem={};
    var date = getdate(Date.parse(new Date()));
    if (app.globalData.userInfo){
      comitem = {
        "userId": wx.getStorageSync("userId"),
        "tripId": this.data.tripId,
        "content": this.data.commitcon,
        "time": date,
        "nickName": app.globalData.userInfo.nickName ,
        "avatarUrl": app.globalData.userInfo.avatarUrl
      };
    }else{
      comitem = {
        "userId": wx.getStorageSync("userId"),
        "tripId": this.data.tripId,
        "content": this.data.commitcon,
        "time": date,
        "nickName":  wx.getStorageSync("userName"),
        "avatarUrl": 'https://www.liuxiu.xyz/demoimage?man.png'
      };
    }
   
    if (this.data.commitcon) {
      post_fetch('putcommits', comitem).then(res => {
        if (res.data.result) {
          commlist.push(comitem);
          this.setData({commlist,committag:true})
          wx.showToast({
            title: res.data.message,
          })
          this.setData({commitcon:''});
        } else {
          console.log(req.data.detail);
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false
          })
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '没有输入内容',
        showCancel: false
      })
    }
  },
  inputing(e) {
    this.setData({ commitcon: e.detail.value });
  },
  delcomm(e){
    let index = e.target.dataset.index;
    console.log(index);
    let list = this.data.commlist;
    post_fetch('delcommits', { "comId": list[index].comId }).then(res => {
      console.log(res.data.message)
    })
    list.splice(index, 1);
    if(list.length==0){this.setData({committag:false})}
    this.setData({ commlist: list });
  },
  scopeimage(e) {
    if(this.data.ifimage){
      let imgLists = this.data.imagelist;
      let index = e.currentTarget.dataset.index;
      wx.previewImage({
        current: imgLists[index],
        urls: imgLists
      })
    }else{
      let imgls=[];
      imgls.push(this.data.tripdetail.picUrl);
      wx.previewImage({
        current: imgls[0],
        urls: imgls
      })
    }
  },
  getcommit(){
    fetch('getcommits/' + this.data.tripId + '/' + this.data.pageStart + '/' + this.data.pageEnd).then(res => {
      if (res.data.result) {
        this.setData({ commlist: res.data.data, committag: true })
      } else {
        this.setData({ committag: false })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.globalData.userInfo) 
    this.setData({ userId: wx.getStorageSync("userId") })
    if (options.tripId) {
      this.setData({ tripId: options.tripId })
    }
    fetch('tripdetail/' + wx.getStorageSync("userId") + '/' + this.data.tripId).then(res => {
      this.setData({ tripdetail: res.data.data[0] })
      console.log(res.data.data[0])
    })
    fetch('imageurls/' + this.data.tripId).then(res => {
      if (res.data.result) {
        this.setData({ imagelist: res.data.data, ifimage: true })
      } else {
        this.setData({ ifimage: false })
      }
      console.log(res.data.message)
    })
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
   
   this.getcommit()
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