'use strict';

/**
 * column service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::column.column', ({strapi}) => ({
    async find_belongedInfo_byColumnID(...args) {
        const [column_id] = args;
        let belongedInfo = {
            belonged_project: void 0,
            belonged_card: void 0
        }

        const find_belongedInfo_byColumnID_fn = async (id) => {
            let column = await strapi.entityService.findOne('api::column.column',id,{
                populate: {
                    kanban: {
                        populate: {
                            group: {
                                populate: {
                                    board: {
                                        populate: {
                                            project: {
                                                fields: ['id']
                                            }
                                        }
                                    }
                                }
                            },
                            relate_by_card: {
                                populate: {
                                    column: {
                                        populate: {
                                            kanban: {
                                                fields: ['id']
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            if(column?.kanban?.group?.board?.project){
                const project_id = column.kanban.group?.board?.project?.id;
                const project = await strapi.service('api::project.project').find_projectByID(project_id);
                // console.log('find_belongedInfo_byColumnID_fn',column);
                if(project){
                    belongedInfo.belonged_project = project
                    // console.log('belongedInfo p',belongedInfo);
                    return belongedInfo
                }
            } else if(column?.kanban?.relate_by_card?.column) {
                if(!belongedInfo.belonged_card){
                    const card_id = column?.kanban?.relate_by_card.id
                    belongedInfo.belonged_card = await strapi.service('api::card.card').find_cardByID(card_id);
                    // console.log('belongedInfo c',belongedInfo);
                }
                const kanban_id = column.kanban?.relate_by_card.column.id
                await find_belongedInfo_byColumnID_fn(kanban_id)
            }
        }
        await find_belongedInfo_byColumnID_fn(column_id);
        // console.log('belongedInfo belongedInfo',belongedInfo);
        if(belongedInfo){
            return belongedInfo
        }
    },
    process_updateColumn_params(...args){
        const [data,fields_permission,props] = args;
        const { orderCards } = props;
        const ctx = strapi.requestContext.get();
        let params = {}
        if(data.name && (fields_permission.includes('name'))){
            params.name = data.name
        } else if(data.name && !fields_permission.includes('name')) {
            ctx.throw(401, '您无权修改分栏名称')
        }
        if(data.status && (fields_permission.includes('status'))){
            params.status = data.status
        } else if(data.name && !fields_permission.includes('status')) {
            ctx.throw(401, '您无权修改分栏状态')
        }
        if(data.executor && (fields_permission.includes('executor'))){
            params.executor = data.executor
        } else if(data.name && !fields_permission.includes('executor')) {
            ctx.throw(401, '您无权修改分栏负责人')
        }
        if(data.type && (fields_permission.includes('type'))){
            params.type = data.type
        } else if(data.name && !fields_permission.includes('type')) {
            ctx.throw(401, '您无权修改分栏类型')
        }
        if(data.cards && (orderCards)){
            params.cards = data.cards
        } else if(data.cards && !orderCards) {
            ctx.throw(401, '您无权修改修改分栏内卡片排序')
        }

        return params
    },
    async filterCardsDataByAuth(...args) {
        const ctx = strapi.requestContext.get();
        let [ cards, user_id, ACL, isSuper_member ] = args;
        // 私有卡片 - 管理组和卡片关联用户可见
        const canShow = async (card) => {
            const user_roles_inCard = await strapi.db.query('api::member-role.member-role').findMany({
              where: {
                by_card: card.id,
                by_user: user_id,
                subject: {
                  $not: {
                    $in: ['unconfirmed', 'blocked']
                  }
                }
              }
            });
            return user_roles_inCard && user_roles_inCard.length > 0
        }
        let team_mode
        if(ctx.default_team){
            team_mode = ctx.default_team.config.mode || 'toMany';
        }
        if(!isSuper_member) {
            cards = cards.filter(card => {
              // 卡片不是私有的
              if (!card.private && team_mode === 'toMany') {
                return true;
              } else {
                  // 用户是卡片的执行者
                  if (card.executor && card.executor.id === user_id) {
                    return true;
                  }
                  
                  // 用户是卡片的成员之一
                  if (canShow(card)) {
                    return true;
                  }
              }
              return false;
            });
        } else {
            return cards
        }

        const { read:read_column_role, create:create_column_role, modify:modify_column_role, remove:remove_column_role } = strapi.service('api::project.project').calc_collection_auth(ACL,'column');
        const { read:read_card_role, create:create_card_role, modify:modify_card_role, remove:remove_card_role } = strapi.service('api::project.project').calc_collection_auth(ACL,'card');
        const { read:read_card_todogroup_role, create:create_card_todogroup_role, modify:modify_card_todogroup_role, remove:remove_card_todogroup_role } = strapi.service('api::project.project').calc_collection_auth(ACL,'card_todogroups');
        const { read:read_card_todo_role, create:create_card_todo_role, modify:modify_card_todo_role, remove:remove_card_todo_role } = strapi.service('api::project.project').calc_collection_auth(ACL,'card_todo');

        if(!read_card_role) {
            cards = cards.filter(i => {
                if(i.creator.id === user_id){
                    return true
                }
                if(i.card_members && i.card_members.some(m => m.by_user.id === user_id)){
                    return true
                }
            })
        }
        if(!read_card_todogroup_role) {
            cards = cards.map(card => ({
                ...card,
                todogroups: []
            }))
        }
        if(!read_card_todo_role) {
            cards = cards.map(card => ({
                ...card,
                todogroups: card.todogroups.map(todogroup => ({
                    ...todogroup,
                    todos: []
                }))
            }))
        }
        cards = cards.map(card => {
            return {
                ...card,
                share_codes: card.share_codes && card.share_codes.length > 0 ? card.share_codes.filter(code => code.creator.id === user_id) : null
            }
        })
        


        return kanban
    },
}));
