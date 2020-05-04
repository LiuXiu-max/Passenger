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
    likelist:[]
  },
  tapHeart(event){
    console.log(event.target.dataset.index);
    const list=this.data.list;
    if (list[event.target.dataset.index].iflike){
      list[event.target.dataset.index].iflike = false;
      this.setData({ list });
    }else{
      list[event.target.dataset.index].iflike = true;
      this.setData({ list });
    }

  },
  onLoad: function () {
    fetch('tripslist/' + wx.getStorageSync("userId")+'/' + this.data.pageStart + '/' + this.data.pageEnd).then(res=>{
      this.setData({list:res.data.data})
      console.log(res.data.data)
    })
    post_fetch('getrecommendlist', { "userid": wx.getStorageSync("userId"), "start": this.data.pageStart, "end": this.data.pageEnd}).then(res => {
      this.setData({ recommendlist: res.data.data })
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
    console.log(this.data.userInfo);
  },
  onHide:function(){
    console.log('demo hided')
  },
  toMyself:function(){
    wx.navigateTo({
      url: '../myself/myself'
    })
  }
})
