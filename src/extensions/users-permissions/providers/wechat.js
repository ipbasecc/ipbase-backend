const axios = require('axios').default;
const mattermostProvider = require('../providers/mattermost');

module.exports = ({ purest }) => ({
    async callback({ query, loginType = 'qrcode' }) {
        // console.log('WeChat provider callback:', { query, loginType });
        /**
         * 注意事项：由于需要同时支持网页扫码和公众号自动登陆，所以派生数据时，务必使用unionid
         * unionid在网页扫码和公众号内登陆时返回内容是相同的，否则是不同的
         * 前端要注意：公众号内换取code时，scope 必须设置为 snsapi_userinfo，snsapi_base不会返回unionid
         * **/
        try {
            // 1. 获取 access_token 和 openid
            const tokenUrl = loginType === 'mp'
                ? 'https://api.weixin.qq.com/sns/oauth2/access_token'  // 公众号接口
                : 'https://api.weixin.qq.com/sns/oauth2/access_token';  // 开放平台接口

            const tokenResponse = await axios.get(tokenUrl, {
                params: {
                    appid: process.env[loginType === 'mp' ? 'WECHAT_MP_APP_ID' : 'WECHAT_APP_ID'],
                    secret: process.env[loginType === 'mp' ? 'WECHAT_MP_APP_SECRET' : 'WECHAT_APP_SECRET'],
                    code: query.code,
                    grant_type: 'authorization_code'
                }
            });

            console.log('Step 1 - Token response:', tokenResponse.data);
            const { access_token, openid, unionid } = tokenResponse.data;

            // 2. 获取用户信息
            let userInfo;
            if (loginType === 'mp' && tokenResponse.data.scope === 'snsapi_base') {
                // 静默授权模式，只有基本信息
                userInfo = {
                    openid,
                    unionid,
                    nickname: openid.substring(0, 8), // 使用 openid 前8位作为昵称
                    headimgurl: '' // 没有头像
                };
            } else {
                // 不同的用户信息接口
                const userInfoUrl = loginType === 'mp'
                    ? 'https://api.weixin.qq.com/sns/userinfo'  // 公众号接口
                    : 'https://api.weixin.qq.com/sns/userinfo';  // 开放平台接口

                const userResponse = await axios.get(userInfoUrl, {
                    params: {
                        access_token,
                        openid,
                        unionid,
                        lang: 'zh_CN'
                    }
                });
                // console.log('Step 2 - User info:', userResponse.data);
                userInfo = userResponse.data;
            }

            // 3. 处理用户信息（保持原有逻辑）
            const { nickname, headimgurl } = userInfo;
            // 使用unionid作为seed来生成强密码
            const _password = mattermostProvider.generateStrongPassword(unionid)

            // 4. 返回标准化的用户信息（保持原有逻辑）
            return {
                id: unionid || openid,
                username: nickname || openid.substring(0, 8),
                email: `${unionid || openid}@wechat.com`,
                password: _password,
                provider: 'wechat',
                confirmed: true,
                blocked: false,
                wechatProfile: {
                    openid,
                    unionid,
                    nickname,
                    avatar: headimgurl
                }
            };

        } catch (error) {
            console.error('WeChat provider error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    }
});
