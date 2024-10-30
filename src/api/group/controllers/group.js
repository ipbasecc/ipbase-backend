// @ts-nocheck
'use strict';

/**
 * group controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::group.group',({strapi}) => ({
    async create(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let board_id = Number(ctx.request.body.board_id);
        const data = ctx.request.body;

        let auth;
        const project = await strapi.service('api::board.board').find_projectByBoardID(board_id);
        if(project){
            const members = project.project_members
            const member_roles = project.member_roles;
            const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
            if(is_blocked){
                ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
            }
            const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'group');
            auth = create
        }
        if(auth) {
            var now = new Date();
            var iso = now.toISOString();
            const group = await strapi.entityService.create('api::group.group', {
                data: {
                    name: data.name,
                    status: data.status || 'pending',
                    unread_count: 0,
                    board: board_id,
                    publishedAt: iso,
                    kanbans: [],
                    creator: user_id
                }
            })
    
            if(group) {
                const response = {
                    team_id: ctx.default_team?.id,
                    board_id: board_id,
                    data: group
                }
                strapi.$publish('group:created', [ctx.room_name], response);
                return group
            }
        } else {
            ctx.throw(401, '您无权执行此操作')
        }
    },
    async update(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let group_id = Number(ctx.params.id);
        const data = ctx.request.body;

        let auth;
        let orderKanban;
        let fields_permission = [];
        const project = await strapi.service('api::group.group').find_belongedProject_ByGroupID(group_id);
        if(project){
            const members = project.project_members
            const member_roles = project.member_roles;
            const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
            if(is_blocked){
                ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
            }
            const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'group');
            auth = modify

            let authed_fields = strapi.service('api::project.project').clac_authed_fields(ACL,'project');
            fields_permission = [...fields_permission, ...authed_fields];

            orderKanban = strapi.service('api::project.project').calc_field_ACL(ACL,'kanban','order');
        }
        if(auth) {
            const props = {
                orderKanban: orderKanban
            }
            const params = strapi.service('api::group.group').process_updateGroup_params(data,fields_permission,props);
            
            const groupUpdate = await strapi.entityService.update('api::group.group', group_id, {
                data: params,
                populate: {
                    kanbans: true
                }
            });
            if(groupUpdate){
                const response = {
                    team_id: ctx.default_team?.id,
                    data: groupUpdate
                }
                strapi.$publish('group:updated', [ctx.room_name], response);
                return groupUpdate
            } else {
                ctx.throw(503, '创建分组时出错')
            }
        } else {
            ctx.throw(403, '您无权执行此操作')
        }

    },
    async delete(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let group_id = Number(ctx.params.id);

        let auth;
        const project = await strapi.service('api::group.group').find_belongedProject_ByGroupID(group_id);
        if(project){
            const members = project.project_members
            const member_roles = project.member_roles;
            const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
            if(is_blocked){
                ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
            }
            const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'group');
            auth = remove
        }
        
        if(!auth) {
            ctx.throw(400, '您没有权限执行此操作');
            return
        } else {
            const group = await strapi.entityService.findOne('api::group.group', group_id, {
                populate: {
                    kanbans: {
                        fields: ['id']
                    }
                }
            });
            if(group.kanbans.map(i => i.id).length > 0){
                ctx.throw(500, '非空分组，只能删除空分组');
                return
            }
            const deleteGroup = await strapi.entityService.delete('api::group.group', group_id);
            if(deleteGroup) {
                const response = {
                    team_id: ctx.default_team?.id,
                    data: {
                        removed_group: group_id
                    }
                }
                strapi.$publish('group:deleted', [ctx.room_name], response);
                return {
                    removed_group: group_id
                }
            };
        }
    }
}));
