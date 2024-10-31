// @ts-nocheck
'use strict';

/**
 * member-role controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::member-role.member-role',({strapi}) => ({
    async create(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const data = ctx.request.body;
        if(!user_id){
            ctx.throw(403, '请先登陆')
        }

        let auth;
        if(data.by_project){
            const project_id = data.by_project;
            const project = await strapi.service('api::project.project').find_projectByID(project_id);
            if(project){
                console.log('authed_fields');
                const {authed_fields} = strapi.service('api::project.project').clac_project_auth(project,user_id);
                if(authed_fields?.includes('manageRole')){
                    auth = true
                }
            }
        }
        if(data.by_card){
            const card_id = data.by_card
            const {authed_fields} = await strapi.service('api::card.card').clac_finalAuth_byCardID(card_id,user_id);
            if(authed_fields?.includes('manageRole')){
                auth = true
            }
        }

        if(auth){
            let params = {
                subject: data.data.subject
            };

            if(data?.by_project){
                params.by_project = data.by_project;
                const { roleBase } = require('../../project/services/roleBase.js');
                const role_base = await roleBase();
                const ACL = role_base.find(i => i.role === 'member')?.ACL
                params.ACL = ACL;
            }
            if(data?.by_card){
                params.by_card = data.by_card;
                const { roleBase } = require('../../card/services/roleBase.js');
                const role_base = await roleBase();
                const ACL = role_base.find(i => i.role === 'member')?.ACL
                params.ACL = ACL;
            }
            // console.log('params',params);
            const create = await strapi.entityService.create('api::member-role.member-role',{
                data: params,
                populate: {
                    ACL: {
                        populate: {
                            fields_permission: true
                        }
                    }
                }
            })
            if(create){
                let _publish = {
                    team_id: ctx.default_team?.id,
                    data: create
                }
                if(data?.by_project){
                    _publish.project_id = data?.by_project
                }
                if(data?.by_card){
                    _publish.card_id = data?.by_card
                }
                strapi.$publish('member-role:created', [ctx.room_name], _publish);
                return create
            }
        } else {
            ctx.throw(403, '您无权执行此操作')
        }
    },
    async update(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { id } = ctx.params;
        const data = ctx.request.body;

        const role_id = Number(id)

        if(!user_id){
            ctx.throw(403, '请先登陆')
        }
        if(!data){
            ctx.throw(400, '请提供有效的更新数据')
        }

        let auth;
        const authInfo = await strapi.service('api::member-role.member-role').find_authInfo(role_id,user_id);
        if(authInfo){
            if(authInfo.is_blocked){
                ctx.throw(403, '您已被管理员屏蔽，请联系管理人员申诉')
            } else if(authInfo.role_names.includes('unconfirmed')){
                auth = false
            } else if(authInfo.user_id === user_id){
                auth = true
            } else {
                const fields_permission = authInfo.fields_permission
                // console.log('fields_permission',fields_permission);
                auth = fields_permission.includes('manageRole');
            }
        }
        if(auth){
            delete data.id;
            const update = await strapi.entityService.update('api::member-role.member-role',role_id,{
                data: data,
                populate: {
                    ACL: {
                        populate: {
                            fields_permission: true
                        }
                    },
                    by_card: {
                        fields: ['id']
                    },
                    by_project: {
                        fields: ['id']
                    },
                }
            })
            if(update){
                let _publish = {
                    team_id: ctx.default_team?.id,
                    data: update
                }
                if(update?.by_project){
                    _publish.project_id = update?.by_project.id
                }
                if(update?.by_card){
                    _publish.card_id = update?.by_card.id
                }
                strapi.$publish('member-role:updated', [ctx.room_name], _publish);
                return update
            }
        } else {
            ctx.throw(403, '您无权执行此操作')
        }
    },
    async delete(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { id } = ctx.params;

        const role_id = Number(id)

        if(!user_id){
            ctx.throw(403, '请先登陆')
        }
        const locked_role = ["creator", "owner", "member", "unconfirmed", "external"];
        const role = await strapi.entityService.findOne('api::member-role.member-role',id);
        if(role && locked_role.includes(role.subject)){
            ctx.throw(503, '不能删除关键角色')
        }

        let auth;
        const authInfo = await strapi.service('api::member-role.member-role').find_authInfo(role_id,user_id);
        if(authInfo){
            if(authInfo.is_blocked){
                ctx.throw(403, '您已被管理员屏蔽，请联系管理人员申诉')
            } else if(authInfo.role_names.includes('unconfirmed')){
                auth = false
            } else if(authInfo.user_id === user_id){
                auth = true
            } else {
                const fields_permission = authInfo.fields_permission
                // console.log('fields_permission',fields_permission);
                auth = fields_permission.includes('manageRole');
            }
        }
        if(auth){
            const remove = await strapi.entityService.delete('api::member-role.member-role',role_id)
            if(remove){
                let _publish = {
                    team_id: ctx.default_team?.id,
                    data: {
                        removed_role_id: role_id
                    }
                }
                strapi.$publish('member-role:removed', [ctx.room_name], _publish);
                return _publish
            }
        } else {
            ctx.throw(403, '您无权执行此操作')
        }
    }
}));
