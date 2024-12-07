module.exports = {
  wechat: {
    enabled: true,
    icon: 'wechat',
    transport: 'querystring',
    state: true,
    response: ['tokens', 'raw', 'profile'],
    qrcode: {
      key: process.env.WECHAT_OPEN_APP_ID,
      secret: process.env.WECHAT_OPEN_APP_SECRET,
      callback: '/api/auth/wechat/callback',
      scope: ['snsapi_login'],
      authorize_url: 'https://open.weixin.qq.com/connect/qrconnect',
      access_url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
      profile_url: 'https://api.weixin.qq.com/sns/userinfo'
    },
    mp: {
      key: process.env.WECHAT_MP_APP_ID,
      secret: process.env.WECHAT_MP_APP_SECRET,
      callback: '/api/auth/wechat/callback',
      scope: ['snsapi_userinfo'],
      authorize_url: 'https://open.weixin.qq.com/connect/oauth2/authorize',
      access_url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
      profile_url: 'https://api.weixin.qq.com/sns/userinfo'
    }
  },
  mattermost: {
    enabled: true,
    icon: 'comments',
    key: process.env.MM_OAUTH_CLIENT_ID,
    secret: process.env.MM_OAUTH_CLIENT_SECRET,
    callback: '/connect/mattermost/callback',
    scope: ['email', 'profile'],
    authorize_url: `${process.env.MM_URL}/oauth/authorize`,
    access_url: `${process.env.MM_URL}/oauth/access_token`,
  },
};
