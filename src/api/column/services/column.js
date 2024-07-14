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
    }
}));
