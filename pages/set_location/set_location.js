const app = getApp();
const QQMapWx = require("../../util/qqmap-wx-jssdk.min.js");
var qqmapskd = null;
Page({
  data: {
    companyId: null,
    latitude: null,
    longitude: null,
    markers: null
  },
  onLoad() {
    // 实例化地图API
    qqmapskd = new QQMapWx({
      key: "OP2BZ-EPXCG-PA3QA-IPKKX-NMA4F-VHFLI"
    });
    this.getCompanyInfo();
  },
  onReady() {
    const page = this;
    page.mapCtx = wx.createMapContext('map');
    page.getCurrentLocation().then(page.getLocationInfo);
  },
  getCompanyInfo() {
    const page = this;
    wx.showLoading({
      title: '加载中'
    });
    wx.request({
      url: app.globalData.host + "/user/getUserInfo",
      method: "GET",
      data: {
        sessionId: app.globalData.sessionId
      },
      success: function(res) {
        if(res.data.resultCode.code === 0) {
          console.log(res);
          page.setData({
            companyId: res.data.value.CompanyId
          });
        }else if(res.data.resultCode.code === -1) {
          app.login()
             .then(app.getSessionId)
             .then(page.getCompanyInfo);
        }
      },
      complete: function() {
        wx.hideLoading();
      }
    });
  },
  getCurrentLocation() {
    const page = this;
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: "gcj02",
        success(res) {
          if (res.errMsg === "getLocation:ok") {
            let latitude = res.latitude;
            let longitude = res.longitude;
            let markers = [{
              id: 0,
              latitude: latitude,
              longitude: longitude,
              iconPath: "/images/location.png",
              width: 32,
              height: 32
            }];
            page.setData({
              latitude: res.latitude,
              longitude: res.longitude,
              markers: markers
            });
            resolve(res);
          } else {
            wx.showModal({
              title: "提示",
              content: "获取位置信息失败，请检查是否已开启定位服务",
              showCancel: false
            });
            reject();
          }
        }
      });
    });
  },
  // 根据经纬度坐标获取坐标的位置信息
  getLocationInfo(coordinate) {
    const page = this;
    wx.showLoading({
      title: '加载位置信息',
    });
    qqmapskd.reverseGeocoder({
      location: {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude
      },
      success: function(res) {
        if(res.status === 0) {
          let address = res.result.formatted_addresses.recommend;
          page.setData({
            'markers[0].latitude': res.result.location.lat,
            'markers[0].longitude': res.result.location.lng,
            'markers[0].callout': {
              content: address,
              color: "#fff",
              bgColor: "#1296db",
              fontSize: 14,
              display: "ALWAYS",
              padding: 10,
              borderRadius: 10 
            }
          });
        }
      },
      complete: function() {
        wx.hideLoading();
      }
    });
  },
  chooseLocation() {
    const page = this;
    wx.chooseLocation({
      success: function(res) {
        console.log(res);
        page.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });
        page.getLocationInfo(res);
      },
    })
  },
  setCompanyLocation() {
    const page = this;
    wx.showLoading({
      title: "正在设置"
    });
    wx.request({
      url: app.globalData.host + "/company/setCompanyLocation",
      method: "GET",
      data: {
        sessionId: app.globalData.sessionId,
        latitude: page.data.latitude,
        longitude: page.data.longitude
      },
      success: function(res) {
        console.log(res);
        if(res.data.resultCode.code === 0) {
          wx.showModal({
            title: '提示',
            content: '设置考勤地点成功',
            showCancel: false,
            success: function(res) {
              if (res.confirm) {
                wx.switchTab({
                  url: '/pages/index/index',
                });
              }
            }
          });
        }else if(res.data.resultCode.code === -1) {
          app.login().then(app.getSessionId).then(page.setCompanyLocation);
        }
      },
      complete: function() {
        wx.hideLoading();
      }
    });
  }
});