'use strict';

/**
 * storage-file service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::storage-file.storage-file',({strapi}) => ({
    async find_belongedInfo_byFileID(...args) {
        const [ file_id ] = args;
        const file = await strapi.service('api::storage-file.storage-file').find_file_byID(file_id);;
        if(file?.storage) {
            let res = {};
            // let { belonged_storage, belonged_user, belonged_card, belonged_project, rootProject } = res
            const find_belonged = async (id) => {
                const storage = await strapi.service('api::storage.storage').get_storage_byID(id);
                if(storage){
                    // if(!belonged_storage){
                    //     belonged_storage = storage;
                    // }
                    return storage
                }
            }

            const storage_id = file.storage?.id
            const belonged = await find_belonged(storage_id);
            if(belonged){
                res.belonged_storage = belonged;
                if(belonged.belonged_user){
                    res.belonged_user = belonged.belonged_user
                }
                if(belonged.belonged_card){
                    res.belonged_card = belonged.belonged_card;
                    const belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(belonged.belonged_card.id);
                    if(belongedInfo){
                        res.rootProject = belongedInfo.belonged_project
                    }
                }
                if(belonged.belonged_project){
                    res.belonged_project = belonged.belonged_project
                }
                if(belonged.storage){
                    await find_belonged(belonged.storage.id)
                }
                // console.log('res result', res);
                return res
            }
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
            
            const calc_auth = (members,member_roles) => {
                const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
                
                if(is_blocked){
                    ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
                }
    
                res = strapi.service('api::project.project').calc_collection_auth(ACL,'card');
            }
            if(belongedInfo.belonged_card){
                const card = belongedInfo.belonged_card
                const card_members = card.card_members.map(i => i.by_user.id);
                if(card_members.includes(user_id)){
                    // console.log('belonged_card service', res);
                    const members = card.card_members;
                    const member_roles = card.member_roles;
                    calc_auth(members,member_roles);
                } else {
                    // console.log('rootProject service', res);
                    const projcet = belongedInfo.rootProject;
                    const member_roles = projcet.member_roles;
                    const members = projcet.project_members;
                    calc_auth(members,member_roles);
                }
            } else if(belongedInfo.belonged_project) {
                const projcet = belongedInfo.belonged_project;
                // console.log('belonged_project service', res);

                const member_roles = projcet.member_roles;
                const members = projcet.project_members;
                calc_auth(members,member_roles);
            }
            // console.log('res service', res);
            return res
        } else {
            ctx.throw(404, '文件ID有误，无法找到关联信息')
        }
    }
}));
