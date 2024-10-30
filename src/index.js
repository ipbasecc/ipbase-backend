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
        'Mutation.updateMessage': {
          middlewares: [
            async (next, parent, args, context, info) => {
                // console.log('context', context)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  let message = await strapi.entityService.findOne('api::message.message',args.id, {
                      populate: {
                          sender: {
                              fields: ['id']
                          }
                      }
                  });
                //   console.log('user', user)
                  if(message?.sender?.id !== id){
                      throw new Error('you have no auth to edit this message');
                  } else {
                      const res = await next(parent, args, context, info);
                      return res
                  }
              }
            },
          ],
        },
        'Mutation.deleteMessage': {
          middlewares: [
            async (next, parent, args, context, info) => {
                // console.log('context', context)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  let message = await strapi.entityService.findOne('api::message.message',args.id, {
                      populate: {
                          sender: {
                              fields: ['id']
                          }
                      }
                  });
                //   console.log('user', user)
                  if(message?.sender?.id !== id){
                      throw new Error('you have no auth to edit this message');
                  } else {
                      const res = await next(parent, args, context, info);
                      return res
                  }
              }
            },
          ],
        },
        'Mutation.updateUsersPermissionsUser': {
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
                      throw new Error('user not exists');
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
        'Mutation.updateElement': {
          middlewares: [
            async (next, parent, args, context, info) => {
            //   console.log('args', args)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  let element = await strapi.entityService.findOne('api::element.element',args.id,{
                      populate: {
                          creator: {
                              fields: ['id']
                          },
                          author: {
                              fields: ['id']
                          }
                      }
                  });
                //   console.log('user', user)
                  if(!element?.creator?.id !== id && !element?.author?.id !== id){
                      throw new Error('this element not belong to you or not exists');
                  } else {
                      const res = await next(parent, args, context, info);
                      return res
                  }
              }
            },
          ],
        },
        'Mutation.deleteElement': {
          middlewares: [
            async (next, parent, args, context, info) => {
            //   console.log('args', args)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  let element = await strapi.entityService.findOne('api::element.element',args.id,{
                      populate: {
                          creator: {
                              fields: ['id']
                          },
                          author: {
                              fields: ['id']
                          }
                      }
                  });
                //   console.log('user', user)
                  if(!element?.creator?.id !== id && !element?.author?.id !== id){
                      throw new Error('this element not belong to you or not exists');
                  } else {
                      const res = await next(parent, args, context, info);
                      return res
                  }
              }
            },
          ],
        },
        'Query.favorite': {
          middlewares: [
            async (next, parent, args, context, info) => {
            //   console.log('args', args)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  let user = await strapi.entityService.findOne('plugin::users-permissions.user',id,{
                      populate: {
                          favorites: {
                              fields: ['id']
                          }
                      }
                  });
                //   console.log('user', user)
                  if(!user?.favorites.map(i => i.id)?.includes(args.id)){
                      throw new Error('this favorite not belong to you or not exists');
                  } else {
                      const res = await next(parent, args, context, info);
                      return res
                  }
              }
            },
          ],
        },
        'Query.favorites': {
          middlewares: [
            async (next, parent, args, context, info) => {
            //   console.log('args', args)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  if(!args.filters){
                      args.filters = {}
                  }
                  args.filters.owner = {
                      id: {
                        eq: id
                       }
                  }
                  const res = await next(parent, args, context, info);
                  return res
              }
            },
          ],
        },
        'Mutation.createFavorite': {
          middlewares: [
            async (next, parent, args, context, info) => {
                // console.log('context', context)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  args.data.owner = id
                  const res = await next(parent, args, context, info);
                  return res
              }
            },
          ],
        },
        'Mutation.updateFavorite': {
          middlewares: [
            async (next, parent, args, context, info) => {
                // console.log('context', context)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  let favorite = await strapi.entityService.findOne('api::favorite.favorite',args.id, {
                      populate: {
                          owner: {
                              fields: ['id']
                          }
                      }
                  });
                //   console.log('user', user)
                  if(favorite?.owner?.id !== id){
                      throw new Error('this favorite is not belong to you or not exists');
                  } else {
                      const res = await next(parent, args, context, info);
                      return res
                  }
              }
            },
          ],
        },
        'Mutation.deleteFavorite': {
          middlewares: [
            async (next, parent, args, context, info) => {
                // console.log('context', context)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  let favorite = await strapi.entityService.findOne('api::favorite.favorite',args.id, {
                      populate: {
                          owner: {
                              fields: ['id']
                          }
                      }
                  });
                //   console.log('user', user)
                  if(favorite?.owner?.id !== id){
                      throw new Error('this favorite is not belong to you or not exists');
                  } else {
                      const res = await next(parent, args, context, info);
                      return res
                  }
              }
            },
          ],
        },
        'Mutation.createBizcard': {
          middlewares: [
            async (next, parent, args, context, info) => {
                // console.log('context', context)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  args.data.user = id
                  const res = await next(parent, args, context, info);
                  return res
              }
            },
          ],
        },
        'Mutation.updateBizcard': {
          middlewares: [
            async (next, parent, args, context, info) => {
                // console.log('context', context)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  let bizcard = await strapi.entityService.findOne('api::bizcard.bizcard',args.id, {
                      populate: {
                          user: {
                              fields: ['id']
                          }
                      }
                  });
                //   console.log('user', user)
                  if(bizcard?.user?.id !== id){
                      throw new Error('this bizcard is not belong to you or not exists');
                  } else {
                      const res = await next(parent, args, context, info);
                      return res
                  }
              }
            },
          ],
        },
        'Mutation.deleteBizcard': {
          middlewares: [
            async (next, parent, args, context, info) => {
                // console.log('context', context)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  let bizcard = await strapi.entityService.findOne('api::bizcard.bizcard',args.id, {
                      populate: {
                          user: {
                              fields: ['id']
                          }
                      }
                  });
                //   console.log('user', user)
                  if(bizcard?.user?.id !== id){
                      throw new Error('this bizcard is not belong to you or not exists');
                  } else {
                      const res = await next(parent, args, context, info);
                      return res
                  }
              }
            },
          ],
        },
        'Mutation.createBizcardCollection': {
          middlewares: [
            async (next, parent, args, context, info) => {
                // console.log('context', context)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  args.data.user = id
                  const res = await next(parent, args, context, info);
                  return res
              }
            },
          ],
        },
        'Mutation.updateBizcardCollection': {
          middlewares: [
            async (next, parent, args, context, info) => {
                // console.log('context', context)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  let bizcard = await strapi.entityService.findOne('api::bizcard-collection.bizcard-collection',args.id, {
                      populate: {
                          user: {
                              fields: ['id']
                          }
                      }
                  });
                //   console.log('user', user)
                  if(bizcard?.user?.id !== id){
                      throw new Error('this bizcard collection is not belong to you or not exists');
                  } else {
                      const res = await next(parent, args, context, info);
                      return res
                  }
              }
            },
          ],
        },
        'Mutation.deleteBizcardCollection': {
          middlewares: [
            async (next, parent, args, context, info) => {
                // console.log('context', context)
              const { id } = context.state.user;
              if(!id){
                  throw new Error('User is not authenticated');
              } else {
                  let bizcard = await strapi.entityService.findOne('api::bizcard.bizcard',args.id, {
                      populate: {
                          user: {
                              fields: ['id']
                          }
                      }
                  });
                //   console.log('user', user)
                  if(bizcard?.user?.id !== id){
                      throw new Error('this bizcard collection is not belong to you or not exists');
                  } else {
                      const res = await next(parent, args, context, info);
                      return res
                  }
              }
            },
          ],
        },
      },
    });
    
    // 向Strapid对象注入一个方法以便全局可以使用
    // 这里是检查插件是否启用，方便业务内判断并执行对应逻辑
    const checkPluginEnable = (plugin_name) => {
        const Plugin = strapi.plugins[plugin_name];
        return Plugin && Object.keys(Plugin).length > 0 ? true : false;
    }
    strapi.checkPluginEnable = checkPluginEnable;
  },

  bootstrap({ strapi }) {
      const mmapi = strapi.plugin('mattermost').service('mmapi');
      strapi.mmapi = mmapi;
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
