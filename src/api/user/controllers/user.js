'use strict';

/**
 * A set of functions called "actions" for `user`
 */

module.exports = {
  addFollw: async () => {
    const ctx = strapi.requestContext.get();
    const user_id = ctx.state.user.id

    try {

      const { body } = ctx.request;
      const will_follow = body.will_follow

      const user = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        user_id,
        { populate: ['follows'] }
      );

      const follows_ids = user.follows.map( i => i.id);
      if(follows_ids.includes(will_follow)) {
        ctx.body = '您已关注过此用户了，无须重复关注';
        return
      }

      const push_follow = await strapi.entityService.update('plugin::users-permissions.user',
        user_id,
        {
          data: {
            follows: {
              connect: [will_follow]
            }
          }
        }
      );
      const new_user = await strapi.entityService.findOne(
          'plugin::users-permissions.user',
          user_id,
          { populate: ['follows'] }
      );
      const follows = new_user.follows
      // const send_data = this.transformResponse(follows);
      return follows;
    } catch (err) {
      ctx.body = err;
    }
  }
};
