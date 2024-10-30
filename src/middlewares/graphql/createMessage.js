module.exports = {
    async createMessage(next, args, context, info) {
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
    }
};