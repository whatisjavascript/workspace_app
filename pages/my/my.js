const app = getApp();
Page({
  data: {
    userInfo: app.globalData.userInfo,
    companyInfo: null
  },
  onShow: function() {
    const page = this;
    app.getUserInfo().then(page.getCompanyInfo);
  },
  getCompanyInfo(data) {
    const page = this;
    page.setData({
      userInfo: data.value
    });
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.host + '/company/getCompanyInfoById',
        method: "GET",
        data: {
          companyId: data.value.CompanyId
        },
        success: function (res) {
          if (res.data.resultCode.code === 0) {
            page.setData({
              companyInfo: res.data.value
            });
            resolve();
          } else if (res.data.resultCode.code === -1) {
            app.login().then(app.getSessionId).then(page.getPageData);
          }
        }
      });
    });
  }
});