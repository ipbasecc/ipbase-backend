// @ts-nocheck
'use strict';

/**
 * schedule-event controller
 */


// 项目、卡片对应的规划、规划事件在获取项目、卡片时已同步提供，因此对应的findOne无需再单独执行
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::schedule-event.schedule-event',({strapi}) => ({
    async create(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const params = ctx.request.body;


        if(!user_id){
            ctx.throw(403, '请先登陆')
        }
        if(!params){
            ctx.throw(400, '请提供有效的更新数据')
        }

        const schedule_id = params.data.schedule;
        let auth;
        const authInfo = await strapi.service('api::schedule-event.schedule-event').find_authInfo(schedule_id,user_id);
        if(authInfo){
            if(authInfo.user_id === user_id){
                auth = true
            } else if(authInfo.is_blocked){
                ctx.throw(403, '您已被管理员屏蔽，请联系管理人员申诉')
            } else if(authInfo.role_names.includes('unconfirmed')){
                auth = false
            } else {
                auth = authInfo.create
            }
        }

        if(auth){
            var now = new Date();
            var iso = now.toISOString();
            const create = await strapi.entityService.create('api::schedule-event.schedule-event',{
                // @ts-ignore
                data: {
                    ...params.data,
                    publishedAt: iso
                },
                populate: {
                    creator: {
                        fields: ['id','username'],
                        populate: {
                            profile: {
                                populate: {
                                    avatar: {
                                        fields: ['id','url','ext']
                                    }
                                }
                            }
                        }
                    },
                    executor: {
                        fields: ['id','color_marker','description','nickname','position','is_blocked','private_email'],
                        populate: {
                            by_user: {
                                fields: ['id','username'],
                                populate: {
                                    profile: {
                                        populate: {
                                            avatar: {
                                                fields: ['id','url','ext']
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })
            if(create){
                return create
            } else {
                ctx.throw(500, '未知错误,请刷新重试')
            }
        } else {
            ctx.throw(403, '您没有权限执行此操作')
        }
    },
    async update(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { id } = ctx.params;
        const data = ctx.request.body
        let params = data.data;
        const _id = Number(id)

        if(!user_id){
            ctx.throw(403, '请先登陆')
        }
        if(!data){
            ctx.throw(400, '请提供有效的更新数据')
        }

        const schedule_id = data?.schedule;
        let auth;
        const authInfo = await strapi.service('api::schedule-event.schedule-event').find_authInfo(schedule_id,user_id);
        if(authInfo){
            // console.log('authInfo',authInfo);
            if(authInfo.user_id === user_id){
                auth = true
            } else if(authInfo.is_blocked){
                ctx.throw(403, '您已被管理员屏蔽，请联系管理人员申诉')
            } else if(authInfo.role_names.includes('unconfirmed')){
                auth = false
            } else {
                auth = authInfo.modify
            }
        }
        if(!auth){
            ctx.throw(403, '您没有权限执行此操作')
        }
        
        if(auth) {
            const _update = await strapi.entityService.update('api::schedule-event.schedule-event',id,{
                data: params,
                populate: {
                    creator: {
                        fields: ['id','username'],
                    },
                    executor: {
                        fields: ['id','color_marker','description','nickname','position','is_blocked','private_email']
                    }
                }
            })
            
            if(_update){
                return _update
            } else {
                ctx.throw(500, '未知错误,请刷新重试')
            }
        }
    },
    async delete(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { id } = ctx.params;
        const _id = Number(id);

        const event = await strapi.entityService.findOne('api::schedule-event.schedule-event',_id,{
            populate: {
                schedule: {
                    fields: ['id']
                }
            }
        })
        let schedule_id;
        if(event){
            schedule_id = event.schedule.id;
            let auth;
            const authInfo = await strapi.service('api::schedule-event.schedule-event').find_authInfo(schedule_id,user_id);
            if(authInfo){
                if(authInfo.user_id === user_id){
                    auth = true
                } else if(authInfo.is_blocked){
                    ctx.throw(403, '您已被管理员屏蔽，请联系管理人员申诉')
                } else if(authInfo.role_names.includes('unconfirmed')){
                    auth = false
                } else {
                    auth = authInfo.remove
                }
            }
    
            if(auth){
                const remove = await strapi.entityService.delete('api::schedule-event.schedule-event',_id);
                if(remove){
                    const _ = { removed_id: _id}
                    return _
                }
            } else {
                ctx.throw(403, '您没有权限执行此操作')
            }
        }
    }
}));
