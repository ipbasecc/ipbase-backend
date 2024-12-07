// src/extensions/users-permissions/strapi-server.js
const user = require('./content-types/user');
const createUserController = require('./controllers/user');
const createAuthController = require('./controllers/auth');

const wechatProvider = require('./providers/wechat');
const grantConfig = require('./config/grant-config');


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

    // 修改 auth controller 配置
    plugin.controllers.auth = {
        ...originalAuthController,
        callback: authController.callback
    };

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
        queryFavoritedCards: userController.queryFavoritedCards,
        favoriteCard: userController.favoriteCard,
        removefavoriteCard: userController.removefavoriteCard,
        queryLikedCards: userController.queryLikedCards,
        likeCard: userController.likeCard,
        removeLikeCard: userController.removeLikeCard,
        unlikeCard: userController.unlikeCard,
        removeUnlikeCard: userController.removeUnlikeCard,
        batchUpdateMattermostPasswords: userController.batchUpdateMattermostPasswords
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
      {
          method: 'GET',
          path: '/user/me/favorites/cards',
          handler: 'user.queryFavoritedCards',
          config: {
              perfix: '',
              policies: []
          }
      },
      {
          method: 'POST',
          path: '/user/me/favorites/cards/add',
          handler: 'user.favoriteCard',
          config: {
              perfix: '',
              policies: []
          }
      },
      {
          method: 'POST',
          path: '/user/me/favorites/cards/remove',
          handler: 'user.removefavoriteCard',
          config: {
              perfix: '',
              policies: []
          }
      },
      {
          method: 'GET',
          path: '/user/me/likes/cards',
          handler: 'user.queryLikedCards',
          config: {
              perfix: '',
              policies: []
          }
      },
      {
          method: 'POST',
          path: '/user/me/likes/cards/add',
          handler: 'user.likeCard',
          config: {
              perfix: '',
              policies: []
          }
      },
      {
          method: 'POST',
          path: '/user/me/likes/cards/remove',
          handler: 'user.removeLikeCard',
          config: {
              perfix: '',
              policies: []
          }
      },
      {
          method: 'POST',
          path: '/user/me/unlikes/cards/add',
          handler: 'user.unlikeCard',
          config: {
              perfix: '',
              policies: []
          }
        },
        {
            method: 'POST',
            path: '/user/me/unlikes/cards/remove',
            handler: 'user.removeUnlikeCard',
            config: {
                perfix: '',
                policies: []
            }
        },
        {
            method: 'POST',
            path: '/user/me/batch-update-mm-passwords',
            handler: 'user.batchUpdateMattermostPasswords',
            config: {
                prefix: '',
                policies: []
            }
        }
    )
    // 修改路由配置
    const wechatRoutes = [
      {
          method: 'GET',
          path: '/auth/wechat/callback',  // 主回调路由
          handler: 'auth.callback',
          config: {
              auth: false,
              prefix: '',
              policies: []
          }
      },
      {
          method: 'GET',
          path: '/connect/wechat/redirect',  // 新增重定向路由
          handler: 'auth.callback',
          config: {
              auth: false,
              prefix: '',
              policies: []
          }
      }
  ];
      // 添加路由
      plugin.routes['content-api'].routes.push(...wechatRoutes);

    // 获取原始的 providers service
    const providersService = plugin.services.providers({strapi});

    // 保存原始的 bootstrap 方法
    const originalBootstrap = plugin.bootstrap;

    // 扩展 bootstrap 方法
    plugin.bootstrap = async function(app) {
      await originalBootstrap.call(this, app);

      // 更新 grant 配置
      const grantStore = strapi.store({
          type: 'plugin',
          name: 'users-permissions',
          key: 'grant'
      });

      // 更新 provider 配置
      const providersStore = strapi.store({
          type: 'plugin',
          name: 'users-permissions',
          key: 'providers'
      });

      const [currentGrantConfig, currentProvidersConfig] = await Promise.all([
          grantStore.get(),
          providersStore.get()
      ]);

      // 更新配置
      await Promise.all([
          grantStore.set({
              value: {
                  ...currentGrantConfig,
                  ...grantConfig
              }
          }),
          providersStore.set({
              value: {
                  ...currentProvidersConfig,
                  ...grantConfig
              }
          })
      ]);
  };
    return plugin;
}
