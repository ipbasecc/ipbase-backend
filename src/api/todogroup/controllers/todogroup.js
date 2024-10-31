// @ts-nocheck
'use strict';

/**
 * todogroup controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::todogroup.todogroup', ({strapi}) => ({
    async find() {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id){
            ctx.throw(400, '请先登陆')
        }

        const page = Number(ctx.query.page);
        const per_page = Number(ctx.query.per_page);

        if(!page || !per_page){
            ctx.throw(400, '需要提供分页数据')
        }
        const todogroups = await strapi.entityService.findMany('api::todogroup.todogroup',{
            limit: per_page,
            start: (page -1) * per_page,
            filters: {
                $or: [
                    { user: { id: user_id } },
                    { creator: { id: user_id } }
                ]
            }
        })

        const total = await strapi.query('api::card.card').count({
            filters: {
                $or: [
                    { user: { id: user_id } },
                    { creator: { id: user_id } }
                ]
            }
        });

        return {todogroups,total,page,per_page}
    },
    async findOne(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { id } = ctx.params;
        const todogroup_id = Number(id);
        const { data } = ctx.request.body;
        let params = {
            name: data.name
        };
        if(!user_id) {
            return ctx.response.status = 401;
        } else {
            params.creator = {
                set: [user_id]
            };
        }
        if(data.color_marker){
            params.color_marker = data.color_marker
        }

        let auth;
        let collection;
        let fields_permission = [];
        let orderTodo
        let members;
        const calc_auth = (members,member_roles) => {
            const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);

            if(is_blocked){
                ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
            }

            const { read, create, modify, remove } =
                strapi.service('api::project.project').calc_collection_auth(ACL,collection);
            auth = read
        }
        let todogroup = await strapi.service('api::todogroup.todogroup').find_todogroup_byID(todogroup_id);
        if(todogroup?.creator?.id === user_id || todogroup?.user?.id === user_id) {
            auth = true
        }
        if(todogroup?.card){
            const card_id = todogroup?.card.id
            const card = await strapi.service('api::card.card').find_cardByID(card_id);
            if(card){
                const member_roles = card.member_roles;
                members = card.card_members;
                if(members.map(i => i.by_user.id).includes(user_id)){
                    collection = 'todogroups'
                    // console.log('members 111',members);
                    calc_auth(members,member_roles);
                } else {
                    const belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(card_id);
                    if(belongedInfo){
                        let members;
                        if(belongedInfo.belonged_card){
                            collection = 'todogroups'
                            const member_roles = belongedInfo.belonged_card.member_roles;
                            members = belongedInfo.belonged_card.card_members;
                            if(members.map(i => i.by_user.id).includes(user_id)){
                                // console.log('members 222',members);
                                calc_auth(members,member_roles);
                            }
                        } else if(belongedInfo.belonged_project){
                            collection = 'card_todogroups'
                            const member_roles = belongedInfo.belonged_project.member_roles;
                            members = belongedInfo.belonged_project.project_members;
                            if(members.map(i => i.by_user.id).includes(user_id)){
                                // console.log('members 333',members);
                                calc_auth(members,member_roles);
                            }
                        }
                    }
                }
            }
        }
        if(todogroup?.project){
            const project_id = todogroup?.project.id
            collection = 'todogroups'
            const project = await strapi.service('api::project.project').find_projectByID(project_id);
            if(project){
                const member_roles = project.member_roles;
                const members = belongedInfo.belonged_project.project_members;
                if(members.map(i => i.by_user.id).includes(user_id)){
                    calc_auth(members,member_roles);
                } else {
                    auth = false;
                }
            }
        }
        if(auth){
            let _todogroup = await strapi.entityService.findOne('api::todogroup.todogroup', todogroup_id, {
                populate: {
                    todos: {
                      populate: {
                          attachment: true
                      }
                  }
                }
            });
            return _todogroup
        } else {
            ctx.throw(401, '您无权执行此操作')
        };
    },
    async create(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { kanban_id, card_id, data } = ctx.request.body

        let params = {
            name: data.name
        };
        if(!user_id) {
            return ctx.response.status = 401;
        } else {
            params.creator = {
                set: [user_id]
            };
        }
        if(data.color_marker){
            params.color_marker = data.color_marker
        }
        if(kanban_id){
            params.kanban = {
                set: [kanban_id]
            }
            params.user = {
                set: [user_id]
            };
        } else if(card_id){
            params.card =  {
                set: [card_id]
            }
        }
        const create_todogroupFn = async () => {
            let new_todogroup = await strapi.entityService.create('api::todogroup.todogroup', {
                data: params,
                populate: {
                    // 此处返回的看板ID，是指用户的私有清单组，指定关联到哪个看板
                    // 当用户查看此看板时，可以筛选出关联了此看板的清单组
                    // 此处关联为单向关联、通过看板并不能反向查找到清单组
                    kanban: {
                        fields: ['id']
                    },
                    card: {
                        fields: ['id']
                    },
                }
            });
            new_todogroup.todos = []
            return new_todogroup
        }

        let auth;
        let collection
        const calc_auth = (members,member_roles) => {
            const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);

            if(is_blocked){
                ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
            }

            const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,collection);
            auth = create
        }
        if(card_id){
            const belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(card_id);
            if(belongedInfo){
                // console.log('belongedInfo',belongedInfo);
                let members;
                if(belongedInfo.belonged_card){
                    collection = 'todogroups'
                    const member_roles = belongedInfo.belonged_card.member_roles;
                    members = belongedInfo.belonged_card.card_members;
                    if(members.map(i => i.by_user.id).includes(user_id)){
                        calc_auth(members,member_roles);
                    } else {
                        auth = false;
                    }
                } else if(belongedInfo.belonged_project){
                    collection = 'card_todogroups'
                    const member_roles = belongedInfo.belonged_project.member_roles;
                    members = belongedInfo.belonged_project.project_members;
                    if(members.map(i => i.by_user.id).includes(user_id)){
                        calc_auth(members,member_roles);
                    } else {
                        auth = false;
                    }
                }
            } else {
                ctx.throw(404, '卡片ID有误，没有找到其所属项目')
            }
        } else {
            auth = true
            params.user = {
                set: [user_id]
            };
        }
        if(auth){
            let res = await create_todogroupFn();
            if(res) {
                if(card_id){
                    let response = {
                        team_id: ctx.default_team?.id,
                        card_id: card_id,
                        data: res
                    }
                    strapi.$publish('todogroup:created', [ctx.room_name], response);
                }
                return res
            }
        }
    },
    async update(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { id } = ctx.params;
        const todogroup_id = Number(id);
        const { data, props } = ctx.request.body;
        let params = {
            name: data.name
        };
        if(!user_id) {
            return ctx.response.status = 401;
        }
        if(data.color_marker){
            params.color_marker = data.color_marker
        }

        let auth;
        let belonged_user;
        let collection;
        let fields_permission = [];
        let orderTodo
        let members;
        const calc_auth = (members,member_roles) => {
            const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);

            if(is_blocked){
                ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
            }

            const { read, create, modify, remove } =
                strapi.service('api::project.project').calc_collection_auth(ACL,collection);
            auth = modify

            fields_permission = strapi.service('api::project.project').clac_authed_fields(ACL,collection);
            orderTodo = strapi.service('api::project.project').calc_field_ACL(ACL,collection,'order');

        }
        const getAuthByCard = async (_card) => {
            const member_roles = _card.member_roles;
            members = _card.card_members;
            if(members.map(i => i.by_user.id).includes(user_id)){
                collection = 'todogroups'
                // console.log('members 111',members);
                calc_auth(members,member_roles);
            } else {
                const belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(_card.id);
                if(belongedInfo){
                    let members;
                    if(belongedInfo.belonged_card){
                        collection = 'todogroups'
                        const member_roles = belongedInfo.belonged_card.member_roles;
                        members = belongedInfo.belonged_card.card_members;
                        if(members.map(i => i.by_user.id).includes(user_id)){
                            // console.log('members 222',members);
                            calc_auth(members,member_roles);
                        }
                    } else if(belongedInfo.belonged_project){
                        collection = 'card_todogroups'
                        const member_roles = belongedInfo.belonged_project.member_roles;
                        members = belongedInfo.belonged_project.project_members;
                        if(members.map(i => i.by_user.id).includes(user_id)){
                            // console.log('members 333',members);
                            calc_auth(members,member_roles);
                        }
                    }
                }
            }
        }
        if(props?.card_id){
            const card = await strapi.service('api::card.card').find_cardByID(props?.card_id);
            if(card){
                await getAuthByCard(card)
            }
        }
        if(!props){
            let todogroup = await strapi.service('api::todogroup.todogroup').find_todogroup_byID(todogroup_id);
            if(todogroup?.creator?.id === user_id || todogroup?.user?.id === user_id) {
                auth = true
                belonged_user = true
            }
            if(!auth){
                if(todogroup?.card){
                const card_id = todogroup?.card.id
                const card = await strapi.service('api::card.card').find_cardByID(card_id);
                if(card){
                    await getAuthByCard(card)
                }
            }
                if(todogroup?.project){
                    const project_id = todogroup?.project.id
                    collection = 'todogroups'
                    const project = await strapi.service('api::project.project').find_projectByID(project_id);
                    if(project){
                        const member_roles = project.member_roles;
                        const members = belongedInfo.belonged_project.project_members;
                        if(members.map(i => i.by_user.id).includes(user_id)){
                            calc_auth(members,member_roles);
                        } else {
                            auth = false;
                        }
                    }
                }
            }
        }
        if(auth){
            let params = strapi.service('api::todogroup.todogroup').process_updateTodogroup_params(data, fields_permission, orderTodo, belonged_user);

            let update_todogroup = await strapi.entityService.update('api::todogroup.todogroup', todogroup_id, {
                data: params,
                populate: {
                    todos: {
                        populate: {
                            attachment: {
                                fields: ['id','ext','url']
                            }
                        }
                    },
                    kanban: {
                        fields: ['id']
                    }
                }
            });
            if(props?.card_id){
                let response = {
                    team_id: ctx.default_team?.id,
                    card_id: props.card_id,
                    data: update_todogroup
                }
                strapi.$publish('todogroup:updated', [ctx.room_name], response);
            }
            return update_todogroup
        } else {
            ctx.throw(403, '您无权执行此操作')
        };
    },
    async delete(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { id } = ctx.params;
        const todogroup_id = Number(id);

        if(!ctx.state.user || !ctx.state.user.id) {
            return ctx.response.status = 401;
        }

        let auth;
        let collection;
        let members;
        const calc_auth = (members,member_roles) => {
            const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);

            if(is_blocked){
                ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
            }

            const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,collection);
            auth = remove
        }
        let todogroup = await strapi.service('api::todogroup.todogroup').find_todogroup_byID(todogroup_id);

        if(todogroup?.creator?.id === user_id || todogroup?.user?.id === user_id) {
            auth = true
        }
        if(!auth && todogroup?.card){
            const card_id = todogroup?.card.id
            const card = await strapi.service('api::card.card').find_cardByID(card_id);
            if(card){
                const member_roles = card.member_roles;
                members = card.card_members;
                collection = 'todogroups'
                if(members.map(i => i.by_user.id).includes(user_id)){
                    calc_auth(members,member_roles);
                } else {
                    const belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(card_id);
                    if(belongedInfo){
                        let members;
                        if(belongedInfo.belonged_card){
                            const member_roles = belongedInfo.belonged_card.member_roles;
                            members = belongedInfo.belonged_card.card_members;
                            if(members.map(i => i.by_user.id).includes(user_id)){
                                calc_auth(members,member_roles);
                            }
                        } else if(belongedInfo.belonged_project){
                            collection = 'card_todogroups'
                            const member_roles = belongedInfo.belonged_project.member_roles;
                            members = belongedInfo.belonged_project.project_members;
                            if(members.map(i => i.by_user.id).includes(user_id)){
                                calc_auth(members,member_roles);
                            }
                        }
                    }
                }
            }
        }
        if(!auth && todogroup?.project){
            const project_id = todogroup?.project.id
            collection = 'todogroups'
            const project = await strapi.service('api::project.project').find_projectByID(project_id);
            if(project){
                const member_roles = project.member_roles;
                const members = belongedInfo.belonged_project.project_members;
                if(members.map(i => i.by_user.id).includes(user_id)){
                    calc_auth(members,member_roles);
                } else {
                    auth = false;
                }
            }
        }
        // console.log(auth, user_id, todogroup_id, todogroup)
        if(auth){
            let _delete = await strapi.entityService.delete('api::todogroup.todogroup', todogroup_id);
            if(_delete) {
                if(todogroup?.card){
                    let response = {
                        team_id: ctx.default_team?.id,
                        card_id: todogroup.card.id,
                        data: {
                            removed_todogroup_id: todogroup_id
                        }
                    }
                    strapi.$publish('todogroup:removed', [ctx.room_name], response);
                }
                return '待办分组已删除'
            }
        } else {
            ctx.throw(401, '您无权执行此操作')
        };
    }
}));
