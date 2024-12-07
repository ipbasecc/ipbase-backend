// src/extensions/users-permissions/controllers/auth.js
const mattermostProvider = require('../providers/mattermost');
const wechatProvider = require('../providers/wechat');

module.exports = ({ strapi, originalController }) => {
    return {
        register: async (ctx) => {
            const mmapi = strapi.plugin('mattermost').service('mmapi');
            try {
                function formatString(str) {
                    str = str.trim();
                    str = str.replace(/\s+/g, '_');
                    return str;
                }

                const { username, password, email } = ctx.request.body;

                // 验证必填字段
                if (!username) throw new Error('Username is required');
                if (!email) throw new Error('Email is required');
                if (!password) throw new Error('Password is required');

                const mmPassword = mattermostProvider.generateStrongPassword();
                const _params = {
                    email: email,
                    username: formatString(username),
                    password: mmPassword,
                }

                const createMmUser = await mmapi.createUser(_params);
                if(createMmUser?.data){
                    // 准备用户数据
                    const originalBody = ctx.request.body;
                    ctx.request.body = {
                        ...originalBody,
                        provider: originalBody.provider || 'local',
                        mm_profile: createMmUser.data,
                        mm_password: mattermostProvider.encryptPassword(mmPassword),
                    };

                    // 等待原始注册方法完成
                    await originalController.register(ctx);

                    // 确保注册成功并且有响应
                    if (!ctx.body) {
                        throw new Error('Registration failed');
                    }

                    try {
                        // 获取 Mattermost token
                        const mmProfile = await mattermostProvider.getMattermostToken(email, mmPassword);

                        // 设置新的响应
                        ctx.body = {
                            ...ctx.body,
                            mm_token: mmProfile.token
                        };
                    } catch (tokenError) {
                        console.error('Failed to get Mattermost token:', tokenError);
                    }
                }
            } catch (error) {
                console.error('Register error:', error);
                ctx.throw(403, error)
            }
        },

        callback: async (ctx) => {
            const mmapi = strapi.plugin('mattermost').service('mmapi');
            try {
                const provider = ctx.params.provider || 'local';
                // console.log('callback setp 1 provider', provider, 'type', loginType)

                if (provider === 'wechat') {

                    let loginType = 'qrcode'; // 默认值

                    try {
                        // console.log('ctx.query', ctx.query)
                        // 尝试解析 state 参数
                        if (ctx.query.state) {
                            const decodedState = decodeURIComponent(ctx.query.state);
                            // console.log('decodedState', decodedState)
                            const decodedString = Buffer.from(decodedState, 'base64').toString();
                            const stateData = JSON.parse(decodedString);
                            // console.log('stateData', stateData)
                            loginType = stateData.loginType || 'qrcode';
                        }
                    } catch (error) {
                        console.error('Failed to parse state parameter:', error);
                        // 解析失败时使用默认值，继续流程
                    }

                    // 微信登录的配置处理
                    const grantStore = strapi.store({
                        type: 'plugin',
                        name: 'users-permissions',
                        key: 'grant'
                    });

                    const grantConfig = await grantStore.get();
                    const wechatConfig = loginType === 'mp'
                        ? grantConfig.wechat.mp
                        : grantConfig.wechat.qrcode;

                    // 更新当前请求的配置
                    await grantStore.set({
                        value: {
                            ...grantConfig,
                            wechat: {
                                ...grantConfig.wechat,
                                key: wechatConfig.key,
                                secret: wechatConfig.secret,
                                callback: wechatConfig.callback,
                                scope: wechatConfig.scope,
                                authorize_url: wechatConfig.authorize_url,
                                access_url: wechatConfig.access_url,
                                profile_url: wechatConfig.profile_url
                            }
                        }
                    });

                    // 调用 wechat provider 获取用户信息
                    const wechatUserInfo = await wechatProvider({ purest: null }).callback({
                        query: ctx.query,
                        loginType
                    });
                    console.log('callback setp 2 wechatUserInfo', wechatUserInfo)

                    // 检查用户是否存在 - 将 email 转换为小写进行查询
                    const user = await strapi.query('plugin::users-permissions.user').findOne({
                        where: { email: wechatUserInfo.email.toLowerCase() }
                    });

                    if (user) { 
                        // 已存在用户，使用本地登录流程
                        const authController = strapi.plugins['users-permissions'].controllers.auth;
                        ctx.request.body = {
                            identifier: user.email,
                            password: wechatUserInfo.password
                        };

                        // 临时保存原始参数
                        const originalParams = ctx.params;
                        // 修改 params 以使用本地登录
                        ctx.params = { provider: 'local' };

                        try {
                            await authController.callback(ctx);
                        } finally {
                            // 恢复原始参数
                            ctx.params = originalParams;
                        }
                    } else {
                        // console.log('callback setp 3 is new user')
                        // 新用户，需要创建账号
                        // 1. 先检查 Mattermost 是否存在该用户
                        try {
                            const existingMmUser = await mmapi.findUserByEmail(wechatUserInfo.email);
                            // console.log('callback setp 3.1 check existing mm user:', existingMmUser?.data);

                            if (existingMmUser?.data) {
                                // 发现重复用户，删除它
                                // console.log('callback setp 3.2 deleting duplicate mm user:', existingMmUser.data.id);
                                const remove = await mmapi.deleteUser(existingMmUser.data.id);
                                // console.log('callback setp 3.3 duplicate mm user deleted', remove);
                            }
                        } catch (mmError) {
                            console.error('Mattermost user check/delete error:', mmError);
                            // 这里的错误不影响后续流程，继续创建新用户
                        }

                        // 2. 创建 Mattermost 用户
                        const mmPassword = mattermostProvider.generateStrongPassword();
                        const createMmUser = await mmapi.createUser({
                            email: wechatUserInfo.email,
                            username: wechatUserInfo.id,
                            password: mmPassword,
                            nickname: wechatUserInfo.username
                        });
                        // console.log('callback setp 4 createMmUser', createMmUser)

                        if (!createMmUser?.data) {
                            throw new Error('Failed to create Mattermost user');
                        }

                        // 3. 获取 Mattermost token
                        let mm_token = null;
                        try {
                            const mmProfile = await mattermostProvider.getMattermostToken(
                                wechatUserInfo.email,
                                mmPassword
                            );
                            // console.log('callback setp 5 getMattermostToken', mmProfile)
                            mm_token = mmProfile.token;
                        } catch (tokenError) {
                            console.error('Failed to get Mattermost token:', tokenError);
                        }

                        // 4. 准备创建 Strapi 用户
                        const userData = {
                            ...wechatUserInfo,
                            password: wechatUserInfo.password,
                            provider: 'wechat',
                            mm_profile: createMmUser.data,
                            mm_password: mattermostProvider.encryptPassword(mmPassword),
                        };

                        // 5. 使用注册方法创建用户
                        ctx.request.body = userData;
                        await originalController.register(ctx);
                        // console.log('callback setp 6 register strapi user', ctx.body)

                        // 6. 在响应中添加 Mattermost token
                        if (ctx.body && mm_token) {
                            const strapi_user = ctx.body?.user;
                            if(strapi_user){
                                const mm_user_props = {
                                    strapi_username: strapi_user.username
                                }
                                const mm_user = createMmUser.data
                                // console.log('mm_user', mm_user)
                                const update_mm_user_params = {
                                    id: mm_user.id,
                                    email: mm_user.email,
                                    username: mm_user.username,
                                    props: mm_user_props
                                }
                                // console.log('update_mm_user_params', update_mm_user_params)
                                try {
                                    await mmapi.updateUser(mm_user.id, update_mm_user_params)
                                } catch (e) {
                                    console.error('Failed to update mm_user props:', e);
                                }
                            }
                            ctx.body = {
                                ...ctx.body,
                                mm_token
                            };
                        }
                    }
                } else {
                    // 非微信登录，使用原有逻辑
                    await originalController.callback(ctx);
                }

                // 后续的 Mattermost token 处理逻辑（针对已存在用户的登录）
                if (ctx.body?.user) {
                    try {
                        const user = await strapi.query('plugin::users-permissions.user').findOne({
                            where: { id: ctx.body.user.id },
                            populate: ['wechat']
                        });

                        if (user?.mm_password) {
                            try {
                                const mmProfile = await mattermostProvider.getMattermostToken(
                                    user.email,
                                    mattermostProvider.decryptPassword(user.mm_password)
                                );

                                ctx.body = {
                                    ...ctx.body,
                                    mm_token: mmProfile.token
                                };
                            } catch (tokenError) {
                                console.error('Failed to get Mattermost token:', tokenError);
                            }
                        } else {
                            // 用户没有 mm_password，检查 Mattermost 是否存在该用户
                            try {
                                // 查找 Mattermost 用户
                                const findMmUser = await mmapi.findUserByEmail(user.email);

                                // 生成新的强密码
                                const mmPassword = mattermostProvider.generateStrongPassword();

                                if (findMmUser?.data) {
                                    // Mattermost 用户存在，更新密码
                                    await mmapi.updateUserPassword(findMmUser.data.id, mmPassword);

                                    // 更新用户的 mm_profile 和 mm_password
                                    await strapi.query('plugin::users-permissions.user').update({
                                        where: { id: user.id },
                                        data: {
                                            mm_profile: findMmUser.data,
                                            mm_password: mattermostProvider.encryptPassword(mmPassword),
                                        }
                                    });
                                } else {
                                    // Mattermost 用户不存在，创建新用户
                                    const createMmUser = await mmapi.createUser({
                                        email: user.email,
                                        username: user.username,
                                        password: mmPassword,
                                    });

                                    if (createMmUser?.data) {
                                        // 更新用户的 mm_profile 和 mm_password
                                        await strapi.query('plugin::users-permissions.user').update({
                                            where: { id: user.id },
                                            data: {
                                                mm_profile: createMmUser.data,
                                                mm_password: mattermostProvider.encryptPassword(mmPassword),
                                            }
                                        });
                                    }
                                }

                                // 获取 Mattermost token
                                try {
                                    const mmProfile = await mattermostProvider.getMattermostToken(
                                        user.email,
                                        mmPassword
                                    );

                                    ctx.body = {
                                        ...ctx.body,
                                        mm_token: mmProfile.token
                                    };
                                } catch (tokenError) {
                                    console.error('Failed to get Mattermost token after user creation/update:', tokenError);
                                }
                            } catch (mmError) {
                                console.error('Failed to handle Mattermost user:', mmError);
                            }
                        }
                    } catch (userError) {
                        console.error('Failed to get user details:', userError);
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                ctx.throw(403, error);
            }
        }
    }
};
