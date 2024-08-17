'use strict';

module.exports = {
  register({ strapi }) {
    const DISABLES = [
        'board', 'card', 'column', 'document',
        'group', 'kanban', 'member', 'member-role',
        'overview', 'project', 'schedule',
        'schedule-event', 'storage', 'storage-file',
        'team', 'team-channel', 'todo', 'todogroup'
    ];

    DISABLES.forEach(api => {
        strapi.plugin('graphql').service('extension').shadowCRUD(`api::${api}.${api}`).disableQueries();
        strapi.plugin('graphql').service('extension').shadowCRUD(`api::${api}.${api}`).disableMutations();
    });

    const extensionService = strapi.plugin('graphql').service('extension');

    extensionService.use({
      resolversConfig: {
        'Mutation.updateChannel': {
          middlewares: [
            './middlewares/graphql/updateChannel.js',
          ],
        },
        'Mutation.createPost': {
          middlewares: [
            './middlewares/graphql/createPost.js',
          ],
        },
        'Mutation.createMessage': {
          middlewares: [
            './middlewares/graphql/createMessage.js',
          ],
        },
      },
    });
  },

  bootstrap({ strapi }) {
    // const server = 'ws://localhost:61337';
    // const { WebsocketProvider } = require('y-websocket');

    // const provider = (room, _ydoc) => {
    //     return new WebsocketProvider(
    //       server, room, _ydoc, { WebSocketPolyfill: require('ws') }
    //     )
    // }
    // strapi.provider = provider

    // const { WebSocketServer } = require("ws");

    // // 创建 yjs ws 服务
    // const yjsws = new WebSocketServer({ port: 61337 });

    // yjsws.on("connection", (conn, req) => {
    //   console.log('"yjs connection"'); // 标识每一个连接用户，用于广播不同的文件协同
    //   conn.onmessage = (event) => {
    //     yjsws.clients.forEach((conn) => {
    //       conn.send(event.data);
    //     });
    //   };

    //   conn.on("close", (conn) => {
    //     console.log("yjs 用户关闭连接");
    //   });
    // })
  }
}
