// pages/searchpage/searchpage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputfocus:false,
    searchtext:'',
    search_history_list:['途牛','耶路撒冷','冬天','纽芬兰']
  },
  go_search(){
    if(this.data.searchtext){
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
  },
  del_history(e){
    let index = e.target.dataset.index;
    console.log(index);
    let list=this.data.search_history_list;
    list.splice(index,1);
    console.log(list);
    this.setData({search_history_list:list});
  },
  inputing(e){
    this.setData({ searchtext: e.detail.value });
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