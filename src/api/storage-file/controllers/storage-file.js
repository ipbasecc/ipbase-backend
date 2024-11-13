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
        if(!data){
            ctx.throw(500, '需要提供修改数据')
        }
        if(!user_id){
            ctx.throw(500, '请先登陆')
        }

        let file_for_get_project
        let total_size = 0
        const batchCreate = async (Arr) => {
            const promises = Arr.map(async (i) => {
              try {
                let res = await strapi.entityService.create('api::storage-file.storage-file', {
                  data: {
                    name: i.name,
                    file: i.file_id,
                    storage: i.storage_id,
                    creator: user_id
                  },
                  populate: {
                    file: {
                        fields: ['id','url','ext','size']
                    }
                  }
                });
                res.storage_id = i.storage_id
                if(!file_for_get_project){
                    file_for_get_project = res.id
                }
                total_size = total_size + res.file.size
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
            return successfulResults;
          };

        const result = await batchCreate(data);
        if(result){
            // console.log('result result', result);
            let response = {
                team_id: ctx.default_team?.id,
                data: result
            }
            strapi.$publish('file:batchCreated', [ctx.room_name], response);

            process.nextTick(async () => {
                try {
                    // console.log('file_for_get_project', file_for_get_project, total_size);
                    const belongedInfo = await strapi.service('api::storage-file.storage-file').find_belongedInfo_byFileID(file_for_get_project);
                    // console.log('process.nextTick belongedInfo', belongedInfo);
                    if(belongedInfo){
                        // console.log('process.nextTick belongedInfo');
                        const project = belongedInfo.belonged_project
                        if(project){
                            const params = {
                                  project: project,
                                  size: total_size,
                                  prv_size: 0
                              }
                            //   console.log('process.nextTick start', params);
                          await strapi.service('api::project.project').updateProjectTotalFileSize(params);
                        }
                    }
                } catch (error) {
                  console.error('After update processing error:', error);
                }
            });

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
            // 鉴权成功后，先直接通知前端删除成功，因为要执行更新存储大小的操作，所以不能提前删除，否则后续执行时会找不到文件从而无法统计出大小
            let response = {
                team_id: ctx.default_team?.id,
                data: {
                    removed_file_id: id
                }
            }
            strapi.$publish('file:removed', [ctx.room_name], response);
            process.nextTick(async () => {
                try {
                    const storage_file = await strapi.db.query('api::storage-file.storage-file').findOne({
                        where: {
                            id: id
                        },
                        populate: {
                            file: {
                                fields: ['id','size','url']
                            }
                        }
                    })
                    if(storage_file){
                        await strapi.plugins.upload.services.upload.remove({
                          id: { $in: [storage_file.file?.id] }  // fileIds 是一个 ID 数组
                        });
                        const ali_params = {
                          url: storage_file.file?.url,
                          urls: null,
                        }
                        await strapi.service('api::ali.ali').removeObject(ali_params)
                    }
                } catch (error) {
                  console.error('After update processing error:', error);
                }
                // 大小统计结束后，删除文件
                await strapi.entityService.delete('api::storage-file.storage-file',id);
            });
            return 'OK'
        }
    }
}));
