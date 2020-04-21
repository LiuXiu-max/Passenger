//index.js
//获取应用实例
const app = getApp()
const fetch=require('../../utils/fetch.js')
const DEFAULT_PAGE = 0;
Page({
  startPageX: 0,
  currentView: DEFAULT_PAGE,
  data: {
    itemlike:"heart.png",
    pageStart:0,
    pageEnd:5,
    userInfo: {},
    hasUserInfo: false,
    toView: `card_${DEFAULT_PAGE}`,
    list: []
  },
  tapHeart(event){
    if (this.data.itemlike === event.target.id){
      this.setData({ itemlike:""})
    }else{
      this.setData({ itemlike: event.target.id })
    }
    console.log(event);
  },
  onLoad: function () {
    fetch('tripslist/1/' + this.data.pageStart + '/' + this.data.pageEnd).then(res=>{
      this.setData({list:res.data.data})
      console.log(res.data.data)
    })
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
  },
  toMyself:function(){
    wx.navigateTo({
      url: '../myself/myself'
    })
  }
})
