'use strict';

/**
 * friend-request controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::friend-request.friend-request',({strapi}) => ({
    async create(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id){
            ctx.throw(400, '请先登陆')
        }
        const { message, contact_id, request_answer } = ctx.request.body.data;
        const target_contact = await strapi.entityService.findOne('api::contact.contact', contact_id, {
            populate: {
                blockeds: {
                    fields: ['id']
                },
                friend_requests: {
                    populate: {
                        sender: {
                            fields: ['id']
                        }
                    }
                },
                owner: {
                    fields: ['id']
                }
            }
        });
        if(target_contact?.owner?.id === user_id){
            ctx.throw(403, '不要添加自己为好友')
        }
        if(
            target_contact?.blockeds?.map(i => i.id).includes(user_id)
            ||
            target_contact.friend_requests.filter(i => i.sender?.id === user_id && i.status === 'blocked')?.length > 0
        ){
            ctx.throw(403, '您已被对方永久屏蔽')
        }
        if(target_contact?.friend_request_question && target_contact?.friend_request_question?.answer !== request_answer){
            ctx.throw(403, '验证回答错误')
        }
        if(target_contact?.accept_friend){
            const _friend_request = await strapi.entityService.create('api::friend-request.friend-request',{
                data: {
                    message: message,
                    contact: contact_id,
                    sender: user_id
                }
            })
            if(_friend_request){
                return _friend_request
            } else {
                ctx.throw(403, '未能成功发送好友请求，请刷新重试')
            }
        } else {
            ctx.throw(404, '未找到对应通讯录')
        }
    },
    async delete(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id){
            ctx.throw(400, '请先登陆')
        }
        let id = Number(ctx.params.id);
        
        const _request = await strapi.entityService.findOne('api::friend-request.friend-request', id, {
            populate: {
                sender: {
                    fields: ['id']
                }
            }
        });
        if(_request?.sender.id === user_id){
            await strapi.entityService.delete('api::friend-request.friend-request', id);
            return '成功删除'
        } else {
            ctx.throw(404, '您不能删除不是自己创建的好友申请')
        }
    }
}));
