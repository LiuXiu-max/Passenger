//index.js
//获取应用实例
const app = getApp()
const fetch=require('../../utils/fetch.js')
const post_fetch = require('../../utils/post_fetch.js')
const DEFAULT_PAGE = 0;
Page({
  startPageX: 0,
  currentView: DEFAULT_PAGE,
  data: {
    pageStart:0,
    pageEnd:5,
    userInfo: {},
    hasUserInfo: false,
    toView: `card_${DEFAULT_PAGE}`,
    list: [],
    recommendlist:[],
  },
  taprecomHeart(event) {
    console.log(event.target.dataset.index);
    const recommendlist = this.data.recommendlist;
    if (recommendlist[event.target.dataset.index].iflike) {
      recommendlist[event.target.dataset.index].iflike = false;
      post_fetch('dellike', { "userid": wx.getStorageSync("userId"), "tripid": recommendlist[event.target.dataset.index].id }).then(res => {
        console.log(res.data)
      })
      this.setData({ recommendlist });
    } else {
      recommendlist[event.target.dataset.index].iflike = true;
      post_fetch('addlike', { "userid": wx.getStorageSync("userId"), "tripid": recommendlist[event.target.dataset.index].id }).then(res => {
        console.log(res.data)
      })
      this.setData({ recommendlist });
    }
  },
  onShow:function(){
    fetch('tripslist/' + wx.getStorageSync("userId") + '/' + this.data.pageStart + '/' + this.data.pageEnd).then(res => {
      this.setData({ list: res.data.data })
      console.log(res.data.data)
    })
    post_fetch('getrecommendlist', { "userid": wx.getStorageSync("userId"), "start": this.data.pageStart, "end": this.data.pageEnd }).then(res => {
      this.setData({ recommendlist: res.data.data })
      console.log(res.data.data)
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    console.log(this.data.userInfo);
  },
  toMyself:function(){
    wx.switchTab({
      url: '../myself/myself'
    })
  }
})
