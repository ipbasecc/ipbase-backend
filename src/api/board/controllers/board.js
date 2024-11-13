// @ts-nocheck
'use strict';

/**
 * board controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::board.board',({strapi}) => ({
    async create(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const data = ctx.request.body
        const project_id = Number(data.project_id);

        let auth;

        if(project_id){
            const project = await strapi.service('api::project.project').find_projectByID(project_id);
            if(project){
                const members = project.project_members
                const member_roles = project.member_roles;
                const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
                if(is_blocked){
                    ctx.throw(401, '您已被管理员屏蔽，请联系管理员申诉')
                }
                const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'board');
                auth = create
            }
    
            //判断当前用户是否在当前项目中
            if(auth) {
                const res = await strapi.service('api::board.board').create_and_init_board(data,user_id);
                if(res){
                    const response = {
                        team_id: ctx.default_team?.id,
                        project_id: project_id,
                        data: res
                    }
                    strapi.$publish('board:created', [ctx.room_name], response);
                    return res
                }
            } else {
                ctx.throw(401, '您无权执行此操作')
            }
        } else {
            // 此段逻辑为附加board到第三方应用做准备
            const _attachBoard = await strapi.service('api::board.board').create_attachBoard(data,user_id);
            if(_attachBoard){
                return _attachBoard
            }
        }
    },
    async delete(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let board_id = Number(ctx.params.id);

        let auth;
        const calc_auth = (members,member_roles) => {
            const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
            if(is_blocked){
                ctx.throw(401, '您已被管理员屏蔽，请联系管理员申诉')
            }
            const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'board');
            auth = remove
        }

        const project = await strapi.service('api::board.board').find_projectByBoardID(board_id);
        if(project){
            const members = project.project_members;
            const member_roles = project.member_roles;
            calc_auth(members,member_roles);
        } else {
            const board = await strapi.service('api::board.board').find_board_byID(board_id);
            if(board?.board_members){
                const members = board.board_members;
                const member_roles = project.member_roles;
                calc_auth(members,member_roles);
            } else {
                ctx.throw(404, '根据您提供的Board ID，无法定位对应的权限')
            }
        }

        if(auth){
            const deleteBoard = await strapi.entityService.delete('api::board.board', board_id);
            if(deleteBoard) {
                const response = {
                    team_id: ctx.default_team?.id,
                    project_id: project.id,
                    data: {
                        removed_board: board_id
                    }
                }
                strapi.$publish('board:deleted', [ctx.room_name], response);
                return response
            }
        } else {
            ctx.throw(404, 'Board ID 错误，请检查提交数据')
        }
    },
    async update(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let board_id = Number(ctx.params.id);
        const data = ctx.request.body

        let auth;
        let fields_permission = [];

        const calc_auth = (members,member_roles) => {
            const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
            if(is_blocked){
                ctx.throw(401, '您已被管理员屏蔽，请联系管理员申诉')
            }
            const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'board');
            auth = modify
            let authed_fields = strapi.service('api::project.project').clac_authed_fields(ACL,'project');
            fields_permission = [...fields_permission, ...authed_fields];
        }

        const project = await strapi.service('api::board.board').find_projectByBoardID(board_id);
        if(project){
            const members = project.project_members;
            const member_roles = project.member_roles;
            calc_auth(members,member_roles);
        } else {
            const board = await strapi.service('api::board.board').find_board_byID(board_id);
            if(board?.board_members){
                const members = board.board_members;
                const member_roles = project.member_roles;
                calc_auth(members,member_roles);
            } else {
                ctx.throw(404, '根据您提供的Board ID，无法定位对应的权限')
            }
        }

        if(auth){
            let params = await strapi.service('api::board.board').process_updateBoardParams(data,fields_permission);
            let board = await strapi.service('api::board.board').update_board(params, board_id);

            const response = {
                team_id: ctx.default_team?.id,
                project_id: project.id,
                data: board
            }
            strapi.$publish('board:updated', [ctx.room_name], response);
            if(board) {
                return board
            }
        } else {
            ctx.throw(403, '您无权执行此操作')
        }
    },
    // group中调用了此处
    async groupOrder(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let board_id = Number(ctx.params.board_id);
        const data = ctx.request.body;

        let auth;
        const board = await strapi.service('api::board.board').find_board_byID(board_id);
        const calc_auth = (members,member_roles) => {
            const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
            if(is_blocked){
                ctx.throw(401, '您已被管理员屏蔽，请联系管理员申诉')
            }
            auth = strapi.service('api::project.project').calc_field_ACL(ACL,'board','order');
        }

        const project = await strapi.service('api::board.board').find_projectByBoardID(board_id);
        if(project){
            const members = project.project_members;
            const member_roles = project.member_roles;
            calc_auth(members,member_roles);
        } else {
            ctx.throw(404, '根据您提供的Board ID，无法定位对应的权限')
        }

        if(auth) {
            const board = await strapi.entityService.findOne('api::board.board', board_id, {
                populate: {
                    groups: {
                        fields: ['id']
                    }
                }
            });
            if(!project?.boards?.map(i => i.id).includes(board_id)) {
                ctx.throw(500, '错误：要求排序分组的Board不在对应项目中');
                return
            }
            //判断新排序数组与原始分组数组是否是由相同元素组成的
            function areArraysEqual(arr1, arr2) {
                if(arr1.length != arr2.length) return false;
                // 使用 filter 和 indexOf 方法，返回一个包含两个数组中相同元素的新数组
                let common = arr1.filter((item) => arr2.indexOf(item) !== -1);
                // 如果新数组的长度与原数组的长度相等，则说明两个数组中的元素完全相同，返回 true
                if (common.length === arr1.length) {
                return true;
                }
                // 否则，返回 false
                else {
                return false;
                }
            }
            //如果新排序的数组与原board的groups id数组组成元素相同
            if(areArraysEqual(board.groups.map(i => i.id),data.order) && board.groups.map(i => i.id).length === data.order.length){

                const board = await strapi.entityService.update('api::board.board', board_id, {
                    data: {
                        groups: {
                            set: data.order
                        }
                    },
                    populate: {
                        groups: {
                            populate: {
                                kanbans: true,
                                icon: {
                                    fields: ['ext','url']
                                }
                            }
                        }
                    }
                });
                if(board) {
                    let order = board.groups.map(i => i.id)
                    const response = {
                        team_id: ctx.default_team?.id,
                        board_id: board_id,
                        data: {
                            group_order: order
                        }
                    }
                    strapi.$publish('group:order', [ctx.room_name], response);
                    return order
                }
            } else {
                ctx.throw(500, '用来排序的分组数据与原board的分组数据不同')
            }
        } else {
            ctx.throw(403, '您无权执行此排序操作')
        }
    },
    async mmCreate(ctx) {
        const user_id = Number(ctx.state.user.id);
        if(!user_id) {
            ctx.throw(500, '缺少用户ID')
        }
        const data = ctx.request.body.mm_data;
        if(!data.belonged){
            data.belonged = 'chatChannel'
        }
        const _attachBoard = await strapi.service('api::board.board').create_attachBoard(data,user_id);
        if(_attachBoard){
            return _attachBoard
        }
    },
    async mmFindOne(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id) {
            ctx.throw(401, '缺少用户ID')
        }
        let mm_channel_id = ctx.params.mm_channel_id;
        const populate = strapi.service('api::board.board').query_populate();
        // entityService 查询时需要ID，这里根据mm_channel_id来查询，因此使用 Query Engine API
        const board = await strapi.db.query('api::board.board').findOne({
            select: ['mm_channel_id'],
            where: { mm_channel_id: mm_channel_id },
            populate: populate
        });
        if(board) {
            let auth;
            const calc_auth = (members,member_roles) => {
                const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
                if(is_blocked){
                    ctx.throw(401, '您已被管理员屏蔽，请联系管理员申诉')
                }
                const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'board');
                auth = remove
            }

            if(board?.board_members){
                const members = board.board_members;
                const member_roles = project.member_roles;
                calc_auth(members,member_roles);
            }
            if(auth){
                return board
            } else {
                ctx.throw(401, '您没有对应的查看权限')
            }
            
        } else {
            ctx.throw(404, '未找到对应内容')
        }
    }
}));
