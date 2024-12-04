// src/extensions/users-permissions/controllers/auth.js
const userService = require('../services/userService');

// 保存原始方法的引用
module.exports = ({ strapi, originalController }) => {
    // 保存原始方法的引用
    // const originalRegister = strapi.plugin('users-permissions').controller('auth').register;
    // const originalResetPassword = strapi.plugin('users-permissions').controller('auth').resetPassword;
    // const originalChangePassword = strapi.plugin('users-permissions').controller('auth').changePassword;
    return {
        register: async (ctx) => {
            try {
                const { username, password, email } = ctx.request.body;
                // console.log('body',{ username, password, email });
                // 实在不知道如何将password传递到生命周期中来创建Mattermost team，所以先创建
                // console.log('password',password);
                const mmapi = strapi.plugin('mattermost').service('mmapi');
                function formatString(str) {
                  // 使用正则表达式替换首尾空格
                  str = str.trim();
                  // 使用正则表达式替换中间的空格为下划线
                  str = str.replace(/\s+/g, '_');
                  return str;
                }
                const _params = {
                    email: email,
                    username: formatString(username),
                    password: password,
                }
                    // console.log('_params', _params)
                const createMmUser = await mmapi.createUser(_params);
                if(createMmUser?.data){
                    ctx.request.body.mm_profile = createMmUser.data;
                    return await originalController.register(ctx);
                }
            } catch (error) {
                console.error('Register error:', error);
                throw error;
            }
        },
        resetPassword: async (ctx) => {
            try {
                const { code, password, passwordConfirmation } = ctx.request.body;
                // console.log('code',{ code, password, passwordConfirmation });
                // const user = await strapi.entityService.findOne('plugin::users-permissions.user',{ resetPasswordToken: code });
        
                const user = await strapi.db.query('plugin::users-permissions.user').findOne({
                    select: ['id','mm_profile'],
                    where: { resetPasswordToken: code },
                })
                // console.log('user',user);
                if(user?.mm_profile){
                    const _params = {
                        // @ts-ignore
                        user_id: user.mm_profile?.id,
                        new_password: password,
                    }
                    const mmapi = strapi.plugin('mattermost').service('mmapi');
                    await mmapi.changeUserPassword(user.mm_profile?.id,_params);
                }
                return await originalController.register(ctx);
            } catch (error) {
                console.error('Register error:', error);
                throw error;
            }
        },
        changePassword: async (ctx) => {
            try {
                const { currentPassword, password, passwordConfirmation } = ctx.request.body;
                const user_id = Number(ctx.state.user.id);
                const user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id);
                if(user?.mm_profile){
                    const _params = {
                        // @ts-ignore
                        user_id: user.mm_profile?.id,
                        new_password: password,
                    }
                    const mmapi = strapi.plugin('mattermost').service('mmapi');
                    await mmapi.changeUserPassword(user.mm_profile?.id,_params);
                }
                return await originalController.changePassword(ctx);
            } catch (error) {
                console.error('Register error:', error);
                throw error;
            }
        }
    }
};
