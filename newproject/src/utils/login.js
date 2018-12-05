import wepy from 'wepy';
import config from '../config';

const { env } = config;
const CANNA = 'a/b';

const login = {
  loginStatus: 'done' // 是否在登录状态
};

// 判断登录是否过期
function isTimeOut() {
  const accessToken = wx.getStorageSync(`${env}_token`);
  const accessTokenExpireAt = wx.getStorageSync(`${env}_token_expire_at`);
  if (!accessToken || !accessTokenExpireAt || Date.now() >= accessTokenExpireAt) {
    return true;
  }
  return false;
}

// 登陆初始化
login.init = function (fn) {
  if (this.loginStatus === 'doing') return;
  this.loginStatus = 'doing';
  this.openLogin(fn);
};

login.openLogin = function (fn) {
  wx.login({
    success: (res) => {
      console.log(res);
      // const data = { res.code };
      // this.appLogin(data, fn);
    }
  });
};

// 调用后台登录接口
login.appLogin = function (data, fn) {

  wepy.request({
    method: 'POST',
    url: `${CANNA}/user/login`,
    data,
    success({ data: response }) {
      const code = response.code || response.errorCode;
      const result = response.result || response.data;
      // 登录失败
      if (code !== '0') {
        wx.showToast({
          title: '服务器异常'
        });
        return;
      }
      // 存储返回数据
      wx.setStorageSync(`${env}_nickname`, result.nickname);
      wx.setStorageSync(`${env}_headimgurl`, result.headimgurl);
      typeof fn === 'function' && fn();
    },
    fail(err) {
      wx.showToast({
        title: '获取Token失败a'
      });
    },
    complete: () => {
      this.loginStatus = 'done';
    }
  });
};

// 更新用户信息 wx.getUserInfo()
login.updateUserInfo = function (data, callback) {
  if (isTimeOut()) return;
  const header = {
    'Content-Type': 'application/json',
    'Access-Token': wx.getStorageSync(`${env}_token`)
  };
  wepy.request({
    method: 'POST',
    url: `${CANNA}/user/updateAccountInfo`,
    data,
    header,
    success({ data: response }) {
      const code = response.code || response.errorCode;
      const result = response.result || response.data;
      if (code !== '0') {
        wx.showToast({
          title: '服务器异常'
        });
        return;
      }
      wx.setStorageSync(`${env}_nickname`, result.nickname);
      wx.setStorageSync(`${env}_headimgurl`, result.headimgurl);
      typeof callback === 'function' && callback();
    }
  });
};

export default login;
