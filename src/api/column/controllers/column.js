'use strict';

/**
 * column controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::column.column',({strapi}) => ({
    async create(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        // @ts-ignore
        let kanban_id = Number(ctx.request.body.kanban_id);
        // @ts-ignore
        let data = ctx.request.body.data;

        // console.log(user_id,project_id,kanban_id);

        if(!kanban_id) {
            ctx.throw(400, '缺少看板ID');
            return
        }
        let auth;
        let ACL;
        const belongedInfo = await strapi.service('api::kanban.kanban').find_belongedInfo_byKanbanID(kanban_id);
        // console.log('belongedInfo', belongedInfo);
        if(belongedInfo){
            let members;
            const calc_auth = (members,member_roles) => {
                // @ts-ignore
                const {ACL:__ACL, is_blocked, role_names} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
                ACL = __ACL
                // console.log('ACL', ACL);

                if(is_blocked){
                    ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
                }

                // @ts-ignore
                const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'column');
                auth = create
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
            ctx.throw(404, '分栏ID有误，没有找到其所属项目')
        }

        if(!auth) {
            ctx.throw(401, '您无权执行此操作')
            return
        }

        var now = new Date();
        var iso = now.toISOString();
        const column_create = await strapi.entityService.create('api::column.column',{
            data: {
                name: data.name,
                status: data.status || 'pending',
                unread_count: 0,
                type: 'P',
                publishedAt: iso,
                kanban: kanban_id,
                creator: user_id
            },
        });

        if(column_create) {
            let val = column_create;
            // @ts-ignore
            val.cards = []; //默认为分栏下的cards字段返回一个空数组，否则前端往分栏拖拽卡片时会无法完成
            strapi.$publish('column:created', [ctx.room_name], {
                team_id: ctx.default_team?.id,
                kanban_id: kanban_id,
                data: val
            });
            return val
        } else {
            return '创建时出错，请刷新页面后重新尝试'
        }
    },
    async update(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let column_id = Number(ctx.params.id);
        // @ts-ignore
        let data = ctx.request.body.data;

        if(data.name === '') {
            ctx.throw(500, '分栏名称不能为空');
        }
        let auth;
        let ACL;
        let fields_permission = [];
        let orderCards;
        let isSuper_member
        const belongedInfo = await strapi.service('api::column.column').find_belongedInfo_byColumnID(column_id);
        if(belongedInfo){
            let members;
            const calc_auth = (members,member_roles) => {
                // @ts-ignore
                const {ACL:__ACL, is_blocked, role_names} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
                ACL = __ACL
                
                isSuper_member = role_names.includes('creator')
                
                if(is_blocked){
                    ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
                }

                // @ts-ignore
                const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'column');
                orderCards = strapi.service('api::project.project').calc_collection_auth(ACL,'column');
                auth = modify

                let authed_fields = strapi.service('api::project.project').clac_authed_fields(ACL,'column');
                fields_permission = [...fields_permission, ...authed_fields];
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
            const props = {
                orderCards: orderCards
            }
            const params = strapi.service('api::column.column').process_updateColumn_params(data,fields_permission,props)
            const column_populate = strapi.service('api::kanban.kanban').column_populate();
            let column_update = await strapi.entityService.update('api::column.column',column_id,{
                data: params,
                populate: column_populate
            });
            if(column_update) {
                // 分栏下的card，ws不发送，因为用户权限不同，应该发送不同的数据，所以只发送id
                // 前端用已有的card去重组数据，如果没有对应id的card，前端重新获取对应card
                // 如果是课程，ws不发送未发布的内容
                const publishedCards = column_update.cards.filter(i => i.type !== 'classroom' || i.published)
                // console.log(column_update.cards?.length)
                let wsData
                if(belongedInfo.kanban?.type === 'classroom'){
                    wsData = {
                        ...column_update,
                        cardSort: publishedCards.length > 0 ? publishedCards.map(i => i.id) : []
                    }
                } else {
                    wsData = {
                        ...column_update,
                        cardSort: column_update.cards.length > 0 ? column_update.cards.map(i => i.id) : []
                    }
                }
                // 删掉cards，ws不能发送
                // 前端当前用户使用返回数据更新，其它用户使用cardSort重组cards数据
                delete wsData.cards
                strapi.$publish('column:updated', [ctx.room_name], {
                    team_id: ctx.default_team?.id,
                    data: wsData,
                    updator: user_id
                });
                return column_update
            } else {
                return '更新时出错，请刷新页面后重新尝试'
            }
        }
    },
    async delete(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let project_id = Number(ctx.query.project_id);
        let column_id = Number(ctx.params.id);

        // console.log(user_id,project_id);

        if(!column_id) {
            ctx.throw(400, '缺少分栏ID');
            return
        }
        let auth;
        const belongedInfo = await strapi.service('api::column.column').find_belongedInfo_byColumnID(column_id);
        if(belongedInfo){
            let members;
            const calc_auth = (members,member_roles) => {
                // @ts-ignore
                const {ACL, is_blocked, role_names} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
                
                if(is_blocked){
                    ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
                }

                // @ts-ignore
                const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'kanban');
                auth = remove
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
        }

        // 判断分栏是否包含卡片，如果有，后续要执行递归删除
        const column = await strapi.entityService.findOne('api::column.column', column_id, {
            populate: {
                creator: {
                    fields: ['id']
                },
                cards: {
                    fields: ['id']
                }
            }
        });
        if(auth && column?.cards.length > 0) {
            const cards_of_delete = column?.cards.map(i => i.id);
            const deleteCard = async (id) => {
                await strapi.entityService.delete('api::card.card',id)
            }
            cards_of_delete.map(card => deleteCard(card));
        }
        const deleteColumn = await strapi.entityService.delete('api::column.column',column_id)
        if(deleteColumn) {
            strapi.$publish('column:deleted', [ctx.room_name], {
                team_id: ctx.default_team?.id,
                data: {
                    removed_column_id: column_id
                }
            });
            return deleteColumn
        }
    },
    async find(ctx) {
        ctx.throw(400, '请在项目内查看分栏');
        return
    },
    async findOne(ctx) {
        ctx.throw(400, '请在项目内查看分栏');
        return
    }
}));
