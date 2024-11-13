// src/extensions/users-permissions/strapi-server.js
const user = require('./content-types/user');
const createUserController = require('./controllers/user');
const createAuthController = require('./controllers/auth');

module.exports = (plugin) => {
    // 保存原始控制器方法的引用
    const originalAuthController = plugin.controllers.auth;
    const originalUserController = plugin.controllers.user;

    // 创建自定义控制器，传入原始控制器引用和 strapi 实例
    const userController = createUserController({ 
        strapi,  // 直接使用 strapi 实例
        originalController: originalUserController 
    });
    const authController = createAuthController({ 
        strapi,  // 直接使用 strapi 实例
        originalController: originalAuthController 
    });

    // 确保完全覆盖 auth 控制器
    plugin.controllers.user = {
        ...originalUserController,  // 保留其他原始方法
        init: userController.init,
        updateTodogroups: userController.updateTodogroups,
        updateAvatar: userController.updateAvatar,
        modifyConfig: userController.modifyConfig,
        updateFollowed: userController.updateFollowed,
        setDefaultTeam: userController.setDefaultTeam,
        update: userController.update,
        findKanbanByTodogroup: userController.findKanbanByTodogroup,
        refreshToken: userController.refreshToken,
    };
    plugin.controllers.auth = {
        ...originalAuthController,  // 保留其他原始方法
        register: authController.register,
        resetPassword: authController.resetPassword,
        changePassword: authController.changePassword
    };
    
    plugin.contentTypes.user = user;
    plugin.routes['content-api'].routes.push(
      {
          method: 'GET',
          path: '/user/me/init',
          handler: 'user.init',
          config: {
              perfix: '',
              policies: []
          }
      },
      {
          method: 'GET',
          path: '/user/me/kanban/:id',
          handler: 'user.findKanbanByTodogroup',
          config: {
              perfix: '',
              policies: []
          }
      },
      {
          method: 'PUT',
          path: '/user/me/todogroups',
          handler: 'user.updateTodogroups',
          config: {
              perfix: '',
              policies: []
          }
      },
      {
          method: 'POST',
          path: '/user/me/avatar',
          handler: 'user.updateAvatar',
          config: {
              perfix: '',
              policies: []
          }
      },
      {
          method: 'POST',
          path: '/user/me/config',
          handler: 'user.modifyConfig',
          config: {
              perfix: '',
              policies: []
          }
      },
      {
          method: 'POST',
          path: '/user/me/updateFollowed',
          handler: 'user.updateFollowed',
          config: {
              perfix: '',
              policies: []
          }
      },
      {
          method: 'PUT',
          path: '/user/me/default_team',
          handler: 'user.setDefaultTeam',
          config: {
              perfix: '',
              policies: []
          }
      },
      {
          method: 'GET',
          path: '/user/me/refreshToken',
          handler: 'user.refreshToken',
          config: {
              perfix: '',
              policies: []
          }
      },
    )

    return plugin;
}