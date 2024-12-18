// @ts-nocheck
'use strict';

/**
 * card service
 */
const sale_types = ['classroom', 'resource']
const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::card.card', ({ strapi }) => ({
    async initRole(...args) {
      const [user_id,member_byCurUser,card_type,is_sale] = args;
      const { roleBase } = require('./roleBase.js');

      try {
        let role_base = roleBase();
        if(is_sale){
            role_base = role_base.filter(i => i.role === 'creator')
        }

        // console.log('role_base ready', role_base);
        const roleBaseResults = await Promise.allSettled(role_base?.map(async (i) => {
          const res = await strapi.entityService.create('api::member-role.member-role', {
            data: {
              subject: i.role,
              ACL: i.ACL,
            }
          });
          return res;
        }));
        
        // console.log('roleBaseResults ready');
        const successfulResults = roleBaseResults.filter((result) => result.status === 'fulfilled')?.map(i => i.value);
        const role_creator = successfulResults.find((result) => result.subject === 'creator');

        // console.log('role_creator',role_creator);
        if (role_creator) {
          const creator = await strapi.entityService.update('api::member-role.member-role', role_creator.id,{
            data: {
                members: member_byCurUser.id
            }
          });
        //   console.log(creator);
          if (creator) {
            const data = { roles: successfulResults };
            return data;
          }
        }

        // throw new Error('Initialization failed.');
      } catch (error) {
        console.error('Error during initialization:', error);
        throw error;
      }
    },
    async find_belongedInfo_byCardID(...args){
        const [card_id] = args;

        let belongedInfo = {
            belonged_project: undefined,
            belonged_card: undefined,
            belonged_column: undefined,
        }

        const find_belongedInfo_byCardID_fn = async (id) => {
            let card = await strapi.entityService.findOne('api::card.card',id,{
                populate: {
                    column: {
                        populate: {
                            kanban: {
                                populate: {
                                    group: {
                                        populate: {
                                            board: {
                                                populate: {
                                                    project: true
                                                }
                                            }
                                        }
                                    },
                                    relate_by_card: {
                                        populate: {
                                            column: {
                                                populate: {
                                                    kanban: true
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            cards: {
                                fields: ['id']
                            }
                        }
                    },
                    share_codes: {
                        populate: {
                            creator: {
                                fields: ['id','username'],
                            }
                        }
                    },
                }
            });
            // console.log('belongedInfo card',card);
            if(card?.column && !belongedInfo.belonged_column){
                belongedInfo.belonged_column = card?.column
            }

            if(card?.column?.kanban?.group?.board?.project){
                const project_id = card?.column?.kanban.group?.board?.project?.id;
                const res = await strapi.service('api::project.project').find_projectByID(project_id);
                if(res){
                    belongedInfo.belonged_project = res;
                    return
                }
            } else if(card?.column?.kanban?.relate_by_card) {
                // console.log('belongedInfo card',card);
                if(!belongedInfo.belonged_card){
                    const card_id = card.column.kanban.relate_by_card.id
                    belongedInfo.belonged_card = await strapi.service('api::card.card').find_cardByID(card_id);
                }
                const _card_id = card.column.kanban.relate_by_card.id
                await find_belongedInfo_byCardID_fn(_card_id)
            }
        }
        await find_belongedInfo_byCardID_fn(card_id);
        // console.log('belongedInfo project',belongedInfo);
        return belongedInfo
    },
    async isSubCard (...args) {
        const [card_id] = args;
        const card = await strapi.entityService.findOne('api::card.card', card_id, {
            populate: {
                column: {
                    populate: {
                        kanban: {
                            populate: {
                                card: {
                                    fields: ['id']
                                }
                            }
                        }
                    }
                }
            }
        })
        return !!card?.column?.kanban?.card
    },
    async sync_mpsInfo(...args) {
      const [overviews] = args;
      const updatedOverviews = await Promise.all(overviews.map(async (overview) => {
        if (!overview.mps_info && overview.media?.url && overview.media?.ext) {
          const url = await strapi.service('api::ali.ali').processUrl(overview.media?.url, overview.media?.ext);
        //   console.log('mps_info url', url)
          if(!url){
              return overview
          }
          if(overview.mps_info){
              return overview
          }
          const mps_info = await strapi.service('api::ali.ali').queryMedias(url);
          if (mps_info) {
            const update = await strapi.entityService.update('api::overview.overview', overview.id, {
              data: {
                mps_info: mps_info
              }
            });
            if(update){
                overview.mps_info = update.mps_info
            }
          }
        }
        return overview;
      }));

      return updatedOverviews;
    },
    async find_cardByID(...args) {
        const ctx = strapi.requestContext.get();
        const [card_id, props] = args;
        
        // 不同类型的卡片，需要查询的关联内容不同
        // 先查询一次基础内容
        // 再根据类型确定是否要再次查询，之后返回数据
        // 所有类型都要返回的关联内容
        let populate = {
            cover: {
                select: ['id', 'ext', 'url']
            },
            overviews: {
                populate: {
                    media: {
                        select: ['id', 'ext','url']
                    }
                }
            },
            creator: {
                select: ['id','username'],
                populate: {
                    profile: {
                        populate: {
                            avatar: {
                                select: ['id', 'ext', 'url']
                            }
                        }
                    }
                }
            }
        }
        let select = ['id', 'name', 'type', 'default_version', 'color_marker', 'price', 'description', 'jsonContent', 'createdAt', 'allow_discover', 'resource_type', 'auth_type', 'auth_extened', 'price_by_auth', 'published', 'pulled' ]
        const findCard = async () => {
            return await strapi.db.query('api::card.card').findOne({
                where: {
                    id: card_id
                },
                select: select,
                populate: populate
            })
        }
        let card = await findCard();
        if(!card){
            ctx.throw(404, '没有找到对应内容')
        }
        // 如果是课程，添加关联
        if(card.type === 'classroom'){
            populate = {
                ...populate,
                storage: {
                    populate: {
                        files: {
                            select: ['id','name','ext','url']
                        },
                        sub_folders: true
                    }
                },
                card_documents: {
                    populate: {
                        creator: {
                            select: ['id','username'],
                            populate: {
                                profile: {
                                    populate: {
                                        avatar: {
                                            select: ['id','ext','url']
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            select = ['id', 'name', 'type', 'default_version', 'color_marker', 'price', 'description', 'jsonContent', 'createdAt', 'allow_discover', 'auth_type', 'published', 'pulled']
        } else { // 其它类型 ['task','todo','note']
            populate = {
                ...populate,
                share_codes: {
                    populate: {
                        creator: {
                            select: ['id','username'],
                        }
                    }
                },
                feedback: {
                    populate: {
                        todos: {
                            populate: {
                                attachment: {
                                    select: ['id','ext','url']
                                }
                            }
                        }
                    }
                },
                followed_bies: {
                    select: ['id','mm_profile'],
                    populate: {
                        profile: {
                            populate: {
                                avatar: {
                                    select: ['id', 'ext','url']
                                },
                                brand: {
                                    select: ['id', 'ext','url']
                                },
                                cover: {
                                    select: ['id', 'ext','url']
                                },
                            }
                        },
                        user_channel: {
                            select: ['id']
                        }
                    }
                },
                card_kanban: true,
                todogroups: {
                    populate: {
                        todos: true
                    }
                },
                storage: {
                    populate: {
                        files: {
                            select: ['id','name','ext','url']
                        },
                        sub_folders: true,
                        creator: {
                            select: ['id','username'],
                            populate: {
                                profile: {
                                    select: ['title'],
                                    populate: {
                                        avatar: {
                                            select: ['ext','url']
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                card_documents: {
                    populate: {
                        creator: {
                            select: ['id','username'],
                            populate: {
                                profile: {
                                    populate: {
                                        avatar: {
                                            select: ['id','ext','url']
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                schedule: {
                    populate: {
                        schedule_events: {
                            populate: {
                                creator: {
                                    select: ['id','username'],
                                    populate: {
                                        profile: {
                                            populate: {
                                                avatar: {
                                                    select: ['id','url','ext']
                                                }
                                            }
                                        }
                                    }
                                },
                                executor: {
                                    select: ['id','color_marker','description','nickname','position','is_blocked','private_email'],
                                    populate: {
                                        by_user: {
                                            select: ['id','username'],
                                            populate: {
                                                profile: {
                                                    populate: {
                                                        avatar: {
                                                            select: ['id','url','ext']
                                                        }
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
                                    select: ['id','username'],
                                }
                            }
                        }
                    }
                },
                card_members: {
                    populate: {
                        by_user: {
                            select: ['id','username','mm_profile'],
                            populate: {
                                profile: {
                                    populate: {
                                        avatar: {
                                            select: ['id','url','ext']
                                        }
                                    }
                                }
                            }
                        },
                        member_roles: {
                            select: ['id','subject']
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
                },
                card_kanban: true
            }
            select = ['id', 'name', 'type', 'default_version', 'color_marker', 'description', 'createdAt', 'status', 'jsonContent', 'default_version', 'importance', 'urgency', 'score', 'mm_thread', 'mm_feedback_group', 'disable_share', 'updatedAt']
        }
        if(card.type !== 'resource'){
            card = await findCard();
        } 
        if(card.type === 'resource'){
            card.auth_types = [
                'exclusive',
                'commercial',
                'non-commercia',
                'educational',
                'personal'
            ]
        }
        
        if(card) {
            if(card.overviews?.length > 0 && card.type === 'classroom'){
                card.overviews = await strapi.service('api::card.card').sync_mpsInfo(card.overviews);
            }
            return card
        }
    },
    removeSharecodesByOthers(card, user_id) {
        if(card.share_codes){
            card.share_codes = card.share_codes.filter(i => i.creator?.id === Number(user_id))
        }
        if(card.card_kanban?.columns?.length > 0){
            card.card_kanban = {
                ...card.card_kanban,
                columns: card.card_kanban.columns.map(column => ({
                    ...column,
                    cards: column.cards?.length > 0 ? column.cards.map(card => card.share_codes?.length > 0 ? {
                        ...card,
                        share_codes: card.share_codes.filter(i => i.creator?.id === Number(user_id))
                    } : card ) : []
                }))
            }
        }
        return card
    },
    async clac_card_auth(...args){
        const [ card_id, user_id, collection ] = args;
        const ctx = strapi.requestContext.get();
        
        let ACL
        let is_blocked
        let role_names
        const card_role = await strapi.db.query('api::member-role.member-role').findOne({
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
        })
        // console.log('card_role', card_role)
        if(card_role){
            ACL = card_role.ACL
            is_blocked = card_role.subject === 'blocked'
            role_names = [card_role.subject]
        } else {
            ctx.throw(403, '没有找到对应的用户角色')
        }

        const { read, create, modify, remove } = {
            read: ACL.find(i => i.collection === collection)?.read,
            create: ACL.find(i => i.collection === collection)?.create,
            modify: ACL.find(i => i.collection === collection)?.modify,
            remove: ACL.find(i => i.collection === collection)?.delete,
        };
        
        // console.log('ACL', read, create, modify, remove)
        const authed_fields = [...new Set(ACL.map(i => i.fields_permission).flat(2)?.filter(j => j.modify)?.map(k => k.field))];
        return { read, create, modify, remove, is_blocked, role_names, ACL, authed_fields }
    },
    async clac_finalAuth_byCardID(...args){
        const [ card_id, user_id, collection ] = args;
        const matchCardMember = async(user_id, card_id) => {
            return await strapi.db.query('api::member-role.member-role').findMany({
                where: {
                    by_card: card_id,
                    members: {
                        by_user: user_id
                    }
                }
            })
        }
        const cardMembers = await matchCardMember(user_id, card_id)
        // console.log('cardMembers 1', cardMembers)
        if(cardMembers?.length > 0){
            const collection = 'card'
            const { read, create, modify, remove, is_blocked, role_names, ACL, authed_fields } = await strapi.service('api::card.card').clac_card_auth(card_id, user_id, collection);
            return { read, create, modify, remove, is_blocked, role_names, ACL, authed_fields }
        } else {
            const belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(card_id);
            // console.log('belongedInfo', belongedInfo);
            let _isCardMember
            if(belongedInfo?.belonged_card){
                const _card_id = belongedInfo.belonged_card.id
                _isCardMember = await matchCardMember(user_id, _card_id)
                if(_isCardMember?.length > 0){
                    // console.log('isCardMember 3', _isCardMember)
                    const { read, create, modify, remove, is_blocked, role_names, ACL, authed_fields } = await strapi.service('api::card.card').clac_card_auth(_card_id, user_id,collection);
                    return { read, create, modify, remove, is_blocked, role_names, ACL, authed_fields }
                }
            };
            // console.log('belonged_project 3', belongedInfo.belonged_project);
            if(!_isCardMember && belongedInfo?.belonged_project){
                // console.log('belonged_project 3')
                const _project = belongedInfo.belonged_project;
                const { read, create, modify, remove, is_blocked, role_names, ACL, authed_fields } =
                    await strapi.service('api::project.project').clac_projectCard_auth(_project.id,user_id,collection);
                // console.log('read 2',read);
                return { read, create, modify, remove, is_blocked, role_names, ACL, authed_fields }
            }
        }
    },

    async process_update_params(...args) {
        const ctx = strapi.requestContext.get();
        const [user_id,card,data,fields_permission,props] = args;
        const { orderTodogroup, orderTodo } = props;
        let params = {};
        const isCreate = await strapi.db.query('api::member-role.member-role').findOne({
            where: {
                subject: 'creator',
                members: {
                    by_user: user_id
                }
            }
        })

        if(!data.role && ((data.new_follow_user_id && data.new_follow_user_id != user_id ) || (data.remove_follow_user_id && data.remove_follow_user_id != user_id))) {
            ctx.throw(401, '执行关注操作的用户ID与操作者不匹配')
            return
        }
        // 任何成员均可关注卡片，因此无须其他鉴权
        if(data.data?.new_follow_user_id) {
            // console.log(typeof data.data?.new_follow_user_id);
            params.followed_bies = {
                connect: [Number(data.data?.new_follow_user_id)]
            }
        }

        if(data.data?.remove_follow_user_id && Number(data.data?.remove_follow_user_id) === user_id) {
            params.followed_bies = {
                disconnect: [Number(data.data?.remove_follow_user_id)]
            }
        }

        if(data.data?.new_storageFiles && fields_permission.includes('storage')) {
            let storage_id = card.storage?.id;
            let storage_files = await strapi.entityService.findOne('api::storage.storage',storage_id,{
                populate: {
                    files: {
                        fields: ['id']
                    }
                }
            })
            let storage_files_ids = storage_files.files?.map(i => i.id).filter(file => !file_ids.includes(file)) || []
            let new_storage_files = [...storage_files_ids,...file_ids]
            // media类型的字段，不可以使用 connect disconnect 来更新，需要使用原生的upload插件，需要验证oss上传是否是直传，这里临时使用set
            await strapi.entityService.update('api::storage.storage',storage_id,{
                data: {
                    files: {
                        set: new_storage_files
                    }
                }
            })
        } else if(data.data?.new_storageFiles && !fields_permission.includes('storage')) {
            ctx.throw(401,'您没有添加文件的权限')
        }
        if(data.data?.remove_storageFiles && fields_permission.includes('storage')) {
            let file_ids = data.remove_storageFiles.map(item => Number(item))
            let storage_id = card.storage?.id;
            let storage_files = await strapi.entityService.findOne('api::storage.storage',storage_id,{
                populate: {
                    files: {
                        fields: ['id']
                    }
                }
            })
            let storage_files_ids = storage_files.files?.map(i => i.id) || []
            let new_storage_files = storage_files_ids.filter(i => !file_ids.includes(i))
            // media类型的字段，不可以使用 connect disconnect 来更新，需要使用原生的upload插件，需要验证oss上传是否是直传，这里临时使用set
            await strapi.entityService.update('api::storage.storage',storage_id,{
                data: {
                    files: {
                        set: new_storage_files
                    }
                },
                populate: {
                    files: {
                        fields: ['id','name','ext','url']
                    }
                }
            })
        } else if(data.data?.new_storageFiles && !fields_permission.includes('storage')) {
            ctx.throw(401,'您没有删除文件的权限')
        }
        if(data.data?.name && fields_permission.includes('name')) {
            params.name = data.data?.name
        } else if (data.data?.name && !fields_permission.includes('name')) {
            ctx.throw(401, '您无权修改名称')
        }
        if(data.data?.description && fields_permission.includes('description')) {
            params.description = data.data?.description
        } else if (data.data?.description && !fields_permission.includes('description')) {
            ctx.throw(401, '您无权修改摘要')
        }
        if(data.data?.type && fields_permission.includes('type')) {
            params.type = data.data?.type
        } else if (data.data?.type && !fields_permission.includes('type')) {
            ctx.throw(401, '您无权修改类型')
        }
        if(data.data?.status && fields_permission.includes('status')) {
            params.status = data.data?.status
        } else if (data.data?.status && !fields_permission.includes('status')) {
            ctx.throw(401, '您无权修改卡片状态')
        }
        if(data.hasOwnProperty('executor') && fields_permission.includes('executor')) {
            const card_executor_role = card.member_roles.find(i => i.subject === 'executor');
            const card_defaultMember_role = card.member_roles.find(i => i.subject === 'member');
            // console.log('card_defaultMember_role',card_defaultMember_role)
            const isInCard = card.card_members.map(i => i.id)?.includes(data.executor);
            if(data.executor) {
                if(!isInCard){
                    await strapi.entityService.update('api::card.card',card.id,{
                        data: {
                            card_members: {
                                connect: [data.executor]
                            }
                        }
                    })
                }
                await strapi.entityService.update('api::member-role.member-role',card_executor_role.id,{
                    data: {
                        members: {
                            set: [data.executor] // 仅允许一位负责人，因此这里用set
                        }
                    }
                })
            } else {
                const executorRole = card.member_roles?.find(i => i.subject === 'executor');
                const executorMember = executorRole.member_roles?.map(i => i.id);
                // 将其设为卡片成员
                await strapi.entityService.update('api::member-role.member-role',executorRole.id,{
                    data: {
                        members: {
                            set: []
                        }
                    }
                })
                // 将其移出负责人
                await strapi.entityService.update('api::member-role.member-role',card_defaultMember_role.id,{
                    data: {
                        members: {
                            connect: executorMember
                        }
                    }
                })
            }
        } else if (data.hasOwnProperty('executor') && !fields_permission.includes('executor')) {
            ctx.throw(401, '您无权指定卡片负责人')
        }
        if(data.data?.content && fields_permission.includes('content')) {
            params.content = data.data?.content
        } else if (data.data?.content && !fields_permission.includes('content')) {
            ctx.throw(401, '您无权修改卡片详情内容')
        }
        if(data.data?.jsonContent && fields_permission.includes('jsonContent')) {
            params.jsonContent = data.data?.jsonContent
        } else if (data.data?.jsonContent && !fields_permission.includes('jsonContent')) {
            ctx.throw(401, '您无权修改卡片详情内容')
        }
        if(data.data?.default_version && fields_permission.includes('default_version')) {
            params.default_version = data.data?.default_version
        } else if (data.data?.default_version && !fields_permission.includes('default_version')) {
            ctx.throw(401, '您无权修改卡片默认版本')
        }
        if(data.data?.importance && fields_permission.includes('importance')) {
            params.importance = data.data?.importance
        } else if (data.data?.importance && !fields_permission.includes('importance')) {
            ctx.throw(401, '您无权修改卡片重要度')
        }
        if(data.data?.urgency && fields_permission.includes('urgency')) {
            params.urgency = data.data?.urgency
        } else if (data.data?.urgency && !fields_permission.includes('urgency')) {
            ctx.throw(401, '您无权修改卡片紧急度')
        }
        if(data.data?.score && fields_permission.includes('score')) {
            params.score = data.data?.score
        } else if (data.data?.score && !fields_permission.includes('score')) {
            ctx.throw(401, '您无权修改卡片评分')
        }
        if(data.data?.color_marker && fields_permission.includes('color_marker')) {
            params.color_marker = data.data?.color_marker
        } else if (data.data?.color_marker && !fields_permission.includes('color_marker')) {
            ctx.throw(401, '您无权修改卡片颜色标签')
        }
        if(data.data?.private && fields_permission.includes('private')) {
            params.private = data.data?.private
        } else if (data.data?.private && !fields_permission.includes('private')) {
            ctx.throw(401, '您无权修改卡片隐私设置')
        }
        if(data.data?.todogroups && orderTodogroup) {
            params.todogroups = data.data?.todogroups
        } else if (data.data?.todogroups && !fields_permission.includes('todogroups')) {
            ctx.throw(401, '您无权修改卡片清单分组')
        }
        // 卡片文档排序拥有card的modify权限即可，这里不需要再次鉴权
        if(data.data?.card_documents) {
            const _card_documents_ids = card.card_documents.map(i => i.id)
            function arraysEqual(a, b) {
              if (a.length !== b.length) return false;
              const set = new Set(a);
              return b.every(item => set.has(item));
            }
            if(!arraysEqual(_card_documents_ids, data.data?.card_documents)){
                // console.log('排序数据错误', _card_documents_ids, data.data?.card_documents)
                ctx.throw(403, '排序数据错误')
            } else {
                params.card_documents = data.data?.card_documents
            }
        }
        //  else if (data.data?.card_documents && !fields_permission.includes('todogroups')) {
        //     ctx.throw(401, '您无权修改卡片清单分组')
        // }
        if(data.data?.role && fields_permission.includes('manageRole')) {
            params.role = card.role.map((r) => ({
                ...r,
                members: {
                    set: data.data.role.find(i => i.id === r.id).members
                }
            }))
            // console.log(params.role);
        } else if (data.role && !fields_permission.includes('manageRole')) {
            ctx.throw(401, '您无权修改卡片角色权限')
        }

        if(data.data?.share_code && fields_permission.includes('share')) {
            // 前端传来的
            let share_code = data.data?.share_code
            // 将当前用户作为创建者
            share_code.creator = user_id;
            // 获取所有非当前用户的原始分享码 - 每个人只能有一个分享码，如果他新建新的，那就删除旧的
            let share_codes = card.share_codes?.length > 0 ? card.share_codes.filter(i => i.creator.id !== user_id) : [];
            // 合并新的分享码
            share_codes = share_codes?.length > 0 ? [...share_codes, share_code] : [share_code]
            // 附加给params
            params.share_codes = share_codes;
            // 需要Mattermost商业版授权，这里通过开关来控制是否创建Mattermost group
            let create_feedbackGroup = false
            if(!card.mm_feedback_group && create_feedbackGroup){
                const user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id,{
                    fields: ['id','username','email','mm_profile'],
                })
                if(user?.mm_profile){
                    const mmapi = strapi.plugin('mattermost').service('mmapi');
                    const groupInfo = {
                        "name": `card${card.id}feedback`,
                        "display_name": `card-${card.id}-feedback`,
                        "source": "",
                        "allow_reference": true
                    }
                    const users = [user?.mm_profile.id]
                    await mmapi.createGroup(groupInfo,users);
                }
            }
            if(!card?.feedback){
                const feedback = await strapi.entityService.create('api::todogroup.todogroup',{
                    data: {
                        name: '反馈收集'
                    }
                })
                if(feedback){
                    await strapi.entityService.update('api::card.card',card.id,{
                        data: {
                            feedback: feedback.id
                        }
                    })
                }
            }
        } else if (data.data?.share_code && !fields_permission.includes('share')) {
            ctx.throw(401, '您无权共享卡片')
        }
        if(data.data?.price && isCreate){
            params.price = data.data?.price
        } else if(data.data?.price && !isCreate){
            ctx.throw(401, '您无权修改售价')
        }
        if(data.data?.published && isCreate){
            params.published = true
        }
        if (isCreate && 'allow_discover' in data.data) {
            params.allow_discover = data.data.allow_discover;
        }
        if (isCreate && data.data?.resource_type) {
            params.resource_type = data.data.resource_type;
        }
        if (isCreate && data.data?.auth_extened) {
            params.auth_extened = data.data.auth_extened;
        }
        if (isCreate && data.data?.price_by_auth) {
            params.price_by_auth = data.data.price_by_auth;
        }
        if (isCreate && data.data?.cover) {
            params.cover = data.data.cover;
        }

        return params
    },
    async initFullCard(...args){
        let [card,user_id] = args;
        const initKanbanCard = async () => {
            if(card && !card.card_kanban) {
                var now = new Date();
                var iso = now.toISOString();
                const new_kanban = await strapi.entityService.create('api::kanban.kanban',{
                    data: {
                        title: `${card.name} 的任务看板`,
                        type: 'kanban',
                        creator: user_id,
                        status: 'pending',
                        publishedAt: iso,
                        relate_by_card: card.id
                    }
                })
                if(new_kanban) {
                    card.card_kanban = new_kanban;
                }
            }
            if(card && !card.schedule) {
                var now = new Date();
                var iso = now.toISOString();
                const new_schedule = await strapi.entityService.create('api::schedule.schedule',{
                    data: {
                        by_card: {
                            set: [card.id]
                        },
                        creator: user_id,
                        publishedAt: iso
                    }
                })
                if(new_schedule) {
                    card.schedule = new_schedule;
                }
            }
        }
        const typesForKanban = ['task', 'note', 'todo']
        if(typesForKanban.includes(card.type)){
            initKanbanCard();
        }
        if(card) {
            return card
        }
    },
    card_populate_template(...args) {
        const [card_type,can_sales] = args
        let populate = {
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
            cover: {
                fields: ['id','ext','url']
            },
            overviews: {
                populate: {
                    media: {
                        fields: ['id', 'ext','url']
                    },
                    marker_todos: {
                        populate: {
                            attachment: {
                                fields: ['id', 'ext','url']
                            }
                        }
                    }
                }
            },
            card_documents: {
                populate: {
                    author: {
                        fields: ['id','username'],
                        populate: {
                            profile: {
                                populate: {
                                    avatar: {
                                        fields: ['id','ext','url']
                                    }
                                }
                            }
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
                    card_members: {
                        populate: {
                          by_user: {
                            fields: ['id']
                          },
                          member_roles: {
                              fields: ['id']
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
                      },
                    owner: {
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
                    }
                }
            },
        }
        if(!can_sales.includes(card_type)){
            populate = {
                ...populate,
                share_codes: {
                    populate: {
                        creator: {
                            fields: ['id','username'],
                        }
                    }
                },
                followed_bies: {
                    fields: ['id','mm_profile'],
                    populate: {
                        profile: {
                            populate: {
                                avatar: {
                                    fields: ['id', 'ext','url']
                                },
                                brand: {
                                    fields: ['id', 'ext','url']
                                },
                                cover: {
                                    fields: ['id', 'ext','url']
                                },
                            }
                        },
                        user_channel: {
                            fields: ['id']
                        }
                    }
                },
                card_kanban: {
                    populate: {
                        columns: {
                            populate: {
                                cards: {
                                    populate: {
                                        share_codes: {
                                            populate: {
                                                creator: {
                                                    fields: ['id','username'],
                                                }
                                            }
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
                                                fields: ['id']
                                              },
                                              member_roles: {
                                                  fields: ['id']
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
                                          },
                                        overview: {
                                            populate: {
                                                media: {
                                                    fields: ['ext','url']
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
                                }
                            }
                        }
                    }
                },
                todogroups: {
                    populate: {
                        todos: true
                    }
                },
                feedback: {
                    populate: {
                        todos: true
                    }
                },
                schedule: {
                    populate: {
                        schedule_events: {
                            populate: {
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
                },
            }
        }
        return populate
    },
    clac_cardName(...args) {
        const [ card ] = args;
        function getFirstText(jsonData) {
            if (jsonData.type === 'text') {
                return jsonData.text;
            } else if (jsonData.content && jsonData.content.length > 0) {
                for (let i = 0; i < jsonData.content.length; i++) {
                const text = getFirstText(jsonData.content[i]);
                if (text !== null) {
                    return text.slice(0, 18) + (text.length > 8 ? '...' : '');
                }
                }
            } else {
                return '未命名任务';
            }
        };
        let _
        if(card.name){
            _ = card.name.slice(0, 18) + (card.name.length > 18 ? '...' : '');
        } else {
            _ = getFirstText(card.jsonContent);
        }
        return _
    },
    clearRedisCacheByCardID(card_id) {
        const isRestCacheEnabled = strapi.checkPluginEnable('rest-cache')
        if(!isRestCacheEnabled) return
        const _redisCache = strapi.plugins[
          "rest-cache"
        ].services.cacheConfig.getCacheKeysRegexp("api::card.card", {
          id: card_id,
        });
        // console.log('_redisCache', _redisCache)
        if(_redisCache){
            strapi.plugins["rest-cache"].services.cacheStore.clearByRegexp(_redisCache);
        }
    },
    async isCreator(...args) {
        const [card_id,user_id] = args;
        const matchedCard = await strapi.db.query('api::card.card').findOne({
            where: {
                id: card_id,
                $or: [
                    {
                        creator: user_id
                    },
                    {
                        member_roles: {
                            subject: 'creator',
                            members: {
                                by_user: user_id
                            }
                        }
                    }
                ]
            }
        })
        return !!matchedCard;
    },
    async checkRemoveLock(args){
        const {card_id} = args;
        const locker = await strapi.db.query('api::order.order').findOne({
            where: {
                card: card_id,
                orderState: 2
            }
        })
        return {
            locked: !!locker,
            message: '已售出的内容不能被删除,'
        }
    },
    async recursiveDeleteCard(args) {
        const {card_id} = args;
        
        let card_kanbans = [];
        let card_documents = [];
        let card_overviews = [];
        let card_todogroups = [];
        let card_storage;
        let card_schedule;
        let card_member_roles = [];
        let card_feedback
    }
  })
);

