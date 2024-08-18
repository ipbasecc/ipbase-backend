'use strict';

/**
 * kanban controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::kanban.kanban',({strapi}) => ({
    async findOne(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let kanban_id = Number(ctx.params.id);
        
        if(!user_id) {
            return '您无权访问该数据'
        }
        if(!kanban_id) {
            return '需要提供看板ID'
        }

        let auth;
        let ACL;
        let isSuper_member;
        const belongedInfo = await strapi.service('api::kanban.kanban').find_belongedInfo_byKanbanID(kanban_id);
        // console.log('belongedInfo kanban',belongedInfo);
        if(belongedInfo){
            let members;
            const calc_auth = (members,member_roles,collection) => {
                const {ACL:__ACL, is_blocked, role_names} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
                ACL = __ACL
                
                if(is_blocked){
                    ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
                }
                if(!isSuper_member) {
                    isSuper_member = role_names.includes('creator');
                }

                const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,collection);
                auth = read
            }
            if(belongedInfo.belonged_project){
                members = belongedInfo.belonged_project.project_members;
                const member_roles = belongedInfo.belonged_project.member_roles;
                calc_auth(members,member_roles,'kanban');
            }
            if(belongedInfo.belonged_card && !auth){
                const { read } = await strapi.service('api::card.card').clac_card_auth(belongedInfo.belonged_card,user_id);
                console.log('read', read)
                auth = read
            }
        } else {
            ctx.throw(404, '看板ID有误，没有找到其所属项目')
        }
        // console.log('auth auth',auth);
        if(!auth) {
            ctx.throw(401, '您无权访问该数据');
            return
        } else {
            // const Y = require('yjs');
            // const room = `kanban_${kanban_id}`;
            // const ydoc = new Y.Doc();
            // strapi.provider(room, ydoc);
            let kanban = await strapi.service('api::kanban.kanban').get_kanbanSourceData_byID(kanban_id);
            if(kanban){
                const processed_data = strapi.service('api::kanban.kanban').process_KanbanSourceData_byAuth(kanban, user_id, ACL, isSuper_member, belongedInfo);
                return processed_data
            }
        }
        
    },
    async create(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        // @ts-ignore
        const { group_id, data } = ctx.request.body;

        if(!user_id) {
            return '您无权访问该数据'
        }
        if(!group_id) {
            return '需要提供分组ID'
        }

        let auth;
        const project = await strapi.service('api::group.group').find_belongedProject_ByGroupID(group_id);
        if(project){
            const members = project.project_members
            const member_roles = project.member_roles;
            const {ACL, is_blocked, role_names} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
            if(is_blocked){
                ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
            }
            const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'kanban');
            auth = create
        }
        
        if(!auth) {
            ctx.throw(401, '您无权执行此操作')
            return
        }
        
        var now = new Date();
        var iso = now.toISOString();

        let params = {
            // @ts-ignore
            title: data?.title,
            status: 'pending',
            // @ts-ignore
            type: data?.type || 'todo',
            publishedAt: iso,
            group: group_id,
            creator: user_id
        };

        const newKanban = await strapi.entityService.create('api::kanban.kanban',{
            data: params,
            populate: {
                group: true
            }
        })

        if(newKanban) {
            return newKanban
        } else {
            ctx.throw(400, '发生未知错误，请刷新页面重新尝试');
        }
    },
    async update(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { id } = ctx.params;
        let kanban_id = Number(id);
        // @ts-ignore
        const { data } = ctx.request.body
        // console.log('ctx.request.body',ctx.request.body);
        if(!kanban_id) {
            ctx.throw(500, '需要提供看板ID')
        }
        if(!user_id) {
            ctx.throw(401, '您无权访问该数据')
        }

        let auth;
        let fields_permission = [];
        let ACL;
        let isSuper_member;
        const belongedInfo = await strapi.service('api::kanban.kanban').find_belongedInfo_byKanbanID(kanban_id);
        if(belongedInfo){
            let members;
            const calc_auth = (members,member_roles) => {
                const {ACL:__ACL, is_blocked, role_names} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
                ACL = __ACL
                if(is_blocked){
                    ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
                }
                const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'kanban');
                auth = create;
                if(!isSuper_member) {
                    isSuper_member = role_names.includes('creator');
                }
                let authed_fields = strapi.service('api::project.project').clac_authed_fields(ACL,'kanban');
                fields_permission = [...fields_permission, ...authed_fields];
            }
            if(belongedInfo.belonged_project){
                members = belongedInfo.belonged_project.project_members;
                const member_roles = belongedInfo.belonged_project.member_roles;
                calc_auth(members,member_roles);
            }
            if(belongedInfo.belonged_card && !auth){
                members = belongedInfo.belonged_card.card_members;
                const member_roles = belongedInfo.belonged_card.member_roles;
                calc_auth(members,member_roles);
            }
        } else {
            ctx.throw(404, '看板ID有误，没有找到其所属项目')
        }
        
        if(auth) {
            const orderColumn = strapi.service('api::project.project').calc_field_ACL(ACL,'column','order');
            let props = {
                orderColumn: orderColumn
            }
            
            let params = strapi.service('api::kanban.kanban').process_updateKanban_params(data,fields_permission,props);
            // console.log('params kanban',params,data);
            const updateKanban = await strapi.entityService.update('api::kanban.kanban',kanban_id,{
                data: params,
                populate: {
                    columns: true
                }
            })

            if(updateKanban) {
                const processed_data = strapi.service('api::kanban.kanban').process_KanbanSourceData_byAuth(updateKanban, user_id, ACL, isSuper_member);
                return processed_data
            } else {
                ctx.throw(400, '发生未知错误，请刷新页面重新尝试');
                return
            }
        }
        
    },
    async delete(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let kanban_id = Number(ctx.params.id);

        if(!user_id) {
            return '您无权访问该数据'
        }
        if(!kanban_id) {
            return '需要提供看板ID'
        }

        let auth;
        const belongedInfo = await strapi.service('api::kanban.kanban').find_belongedInfo_byKanbanID(kanban_id);
        if(belongedInfo){
            let members;
            const calc_auth = (members,member_roles) => {
                const {ACL, is_blocked, role_names} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
                if(is_blocked){
                    ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
                }
                const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'kanban');
                auth = remove;
            }
            if(belongedInfo.belonged_project){
                members = belongedInfo.belonged_project.project_members;
                const member_roles = belongedInfo.belonged_project.member_roles;
                calc_auth(members,member_roles);
            } else if(belongedInfo.belonged_card && !auth){
                members = belongedInfo.belonged_card.card_members;
                const member_roles = belongedInfo.belonged_card.member_roles;
                calc_auth(members,member_roles);
            }
        } else {
            ctx.throw(404, '看板ID有误，没有找到其所属项目')
        }

        if(!auth) {
            ctx.throw(401, '您无权执行此操作')
            return
        } else {
            const remove = await strapi.service('api::kanban.kanban').remove_kanban_rf(kanban_id);

            if(remove) {
                return remove
            } else {
                ctx.throw(400, '发生未知错误，请刷新页面重新尝试');
                return
            }
        }
    }
}));
