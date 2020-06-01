module.exports = (url, data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://www.liuxiu.xyz/api/' + url,
      method:'POST',
      data: data,
      success: resolve,
      fail: reject
    })
  })
}