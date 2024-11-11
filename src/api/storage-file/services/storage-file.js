'use strict';

/**
 * storage-file service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::storage-file.storage-file',({strapi}) => ({
    async find_belongedInfo_byFileID(...args) {
        const [ file_id ] = args;
        const storage_populate = {
            storage: {
                fields: ['id']
            },
            belonged_project: {
                fields: ['id']
            },
            belonged_card: {
                fields: ['id']
            },
            belonged_user: {
                fields: ['id']
            },
            creator: {
                fields: ['id']
            },
            can_write_user: {
                fields: ['id']
            },
            can_read_user: {
                fields: ['id']
            }
        }
        
        const file = await strapi.db.query('api::storage-file.storage-file').findOne({
            where: { id: file_id },
            populate: {
                storage: {
                    populate: storage_populate
                }
            }
        });
        if(file){
            const getStorage = async (storage_id) => {
                return await strapi.db.query('api::storage.storage').findOne({
                    where: { id: storage_id },
                    populate: storage_populate
                });
            }
            
            // 创建一个新的 Promise 来处理递归查询
            const findBelongedInfo = async (storage) => {
                const result = {};
                
                const processStorage = async (storage) => {
                    const uplevel_storage = await getStorage(storage.id);
                    
                    if(uplevel_storage.storage) {
                        await processStorage(uplevel_storage.storage);
                    }
                    
                    if(uplevel_storage.belonged_project) {
                        result.belonged_project = uplevel_storage.belonged_project;
                    }
                    
                    if(uplevel_storage.belonged_card) {
                        result.belonged_card = uplevel_storage.belonged_card;
                        const card_id = uplevel_storage.belonged_card.id;
                        const card_BelongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(card_id);
                        if(card_BelongedInfo?.belonged_project) {
                            result.belonged_project = card_BelongedInfo.belonged_project;
                        }
                    }
                    
                    if(uplevel_storage.belonged_user) {
                        result.belonged_user = uplevel_storage.belonged_user;
                    }
                };
        
                await processStorage(storage);
                return result;
            };
        
            // 主逻辑
            // console.log('file res', file);
            if (!file.storage) {
                return {};
            }
        
            const result = {
                belonged_storage: file?.storage,
                ...(await findBelongedInfo(file?.storage))
            };
        
            // console.log('belongedInfo res', result);
            return result;
        } else {
            const ctx = strapi.requestContext.get();
            ctx.throw(404,'没有找到要统计的文件')
        }
    
    },
    async find_file_byID(...args) {
        const [file_id] = args;
        let file = await strapi.entityService.findOne('api::storage-file.storage-file',file_id,{
            populate: {
                owner: {
                    fields: ['id','username'],
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
                storage: {
                    fields: ['id']
                }
            }
        })
        if(file){
            return file
        }
    },
    async calc_collection_auth(...args) {
        const [ storage_id, user_id ] = args;
        const ctx = strapi.requestContext.get();
        // console.log('superMember service', storage_id,user_id);

        let res = {};
        // let { belonged_storage, belonged_user, belonged_card, belonged_project, rootProject } = res
        const belongedInfo = await strapi.service('api::storage-file.storage-file').find_belongedInfo_byFileID(storage_id);
        if(belongedInfo){
            // console.log('belongedInfo result', belongedInfo);
            if(belongedInfo.belonged_storage){
                const __ = belongedInfo.belonged_storage;
                const _ = [
                    __.creator?.id || null,
                    __.belonged_user?.id || null,
                    __.belonged_card?.creator?.id || null,
                    __.belonged_project?.creator?.id || null,
                    __.can_write_user?.id || null
                ]
                // console.log('superMember service', res);
                res.superMember = _.includes(user_id);
            }
            
            if(belongedInfo.belonged_card){
                // 一个用户在card中只对应一个角色，这里使用findOne
                const cardRole = await strapi.db.query('api::member-role.member-role').findOne({
                    where: {
                        by_card: belongedInfo.belonged_card.id,
                        members: {
                            by_user: user_id
                        }
                    },
                    populate: {
                        ACL: {
                            populate: {
                                fields_permission: true
                            }
                        }
                    }
                })
                res = {
                    ...res,
                    ...cardRole.ACL?.find(i => i.collection === 'storage')
                }
                res.fields_permission = res.fields_permission.filter(i => i.modify)?.map(j => j.field);
            } else if(belongedInfo.belonged_project) {
                const projectRoles = await strapi.db.query('api::member-role.member-role').findMany({
                    where: {
                        by_project: belongedInfo.belonged_project.id,
                        members: {
                            by_user: user_id
                        }
                    },
                    populate: {
                        ACL: {
                            populate: {
                                fields_permission: true
                            }
                        }
                    }
                })
                const allStorageAuths = projectRoles.map(i => i.ACL?.find(i => i.collection === 'storage')).flat(2);
                res = {
                    ...res,
                    read: allStorageAuths?.filter(i => i.read)?.length > 0,
                    create: allStorageAuths?.filter(i => i.create)?.length > 0,
                    modify: allStorageAuths?.filter(i => i.modify)?.length > 0,
                    remove: allStorageAuths?.filter(i => i.remove)?.length > 0,
                    fields_permission: [...new Set(allStorageAuths?.map(i => i.fields_permission)?.flat(2)?.filter(j => j.modify)?.map(k => k.field))]
                }
            }
            // console.log('res service', res);
            return res
        } else {
            ctx.throw(404, '文件ID有误，无法找到关联信息')
        }
    },
}));
