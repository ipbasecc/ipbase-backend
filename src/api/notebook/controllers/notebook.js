'use strict';

/**
 * notebook controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::notebook.notebook', ({strapi}) => ({
    async findOne(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id){
            ctx.throw(403, '请先登陆')
        }
        const { id } = ctx.request.params;
        const notebook = await strapi.db.query('api::notebook.notebook').findOne({
          where: {
              id: id,
              user: user_id
          },
          populate: {
              documents: {
                  populate: {
                      by_course: true
                  }
              }
          },
        });
        if(notebook){
            return notebook
        } else {
            ctx.throw(404, '未找到对应数据')
        }
    },
    async create(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id){
            ctx.throw(403, '请先登陆')
        }
        const { data } = ctx.request.body;
        
        const _create = await strapi.db.query('api::notebook.notebook').create({
          data: {
              ...data,
              user: user_id
          },
        });
        if(_create){
            return _create
        } else {
            ctx.throw(500, '创建时发生未知错误')
        }
    },
    async update(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id){
            ctx.throw(403, '请先登陆')
        }
        const { data } = ctx.request.body;
        const { id } = ctx.params;
        if(!id){
            ctx.throw(403, '缺少ID')
        }
        const notebook = await strapi.db.query('api::notebook.notebook').findOne({
            where: {
                id: id,
                user: user_id
            }
        })
        if(notebook){
            const _update = await strapi.db.query('api::notebook.notebook').update({
                where: { id: id },
                data: data
            });
            if(_update){
                return _update
            } else {
                ctx.throw(500, '创建时发生未知错误')
            }
        }
    },
    async delete(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id){
            ctx.throw(403, '请先登陆')
        }
        const { id } = ctx.params;
        if(!id){
            ctx.throw(403, '缺少ID')
        }
        const notebook = await strapi.db.query('api::notebook.notebook').findOne({
            where: {
                id: id,
                user: user_id
            }
        })
        if(notebook){
            const _delete = await strapi.db.query('api::notebook.notebook').delete({
                where: { id: id }
            });
            if(_delete){
                return _delete
            } else {
                ctx.throw(500, '删除时发生未知错误')
            }
        }
    }
}));
