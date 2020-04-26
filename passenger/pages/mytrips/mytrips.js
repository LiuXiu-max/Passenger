// pages/mytrips/mytrips.js
const fetch = require('../../utils/fetch.js')
const post_fetch = require('../../utils/post_fetch.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listtag: true,
    searchlist: [],
    startindex: 0,
    pagesize: 5,
    filer_tag: [false, false, false],
    searchtext: '游'
  },
  go_publish(){
    wx.navigateTo({
      url: '../publish/publish',
    })
  },
  taphistory() {
    this.setData({ filer_tag: [true, false, false] })
    //console.log(this.data.filer_tag)
    let url = 'historylist/'+wx.getStorageSync("userId")+'/'  + this.data.startindex + '/' + this.data.pagesize;
    console.log(url);
    fetch(url).then(res => {
      console.log(res.data)
      if (res.data.result) {
        this.setData({ searchlist: res.data.data, listtag: true });
      } else {
        this.setData({ listtag: false });
      }

      //console.log(this.data.searchlist)
    })
  },
  taplike() {
    this.setData({ filer_tag: [false, false, true] })
    let url = 'likelist/'+  this.data.startindex + '/' + this.data.pagesize;
    post_fetch(url, {"id":wx.getStorageSync("userId")}).then(res => {
      console.log(res.data)
      if (res.data.result) {
        this.setData({ searchlist: res.data.data, listtag: true });
      } else {
        this.setData({ listtag: false });
      }

      //console.log(this.data.searchlist)
    })
  },
  tapmytrips() {
    this.setData({ filer_tag: [false, true, false] })
    let url = 'searchbyview/1/' + this.data.searchtext + '/' + this.data.startindex + '/' + this.data.pagesize;
    fetch(url).then(res => {
      console.log(res.data)
      if (res.data.result) {
        this.setData({ searchlist: res.data.data, listtag: true });
      } else {
        this.setData({ listtag: false });
      }

      //console.log(this.data.searchlist)
    })
  },
  cleartext() {
    this.setData({ inputfocus: false }, () => {
      this.setData({ searchtext: '' });
    })
  },
  inputing(e) {
    this.setData({ searchtext: e.detail.value });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.searchtext) {
      this.setData({ searchtext: options.searchtext })
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.taphistory()
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