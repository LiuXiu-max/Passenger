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
    toptag:false,
    pageStart:0,
    pageEnd:5,
    userInfo: {},
    hasUserInfo: false,
    toView: `card_${DEFAULT_PAGE}`,
    list: [],
    recommendlist:[],
    hascomm:true,
    hasMore:true
  },
  totop(){
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
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
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }
    console.log(app.globalData.userInfo);
    fetch('poptripslist/' + wx.getStorageSync("userId") + '/' + 0 + '/' + 5).then(res => {
      this.setData({ list: res.data.data })
      console.log(res.data.data)
    })
    this.loadMore()
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } 
    console.log(app.globalData.userInfo);
  },
  loadMore() {
    let { pageStart, pageEnd, hasMore, hascomm ,recommendlist} = this.data;
    console.log(pageStart + '  ' + pageEnd)
    if (hascomm){
      post_fetch('getrecommendlist', { "userid": wx.getStorageSync("userId"), "start": pageStart, "end": pageEnd }).then(res => {
        if (res.data.data) {
          console.log('获取到推荐')
           recommendlist=recommendlist.concat(res.data.data)
          this.setData({ recommendlist, pageStart: pageEnd + 1, pageEnd: pageEnd + 5, hasMore: true })
        } else {
          console.log('没有推荐')
          fetch('tripslist/' + wx.getStorageSync("userId") + '/' + this.data.pageStart + '/' + this.data.pageEnd).then(res => {
            if (res.data.data) {
              recommendlist = recommendlist.concat(res.data.data)
              this.setData({ recommendlist, pageStart: pageEnd + 1, pageEnd: pageEnd + 5, hasMore: true })
            } else {
              this.setData({ hasMore: false })
            }
          })
          this.setData({ hascomm: false })
        }
      })
    }else{
      fetch('tripslist/' + wx.getStorageSync("userId") + '/' + this.data.pageStart + '/' + this.data.pageEnd).then(res => {
        if (res.data.data) {
          recommendlist = recommendlist.concat(res.data.data)
          this.setData({ recommendlist, pageStart: pageEnd + 1, pageEnd: pageEnd + 5, hasMore: true })
        } else {
          this.setData({ hasMore: false })
        }
      })
    }
  },
  onReachBottom: function () {
    console.log('bottom')
    //在这里加载下一页
    //需要判断是否正在加载，否则会有多次触发问题
    this.loadMore()


  },
  toMyself:function(){
    wx.switchTab({
      url: '../myself/myself'
    })
  }
})
