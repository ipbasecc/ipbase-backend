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
                    fields: ['id','ext','url','size']
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
        
        let permission
        const setAuth = (roles) => {
            const ACLs = roles?.map(i => i.ACL.find(j => j.collection === 'overview')).flat(2);
            return {
                read: ACLs?.filter(i => i.read)?.length > 0,
                create: ACLs?.filter(i => i.create)?.length > 0,
                modify: ACLs?.filter(i => i.modify)?.length > 0,
                remove: ACLs?.filter(i => i.delete)?.length > 0,
                fields_permission: [...new Set(ACLs?.map(i => i.fields_permission)?.flat(2)?.filter(j => j.modify)?.map(k => k.field))]
            }
        }
        if(overview.project){
            const project_id = overview.project.id;
            const roles = await strapi.db.query('api::member-role.member-role').findMany({
                where: {
                    by_project: project_id,
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
            });
            permission = setAuth(roles)
        }
        if(overview.card){
            const card_id = overview.card.id;
            const roles = await strapi.db.query('api::member-role.member-role').findMany({
                where: {
                    by_card: card_id,
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
            });
            permission = setAuth(roles)
        }
        return permission
    },
    /**
        @args card_id ||  overview || project_id
        会一并删除OSS文件
    */
    async remove_overview(args){
        const {card_id, overview, project_id} = args;
        
        const removeOverview = async (overview) => {
            if(overview.media) {
                process.nextTick(async () => {
                    try {
                        if(overview.media?.url){
                            const ali_params = {
                              url: overview.media?.url,
                              urls: null,
                        }
                        await strapi.service('api::ali.ali').removeObject(ali_params)
                        }
                    } catch (error) {
                      console.error('After update processing error:', error);
                    }
                });
            }
            await strapi.entityService.delete('api::overview.overview', overview.id);
        }
        
        if(overview){
            await removeOverview(overview)
        }
        
        if(card_id){
            const overviews = await strapi.db.query('api::overview.overview').findMany({
                where: {
                    card: card_id,
                },
                populate: {
                    media: {
                        fields: ['id', 'url', 'size']
                    }
                }
            });
            if(overviews?.length > 0){
                for(const overview in overviews){
                    await removeOverview(overview)
                }
            }
        }
        
        if(project_id){
            const overviews = await strapi.db.query('api::overview.overview').findMany({
                where: {
                    project: project_id,
                },
                populate: {
                    media: {
                        fields: ['id', 'url', 'size']
                    }
                }
            });
            if(overviews?.length > 0){
                for(const overview in overviews){
                    await removeOverview(overview)
                }
            }
        }
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
