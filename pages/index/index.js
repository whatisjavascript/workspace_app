const app = getApp();
const QQMapWx = require("../../util/qqmap-wx-jssdk.min.js");
var qqmapskd = null;
Page({
  data: {
    companyId: null,
    companyInfo: null,
    attenceInfo: null,
    userInfo: null,
    companyLat: null,
    companyLng: null,
    nearCompany: true, // 是否处于考勤地点200米附近
    curLocation: "", // 当前定位的位置信息
    isLate: false,
    isEarly: false
  },
  onLoad() {
    const page = this;
    qqmapskd = new QQMapWx({
      key: "OP2BZ-EPXCG-PA3QA-IPKKX-NMA4F-VHFLI"
    });
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
          companyId: data.value.CompanyId,
          userInfo: app.globalData.userInfo
        });
        page.getPageData();
      }
    }else if(data.resultCode.code === -1) {
      app.login().then(app.getSessionId).then(app.getUserInfo).then(page.isJoinCompany);
    }
  },

  getPageData() {
    const page = this;
    page.getCompanyInfo().then(page.getCompanyLocation).then(page.getCurLocation).then(page.judgeDistance).then(page.getCurLocationInfo).then(function() {
      let curDate = new Date();
      let year = curDate.getFullYear();
      let month = curDate.getMonth() + 1;
      let date = curDate.getDate();
      let ruleStartDate = new Date(year + '/' + month + '/' + date + ' ' + page.data.companyInfo.AttenceStartTime).getTime();
      let ruleEndDate = new Date(year + '/' + month + '/' + date + ' ' + page.data.companyInfo.AttenceEndTime).getTime();
      console.log(ruleStartDate, curDate.getTime());
      if (ruleStartDate < curDate.getTime()) {
        page.setData({
          isLate: true
        });
      }
      if (ruleEndDate > curDate.getTime()) {
        page.setData({
          isEarly: true
        });
      }
    });
    page.getAttenceInfo();
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
      wx.request({
        url: app.globalData.host + '/company/getCompanyLocation',
        method: 'GET',
        data: {
          companyId: page.data.companyId
        },
        success: function(res) {
          console.log(res);
          page.setData({
            companyLat: res.data.value.Latitude/100000,
            companyLng: res.data.value.Longitude/100000
          });
          resolve(res.data.value);
        },
        fail: function() {
          reject();
        },
        complete: function() {
          wx.hideLoading();
        }
      });
    });
  },
  getCurLocation() {
    const page = this;
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: "gcj02",
        success: function(res) {
          resolve(res);
        },
        fail: function() {
          reject();
        }
      })
    });
  },
  judgeDistance(data) {
    const page = this;
    return new Promise((resolve, reject) => {
      qqmapskd.calculateDistance({
        from: data.latitude + ',' + data.longitude,
        to: page.data.companyLat + ',' + page.data.companyLng,
        success: function(res) {
          if(res.status === 0) {
            let distance = res.result.elements[0].distance;
            if(distance > 200) {
              page.setData({
                nearCompany: false
              });
            }else {
              page.setData({
                nearCompany: true
              });
            }
            resolve(data);
          }
        },
        fail: function(res) {
          console.log(res);
          if(res.status === 373) {
            page.setData({
              nearCompany: false
            });
            resolve(data);
          }
        }
      });
    });
  },
  getCurLocationInfo(data) {
    const page = this;
    return new Promise((resolve, reject) => {
      console.log('aaa');
      qqmapskd.reverseGeocoder({
        location: {
          latitude: data.latitude,
          longitude: data.longitude
        },
        success: function(res) {
          if(res.status === 0) {
            page.setData({
              curLocation: res.result.formatted_addresses.recommend
            });
            resolve();
          }
        }
      });
    });
  },
  setAttenceStartTime() {
    const page = this;
    wx.showLoading({
      title: '正在打卡'
    });
    let status = 0;
    if (page.data.isLate) {
      status = 1;
    }
    wx.request({
      url: app.globalData.host + '/attence/setAttenceStartTime',
      method: 'GET',
      data: {
        sessionId: app.globalData.sessionId,
        location: page.data.curLocation,
        status: status
      },
      success: function(res) {
        if(res.data.resultCode.code === 0) {
          wx.showModal({
            title: '提示',
            content: '上班打卡成功',
            showCancel: false
          });
          page.setData({
            attenceInfo: res.data.value
          });
        }
      },
      complete: function () {
        wx.hideLoading();
      }
    });
  },
  setAttenceEndTime() {
    const page = this;
    wx.showLoading({
      title: '正在打卡'
    });
    let status = 0;
    if (page.data.isEarly) {
      status = 1;
    }
    wx.request({
      url: app.globalData.host + '/attence/setAttenceEndTime',
      method: 'GET',
      data: {
        id: page.data.attenceInfo.Id,
        location: page.data.curLocation,
        status: status
      },
      success: function (res) {
        if (res.data.resultCode.code === 0) {
          wx.showModal({
            title: '提示',
            content: '下班打卡成功',
            showCancel: false
          });
          page.setData({
            attenceInfo: res.data.value
          });
        }
      },
      complete: function () {
        wx.hideLoading();
      }
    });
  },
  waiqinStartAttence() {
    wx.navigateTo({
      url: '/pages/waiqin/waiqin?type=1',
    });
  },
  waiqinEndAttence() {
    const page = this;
    wx.navigateTo({
      url: '/pages/waiqin/waiqin?type=2&attenceId=' + page.data.attenceInfo.Id,
    });
  }
});