// src/extensions/users-permissions/strapi-server.js
const user = require('./content-types/user');

const userRoutes = require('./routes/userRoutes');
const createUserController = require('./controllers/user');
const createAuthController = require('./controllers/auth');

module.exports = (plugin) => {
    const userController = createUserController(strapi);
    // 保存原始控制器方法的引用
    const originalAuthController = plugin.controllers.auth;
    
    // 创建自定义控制器，传入原始控制器引用
    const authController = require('./controllers/auth')({ 
        strapi,
        originalController: originalAuthController 
    });

    // 确保完全覆盖 auth 控制器
    plugin.controllers.auth = {
        ...originalAuthController,  // 保留其他原始方法
        register: authController.register,
        resetPassword: authController.resetPassword,
        changePassword: authController.changePassword
    };
    
    plugin.contentTypes.user = user;
    
    
    plugin.routes['content-api'].routes.push(...userRoutes);

    return plugin;
}
