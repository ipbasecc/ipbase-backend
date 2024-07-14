'use strict';

/**
 * document controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::document.document',({strapi}) => ({
    async find(ctx){
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id) {
            ctx.throw(403, '请先登陆')
        }
        const documents = strapi.entityService.findMany('api::document.document',{
            filters: {
                by_user: {
                    id: user_id
                }
            },
            populate: {
                creator: {
                    fields: ['id','username'],
                    profile: {
                        populate: {
                            avatar: {
                                fields: ['id','url','ext']
                            }
                        }
                    }
                }
            }
        })
        if(documents){
            return documents
        }
    },
    async findOne(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let document_id = Number(ctx.params.id);
        // @ts-ignore
        let data = ctx.request.body.data;
        // console.log(ctx.request.body);
        if(!user_id) {
            ctx.throw(401, '您无权访问该数据')
        }

        const { auth } = await strapi.service('api::document.document').calc_collection_auth(document_id,user_id);
        // console.log('document findOne',auth);
        if(!auth?.read) {
            ctx.throw(401, '您无权执行此操作')
        } else {
            const document = await strapi.entityService.findOne('api::document.document', document_id,{
                populate: {
                    creator: {
                        fields: ['id','username'],
                        profile: {
                            populate: {
                                avatar: {
                                    fields: ['id','url','ext']
                                }
                            }
                        }
                    }
                }
            });

            if(document) {
                return document
            }
        }

    },
    async update(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let document_id = Number(ctx.params.id);
        // console.log(document_id, user_id);
        // @ts-ignore
        let data = ctx.request.body.data;
        // console.log(ctx.request.body);
        if(!user_id) {
            ctx.throw(401, '您无权访问该数据')
        }
        // 如果有收到更新mm_thread的请求，直接从Mattermost读取当前document的thread并直接更新
        // 此处无须返回，前端Mattermost的thread并更新UI，这里只是更新Strapi中的数据，方便下次读取
        if(data?.mm_thread){
            const document = await strapi.entityService.findOne('api::document.document', document_id);
            if(document?.id === document_id && document.mm_thread){
                // @ts-ignore
                const post_id = document.mm_thread?.id;
                const mmapi = strapi.plugin('mattermost').service('mmapi');
                const thread = await mmapi.getPost(post_id);
                if(thread?.data) {
                    await strapi.entityService.update('api::document.document', document_id,{
                        data: {
                            mm_thread: thread.data
                        }
                    });
                }
            }
        }

        const authInfo = await strapi.service('api::document.document').find_authInfo(document_id,user_id);
        // console.log(authInfo);
        if(authInfo?.isCreator || authInfo?.modify) {
            let props = {}
            let params = strapi.service('api::document.document').process_updateDocument_params(data,authInfo.fields_permission,props);

            const update = await strapi.entityService.update('api::document.document', document_id,{
                data: params
            });

            if(update) {
                return update
            }
        } else {
            ctx.throw(401, '您无权执行此操作')
        }

    },
    async create(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        // @ts-ignore
        let project_id = Number(ctx.request.body.project_id);
        // @ts-ignore
        let card_id = Number(ctx.request.body.card_id);
        // @ts-ignore
        let data = ctx.request.body.data;
        // console.log(ctx.request.body);
        if(!user_id) {
            ctx.throw(401, '您无权访问该数据')
        }

        let auth;
        let project;
        let card;
        const cala_auth = (members,member_roles,props) => {
            const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
            if(is_blocked){
                ctx.throw(401, '您已被管理员屏蔽，请联系管理员申诉')
            }
            if(props === 'root_project'){
                const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'card_document');
                auth = create
            } else {
                const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'document');
                auth = create
            }
        }
        let members;
        if(project_id){
            project = await strapi.service('api::project.project').find_projectByID(project_id);
            if(project){
                members = project.project_members;
                const member_roles = project.member_roles;
                if(members.filter(i => i.by_user.id === user_id).map(j => j.by_user.id).includes(user_id)){
                    cala_auth(members,member_roles,'project')
                } else {
                    auth = false
                }
            }
        }
        if(card_id){
            card = await strapi.service('api::card.card').find_cardByID(card_id);
            if(card){
                members = card.card_members;
                const member_roles = card.member_roles;
                if(members.filter(i => i.by_user.id === user_id).map(j => j.by_user.id).includes(user_id)){
                    cala_auth(members,member_roles,'card')
                } else {
                    const card_belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(card.id);
                    if(card_belongedInfo){
                        const _project_id = card_belongedInfo.belonged_project?.id;
                        project = await strapi.service('api::project.project').find_projectByID(_project_id);
                        if(project){
                            members = project.project_members;
                            const member_roles = project.member_roles;
                            if(members.filter(i => i.by_user.id === user_id).map(j => j.by_user.id).includes(user_id)){
                                cala_auth(members,member_roles,'root_project')
                            } else {
                                auth = false
                            }
                        }
                    }
                }
            }
        }

        if(!auth) {
            ctx.throw(403, '您无权执行此操作')
        } else {
            var now = new Date();
            var iso = now.toISOString();
            let params = data;
            params.creator = user_id;
            params.publishedAt = iso;
            if(card_id) {
                params.by_card = card_id;
            } else if(project_id) {
                params.by_project = project_id
            } else {
                params.by_user = user_id;
            }
            const new_document = await strapi.entityService.create('api::document.document', {
                data: params,
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
                    }
                }
            });

            if(new_document) {
                const mmapi = strapi.plugin('mattermost').service('mmapi');
                let mmChannel_id = void 0;
                let params = {
                    "message": `${card_id ? '卡片' : '项目'}文档：${new_document.title}被创建`,
                    "props": {
                        "strapi": {
                            "data": {
                                "by_user": user_id,
                                "action": "document_created",
                                "body": new_document
                            },
                        },
                    }
                }
                if(card?.mm_thread){
                    mmChannel_id = card.mm_thread?.channel_id
                    params.props.strapi.data.is = 'card';
                    params.props.strapi.data.card_id = card.id;
                } else if(project?.mm_channel) {
                    mmChannel_id = project.mm_channel?.id
                    params.props.strapi.data.is = 'project';
                    params.props.strapi.data.project_id = project.id;
                }
                
                if(mmChannel_id){
                    params.channel_id = mmChannel_id
                    const mmMsg = await mmapi.createPost(params);
                    // console.log('mmMsg',mmMsg)
                    if(mmMsg?.data){
                        const update = await strapi.entityService.update('api::document.document',new_document.id,{
                            data: {
                                mm_thread: mmMsg.data
                            }
                        })
                        return update
                    }
                } else {
                    return new_document
                }
            }
        }
    },
    async delete(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let document_id = Number(ctx.params.id);
        // console.log(user_id,project_id,card_id,document_id);
        if(!user_id) {
            ctx.throw(401, '您无权访问该数据')
        }
        
        const authInfo = await strapi.service('api::document.document').find_authInfo(document_id,user_id);

        if(!authInfo?.remove) {
            ctx.throw(401, '您无权执行此操作')
        } else {
            const remove = await strapi.entityService.delete('api::document.document', document_id);

            if(remove) {
                return { removed: document_id}
            }
        }

    },
}));
