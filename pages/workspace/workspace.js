Page({
  gotoRenshi: function() {
    wx.navigateTo({
      url: '/pages/renshi/renshi',
    })
  },
  gotoQingjia: function() {
    wx.navigateTo({
      url: '/pages/qingjia/qingjia',
    })
  },
  gotoLocation: function() {
    wx.navigateTo({
      url: '/pages/set_location/set_location',
    })
  }
});