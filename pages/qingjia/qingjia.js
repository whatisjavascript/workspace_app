const app = getApp();
Page({
  data: {
    typeList: [{ id: 0, name: '事假' }, { id: 1, name: '病假' }, { id: 2, name: '年假' }, { id: 3, name: '产假' }],
    type: null,
    startTime: null,
    endTime: null,
    reason: ""
  },
  changeType: function(event) {
    this.setData({
      type: event.detail.value
    })
  },
  changeStartTime: function(event) {
    this.setData({
      startTime: event.detail.value
    })
  },
  changeEndTime: function(event) {
    this.setData({
      endTime: event.detail.value
    });
  },
  changeReason: function(event) {
    this.setData({
      reason: event.detail.value
    });
  },
  submitQingjia: function() {
    const page = this;
    if (!this.data.type) {
      wx.showModal({
        title: '提示',
        content: '请选择请假类型',
        showCancel: false
      });
      return false;
    }
    if (!this.data.startTime) {
      wx.showModal({
        title: '提示',
        content: '请选择请假开始时间',
        showCancel: false
      });
      return false;
    }
    if (!this.data.endTime) {
      wx.showModal({
        title: '提示',
        content: '请选择请假结束时间',
        showCancel: false
      });
      return false;
    }
    if (!this.data.reason) {
      wx.showModal({
        title: '提示',
        content: '请输入请假事由',
        showCancel: false
      });
      return false;
    }
    wx.showLoading({
      title: '正在提交',
    });
    let startTime = page.getCurDate() + ' ' + page.data.startTime;
    let endTime = page.getCurDate() + ' ' + page.data.endTime;
    wx.request({
      url: app.globalData.host + '/qingjia/qingjia',
      method: 'GET',
      data: {
        sessionId: app.globalData.sessionId,
        type: page.data.type,
        startTime: startTime,
        endTime: endTime,
        reason: page.data.reason
      },
      success: function(res) {
        if(res.data.resultCode.code === 0) {
          wx.showModal({
            title: '提示',
            content: '提交请假成功',
            showCancel: false,
            success: function(res) {
              if(res.confirm) {
                wx.switchTab({
                  url: '/pages/workspace/workspace',
                });
              }
            }
          });
        }
      },
      complete: function() {
        wx.hideLoading();
      }
    });
  },
  getCurDate: function() {
    let d = new Date();
    let year = d.getFullYear();
    let month = d.getMonth()+1;
    let monthStr = month < 10 ? '0' + month : month;
    let date = d.getDate();
    return year + '-' + month + '-' + date;
  }
});