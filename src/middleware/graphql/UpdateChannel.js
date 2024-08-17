module.exports = async (next, args, context, info) => {
  // 从 context 中获取当前认证的用户信息
  const currentUser = context.state.user;
  if(!currentUser){
      throw new Error('User is not authenticated');
  } else {
      let user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id, {
          populate: {
              user_channel: {
                  fields: ['fileds']
              }
          }
      });
      const updateChannelId = user.user_channel.id;
      args.id = updateChannelId;
      return next(args, context, info);
  }
};
