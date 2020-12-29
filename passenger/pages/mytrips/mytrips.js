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
  },
  navdetail(event){
    let index = event.target.dataset.index;
    let searchlist = this.data.searchlist;
    wx.navigateTo({
      url: '/pages/tripdetail/tripdetail?tripId='+searchlist[index].id,
    })
  },
  deltrip(event) {
    let index = event.target.dataset.index;
    let searchlist=this.data.searchlist;
    console.log(index);
    post_fetch('deltrip', { "tripid": JSON.stringify(searchlist[index].id) }).then(res => {
      console.log(res.data.message)
    })
    searchlist.splice(index, 1);
    this.setData({searchlist});
  },
  tapHeart(event) {
    console.log(event.target.dataset.index);
    const searchlist = this.data.searchlist;
    if (searchlist[event.target.dataset.index].iflike) {
      searchlist[event.target.dataset.index].iflike = false;
      post_fetch('dellike', { "userid": wx.getStorageSync("userId"), "tripid": searchlist[event.target.dataset.index].id }).then(res => {
        console.log(res.data)
      })
      this.setData({ searchlist });
    } else {
      searchlist[event.target.dataset.index].iflike = true;
      post_fetch('addlike', { "userid": wx.getStorageSync("userId"), "tripid": searchlist[event.target.dataset.index].id }).then(res => {
        console.log(res.data)
      })
      this.setData({ searchlist });
    }

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
    let url = 'selftrips/' + wx.getStorageSync("userId") + '/' + this.data.startindex + '/' + this.data.pagesize;
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.taphistory()
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