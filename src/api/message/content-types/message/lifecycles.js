module.exports = {
    // 文档地址：https://docs.strapi.io/dev-docs/backend-customization/models#available-lifecycle-events
    // 只有超级管理员或者message sender才可以修改和删除message
  
    async beforeUpdate(event) {
        const message_id = event.params.where.id;

        // 从全局获取 ctx
        const ctx = strapi.requestContext.get();
        const user_id = ctx.state.user.id;
        const user_role = ctx.state.user.role.id;
  
        const message = await strapi.service('api::message.message').findOne(message_id,{ populate: ['sender'] });
        const message_sender = message.sender || null;

        const can_update =
            user_role == process.env.SUPER_MANAGER_ROLE ? true :
            message_sender && message_sender.id == user_id
            ? true : false

        if(!can_update) {
            throw new Error('只有超级管理员、作者可以修改当前内容');
            // ctx.send('只有超级管理员、作者可以修改当前内容')
        }
    },
    async beforeDelete(event) {
        const message_id = event.params.where.id;

        // 从全局获取 ctx
        const ctx = strapi.requestContext.get();
        const user_id = ctx.state.user.id;
        const user_role = ctx.state.user.role.id;
  
        const message = await strapi.service('api::message.message').findOne(message_id,{ populate: ['sender'] });
        const message_sender = message.sender || null;

        const can_delete =
            user_role == process.env.SUPER_MANAGER_ROLE ? true :
            message_sender && message_sender.id == user_id
            ? true : false

        if(!can_delete) {
            throw new Error('只有超级管理员、作者可以删除当前内容');
            // ctx.send('只有超级管理员、作者可以删除当前内容')
        }
    },
};
