'use strict';

/**
 * storage-file controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::storage-file.storage-file',({strapi}) => ({
    async batchCreate(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const data = ctx.request.body;

        // console.log('data data', data);

        if(!data){
            ctx.throw(500, '需要提供修改数据')
        }
        if(!user_id){
            ctx.throw(500, '请先登陆')
        }
        const batchCreate = async (Arr) => {
            const promises = Arr.map(async (i) => {
              try {
                let res = await strapi.entityService.create('api::storage-file.storage-file', {
                  data: {
                    name: i.name,
                    file: i.file_id,
                    storage: i.storage_id,
                    owner: user_id
                  },
                  populate: {
                    owner: {
                        fields: ['id','username','mm_profile'],
                        populate: {
                            profile: {
                                populate: {
                                    avatar: {
                                        fields: ['id','url','ext']
                                    }
                                }
                            }
                        }
                    },
                    file: {
                        fields: ['id','url','ext']
                    }
                  }
                });
                res.storage_id = i.storage_id
                return res;
              } catch (error) {
                console.error('Error creating entity:', error);
                // 如果你希望即使出现错误也继续执行，可以返回一个占位值，例如 null
                return null;
              }
            });
          
            const results = await Promise.allSettled(promises);
          
            // 过滤掉失败的 Promise 结果
            const successfulResults = results
              .filter((result) => result.status === 'fulfilled')
              // @ts-ignore
              .map((result) => result.value);
          
            let response = {
                team_id: ctx.default_team?.id,
                data: successfulResults
            }
            strapi.$publish('file:batchCreated', [ctx.room_name], response);
            return successfulResults;
          };
          
          const result = await batchCreate(data);
          if(result){
              // console.log('result result', result);
            let response = {
                team_id: ctx.default_team?.id,
                data: result
            }
            strapi.$publish('file:removed', [ctx.room_name], response);
            return result
          }
    },
    async delete(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { id } = ctx.params;

        if(!user_id){
            ctx.throw(500, '请先登陆')
        }

        let auth;
        const res = await strapi.service('api::storage-file.storage-file').calc_collection_auth(id,user_id);
        if(res){
            // console.log('res result', res);
            auth = res.remove || res.superMember
        }
        // console.log('auth result', auth);
        if(auth){
            const remove = await strapi.entityService.delete('api::storage-file.storage-file',id);
            if(remove){
                let response = {
                    team_id: ctx.default_team?.id,
                    data: {
                        removed_file_id: id
                    }
                }
                strapi.$publish('file:removed', [ctx.room_name], response);
                return 'OK'
            } else {
                ctx.throw(403, '您无权删除此文件')
            }
        }

    }
}));
