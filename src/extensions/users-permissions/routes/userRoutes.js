// src/extensions/users-permissions/routes/userRoutes.js
// const userController = require('../controllers/user');
const userController = require('../controllers/user')(strapi);

module.exports = [
  {
      method: 'GET',
      path: '/user/me/init',
      handler: userController.init,
      config: {
          perfix: '',
          policies: []
      }
  },
  {
      method: 'GET',
      path: '/user/me/kanban/:id',
      handler: userController.findKanbanByTodogroup,
      config: {
          perfix: '',
          policies: []
      }
  },
  {
      method: 'PUT',
      path: '/user/me/todogroups',
      handler: userController.updateTodogroups,
      config: {
          perfix: '',
          policies: []
      }
  },
  {
      method: 'POST',
      path: '/user/me/avatar',
      handler: userController.updateAvatar,
      config: {
          perfix: '',
          policies: []
      }
  },
  {
      method: 'POST',
      path: '/user/me/config',
      handler: userController.modifyConfig,
      config: {
          perfix: '',
          policies: []
      }
  },
  {
      method: 'POST',
      path: '/user/me/updateFollowed',
      handler: userController.updateFollowed,
      config: {
          perfix: '',
          policies: []
      }
  },
  {
      method: 'PUT',
      path: '/user/me/default_team',
      handler: userController.setDefaultTeam,
      config: {
          perfix: '',
          policies: []
      }
  },
  {
      method: 'GET',
      path: '/user/me/refreshToken',
      handler: userController.refreshToken,
      config: {
          perfix: '',
          policies: []
      }
  },
];