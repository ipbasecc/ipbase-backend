'use strict';

/**
 * schedule service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::schedule.schedule',({strapi}) => ({
    async find_schedula_byID(...args) {
        const [schedule_id] = args;
        const schedule = await strapi.entityService.findOne('api::schedule.schedule',schedule_id,{
            populate: {
                by_user: {
                    fields: ['id']
                },
                by_project: {
                    fields: ['id']
                },
                by_card: {
                    fields: ['id']
                },
                share_codes: {
                    populate: {
                        creator: {
                            fields: ['id','username'],
                        }
                    }
                }
            }
        })
        return schedule
    },
    async find_authInfo(...args){
        const [schedule_id,user_id] = args;
        // console.log('authInfo service',schedule_id,user_id);
        let by_user_id;
        const schedule = await strapi.service('api::schedule.schedule').find_schedula_byID(schedule_id);
        if(schedule){
            const clac_auth_by_project = async (project_id) => {
                const project = await strapi.service('api::project.project').find_projectByID(project_id);
                if(project){
                    const { 
                        read, create, modify, remove, is_blocked, role_names, ACL
                    } = await strapi.service('api::project.project').clac_project_auth(project, user_id);

                    let fields_permission = strapi.service('api::project.project').clac_authed_fields(ACL,'schedule');

                    const authInfo = {
                        read, create, modify, remove, is_blocked, role_names, fields_permission
                    }

                    return authInfo
                }
            }
            const clac_auth_by_card = async (card_id) => {
                const card = await strapi.service('api::card.card').find_cardByID(card_id);
                if(card){
                    const isCardMember = card.card_members.map(i => i.by_user.id).includes(user_id);
                    if(isCardMember) {
                        const { 
                            read, create, modify, remove, is_blocked, role_names, ACL
                        } = await strapi.service('api::card.card').clac_card_auth(card, user_id);
    
                        let fields_permission = strapi.service('api::project.project').clac_authed_fields(ACL,'card_schedule');
    
                        const authInfo = {
                            read, create, modify, remove, is_blocked, role_names, fields_permission
                        }
    
                        return authInfo
                    } else {
                        const belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(card.id);
                        if(belongedInfo?.belonged_project){
                            const belonged_project_id = belongedInfo?.belonged_project.id;
                            await clac_auth_by_project(belonged_project_id)
                        }
                    }

                }
            }
            if(schedule.by_project){
                const project_id = schedule.by_project.id;
                let res = await clac_auth_by_project(project_id);
                if(res) {
                    return res
                }
            }
            if(schedule.by_card){
                const card_id = schedule.by_card.id;
                let res = await clac_auth_by_card(card_id);
                if(res) {
                    return res
                }
            }
            if(schedule.by_user){
                by_user_id = schedule.by_user.id;
                const authInfo = {
                    user_id: by_user_id
                }
                return authInfo
            }
        } else {
            const ctx = strapi.requestContext.get();
            ctx.throw(404, '未找到所属的规划')
        }
    },
    response_template() {
        const _ = {
            fields: ['id','type','name'],
            populate: {
                can_read_user: {
                    fields: ['id','username']
                },
                can_write_user: {
                    fields: ['id','username']
                },
                schedule_events: {
                    creator: {
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
                    executor: {
                        fields: ['id','color_marker','description','nickname','position','is_blocked','private_email'],
                        populate: {
                            by_user: {
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
                            }
                        }
                    }
                },
                share_codes: {
                    populate: {
                        creator: {
                            fields: ['id','username'],
                        }
                    }
                }
            }
        }
        return _
    }
}));
