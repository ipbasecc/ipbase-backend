'use strict';

/**
 * todo service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::todo.todo',({strapi}) => ({
    async find_belonged_todogroup(...args){
        const [todo_id] = args;
        const todo = await strapi.entityService.findOne('api::todo.todo',todo_id,{
            populate: {
                todogroup: {
                    fields: ['id']
                }
            }
        })
        if(todo) {
            const todogroup = await strapi.service('api::todogroup.todogroup').find_todogroup_byID(todo.todogroup.id);
            if(todogroup) {
                return todogroup
            }
        }
    },
    process_updateTodo_params(...args){
        const [data,fields_permission,belonged_user] = args;
        const ctx = strapi.requestContext.get();
        const user_id = Number(ctx.state.user.id);
        
        let params = {};
        if(data.content && (fields_permission.includes('content') || belonged_user)) {
            params.content = data.content
        } else if (data.content && !belonged_user && !fields_permission.includes('content')) {
            ctx.throw(401, '您无权修改该待办内容')
        }
        if(data.hasOwnProperty('status') && (fields_permission.includes('status') || belonged_user)) {
            params.status = data.status
            if(data.status){
                params.completed_by = user_id
            } else {
                params.completed_by = null
            }
        } else if (data.hasOwnProperty('status') && !belonged_user && !fields_permission.includes('status')) {
            ctx.throw(401, '您无权修改该待办状态')
        }
        if(data.color_marker && (fields_permission.includes('color_marker') || belonged_user)) {
            params.color_marker = data.color_marker
        } else if (data.color_marker && !belonged_user && !fields_permission.includes('color_marker')) {
            ctx.throw(401, '您无权修改该待办颜色标签')
        }
        if(data.importance && (fields_permission.includes('importance') || belonged_user)) {
            params.importance = data.importance
        } else if (data.importance && !belonged_user && !fields_permission.includes('importance')) {
            ctx.throw(401, '您无权修改该待办重要度')
        }
        if(data.urgency && (fields_permission.includes('urgency') || belonged_user)) {
            params.urgency = data.urgency
        } else if (data.urgency && !belonged_user && !fields_permission.includes('urgency')) {
            ctx.throw(401, '您无权修改该待办紧急度')
        }
        if(data.attachment && (fields_permission.includes('content') || belonged_user)) {
            params.attachment = {
                set: data.attachment
            }
        } else if (data.content && !belonged_user && !fields_permission.includes('content')) {
            ctx.throw(401, '您无权修改该待办内容')
        }

        return params
    }
}));
