'use strict';

/**
 * message controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::message.message',({strapi}) => ({

    async like(ctx) {
        await this.validateQuery(ctx);
        const { id } = ctx.params;
        const { query } = ctx;
        const { body } = ctx.request;
        const user_id = body.user_id; // 获取用户ID
        const message_id = body.message_id; // 获取内容ID
        
        const user = await strapi.entityService.findOne(
            'plugin::users-permissions.user',
            user_id,
            { populate: ['liked_messages','unliked_messages'] }
        );


        const user_unliked_messages_ids = user.unliked_messages?.map(i => i.id) || [];
        const has_unliked = user_unliked_messages_ids.includes(message_id);
        if(has_unliked) {
            return 'is_unliked'
        }

        const user_liked_messages_ids = user.liked_messages?.map(i => i.id) || [];
        const has_liked = user_liked_messages_ids.includes(message_id);
        if(has_liked) {    
            await strapi.entityService.update(
                'plugin::users-permissions.user',
                user_id,
                {
                    data: {
                        liked_messages: {
                            disconnect: [message_id] // 关联内容给用户阅读列表
                        }
                    }
                }
            );
        } else {
            await strapi.entityService.update(
                'plugin::users-permissions.user',
                user_id,
                {
                    data: {
                        liked_messages: {
                            connect: [message_id] // 关联内容给用户阅读列表
                        }
                    }
                }
            );
        }

        const message = await strapi.service('api::message.message').findOne(message_id, {
            populate: ['liked_by'],
        });
        const liked_count = message.liked_by.length;
        const updatedMessage = await strapi.service('api::message.message').update(message_id, {data: {liked_count: liked_count}});
        
        const new_user_data =  await strapi.entityService.findOne(
            'plugin::users-permissions.user',
            user_id,
            { populate: ['liked_messages'] }
        );

        const new_liked_ids = new_user_data.liked_messages.map(i => i.id)
        const new_liked_count = updatedMessage.liked_count;

        return { new_liked_ids, new_liked_count };
    },
    async unlike(ctx) {
        await this.validateQuery(ctx);
        const { id } = ctx.params;
        const { query } = ctx;
        const { body } = ctx.request;
        const user_id = body.user_id; // 获取用户ID
        const message_id = body.message_id; // 获取内容ID
        
        const user = await strapi.entityService.findOne(
            'plugin::users-permissions.user',
            user_id,
            { populate: ['liked_messages','unliked_messages'] }
        );

        const user_liked_messages_ids = user.liked_messages?.map(i => i.id) || [];
        const has_liked = user_liked_messages_ids.includes(message_id);
        if(has_liked) {
            return 'is_liked'
        }

        const user_unliked_messages_ids = user.unliked_messages?.map(i => i.id) || [];
        const has_unliked = user_unliked_messages_ids.includes(message_id);

        if(has_unliked) {    
            await strapi.entityService.update(
                'plugin::users-permissions.user',
                user_id,
                {
                    data: {
                        unliked_messages: {
                            disconnect: [message_id] // 关联内容给用户阅读列表
                        }
                    }
                }
            );
        } else {
            await strapi.entityService.update(
                'plugin::users-permissions.user',
                user_id,
                {
                    data: {
                        unliked_messages: {
                            connect: [message_id] // 关联内容给用户阅读列表
                        }
                    }
                }
            );
        }

        const new_user_data =  await strapi.entityService.findOne(
            'plugin::users-permissions.user',
            user_id,
            { populate: ['unliked_messages'] }
        );
        
        const message = await strapi.service('api::message.message').findOne(message_id, {
            populate: ['unliked_by'],
        });
        const unliked_count = message.unliked_by.length;
        const updatedMessage = await strapi.service('api::message.message').update(message_id, {data: {unliked_count: unliked_count}});

        const new_unliked_ids = new_user_data.unliked_messages.map(i => i.id)
        const new_unliked_count = updatedMessage.unliked_count;

        return { new_unliked_ids, new_unliked_count };
    },
}));
