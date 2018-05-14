const app = getApp();
Page({
  data: {
    createCompanyActive: true,
    focusCompanyName: false,
    focusCompanyNumber: false,
    focusCompanyAddressDetail: false,
    companyName: '',
    companyNumber: '',
    companyPosition: null,
    companyAddressDetail: '',
    showAuthLocationAlert: false,
    showAuthUserInfoAlert: true
  },
  onShow() {
    const page = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            fail: function (res) {
              page.setData({
                showAuthLocationAlert: true
              });
            },
          });
        }
      }
    });
  },
  chooseCreateCompany() {
    const page = this;
    page.setData({
      createCompanyActive: true
    });
  },
  chooseJoinCompany() {
    const page = this;
    page.setData({
      createCompanyActive: false
    });
  },
  focusCompanyName() {
    const page = this;
    page.setData({
      focusCompanyName: true
    });
  },
  blurCompanyName(event) {
    const page = this;
    page.setData({
      focusCompanyName: false,
      companyName: event.detail.value
    });
  },
  focusCompanyNumber() {
    const page = this;
    page.setData({
      focusCompanyNumber: true
    });
  },
  blurCompanyNumber(event) {
    const page = this;
    page.setData({
      focusCompanyNumber: false,
      companyNumber: event.detail.value
    });
  },
  focusCompanyPosition() {
    const page = this;
    page.setData({
      focusCompanyPosition: true
    });
  },
  companyPositionChange(event) {
    const page = this;
    page.setData({
      companyPosition: event.detail.value
    });
  },
  focusCompanyAddressDetail() {
    const page = this;
    page.setData({
      focusCompanyAddressDetail: true
    });
  },
  changeCompanyAddressDetail(event) {
    const page = this;
    const pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“’。，、？]", "gm");
    let value = event.detail.value.replace(pattern, '');
    page.setData({
      companyAddressDetail: value
    });
    return value;
    
  },
  inputFilter(event) {
    const pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“’。，、？]", "gm");
    let value = event.detail.value;
    return value.replace(pattern, '');
  },
  submitCompanyInfo() {
    const page = this;
    if(page.data.companyName === '') {
      wx.showModal({
        title: '提示',
        content: '您还未填写企业名称',
        showCancel: false
      });
    }else if(page.data.companyNumber === '') {
      wx.showModal({
        title: '提示',
        content: '您还未填写企业编号',
        showCancel: false
      });
    }else if(page.data.companyPosition === null) {
      wx.showModal({
        title: '提示',
        content: '您还未选择企业所在地',
        showCancel: false
      });
    }else if(page.data.companyAddressDetail === '') {
      wx.showModal({
        title: '提示',
        content: '您还未填写企业详细地址',
        showCancel: false
      });
    }else {
      wx.request({
        url: app.globalData.host + '/company/createCompany',
        method: 'POST',
        data: {
          sessionId: app.globalData.sessionId,
          companyName: page.data.companyName,
          companyNumber: page.data.companyNumber,
          companyPosition: page.data.companyPosition,
          companyAddressDetail: page.data.companyAddressDetail
        },
        success(res) {
          console.log(res);
          if(res.data.resultCode.code === 0) {
            wx.redirectTo({
              url: '/pages/index/index',
            });
          }else {
            wx.showModal({
              title: "错误提示",
              content: res.resultCode.msg,
              showCancel: false
            });
          }
        }
      });
    }
  },
  openAuthSetting() {
    const page = this;
    wx.openSetting({
      success(res) {
        if (res.authSetting['scope.userLocation']) {
          page.setData({
            showAuthLocationAlert: false
          });
        }
      }
    })
  },
  getUserWxInfo(event) {
    const page = this;
    let userInfo = event.detail.userInfo;
    console.log(userInfo)
    if(userInfo) {
      app.submitUserInfo(userInfo);
      page.setData({
        showAuthUserInfoAlert: false
      });
    }
  }
});