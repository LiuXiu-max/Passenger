// pages/searchpage/searchpage.js
const app = getApp()
const fetch = require('../../utils/fetch.js')
const post_fetch = require('../../utils/post_fetch.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputfocus:false,
    searchtext:'',
    search_history_list:[]
  },
  go_search(){
    if(this.data.searchtext){
      post_fetch('add_search_history', { "userid": wx.getStorageSync("userId"), "searchItem": this.data.searchtext }).then(res => {
        console.log(res.data.message)
      })
      wx.navigateTo({
        url: '../searchlist/searchlist?searchtext=' + this.data.searchtext,
      })
    }
  },
  taphistory(e){
    this.setData({ searchtext: e.target.dataset.text});
  },
  cleartext(){
    this.setData({inputfocus:false},()=>{
      this.setData({ searchtext: '' });
    })
  },
  delall_history(){
    this.setData({ search_history_list:[]})
    post_fetch('empty_search_history', { "userid": wx.getStorageSync("userId")}).then(res => {
      console.log(res.data.message)
    })
  },
  del_history(e){
    let index = e.target.dataset.index;
    console.log(index);
    let list=this.data.search_history_list;
    post_fetch('del_search_history', { "userid": wx.getStorageSync("userId"), "searchItem": list[index] }).then(res => {
      console.log(res.data.message)
    })
    list.splice(index,1);
    this.setData({search_history_list:list});
  },
  inputing(e){
    this.setData({ searchtext: e.detail.value });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    fetch('get_search_history/' + wx.getStorageSync("userId")).then(res => {
      this.setData({ search_history_list: res.data.data })
      console.log(res.data.data)
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
    fetch('get_search_history/' + wx.getStorageSync("userId")).then(res => {
      this.setData({ search_history_list: res.data.data })
      console.log(res.data.data)
    })
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