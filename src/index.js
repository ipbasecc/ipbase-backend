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
            async (next, parent, args, context, info) => {
                // console.log('context', context)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  let user = await strapi.entityService.findOne('plugin::users-permissions.user',id, {
                      populate: {
                          user_channel: {
                              fields: ['id'],
                              populate: {
                                  post: {
                                      fields: ['id'],
                                  }
                              }
                          }
                      }
                  });
                //   console.log('user', user)
                  if(!user?.user_channel){
                      throw new Error('channel not exists');
                  } else {
                      const channelId = user.user_channel.id;
                      args.data.id = channelId;
                    //   console.log('args', args)
                      const res = await next(parent, args, context, info);
                      return res
                  }
              }
            },
          ],
        },
        'Mutation.createPost': {
          middlewares: [
            async (next, parent, args, context, info) => {
                // console.log('context', context)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  let user = await strapi.entityService.findOne('plugin::users-permissions.user',id, {
                      populate: {
                          user_channel: {
                              fields: ['id'],
                              populate: {
                                  post: {
                                      fields: ['id'],
                                  }
                              }
                          }
                      }
                  });
                //   console.log('user', user)
                  if(user?.user_channel?.post){
                      throw new Error('channel post already exists');
                  } else {
                      const channelId = user.user_channel.id;
                      args.data.channel = channelId;
                      args.data.publishedAt = new Date().toISOString();
                    //   console.log('args', args)
                      const res = await next(parent, args, context, info);
                      return res
                  }
              }
            },
          ],
        },
        'Mutation.createMessage': {
          middlewares: [
            async (next, parent, args, context, info) => {
                // console.log('context', context)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  let user = await strapi.entityService.findOne('plugin::users-permissions.user',id, {
                      populate: {
                          user_channel: {
                              fields: ['id'],
                              populate: {
                                  post: {
                                      fields: ['id'],
                                  }
                              }
                          }
                      }
                  });
                //   console.log('user', user)
                  if(!user?.user_channel?.post){
                      throw new Error('channel post not exists');
                  } else {
                      const postId = user.user_channel.post.id;
                      args.data.post = postId;
                      args.data.publishedAt = new Date().toISOString();
                    //   console.log('args', args)
                      const res = await next(parent, args, context, info);
                      return res
                  }
              }
            },
          ],
        },
        'Mutation.updateUsersBasicinfo': {
          middlewares: [
            async (next, parent, args, context, info) => {
                // console.log('context', context)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  let user = await strapi.entityService.findOne('plugin::users-permissions.user',id);
                //   console.log('user', user)
                  if(!user){
                      throw new Error('channel not exists');
                  } else {
                      args.id = user.id;
                    //   console.log('args', args)
                      const res = await next(parent, args, context, info);
                      return res
                  }
              }
            },
          ],
        },
        'Mutation.createElement': {
          middlewares: [
            async (next, parent, args, context, info) => {
            //   console.log('args', args)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  let user = await strapi.entityService.findOne('plugin::users-permissions.user',id,{
                      populate: {
                          user_channel: {
                              fields: ['id']
                          }
                      }
                  });
                //   console.log('user', user)
                  if(!user?.user_channel){
                      throw new Error('your channel not exists');
                  } else {
                      args.data.channel = user.user_channel.id;
                      args.data.publishedAt = new Date().toISOString();
                    //   args.data.creator = id;
                      if(!args.data.author){
                          args.data.author = id;
                      }
                      console.log('args', args)
                      const res = await next(parent, args, context, info);
                      return res
                  }
              }
            },
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
