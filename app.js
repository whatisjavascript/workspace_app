App({
  globalData: {
    host: 'http://dev.service.61info.cn',
    sessionId: null
  },
  onLaunch(options) {
    const app = this;
    let sessionId = wx.getStorageSync('sessionId');
    if(sessionId) {
      app.globalData.sessionId = sessionId;
    }
  },
  onShow(options) {
    
  },
  onHide() {

  },
  onError(msg) {
    wx.showToast({
      title: '错误提示',
      content: msg,
      showCancel: false
    });
  },
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success(res) {
          resolve(res.code);
        },
        fail() {
          reject('login error');
        }
      });
    });
  },
  getSessionId(code) {
    const app = this;
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.host + '/user/login',
        method: 'GET',
        data: {
          code: code
        },
        success(res) {
          if(res.data.resultCode.code === 0) {
            wx.setStorage({
              key: 'sessionId',
              data: res.data.value,
            });
            app.globalData.sessionId = res.data.value;
            resolve();
          }else if(res.data.resultCode.code === -1) {
            wx.showModal({
              title: '错误提示',
              content: '登陆失败',
              showCancel: false
            });
            reject();
          }
        },
        fail() {
          reject();
        }
      });
    });
  },
  getUserInfo() {
    const app = this;
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: '加载中'
      });
      wx.request({
        url: app.globalData.host + '/user/getUserInfo',
        method: 'GET',
        data: {
          sessionId: app.globalData.sessionId
        },
        success(res) {
          resolve(res.data);
        },
        fail() {
          reject();
        },
        complete() {
          wx.hideLoading();
        }
      });
    });
  },
  submitUserInfo(userInfo) {
    const app = this;
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.host + '/user/submitUserInfo',
        method: 'POST',
        data: {
          sessionId: app.globalData.sessionId,
          nickName: userInfo.nickName,
          gender: userInfo.gender,
          avatar: userInfo.avatarUrl
        }
      });
    });
  }
});