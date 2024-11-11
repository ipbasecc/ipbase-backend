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
        let kanban_type
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
            kanban_type = kanban.type
            
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
            belongedInfo.kanban_type = kanban_type
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
    column_populate(kanban_type){
        if(kanban_type === 'classroom'){
            return {
                cards: {
                    populate: {
                        overviews: {
                            populate: {
                                media: {
                                    fields: ['id', 'ext','url']
                                }
                            }
                        },
                        storage: {
                            populate: {
                                files: {
                                    fields: ['id','name','ext','url']
                                },
                                sub_folders: true,
                            }
                        },
                        cover: {
                            fields: ['id', 'ext', 'url']
                        },
                        creator: {
                            fields: ['id', 'username'],
                            populate: {
                                profile: {
                                    populate: {
                                        avatar: {
                                            fields: ['id', 'ext', 'url']
                                        }
                                    }
                                }
                            }
                        },
                    }
                }
            }
        }
        return {
            cards: {
                populate: {
                    cover: {
                        fields: ['id', 'ext', 'url']
                    },
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
                                fields: ['id', 'ext','url']
                            }
                        },
                        marker_todos: {
                            populate: {
                                attachment: {
                                    fields: ['id', 'ext','url']
                                }
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
                                                fields: ['id', 'ext','url']
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
    },
    async get_kanbanSourceData_byID(...args){
        const[ kanban_id, kanban_type, user_id ] = args;
        let column_populate = strapi.service('api::kanban.kanban').column_populate(kanban_type);
        let kanban = await strapi.entityService.findOne('api::kanban.kanban',kanban_id,{
            populate: {
                columns: {
                    populate: column_populate
                }
            }
        })
        // console.log('kanban :', kanban.columns?.map(i => i.cards).flat(2)?.length)
        if(kanban){
            async function sync_mps(_kanban) {
                _kanban.columns = await Promise.all(_kanban.columns.map(async (column) => {
                  const updatedCards = await Promise.all(column.cards.map(async (card) => {
                    const updatedOverviews = card.overviews?.length > 0
                      ? await strapi.service('api::card.card').sync_mpsInfo(card.overviews)
                      : card.overviews;
                    return {
                      ...card,
                      overviews: updatedOverviews
                    };
                  }));
                  return {
                    ...column,
                    cards: updatedCards
                  };
                }));
                return _kanban;
            }
            kanban = await sync_mps(kanban)
            let authMap = [];
            let paiedMap = [];
            const validate = async (card) => {
                let auth = false
                if(!card.price || card.price <= 0 && card.published && !card.pulled) {
                    auth = true
                } // 免费的 且 已发布
                // console.log('validate 1', card.id, auth)
                if(!auth){
                    const isCreator = async () => {
                        if(card.creator?.id === user_id) {
                            auth = true
                        } else {
                            const creator = await strapi.db.query('api::member-role.member-role').findOne({
                                where: {
                                    members: {
                                        by_user: user_id
                                    },
                                    by_card: card.id,
                                    subject: 'creator'
                                }
                            })
                            auth = !!creator
                        }
                    }
                    await isCreator();
                    // console.log('validate 2', card.id, auth)
                }
                if(!auth){
                    // 购买过或者是card的创建者
                    const order = await strapi.db.query('api::order.order').findOne({
                        where: {
                            card: card.id, // 确保关联的card是给定的card.id
                            buyer: user_id,
                            orderState: 2
                        },
                        populate: {
                            buyer: {
                                fields: ['id']
                            },
                            card: {
                                fields: ['id']
                            }
                        }
                    });
                    if(order?.buyer?.id === user_id && order?.card?.id){
                        paiedMap.push(order.card?.id)
                    }
                    auth = !!order
                }
                // console.log('validate 3', card.id, auth)
                // console.log(order)
                return auth
            }
            const process_payment = async (_kanban) => {
                _kanban.columns = await Promise.all(_kanban.columns.map(async (column) => {
                  const updatedCards = await Promise.all(column.cards.map(async (card) => {
                    const auth = await validate(card);
                    // 验证不通过的，删除详情数据
                    // console.log('auth', auth)
                    if(!auth){
                        delete card.overviews
                        delete card.storage
                    }
                    authMap.push({
                        id: card.id,
                        detailAuth: auth
                    });
                    return card
                  }));
                //   console.log(authMap)
                  function filterCards(cards) {
                      const filteredCards = [];
                      for (const card of cards) {
                        // (没有下架 || 已经购买) && ( 已发布 || 经过验证可以被查看内容的：是作者 / 买过 )
                        const hasDetialAuthMap = authMap.filter(i => i.detailAuth)?.map(j => j.id)
                        const canShow = (_card) => {
                            return hasDetialAuthMap.includes(_card.id)
                        }
                        // console.log('canShow',card.id, canShow(card))
                        if (canShow(card)) {
                          filteredCards.push(card);
                        }
                      }
                      return filteredCards;
                    }
                    
                //   const filteredCards = updatedCards;
                  const filteredCards = await filterCards(updatedCards);
                  return {
                    ...column,
                    cards: filteredCards
                  };
                }));
                return _kanban;
            }
            if(kanban_type === 'classroom'){
                kanban = process_payment(kanban)
            }
            return kanban
        }
    },
    async process_KanbanSourceData_byAuth(...args) {
        const ctx = strapi.requestContext.get();
        const [ kanban, user_id, ACL, isSuper_member, belongedInfo ] = args;
        
        const canShow = async (card) => {
            const user_roles_inCard = await strapi.db.query('api::member-role.member-role').findMany({
              where: {
                by_card: card.id,
                by_user: user_id,
                subject: {
                  $not: {
                    $in: ['unconfirmed', 'blocked']
                  }
                }
              }
            });
            return user_roles_inCard && user_roles_inCard.length > 0
        }
        let team_mode
        if(ctx.default_team){
            team_mode = ctx.default_team.config.mode || 'toMany';
        }
        // 私有卡片 - 管理组和卡片关联用户可见
        if (!isSuper_member) {
            kanban.columns = kanban.columns.map(c => {
                // 确保c.cards是一个数组
                const cardsArray = Array.isArray(c.cards) ? c.cards : [];
                return {
                    ...c,
                    cards: cardsArray.length > 0 ? cardsArray.filter(card => {
                        // 卡片不是私有的，并且团队模式是toMany
                        if (!card.private && team_mode === 'toMany') {
                            return true;
                        } else {
                            // 用户是卡片的成员之一，并且canShow函数返回true
                            if (canShow(card)) {
                                return true;
                            }
                        }
                        return false;
                    }) : []
                }
            });
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
