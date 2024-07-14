'use strict';

/**
 * kanban router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::kanban.kanban');

//自定义路由，希望覆盖默认路由，但不成功
// module.exports = createCoreRouter('api::kanban.kanban', {
//     prefix: '/projects/:project_id',
//     only: ['find', 'findOne'],
//     except: [],
//     config: {
//       find: {
//         auth: false,
//         policies: [],
//         middlewares: [],
//       },
//       findOne: {},
//       create: {},
//       update: {},
//       delete: {},
//     },
// });