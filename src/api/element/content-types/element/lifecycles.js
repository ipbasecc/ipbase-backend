module.exports = {
    // 文档地址：https://docs.strapi.io/dev-docs/backend-customization/models#available-lifecycle-events
  
    async afterCreate(event) {
        const { result, params } = event;
        const element_id = event.result.id;

        // 从全局获取 ctx
        const ctx = strapi.requestContext.get();
        const user_id = ctx.state.user.id
  
        const element = await strapi.service('api::element.element').findOne(element_id,{ populate: '*' });
        const element_author = element.author || null;
        if(!element.post) {
            await strapi.entityService.create('api::post.post', {
                data: {
                    title: `element${element.id}'s Message Board`,
                    element: element.id,
                    publishedAt: Date.now()
                },
              });
        }

        await strapi.service('api::element.element').update(
            element_id,
            {
                data: {
                    creator: user_id, // 指定创建者
                    author: element_author || user_id // 如果指定了作者，那么使用指定的作者，否则，指定作者为创建者
                }
            }
        );
    },
    async beforeUpdate(event) {
        const element_id = event.params.where.id;

        // 从全局获取 ctx
        const ctx = strapi.requestContext.get();
        const user_id = ctx.state.user.id;
        
        const allowed_handlers = ['element.viewed','element.favorite','element.like','element.unlike'];
        const current_handler = ctx.state.route.handler;
        const user_role = ctx.state.user.role?.id || null;
        const isBackend = ctx.state.user.roles?.length > 0
  
        const element = await strapi.service('api::element.element').findOne(element_id,{ populate: ['creator','author'] });
        const element_creator = element.creator || null;
        const element_author = element.author || null;

        const can_update =
            isBackend ? true :
            user_role == process.env.SUPER_MANAGER_ROLE ? true :
            allowed_handlers.includes(current_handler) ? true :
            (element_creator && element_creator.id == user_id || element_author && element_author.id == user_id)
            ? true :
            (!element_creator && !element_author)
            ? true : false
        
        if(!can_update) {
            throw new Error('只有超级管理员、作者、创建者可以修改当前内容');
            ctx.send('只有超级管理员、作者、创建者可以修改当前内容')
        }
    },
    async afterUpdate(event) {
        const element_id = event.params.where.id;

        // 从全局获取 ctx
        const ctx = strapi.requestContext.get();
        const ignore_handlers = ['element.viewed','element.favorite','element.like','element.unlike'];
        const current_handler = ctx.state.route.handler;
        if(ignore_handlers.includes(current_handler)) {
            return
        }

        const user_id = ctx.state.user.id;
  
        const element = await strapi.service('api::element.element').findOne(element_id,{ populate: ['creator','author'] });
        if(!element.creator) {
            await strapi.service('api::element.element').update(
                element_id,
                {
                    data: {
                        creator: user_id
                    }
                }
            );
        }
        if(!element.author) {
            await strapi.service('api::element.element').update(
                element_id,
                {
                    data: {
                        author: user_id
                    }
                }
            );
        }
    },
    async beforeDelete(event) {
        const element_id = event.params.where.id;

        // 从全局获取 ctx
        const ctx = strapi.requestContext.get();
        const user_id = ctx.state.user.id;
        const user_role = ctx.state.user.role.id;
  
        const element = await strapi.service('api::element.element').findOne(element_id,{ populate: ['creator','author'] });
        const element_creator = element.creator || null;
        const element_author = element.author || null;

        const can_delete =
            user_role == process.env.SUPER_MANAGER_ROLE ? true :
            element_creator && element_creator.id == user_id
            ? true :
            (!element_creator && element_author && element_author.id == user_id)
            ? true : false
        
        if(!can_delete) {
            throw new Error('只有超级管理员、作者、创建者可以删除当前内容');
            ctx.send('只有超级管理员、作者、创建者可以删除当前内容')
        }
    },
};
