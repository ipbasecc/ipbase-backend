'use strict';

/**
 * group service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::group.group',({strapi}) => ({
    async find_belongedProject_ByGroupID(...args){
        const [group_id] = args;
        const group = await strapi.entityService.findOne('api::group.group',group_id,{
            populate: {
                board: {
                    populate: {
                        project: {
                            fields: ['id']
                        }
                    }
                }
            }
        });
        if(group){
            const project_id = group.board?.project?.id
            const project = await strapi.service('api::project.project').find_projectByID(project_id);
            if(project){
                return project
            }
        }
    },
    process_updateGroup_params(...args) {
        const ctx = strapi.requestContext.get();
        const [data,fields_permission,props] = args;
        const { orderKanban } = props;
        console.log('orderKanban',orderKanban);
        let params = {};
        if(data.name && fields_permission.includes('name')) {
            params.name = data.name
        } 
        if(data.name && !fields_permission.includes('name')) {
            ctx.throw(402, '您无权修改分组名称');
        }

        if(data.status && fields_permission.includes('status')) {
            params.status = data.status
        } 
        if(data.status && !fields_permission.includes('status')) {
            ctx.throw(402, '您无权修改分组状态');
        }
        if(data.icon && fields_permission.includes('icon')) {
            params.icon = data.icon
        } 
        if(data.icon && !fields_permission.includes('icon')) {
            ctx.throw(402, '您无权修改分组图标');
        }
        if(data.kanbans && orderKanban) {
            params.kanbans = data.kanbans
        } 
        if(data.kanbans && !orderKanban) {
            ctx.throw(402, '您无权对分组进行排序');
        }

        return params
    }
}));
