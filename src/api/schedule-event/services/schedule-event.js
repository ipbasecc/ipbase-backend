'use strict';

/**
 * schedule-event service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::schedule-event.schedule-event',({strapi}) => ({
    async find_authInfo(...args){
        const [schedule_id,user_id] = args;
        // console.log('authInfo service',schedule_id,user_id);
        let by_user_id;
        const schedule = await strapi.service('api::schedule.schedule').find_schedula_byID(schedule_id);
        if(schedule){
            // console.log('schedule service',schedule);
            const clac_auth_by_project = async (project_id) => {
                const project = await strapi.service('api::project.project').find_projectByID(project_id);
                if(project){
                    
                    const { 
                        read, create, modify, remove, is_blocked, role_names, ACL
                    } = await strapi.service('api::project.project').clac_project_auth(project, user_id);

                    let fields_permission = strapi.service('api::project.project').clac_authed_fields(ACL,'schedule_event');

                    const authInfo = {
                        read, create, modify, remove, is_blocked, role_names, fields_permission
                    }
                    // console.log('authInfo service',authInfo);

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
    
                        let fields_permission = strapi.service('api::project.project').clac_authed_fields(ACL,'card_schedule_event');
    
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
    }
}));
