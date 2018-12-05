let env = 'dev';
env = require('./env');

const version = '1.0.1'; // 当前版本
const configs = {
  dev: require('./dev'),
  uat: require('./uat'),
  prd: require('./prd'),
};

const config = {
  env,
  version,
  AppName: '小工具',
  AppID: 'aaa',
};

Object.assign(config, configs[env]);

module.exports = config;
