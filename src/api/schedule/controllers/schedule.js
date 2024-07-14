// @ts-nocheck
'use strict';

/**
 * schedule controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::schedule.schedule',({strapi}) => ({
    async findOne(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state?.user?.id);
        let { id } = ctx.request.params;
        id = Number(id)
        const { share_code, share_by } = ctx.request.query;
        if((!share_code || !share_by) && (share_code || share_by)){
            ctx.throw(404, '无效的共享连接')
        }
        
        const get_schedule = async (_id) => {
            const res = await strapi.entityService.findOne('api::schedule.schedule',_id,{
                populate: {
                    can_read_user: {
                        fields: ['id','username']
                    },
                    can_write_user: {
                        fields: ['id','username']
                    },
                    schedule_events: {
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
                    },
                    share_codes: {
                        populate: {
                            creator: {
                                fields: ['id','username'],
                            }
                        }
                    }
                }
            });
            if(res) {
                return res
            }
        }
        if(user_id && !share_code){
            let auth;
            const authInfo = await strapi.service('api::schedule.schedule').find_authInfo(id,user_id);
            if(authInfo){
                if(authInfo.is_blocked){
                    ctx.throw(403, '您已被管理员屏蔽，请联系管理人员申诉')
                } else if(authInfo.role_names.includes('unconfirmed')){
                    auth = false
                } else if(authInfo.user_id === user_id){
                    auth = true
                } else {
                    auth = authInfo.modify
                }
            }
            if(auth) {
                let _schedule = await get_schedule(id);
                delete _schedule.share_codes
                ctx.body = _schedule;
            } else {
                ctx.throw(403, '您没有权限执行此操作')
            }
        } else if(share_code){
            let _schedule = await get_schedule(id);
            
            const _share_codes = _schedule?.share_codes;
            console.log('_share_codes', _share_codes)
            let _share_code
            if(_share_codes?.length > 0 && _share_codes.map(i => i.code).includes(share_code)){
                _share_code = _share_codes.find(i => i.code === share_code);
            }
            console.log('_share_code', _share_code)
            if(_share_code){
                if(_share_code.creator?.id != share_by){
                    ctx.throw(404, '无效的共享连接')
                }
                const maxCount_donw = async (_schedule, _share_code) => {
                    await strapi.entityService.update('api::schedule.schedule',id,{
                        data: {
                            share_codes: _schedule.share_codes.map((i) => ({
                                ...i,
                                max_count: i.id === _share_code.id ? --_share_code.max_count : i.max_count
                            }))
                        }
                    })
                }

                const now = new Date ();
                if(_share_code.disable){
                    ctx.throw(400, '该共享码已被禁用')
                } else if(_share_code.max_count < 1){
                    ctx.throw(400, '该共享码已超过使用次数')
                } else if(_share_code.up_time < new Date ()){
                    ctx.throw(400, '该共享码已超过使用期限')
                } else {
                    await maxCount_donw(_schedule, _share_code)
                    delete _schedule.can_read_user
                    delete _schedule.can_write_user
                    delete _schedule.share_codes
                    const _data = {
                        "id": 118,
                        "name": _schedule.name,
                        "icon": _schedule.icon,
                        "schedule_events": _schedule.schedule_events,
                    }
                    ctx.body = _data;
                }
            } else {
                ctx.throw(404, '无效的共享码')
            }
        } else {
            ctx.throw(400, '您无权查看该内容')
        }
    },
    async create(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const params = ctx.request.body;
        const by_info = params.by_info;

        if(!user_id){
            ctx.throw(403, '请先登陆')
        }
        if(!params){
            ctx.throw(400, '请提供有效的更新数据')
        }
        if(!by_info){
            ctx.throw(400, '请提供有效附加对象信息')
        }

        let auth;
        let project;
        const clacAuth_by_project = async (project_id) => {
            project = await strapi.service('api::project.project').find_projectByID(project_id);
            if(project){
                const { ACL } = await strapi.service('api::project.project').clac_project_auth(project,user_id);
                const { modify } = strapi.service('api::project.project').calc_collection_auth(ACL,'schedule');
                return modify
            }
        }
        const clacAuth_by_card = async (card_id) => {
            const card_members = card.card_members;
            const isCardMember = card_members?.map(i => i.by_user.id)?.includes(user_id);
            const belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(card_id);
            if(belongedInfo?.belonged_project){
                project = belongedInfo?.belonged_project;
            }
            if(isCardMember){
                const { ACL } = await strapi.service('api::card.card').clac_card_auth(project,user_id);
                const { modify } = strapi.service('api::card.card').calc_collection_auth(ACL,'schedule');
                return modify
            } else if(belongedInfo?.belonged_project){
                const project_id = belongedInfo?.belonged_project.id;
                const res = await clacAuth_by_project(project_id);
                return res
            }
        }
        if(by_info.by === 'project' && by_info.project_id){
            params.data.by_project = by_info.project_id;
            const project_id = by_info.project_id;
            const res = await clacAuth_by_project(project_id);
            auth = res
        }
        
        if(by_info.by === 'card' && by_info.card_id){
            params.data.by_card = by_info.card_id;
            const card_id = by_info.card_id;
            const card = await strapi.service('api::card.card').find_cardByID(card_id);
            if(card){
                const res = await clacAuth_by_card(card.id);
                auth = res
            }
        }

        if(by_info.by === 'user'){
            params.data.by_user = user_id;
            auth = true;
        }

        if(auth){
            const response = strapi.service('api::schedule.schedule').response_template;
            var now = new Date();
            var iso = now.toISOString();
            const create = await strapi.entityService.create('api::schedule.schedule',{
                // @ts-ignore
                data: {
                    ...params.data,
                    publishedAt: iso
                },
                ...response
            })
            if(create){
                if(project?.mm_channel){
                    const mmChannel_id = project?.mm_channel?.id
                    const mmapi = strapi.plugin('mattermost').service('mmapi');
                    let mm_params = {
                        "channel_id": mmChannel_id,
                        "message": `${by_info.card_id ? '卡片' : '项目'}规划：${create.name}被创建`,
                        "props": {
                            "strapi": {
                            "data": {
                                is: by_info.project_id ? 'project' : 'card',
                                by_user: user_id,
                                action: "schedule_created",
                                body: create,
                            },
                            },
                        }
                    }
                    if(by_info.project_id){
                        mm_params.props.data.strapi.project_id = by_info.project_id
                    }
                    if(by_info.card_id){
                        mm_params.props.data.strapi.card_id = by_info.card_id
                    }
                    const mmMsg = await mmapi.createPost(mm_params);
                    // console.log('create_todo',create_todo)
                    if(mmMsg?.data){
                        const update = await strapi.entityService.update('api::schedule.schedule',create.id,{
                            data: {
                                mm_thread: mmMsg.data
                            }
                        })
                        return update
                    }
                } else {
                    return create
                }
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
        const _id = Number(id)

        if(!user_id){
            ctx.throw(403, '请先登陆')
        }
        if(!data){
            ctx.throw(400, '请提供有效的更新数据')
        }
        // 如果有收到更新mm_thread的请求，直接从Mattermost读取当前schedule的thread并直接更新
        // 此处无须返回，前端Mattermost的thread并更新UI，这里只是更新Strapi中的数据，方便下次读取
        const schedule = await strapi.entityService.findOne('api::schedule.schedule', _id,{
            populate: {
                share_codes: {
                    populate: {
                        creator: {
                            fields: ['id','username'],
                        }
                    }
                }
            }
        });
        if(schedule && data?.data.mm_thread){
            if(schedule?.id === _id && schedule.mm_thread){
                // @ts-ignore
                const post_id = schedule.mm_thread?.id;
                const mmapi = strapi.plugin('mattermost').service('mmapi');
                const thread = await mmapi.getPost(post_id);
                if(thread?.data) {
                    await strapi.entityService.update('api::schedule.schedule', _id,{
                        data: {
                            mm_thread: thread.data
                        }
                    });
                }
            }
        }

        let auth;
        let shareAuth;
        const authInfo = await strapi.service('api::schedule.schedule').find_authInfo(id,user_id);
        if(authInfo){
            if(authInfo.is_blocked){
                ctx.throw(403, '您已被管理员屏蔽，请联系管理人员申诉')
            } else if(authInfo.role_names.includes('unconfirmed')){
                auth = false
            } else if(authInfo.user_id === user_id){
                auth = true
            } else {
                if(data.data?.share_code){
                    shareAuth = authInfo.fields_permission.includes('share')
                }
                auth = authInfo.modify
            }
        }
        if(auth) {
            let params = data.data;
            if(!shareAuth && data.data?.share_code){
                delete params.share_code
            }
            if(shareAuth && schedule){
                // 前端传来的
                let share_code = data.data?.share_code
                // 删除附加给params的，因为规划中是复数，前端只是传来一个
                delete params.share_code
                // 将当前用户作为创建者
                share_code.creator = user_id;
                // 获取所有非当前用户的原始分享码 - 每个人只能有一个分享码，如果他新建新的，那就删除旧的
                let share_codes = schedule.share_codes.filter(i => i.creator.id != user_id);
                // 合并新的分享码
                share_codes = share_codes?.length > 0 ? [...share_codes, share_code] : [share_code]
                // 附加给params
                params.share_codes = share_codes
            }
            const response = strapi.service('api::schedule.schedule').response_template;
            let _update = await strapi.entityService.update('api::schedule.schedule',_id,{
                data: params,
                populate: {
                    share_codes: {
                        populate: {
                            creator: {
                                fields: ['id','username'],
                            }
                        }
                    }
                }
            })
            
            if(_update){
                if(!shareAuth && data.data?.share_code){
                    _update.attachInfo = '您无权分享规划'
                }
                if(shareAuth){
                    _update.share_codes = _update.share_codes.filter(i => i.creator.id == user_id)
                }
                return _update
            } else {
                ctx.throw(500, '未知错误,请刷新重试')
            }
        } else {
            ctx.throw(403, '您没有权限执行此操作')
        }
    },
    async delete(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { id } = ctx.params;
        const _id = Number(id);
        let auth;
        const authInfo = await strapi.service('api::schedule.schedule').find_authInfo(_id,user_id);
        if(authInfo){
            if(authInfo.is_blocked){
                ctx.throw(403, '您已被管理员屏蔽，请联系管理人员申诉')
            } else if(authInfo.role_names.includes('unconfirmed')){
                auth = false
            } else if(authInfo.user_id === user_id){
                auth = true
            } else {
                auth = authInfo.remove
            }
        }

        if(auth){
            const remove = await strapi.entityService.delete('api::schedule.schedule',_id);
            if(remove){
                const _ = { removed_id: _id}
                return _
            }
        } else {
            ctx.throw(403, '您没有权限执行此操作')
        }
    }
}));
