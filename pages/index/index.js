const app = getApp();
Page({
  data: {
    companyId: null,
    companyInfo: null,
    attenceInfo: null
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
  onShow() {
    const page = this;
    if(page.data.companyId) {
      page.getPageData();
    }
  },
  // 是否已经加入企业
  isJoinCompany(data) {
    const page = this;
    if(data.resultCode.code === 0) {
      if(!data.value.CompanyId) {
        console.log('未加入企业，跳转到加入/创建企业页面');
        wx.redirectTo({
          url: '/pages/create_join_company/create_join_company',
        })
      }else {
        page.setData({
          companyId: data.value.CompanyId
        });
        page.getPageData();
      }
    }else if(data.resultCode.code === -1) {
      app.login().then(app.getSessionId).then(app.getUserInfo).then(page.isJoinCompany);
    }
  },

  getPageData() {
    const page = this;
    page.getCompanyInfo();
    page.getAttenceInfo();
    page.get
  },
  getCompanyInfo() {
    const page = this;
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.host + '/company/getCompanyInfoById',
        method: "GET",
        data: {
          companyId: page.data.companyId
        },
        success: function(res) {
          if(res.data.resultCode.code === 0) {
            page.setData({
              companyInfo: res.data.value
            });
            resolve();
          }else if(res.data.resultCode.code === -1) {
            app.login().then(app.getSessionId).then(page.getPageData);
          }
        }
      });
    });
  },
  getAttenceInfo() {
    const page = this;
    return new Promise((resolve, reject) => {
      let date = new Date();
      let dateString = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
      wx.request({
        url: app.globalData.host + '/attence/getAttenceRecord',
        method: 'GET',
        data: {
          sessionId: app.globalData.sessionId,
          attenceDate: dateString
        },
        success: function(res) {
          if(res.data.resultCode.code === 0) {
            page.setData({
              attenceInfo: res.data.value
            })
          }
        }
      });
    });
  },
  getCompanyLocation() {
    const page = this;
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: '加载中'
      });
    });
  }
});