import wepy from 'wepy';
import config from '../config';

const { env } = config;
const app = getApp();
const accessToken = wx.getStorageSync(`${env}_token`);

function getServerUrl(url, server = 'CANNA') {
  return url.startsWith('https') ? `${url}` : `${url}`;
}

function request(params = {}) {

  const { url, server, method = 'get', data, success, fail, complete, options = {} } = params;
  const { isLoading, isNeedCode } = options;

  // 显示加载中
  if (isLoading) {
    wx.showToast({
      title: '正在加载数据...',
      icon: 'loading',
      duration: 10000,
      mask: true,
    });
  }

  const header = {
    'Content-Type': 'application/json',
    'Access-Token': accessToken,
  };

  wepy.request({
    url,
    method,
    data,
    header,
    success({ statusCode, data: response }) {
      const code = response.code || response.errorCode;
      const result = response.result || response.data;

      if (statusCode !== 200) {
        wx.showModal({
          showCancel: false,
          content: '请求异常',
        });
        return;
      }

      // 是否需要返回code
      if (isNeedCode) {
        typeof success === 'function' && success(response);
        return;
      }

      if (+code === 0) {
        typeof success === 'function' && success(result);
      } else {
        const message = response.message;
        wx.showModal({
          showCancel: false,
          content: message,
        });
      }
    },
    fail() {
      wx.showModal({
        showCancel: false,
        content: '网络异常，请稍后再试',
      });
    },
    complete() {
      !noLoading && wx.hideToast();
      typeof complete === 'function' && complete();
    },
  });
}

export default request;
