// pages/changepsd/changepsd.js
const app = getApp()
const post_fetch = require('../../utils/post_fetch.js')
const getdate = require('../../utils/getDate.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    oldpsd:'',
    newpsd:''
  },
  inputoldpsd(e) {
    this.setData({ oldpsd: e.detail.value });
    console.log(this.data.oldpsd);
  },
  inputnewpsd(e){
    this.setData({ newpsd: e.detail.value });
    console.log(this.data.newpsd);
  },
  changepsd(){
    post_fetch('changepsd', {
      "id": wx.getStorageSync("userId"),
      "oldpsd": this.data.oldpsd,
      "newpsd": this.data.newpsd
    }).then(res => {
      if (res.data.result) {
        wx.showModal({
          title: '提示',
          content: res.data.message,
          showCancel: false,
          success(res) {
            if (res.confirm) {
              wx.switchTab({
                url: '../myself/myself'
              })
            } 
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.message,
          showCancel: false
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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