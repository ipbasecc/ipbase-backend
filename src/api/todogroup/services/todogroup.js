'use strict';

/**
 * todogroup service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::todogroup.todogroup',({strapi}) => ({
    async find_todogroup_byID(...args) {
        const [todogroup_id] = args;
        const todogroup = strapi.entityService.findOne('api::todogroup.todogroup',todogroup_id,{
            populate: {
                user: {
                    fields: ['id']
                },
                card: true,
                project: {
                    fields: ['id','mm_channel']
                },
                kanban: {
                    fields: ['id']
                },
                creator: {
                    fields: ['id']
                }
            }
        })
        if(todogroup){
            return todogroup
        }
    },
    process_updateTodogroup_params(...args){
        const ctx = strapi.requestContext.get();
        let params = {}
        const [ data, fields_permission, orderTodo, belonged_user ] = args;
        if(data.name && (fields_permission?.includes('name') || belonged_user)) {
            params.name = data.name
        } else if(data.name && (!fields_permission?.includes('name') && !belonged_user)) {
            ctx.throw(401, '您无权修改待办分组名称')
        }
        if(data.color_marker && (fields_permission?.includes('color_marker') || belonged_user)) {
            params.color_marker = data.color_marker
        } else if(data.color_marker && (!fields_permission?.includes('color_marker') && !belonged_user)) {
            ctx.throw(401, '您无权修改待办分组颜色标签')
        }
        console.log('orderTodo',orderTodo);
        if(data.todos && (orderTodo || belonged_user)) {
            params.todos = data.todos
        } else if(data.todos && (!orderTodo && !belonged_user)) {
            ctx.throw(401, '您无权对待办内容执行排序操作')
        }
        return params
    }
}));
