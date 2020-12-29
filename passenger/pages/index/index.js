//index.js
//获取应用实例
const app = getApp()
const post_fetch = require('../../utils/post_fetch.js')
Page({
  data: {
    userPwd:'',
    cfuserPwd:'',
    userName:'',
    showModalStatus:false,
    islogin:true,
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  showModel:function(){
    var animation=wx.createAnimation({
      duration:240,
      timingFunction:"linear",
      delay:0
    });
    this.animation=animation;
    animation.translateY(550).step();
    this.setData({
      animationData:animation.export(),
      showModalStatus:true
    })
    setTimeout(function(){
      animation.translateY(0).step();
      this.setData({
        animationData:animation.export()
      })
    }.bind(this),200);
  },
  hideModel:function(){
    var animation = wx.createAnimation({
      duration: 240,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(550).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },
  selectlogin(){
      this.setData({islogin:true});
    console.log(this.data.islogin);
  },
  selectregister(){
      this.setData({ islogin: false });
      console.log(this.data.islogin);
  },
  register(){
    if(this.data.userPwd!=this.data.cfuserPwd){
      wx.showModal({
        title: '出问题了',
        content: '两次密码不一致',
        showCancel: false
      })
      return;
    }
    if (this.data.userName && this.data.userPwd && this.data.cfuserPwd) {
      post_fetch('register', { "username": this.data.userName, "psd": this.data.userPwd }).then(res => {
        console.log(res.data)
        if (res.data.result) {
          wx.setStorageSync("userId", res.data.data.insertId)
          wx.setStorageSync("userName", this.data.userName)
          wx.switchTab({
            url: '../demo/demo',
          })
        } else {
          wx.showModal({
            title: '出问题了',
            content: res.data.message,
            showCancel: false
          })
        }
      })
      
    } else {
      wx.showModal({
        title: '出问题了',
        content: '请输入用户名和密码',
        showCancel: false
      })
    }
  },
  login(){
    if (this.data.userName && this.data.userPwd){
      post_fetch('login', { "username": this.data.userName, "psd": this.data.userPwd }).then(res => {
        console.log(res.data.message)
        if(res.data.result){
          wx.setStorageSync("userId", res.data.data)
          wx.setStorageSync("userName", this.data.userName)
            wx.switchTab({
              url: '../demo/demo',
            })
        }else{
          wx.showModal({
            title: '出问题了',
            content: res.data.message,
            showCancel: false
          })
        }
      })
    }else{
      wx.showModal({
        title: '出问题了',
        content: '请输入用户名和密码',
        showCancel:false
      })
    }
  },
  userNameChanged(e){
    this.setData({ userName: e.detail.value});
  },
  pwdChanged(e){
    this.setData({userPwd:e.detail.value})
  },
  cfpwdChanged(e){
    this.setData({ cfuserPwd: e.detail.value })
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
  getUserInfo: function(e) {

    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  tologin:function(){
    wx.navigateTo({
      url: '../login/login',
    })
  }
})
