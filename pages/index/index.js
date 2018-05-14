const app = getApp();
Page({
  data: {
    
  },
  onLoad() {
    const page = this;
    wx.checkSession({
      success() {
        console.log('index-授权未过期');
        const sessionId = app.globalData.sessionId;
        if(sessionId) {
          app.getUserInfo()
            .then(page.isJoinCompany);
        }else {
          console.log('storage sessionId 丢失');
          app.login()
            .then(app.getSessionId)
            .then(app.getUserInfo)
            .then(page.isJoinCompany);
        }
      },
      fail() {
        console.log('index-授权过期,重新登陆');
        app.login()
          .then(app.getSessionId)
          .then(app.getUserInfo)
          .then(page.isJoinCompany);
      }
    });
  },
  onShow() {},
  // 是否已经加入企业
  isJoinCompany(data) {
    const page = this;
    if(data.resultCode.code === 0) {
      if(data.value.CompanyId) {
        console.log('已加入企业，获取首页数据');
      } else {
        console.log('未加入企业，跳转到加入/创建企业页面');
        wx.redirectTo({
          url: '/pages/create_join_company/create_join_company',
        })
      }
    }else if(data.resultCode.code === -1) {
      app.login().then(app.getSessionId).then(app.getUserInfo).then(page.isJoinCompany);
    }
    
  }
});