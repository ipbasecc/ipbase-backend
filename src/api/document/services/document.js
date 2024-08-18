'use strict';

/**
 * document service
 */

const { createCoreService } = require('@strapi/strapi').factories;


module.exports = createCoreService('api::document.document',({strapi}) => ({
    async find_belongedInfo_byDocumentID(...args){
        const [ document_id ] = args;
        const document = await strapi.entityService.findOne('api::document.document',document_id,{
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
                creator: {
                    fields: ['id', 'mm_profile']
                }
            }
        })
        if(document){
            // console.log('document service document', document)
            let belongedInfo = {};
            if(document.by_user?.id){
                belongedInfo.user_id = document.by_user.id
            }
            if(document.by_project?.id){
                const project_id = document.by_project.id;
                const project = await strapi.service('api::project.project').find_projectByID(project_id)
                if(project){
                    belongedInfo.project = project
                }
            }
            if(document.by_card?.id){
                const card_id = document.by_card.id;
                const card = await strapi.service('api::card.card').find_cardByID(card_id)
                if(card){
                    belongedInfo.card = card
                    const card_belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(card.id);
                    if(card_belongedInfo){
                        belongedInfo.root_project = card_belongedInfo.belonged_project
                    }
                }
            }
            return belongedInfo
        }
    },
    process_updateDocument_params(...args){
        const ctx = strapi.requestContext.get();
        const [ data, fields_permission, props ] = args;
        let params = {};
        if(data.title) {
            if(data.title && fields_permission.includes('title')) {
                params.title = data.title
            } else {
                ctx.throw(401,'您无权修改该文档标题')
            }
        }
        if(data.jsonContent) {
            if(data.jsonContent && fields_permission.includes('jsonContent')) {
                params.jsonContent = data.jsonContent
            } else {
                ctx.throw(401,'您无权修改该文档内容')
            }
        }

        return params
    },
    async calc_collection_auth(...args){
        const ctx = strapi.requestContext.get();
        const [document_id,user_id] = args
        // console.log('document service document_id,user_id', document_id,user_id)
        let auth;
        let fields_permission = []
        const cala_auth = ( members, member_roles, props) => {
            const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
            if(is_blocked){
                ctx.throw(401, '您已被管理员屏蔽，请联系管理员申诉')
            }
            let authed_fields
            if(props === 'root_project'){
                const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'card_document');
                authed_fields = strapi.service('api::project.project').clac_authed_fields(ACL,'card_document');
                auth = {
                    read: read,
                    create: create,
                    modify: modify,
                    remove: remove
                }
            } else {
                const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'document');
                authed_fields = strapi.service('api::project.project').clac_authed_fields(ACL,'document');
                auth = {
                    read: read,
                    create: create,
                    modify: modify,
                    remove: remove
                }
            }

            fields_permission = [...fields_permission, ...authed_fields];
            const res = {
                auth: auth,
                fields_permission: fields_permission
            }
            return res

        }
        let members;
        const belongedInfo = await strapi.service('api::document.document').find_belongedInfo_byDocumentID(document_id);
        if(belongedInfo){
            // console.log('document service belongedInfo', belongedInfo)
            if(belongedInfo.user_id === user_id){
                auth = {
                    read: true,
                    create: true,
                    modify: true,
                    remove: true,
                    isSelf: true
                }
            }
            if(belongedInfo.project){
                const project_id = belongedInfo.project.id
                const project = await strapi.service('api::project.project').find_projectByID(project_id);
                if(project){
                    members = project.project_members;
                    const member_roles = project.member_roles;
                    if(members.filter(i => i.by_user.id === user_id).map(j => j.by_user.id).includes(user_id)){
                        const res = cala_auth(members,member_roles,'project')
                        if(res){
                            auth = res.auth;
                            fields_permission = res.fields_permission
                        }
                        
                    }
                }
            }
            if(belongedInfo.card){
                const card_id = belongedInfo.card.id
                const card = await strapi.service('api::card.card').find_cardByID(card_id);
                if(card){
                    // console.log('document service card', card)
                    members = card.card_members;
                    const member_roles = card.member_roles;
                    const isInCard = members.filter(i => i.by_user.id === user_id).map(j => j.by_user.id).includes(user_id);
                    // console.log('document service isInCard', isInCard)
                    if(members.filter(i => i.by_user.id === user_id).map(j => j.by_user.id).includes(user_id)){
                        const res = await cala_auth(members,member_roles,'card')
                        if(res){
                            auth = res.auth;
                            fields_permission = res.fields_permission
                        }
                    } else {
                        if(belongedInfo.root_project){
                            const project_id = belongedInfo.root_project.id
                            const project = await strapi.service('api::project.project').find_projectByID(project_id);
                            if(project){
                                members = project.project_members;
                                const member_roles = project.member_roles;
                                const isInProject = members.filter(i => i.by_user.id === user_id).map(j => j.by_user.id).includes(user_id);
                                // console.log('document service isInProject', isInProject)
                                if(members.filter(i => i.by_user.id === user_id).map(j => j.by_user.id).includes(user_id)){
                                    const res = await cala_auth(members,member_roles,'root_project')
                                    if(res){
                                        auth = res.auth;
                                        fields_permission = res.fields_permission
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        if(auth){
            return { auth, fields_permission }
        }
        
        
    },
    async find_document_byID(...args) {
        const [document_id] = args;
        const document = await strapi.entityService.findOne('api::document.document',document_id,{
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
                creator: {
                    fields: ['id']
                }
            }
        })
        return document
    },
    async find_authInfo(...args){
        const [document_id, user_id] = args;
        
        let by_user_id;
        let authInfo = {};
        const document = await strapi.service('api::document.document').find_document_byID(document_id);
        if(document){
            if(document.creator?.id === user_id){
                authInfo.isCreator = true
            }
            const clac_auth_by_project = async (project_id,_collection) => {
                let collection = !_collection ? 'document' : _collection
                const project = await strapi.service('api::project.project').find_projectByID(project_id);
                if(project){
                    const { 
                        read, create, modify, remove, is_blocked, role_names, ACL
                    } = await strapi.service('api::project.project').clac_project_auth(project, user_id);

                    let fields_permission = strapi.service('api::project.project').clac_authed_fields(ACL,collection);

                    authInfo = {
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
                        // console.log('ACL service',ACL);
    
                        let fields_permission = strapi.service('api::project.project').clac_authed_fields(ACL,'document');
    
                        authInfo = {
                            read, create, modify, remove, is_blocked, role_names, fields_permission
                        }
    
                        return authInfo
                    } else {
                        const belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(card.id);
                        if(belongedInfo?.belonged_project){
                            const belonged_project_id = belongedInfo?.belonged_project.id;
                            await clac_auth_by_project(belonged_project_id,'card_document')
                        }
                    }

                }
            }
            if(document.by_project){
                const project_id = document.by_project.id;
                let res = await clac_auth_by_project(project_id);
                if(res) {
                    return res
                }
            }
            if(document.by_card){
                const card_id = document.by_card.id;
                let res = await clac_auth_by_card(card_id);
                if(res) {
                    return res
                }
            }
            if(document.by_user){
                by_user_id = document.by_user.id;
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
}));
