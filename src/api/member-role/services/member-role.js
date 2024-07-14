'use strict';

/**
 * member-role service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::member-role.member-role',({strapi}) => ({
    async find_memberRole_byID(...args) {
        const [memberRole_id] = args;
        const memberRole = await strapi.entityService.findOne('api::member-role.member-role',memberRole_id,{
            populate: {
                by_board: {
                    fields: ['id']
                },
                by_project: {
                    fields: ['id']
                },
                by_card: {
                    fields: ['id']
                }
            }
        })
        return memberRole
    },
    async find_authInfo(...args){
        const [memberRole_id,user_id] = args;
        // console.log('authInfo service',memberRole_id,user_id);
        // let by_board;
        const memberRole = await strapi.service('api::member-role.member-role').find_memberRole_byID(memberRole_id);
        if(memberRole){
            const clac_auth_by_project = async (project_id) => {
                const project = await strapi.service('api::project.project').find_projectByID(project_id);
                if(project){
                    const { 
                        read, create, modify, remove, is_blocked, role_names, ACL
                    } = await strapi.service('api::project.project').clac_project_auth(project, user_id);

                    let fields_permission = strapi.service('api::project.project').clac_authed_fields(ACL,'project');

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
    
                        let fields_permission = strapi.service('api::project.project').clac_authed_fields(ACL,'card');
    
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
            if(memberRole.by_project){
                const project_id = memberRole.by_project.id;
                let res = await clac_auth_by_project(project_id);
                if(res) {
                    return res
                }
            }
            if(memberRole.by_card){
                const card_id = memberRole.by_card.id;
                let res = await clac_auth_by_card(card_id);
                if(res) {
                    return res
                }
            }
            if(memberRole.by_board){
                // 下个版本处理board
            }
        } else {
            const ctx = strapi.requestContext.get();
            ctx.throw(404, '未找到所属的规划')
        }
    }
}));
