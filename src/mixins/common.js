import wepy from 'wepy';
import config from '../config';
import request from '../utils/request';
import login from '../utils/login';

const { env, imgUrl } = config;
let clickTimestamp = 0;

export default class extends wepy.mixin {
  data = {
    ready: false,
    env,
    imgUrl,
    authSetting: {},
  };

  computed = {
  };

  methods = {

    // 页面跳转
    toUrl(url, rType='page') {
      // 无参数跳转首页
      if (!url) {
        url = '/pages/index';
        rType = 'tab';
      }
      this.toUrl(url, rType);
    },

    // 收集模板ID
    saveFormId(e) {
      if (!this.refuseMuchClick()) return;
      this.saveFormId(e);
    },

    // 授权用户信息
    allowUserInfo(e) {
      this.updateUserInfo(e);
    },

  };

  // 收集formId
  // eslint-disable-next-line
  saveFormId(e) {
    if (!e || !e.detail || !e.detail.formId) return;
    const formId = e.detail.formId;
    request({
      url: '/user/updateUserFormId',
      data: { formId },
      options: {
        noLoading: true,
        noModal: true,
      },
    });
  }

  // 更新用户信息
  updateUserInfo(e, callback) {
    if (e && e.detail && e.detail.encryptedData && e.detail.iv) {
      this.updateAuthSetting();
      const data = {
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
        userInfo: e.detail.userInfo,
      };
      login.updateUserInfo(data, callback);
    }
  }

  // 拒绝过度访问标识 duringTime阻止点击间隔
  // eslint-disable-next-line
  refuseMuchClick(duringTime) {
    const during = duringTime || 1500;
    const timestamp = new Date().getTime();
    if (timestamp - clickTimestamp > during) {
      clickTimestamp = timestamp;
      return true;
    }
    // debug.warn('不要点太快');
    return false;
  }

  // 页面跳转
  toUrl(url, rType) {
    switch (rType) {
      case 'page': {
        wx.redirectTo({ url });
        break;
      }
      case 'back': {
        wx.navigateBack({ delta: 1 });
        break;
      }
      case 'tab': {
        wx.switchTab({ url });
        break;
      }
    }
  }

  // 更新已授权信息
  updateAuthSetting() {
    wx.getSetting({
      success: (res) => {
        this.$root.$parent.globalData.authSetting = res.authSetting;
      },
    });
  }

  // 页面路径中的参数
  onLoad({ returnURL = '', returnType = '', returnDelta = 1 }) {
    this.returnURL = returnURL;
    this.returnType = returnType;
    this.returnDelta = +returnDelta;

    this.updateAuthSetting();
  }

  onReady() {
    this.ready = true;
    this.$apply();
  }

}
