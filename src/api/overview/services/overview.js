'use strict';

/**
 * overview service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::overview.overview',({strapi}) => ({
    async find_overview_byID(...args){
        const [ id ] = args;
        const overview = await strapi.entityService.findOne('api::overview.overview', id, {
            populate: {
                media: {
                    fields: ['id','ext','url']
                },
                project: {
                    populate: {
                        project_members: {
                            populate: {
                                by_user: {
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
                                member_roles: {
                                    fields: ['id','subject']
                                }
                            }
                        },
                        member_roles: {
                            populate: {
                                ACL: {
                                    populate: {
                                        fields_permission: true
                                    }
                                }
                            }
                        }
                    }
                },
                card: {
                    populate: {
                        card_members: {
                            populate: {
                                by_user: {
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
                                member_roles: {
                                    fields: ['id','subject']
                                }
                            }
                        },
                        member_roles: {
                            populate: {
                                ACL: {
                                    populate: {
                                        fields_permission: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if(overview){
            return overview
        }
    },
    async calc_overview_auth(...args){
        const ctx = strapi.requestContext.get();
        const [ overview, user_id ] = args;

        let members;
        let member_roles;
        const calc_auth = (members,member_roles) => {
            // console.log('members',members,member_roles);
            const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
            
            if(is_blocked){
                ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
            }

            const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'overview');
            const fields_permission = strapi.service('api::project.project').clac_authed_fields(ACL,'overview');
            // console.log('A',read, create, modify, remove);
            return { read, create, modify, remove, fields_permission }
        }
        if(overview.project?.project_members){
            members = overview.project?.project_members
            member_roles = overview.project?.member_roles;
        }
        if(overview.card?.card_members){
            members = overview.card?.card_members
            member_roles = overview.card?.member_roles;
        }
        const { read, create, modify, remove, fields_permission } = calc_auth(members,member_roles);
        // console.log('B',read, create, modify, remove);
        const calc_info = { read:read, create:create, modify:modify, remove:remove, fields_permission:fields_permission }
        return calc_info
    },
    process_updateOverview_params(...args){
        const [ data, fields_permission ] = args;
        
        const ctx = strapi.requestContext.get();
        let params = {};
        if(data.name && fields_permission.includes('name')) {
            params.name = data.name
        } else if(data.name && !fields_permission.includes('name')) {
            ctx.throw(402, '您无权修改概览名称');
        }
        if(data.description && fields_permission.includes('description')) {
            params.description = data.description
        } else if(data.description && !fields_permission.includes('description')) {
            ctx.throw(402, '您无权修改概览摘要');
        }
        if(data.media && fields_permission.includes('media')) {
            params.media = data.media
        } else if(data.media === null && fields_permission.includes('media')) {
            params.media = null
        } else if(!fields_permission.includes('media')) {
            ctx.throw(402, '您无权修改概览预览');
        }
        if(data.start && fields_permission.includes('start')) {
            params.start = data.start
        } else if(data.start && !fields_permission.includes('start')) {
            ctx.throw(402, '您无权修改开始日期');
        }
        if(data.end && fields_permission.includes('end')) {
            params.end = data.end
        } else if(data.end && !fields_permission.includes('end')) {
            ctx.throw(402, '您无权修改结束日期');
        }
        if(data.deadline && fields_permission.includes('deadline')) {
            params.deadline = data.deadline
        } else if(data.deadline && !fields_permission.includes('deadline')) {
            ctx.throw(402, '您无权修改交付时间');
        }
        if(data.jsonContent && fields_permission.includes('jsonContent')) {
            params.jsonContent = data.jsonContent
        } else if(data.jsonContent && !fields_permission.includes('jsonContent')) {
            ctx.throw(402, '您无权修改概览详情内容');
        }
        if(data.marker_todos && fields_permission.includes('marker_todos')) {
            params.marker_todos = data.marker_todos
        } else if(data.marker_todos && !fields_permission.includes('marker_todos')) {
            ctx.throw(402, '您无权修改标记内容');
        }
        // console.log( 'service',data,params)

        return params
    }
}));
