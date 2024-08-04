'use strict';

/**
 * kanban service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::kanban.kanban',({strapi}) => ({
    async find_belongedInfo_byKanbanID(...args){
        const [kanban_id] = args;

        let belonged_card;
        let project;
        const find_belongedInfo_byKanbanID_fn = async (id) => {
            let kanban = await strapi.entityService.findOne('api::kanban.kanban',id,{
                populate: {
                    group: {
                        populate: {
                            board: {
                                populate: {
                                    project: {
                                        fields: ['id']
                                    }
                                }
                            }
                        }
                    },
                    relate_by_card: {
                        populate: {
                            column: {
                                populate: {
                                    kanban: {
                                        fields: ['id']
                                    }
                                }
                            }
                        }
                    },
                    by_team: {
                        fields: ['id']
                    }
                }
            });

            if(kanban?.relate_by_card) {
                if(!belonged_card){
                    const card_id = kanban?.relate_by_card.id
                    belonged_card = await strapi.service('api::card.card').find_cardByID(card_id);
                }
                const _id = kanban?.relate_by_card?.column?.kanban?.id
                await find_belongedInfo_byKanbanID_fn(_id);
            }

            if(kanban?.group?.board?.project){
                const project_id = kanban.group?.board?.project?.id;
                project = await strapi.service('api::project.project').find_projectByID(project_id);
            }
        }
        await find_belongedInfo_byKanbanID_fn(kanban_id);
        if(project){
            let belongedInfo = {
                belonged_project: undefined,
                belonged_card: undefined
            }
            belongedInfo.belonged_project = project;
            if(belonged_card){
                belongedInfo.belonged_card = belonged_card
            }
            return belongedInfo
        }
    },
    process_updateKanban_params(...args){
        const [data,fields_permission,props] = args;
        const orderColumn = props.orderColumn;
        const ctx = strapi.requestContext.get();
        let params = {};

        if(data?.title && fields_permission.includes('title')) {
            params.title = data.title
        } else if(data?.title && !fields_permission.includes('title')) {
            ctx.throw(402, '您无权修改看板名称');
        }
        if(data?.description && fields_permission.includes('description')) {
            params.description = data.description
        } else if(data?.description && !fields_permission.includes('description')) {
            ctx.throw(402, '您无权修改看板摘要');
        }
        if(data?.type && fields_permission.includes('type')) {
            params.type = data.type
        } else if(data?.type && !fields_permission.includes('type')) {
            ctx.throw(402, '您无权修改看板类型');
        }
        if(data?.icon && fields_permission.includes('icon')) {
            params.icon = data.icon
        } else if(data?.icon && !fields_permission.includes('icon')) {
            ctx.throw(402, '您无权修改看板图标');
        }
        if(data?.status && fields_permission.includes('status')) {
            params.status = data.status
        } else if(data?.status && !fields_permission.includes('status')) {
            ctx.throw(402, '您无权修改看板状态');
        }
        if(data?.columns && orderColumn) {
            params.columns = data.columns
        } else if(data?.columns && !fields_permission.includes('order')) {
            ctx.throw(402, '您无权对分栏进行排序');
        }

        return params
    },
    async get_kanbanSourceData_byID(...args){
        const[ kanban_id ] = args;
        const kanban = await strapi.entityService.findOne('api::kanban.kanban',kanban_id,{
            populate: {
                columns: {
                    populate: {
                        cards: {
                            populate: {
                                followed_bies: {
                                    fields: ['id','username'],
                                    populate: {
                                        profile: {
                                            fields: ['title'],
                                            populate: {
                                                avatar: {
                                                    fields: ['ext','url']
                                                }
                                            }
                                        }
                                    }
                                },
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
                                        },
                                        members: {
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
                                        }
                                        }
                                    }
                                },
                                creator: {
                                    fields: ['id']
                                },
                                overviews: {
                                    populate: {
                                        media: {
                                            fields: ['ext','url']
                                        }
                                    }
                                },
                                storage: {
                                    populate: {
                                        files: {
                                            fields: ['id','name','ext','url']
                                        },
                                        sub_folders: true,
                                        creator: {
                                            fields: ['id','username'],
                                            populate: {
                                                profile: {
                                                    fields: ['title'],
                                                    populate: {
                                                        avatar: {
                                                            fields: ['ext','url']
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        can_read_user: {
                                            fields: ['id']
                                        },
                                        can_write_user: {
                                            fields: ['id']
                                        },
                                    }
                                },
                                todogroups: {
                                    populate: {
                                        todos: {
                                            populate: {
                                                attachment: true
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
                        },
                        executor: {
                            fields: ['id','mm_profile'],
                            populate: {
                                profile: {
                                    populate: {
                                        avatar: {
                                            fields: ['ext','url']
                                        },
                                        brand: {
                                            fields: ['ext','url']
                                        },
                                        cover: {
                                            fields: ['ext','url']
                                        },
                                    }
                                },
                                user_channel: {
                                    fields: ['id']
                                }
                            }
                        },
                        creator: {
                            fields: ['id']
                        }
                    }
                }
            }
        })
        if(kanban){
            return kanban
        }
    },
    async process_KanbanSourceData_byAuth(...args) {
        const [ kanban, user_id, ACL, isSuper_member, belongedInfo ] = args;
        // 私有卡片 - 管理组和卡片关联用户可见
        if(!isSuper_member) {
            kanban.columns = kanban.columns.map(c => ({
                ...c,
                cards: c.executor?.id === user_id && (c.cards?.length > 0 && c.cards || [])
                    || c.cards?.length > 0 && c.cards.filter(
                        card => !card.private
                        || card.card_members.map(member => member.by_user.id === user_id))
                    || []
            }))
        }

        const { read:read_column_role, create:create_column_role, modify:modify_column_role, remove:remove_column_role } = strapi.service('api::project.project').calc_collection_auth(ACL,'column');
        const { read:read_card_role, create:create_card_role, modify:modify_card_role, remove:remove_card_role } = strapi.service('api::project.project').calc_collection_auth(ACL,'card');
        const { read:read_card_todogroup_role, create:create_card_todogroup_role, modify:modify_card_todogroup_role, remove:remove_card_todogroup_role } = strapi.service('api::project.project').calc_collection_auth(ACL,'card_todogroups');
        const { read:read_card_todo_role, create:create_card_todo_role, modify:modify_card_todo_role, remove:remove_card_todo_role } = strapi.service('api::project.project').calc_collection_auth(ACL,'card_todo');

        if(!read_column_role) {
            kanban.columns = kanban.columns.filter(i => i.creator.id === user_id)
        }
        if(!read_card_role) {
            kanban.columns = kanban.columns.map(c => ({
                ...c,
                cards: c.cards.filter(i => i.creator.id === user_id || i.card_members?.filter(m => m.by_user.id === user_id)?.length > 0)
            }))
        }
        if(!read_card_todogroup_role) {
            kanban.columns = kanban.columns.map(k => ({
                ...k,
                cards: k.cards.map(c => ({
                    ...c,
                    todogroups: c.todogroups.filter(i => i.creator.id === user_id)
                }))
            }))
        }
        if(!read_card_todo_role) {
            kanban.columns = kanban.columns.map(k => ({
                ...k,
                cards: k.cards.map(c => ({
                    ...c,
                    todogroups: c.todogroups.map(g => ({
                        ...g,
                        todos: g.todos.filter(i => i.creator.id === user_id)
                    }))
                }))
            }))
        }

        kanban.columns = kanban.columns.map(column => ({
            ...column,
            cards: column.cards?.length > 0 ? column.cards.map(card => {
                if (card.share_codes?.length > 0) {
                    card.share_codes = card.share_codes.filter(code => code.creator.id === user_id);
                }
                return card;
            }) : []
        }))
        if(belongedInfo.belonged_project.by_team){
            // console.log('belongedInfo.belonged_project.by_team', belongedInfo.belonged_project.by_team)
            const canShow = (members, roles) => {
                const membersInCard = members.filter(i => i.by_user.id === user_id && i.subject !== 'unconfirmed' && i.subject !== 'blocked')
                // console.log('membersInCard', membersInCard)
                if(!members || !membersInCard?.map(i => i.by_user.id)?.includes(user_id)){
                    return false
                }
                const rolesByFilters = membersInCard.map(i => i.member_roles?.map(j => j.id))?.flat(2);
                const rolesIds = roles.map(j => j.id);
                function hasIntersection(arr1, arr2) {
                  const set1 = new Set(arr1);
                  for (const num of arr2) {
                    if (set1.has(num)) {
                      return true; // 找到交集，返回true
                    }
                  }
                  return false; // 没有找到交集，返回false
                }

                return hasIntersection(rolesByFilters, rolesIds)
            }
            const _by_team_id = belongedInfo.belonged_project.by_team.id;
            const team = await strapi.entityService.findOne('api::team.team', _by_team_id);
            // console.log('team', team)
            if(team){
                const team_mode = team.config?.mode || 'toMany';

                if(team_mode === 'toOne'){
                    kanban.columns = kanban.columns.map(column => ({
                        ...column,
                        cards: column.cards?.length > 0 ? column.cards.filter(card => canShow(card.card_members, card.member_roles)) : []
                    }))
                }
            }
        }

        return kanban
    },
    async remove_kanban_rf(...args){
        // todo 需要根据看板及其子元素的 readonly protected 状态来完善递归删除逻辑
        const [ kanban_id ] = args;
        const deleteKanban = await strapi.entityService.delete('api::kanban.kanban',kanban_id);
        if(deleteKanban){
            return deleteKanban
        }
    }
}))
