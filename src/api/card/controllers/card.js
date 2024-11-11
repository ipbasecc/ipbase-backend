// @ts-nocheck
'use strict';

/**
 * card controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const cant_share_as_types = ['classroom']
const can_sales = ['classroom']
module.exports = createCoreController('api::card.card',({strapi}) => ({
    async find(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const start = Number(ctx.query.start);
        const limit = Number(ctx.query.limit);
        const team_id = Number(ctx.query.team_id);

        // console.log('team_id', team_id)
        if (start < 0 || limit < 0) {
            ctx.throw(400, '需要提供分页数据')
        }
        const cards = await strapi.entityService.findMany('api::card.card',{
            start: start,
            limit: limit,
            filters: {
                $and: [
                    {
                        card_members: {
                            by_user: {
                                id: user_id
                            },
                            by_team: {
                                id: team_id
                            },
                        }
                    },
                    {
                        type: ['task', 'todo', 'note'],
                    }
                ]
            },
            populate: {
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
                todogroups: {
                    populate: {
                        todos: true
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
        })
        // 获取 _cards 的总数
        const total = await strapi.db.query("api::card.card").count({
            where: {
                card_members: {
                    by_user: {
                        id: user_id,
                    },
                    by_team: {
                        id: team_id
                    }
                },
            }
        });
        return {cards,total,start,limit}
    },
    async findFollowed(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const start = Number(ctx.query.start);
        const limit = Number(ctx.query.limit);
        const team_id = Number(ctx.query.team_id);

        if (start < 0 || limit < 0) {
            ctx.throw(400, '需要提供分页数据')
        }
        
        const cards = await strapi.entityService.findMany('api::card.card',{
            limit: limit,
            start: start,
            filters: {
                $and: [
                    {
                        card_members: {
                            by_user: {
                                id: user_id
                            },
                            by_team: {
                                id: team_id
                            },
                        }
                    },
                    {
                        followed_bies: {
                            id: user_id
                        }
                    },
                    {
                        status: {
                            $ne: 'completed'
                        },
                    },
                    {
                        type: ['task', 'todo', 'note'],
                    }
                ]
            },
            populate: {
                overviews: {
                    populate: {
                        media: {
                            fields: ['ext','url']
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
                        },
                        by_team: {
                            fields: ['id','display_name']
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
        })
        // 获取 _cards 的总数
        const total = await strapi.db.query("api::card.card").count({
            where: {
                followed_bies: {
                    id: user_id,
                },
                card_members: {
                    by_team: {
                        id: team_id
                    },
                }
            }
        });
        
        return {cards,total,start,limit}
    },
    async create(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let column_id = Number(ctx.request.body.column_id);
        let data = ctx.request.body.data;

        if(!user_id) {
            ctx.throw(401, '您无权访问该数据')
        }
        if(!column_id) {
            ctx.throw(400, '需要提供看板分栏ID')
        }
        
        let auth
        let belonged_project
        let belonged_card
        const belongedInfo = await strapi.service('api::column.column').find_belongedInfo_byColumnID(column_id);
        // console.log('belongedInfo', belongedInfo)
        if(belongedInfo){
            // console.log('belongedInfo', belongedInfo)
            const collection = 'card'
            if(belongedInfo.belonged_card){
                belonged_card = belongedInfo.belonged_card
                const card_id = belonged_card.id
                // console.log('belonged_card', belonged_card)
                const { create } = await strapi.service('api::card.card').clac_finalAuth_byCardID(card_id, user_id, collection);
                // console.log('create', create)
                auth = create
            }
            if(belongedInfo.belonged_project){
                belonged_project = belongedInfo.belonged_project
                if(!auth){
                    const project_id = belonged_project.id
                    const { create } = await strapi.service('api::project.project').clac_projectCard_auth(project_id, user_id, collection);
                    auth = create
                }
            }
        } else {
            ctx.throw(404, '分栏ID有误，没有找到其所属项目')
        }

        if(auth) {
            // console.log('auth', auth)
            const card_type = data.type
            const member_byCurUser = await strapi.db.query('api::member.member').findOne({
                where: {
                    by_projects: belonged_project.id,
                    by_user: user_id
                }
            })
            
            let init_member_roles = await strapi.service('api::card.card').initRole(user_id, member_byCurUser, card_type);
            let member_roles = init_member_roles?.roles?.map(i => i.id);
            
            // console.log('member_roles',member_roles)
            let now = new Date();
            let iso = now.toISOString();
            let cardEntry;
            let new_overview_parmars = {
                name: 'Initial_Version',
                publishedAt: iso
            }
            if(data.media){
                new_overview_parmars.media = data.media;
                delete data.media
            }
            let new_overview = await strapi.entityService.create('api::overview.overview',{
                data: new_overview_parmars
            })
            if(new_overview && init_member_roles){
                let params = data;
                params.overviews = [new_overview.id];
                params.default_version = new_overview.id;
                params.creator = user_id;
                params.publishedAt = iso;
                // 如果是销售的产品，创建时先不发布，由创建者手动发布
                if(can_sales.includes(card_type)){
                    params.published = false
                }
                params.type = card_type || 'todo';
                if(!params.status){
                    params.status = 'pending'
                }
                if(!params.cover && card_type === 'classroom' && process.env.DEFAULT_COURSE_COVER){
                    params.cover = process.env.DEFAULT_COURSE_COVER
                }
                params.jsonContent = data.jsonContent ? data.jsonContent : {
                    "type": "doc",
                    "content": [
                        {
                        "type": "paragraph"
                        }
                    ]
                };
                if(data.hasOwnProperty('private')) {
                    params.private = data.private;
                }

                params.member_roles = {
                    set: member_roles
                }

                params.card_members = {
                    set: [member_byCurUser?.id]
                }
                if(data.price && can_sales.includes(card_type)){
                    params.price = data.price
                }
                // console.log(params, data)
                // console.log('params.card_members',params.card_members)
                cardEntry = await strapi.entityService.create('api::card.card', {
                    data: params,
                    populate: {
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
                        cover: {
                            populate: {
                                fields: ['id', 'ext', 'url']
                            }
                        },
                        creator: {
                            fields: ['id', 'username'],
                            populate: {
                                profile: {
                                    populate: {
                                        fields: ['id', 'ext', 'url']
                                    }
                                }
                            }
                        }
                    },
                })
                if(cardEntry) {
                    await strapi.entityService.create('api::storage.storage',{
                        data: {
                            name: `${cardEntry.name}_storage`,
                            belonged_card: {
                                set: [cardEntry.id]
                            },
                            creator: {
                                set: [user_id]
                            },
                            can_read_user: {
                                connect: [user_id]
                            },
                            can_write_user: {
                                connect: [user_id]
                            },
                            color_marker: []
                        }
                    })
                }
                const columnEntry = await strapi.entityService.findOne('api::column.column',column_id,{
                    populate: {
                        kanban: {
                            fields: ['type']
                        }
                    }
                })
                if(cardEntry && columnEntry) {
                    let params;
                    const unshift_types = ['kanban','classroom']
                    if(unshift_types.includes(columnEntry.kanban.type)) {
                        params = {
                            cards: {
                                connect: [
                                    { id: cardEntry.id, position: { start: true } },
                                ]
                            }
                        }
                    } else {
                        params = {
                            cards: {
                                connect: [ cardEntry.id ]
                            }
                        }
                    }
                    await strapi.entityService.update('api::column.column',column_id,{
                        data: params
                    })

                    // 因为需要为卡片初始化一个消息主题作为卡片讨论的入口
                    // 这里在创建后直接发布一条消息
                    if(belonged_project?.mm_channel){
                        const mmChannel_id = belonged_project?.mm_channel?.id
                        const mmapi = strapi.plugin('mattermost').service('mmapi');
                        let params = {
                            "channel_id": mmChannel_id,
                            "message": `新建卡片：${cardEntry.name ? cardEntry.name : 'id:' + cardEntry.id}`,
                            "props": {
                                "strapi": {
                                    "event": "create_card"
                                },
                            }
                        }
                        const mmMsg = await mmapi.createPost(params);
                        // console.log('create_todo',create_todo)
                        if(mmMsg?.data){
                            const update = await strapi.entityService.update('api::card.card',cardEntry.id,{
                                data: {
                                    mm_thread: mmMsg.data
                                }
                            })
                            cardEntry.mm_thread = update.mm_thread
                        }
                    }
                    
                    // 不是销售的内容，直接推送
                    // 否则 - 销售内容默认不发布状态，售出方修改发布状态后再推送
                    if(!can_sales.includes(card_type)){
                        strapi.$publish('card:created', [ctx.room_name], {
                            team_id: ctx.default_team?.id,
                            column_id: column_id,
                            data: cardEntry
                        });
                    }
                    if(cardEntry?.type === 'classroom'){
                        cardEntry.payState.cardState = {
                            isCreator: true
                        }
                    }
                    return cardEntry
                }
            };
            
        } else {
            ctx.throw(403, '您无权在此处创建卡片')
        }
    },
    async update(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let card_id = Number(ctx.params.id);
        let data = ctx.request.body;
        if(!user_id) {
            ctx.throw(401, '您无权访问该数据')
        }
        if(!card_id) {
            ctx.throw(400, '请提供卡片ID')
        }

        let fields_permission = [];
        let auth;
        let orderTodogroup
        let orderTodo
        const card = await strapi.service('api::card.card').find_cardByID(card_id);
        if(cant_share_as_types.includes(card.type) && data.data?.share_code){
            ctx.throw(403,'当前类型不允许被共享')
        }
        /**
            todo
            此处需要增加招标任务被共享时的提示
        */
        
        // 如果有收到更新mm_thread的请求，直接从Mattermost读取当前卡片的thread并直接更新
        // 此处无须返回，前端Mattermost的thread并更新UI，这里只是更新Strapi中的数据，方便下次读取
        if(data.data?.mm_thread && data.data.mm_thread?.id === card.mm_thread?.id){
            const post_id = card.mm_thread.id;
            const mmapi = strapi.plugin('mattermost').service('mmapi');
            const thread = await mmapi.getPost(post_id);
            if(thread?.data) {
                await strapi.entityService.update('api::card.card', card_id,{
                    data: {
                        mm_thread: thread.data
                    }
                });
            }
        }
        
        const belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(card_id);
        // console.log('card', card, 'data', data)
        // 开始处理card 被下架
        if(card.type === 'classroom' && data.data?.pulledCard_id === card.id && card.creator?.id === user_id){
            const _updateCard = await strapi.db.query('api::card.card').update({
                where: {
                    id: card_id
                },
                data: {
                    pulled: true
                }
            })
            // console.log('_updateCard', _updateCard)
            // 后台执行：如果用户下架商品，减小项目占用空间统计，因为卖出的产品还要被购买者查看
            process.nextTick(async () => {
                if(belongedInfo.belonged_project){
                    // 查询到所有与此卡片关联的已经成交的订单
                    const orders = await strapi.db.query('api::order.order').findMany({
                        where: {
                            card: card_id,
                            orderState: 2
                        },
                        populate: {
                            card: {
                                populate: {
                                    overviews: {
                                        populate: {
                                            media: {
                                                fields: ['id','size','url']
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    })
                    //筛选出所有有媒体文件的内容
                    const overviews = orders.map(i => i.card.overviews).flat(2).filter(j => j.media?.size > 0)
                    if(overviews?.length > 0){
                        //统计出媒体总大小
                        let prv_size = 0
                        for (const overview of overviews){
                            prv_size + overview.media.size
                        }
                        if(prv_size > 0){
                            // 减掉项目存储占用
                            try {
                                const params = {
                                      project: belongedInfo.belonged_project,
                                      size: 0,
                                      prv_size: prv_size
                                  }
                              await strapi.service('api::project.project').updateProjectTotalFileSize(params);
                            } catch (error) {
                              console.error('After update processing error:', error);
                            }
                        }
                    }
                }
            });
            const _resp_card_data = {
                id: card_id,
                type: card.type,
                message: '该内容已下架',
                cardState: {
                    isPulled: true
                },
                hasDetialAuth: false
            }
            if(ctx.room_name){
                strapi.$publish('card:updated', [ctx.room_name], {
                    team_id: ctx.default_team?.id,
                    card_id: card_id,
                    updator: user_id,
                    column_id: belongedInfo.belonged_column?.id,
                    data: {
                        id: card_id,
                        pulled_card_id: card_id,
                        card_data: _resp_card_data
                    }
                });
            }
            return _resp_card_data
        }
        // card被下架处理完毕
        
        const collection = 'card'
        const { read, create, modify, remove, is_blocked, role_names, ACL, authed_fields } =
            await strapi.service('api::card.card').clac_finalAuth_byCardID(card_id, user_id,collection);
        auth = modify;
        // console.log('ACL', ACL);
        fields_permission = authed_fields
        orderTodogroup = strapi.service('api::project.project').calc_field_ACL(ACL,'todogroups','order');
        orderTodo = strapi.service('api::project.project').calc_field_ACL(ACL,'todo','order');

        // console.log('orderTodogroup',orderTodogroup,'orderTodo',orderTodo);
        
        function isUserId(obj) {
            // 判断 obj 是否是一个正整数
            if (Number.isInteger(obj) && obj > 0) {
              // 判断 obj 是否是一个整数的字符串表示，例如 "5" 或 "123"
              if (obj.toString() === parseInt(obj).toString()) {
                // 返回 true
                return true;
              }
            }
            // 否则返回 false
            return false;
        }
        if(data.new_follow_user_id && !isUserId(Number(data.new_follow_user_id))) {
            ctx.throw(500, '错误的用户ID')
        }
        if(data.remove_follow_user_id && !isUserId(Number(data.remove_follow_user_id))) {
            ctx.throw(500, '错误的用户ID')
        }
        
        if(auth) {
            //  加入新成员
            if(data?.new_member?.user_id){
                const _project = belongedInfo.belonged_project;
                const member_byCurUser = await strapi.service('api::project.project').find_projectMemberByUID(data?.new_member?.user_id,_project?.id);
                
                if(!member_byCurUser){
                    ctx.throw(404, '没有找到对应的团队成员')
                }
                const role_of_member = card.member_roles?.find(i => i.subject === 'member')?.id;
                await strapi.entityService.update('api::member-role.member-role', role_of_member, {
                    data: {
                        members: {
                            connect: [ member_byCurUser.id ]
                        }
                    }
                })
                await strapi.entityService.update('api::card.card', card_id, {
                    data: {
                        card_members: {
                            connect: [ member_byCurUser.id ]
                        }
                    }
                })
            }
            
            //  移除成员
            if(data?.remove_member){
                const cardRoles_ids = card.member_roles?.map(i => i.id) || [];
                const updateMember = await strapi.entityService.update('api::member.member', data.remove_member, {
                    data: {
                        by_cards: {
                            disconnect: [card_id]
                        },
                        member_roles: {
                            disconnect: cardRoles_ids
                        }
                    }
                })
            }
            // 修改成员身份
            if(data?.update_member){
                const updateMember_id = data?.update_member.member_id;
                const updateMember_roles = data?.update_member.new_roles;
                const member = card.card_members.find(i => i.id === updateMember_id);
                if(member){
                    await strapi.entityService.update('api::member.member',updateMember_id,{
                        data: {
                            member_roles: {
                                set: updateMember_roles
                            }
                        }
                    })
                } else {
                    ctx.throw(404, '错误的成员ID')
                }
            }
            const props = {
                orderTodogroup: orderTodogroup,
                orderTodo: orderTodo
            }
            // console.log('fields_permission',fields_permission)
            let params = await strapi.service('api::card.card').process_update_params(user_id,card,data,fields_permission,props);
            const populate = strapi.service('api::card.card').card_populate_template(card.type);
            let update = await strapi.entityService.update('api::card.card', card_id,{
                data: params,
                populate: populate
            });
            if(update) {
                update = strapi.service('api::card.card').removeSharecodesByOthers(update, user_id);
                if(belongedInfo?.belonged_project){
                    update.belonged_project = belongedInfo.belonged_project.id;
                }
                if(belongedInfo?.belonged_card){
                    update.belonged_card = belongedInfo.belonged_card.id;
                }
                const res = await strapi.service('api::card.card').initFullCard(update)
                
                if(ctx.room_name){
                    strapi.$publish('card:updated', [ctx.room_name], {
                        team_id: ctx.default_team?.id,
                        card_id: card_id,
                        updator: user_id,
                        column_id: belongedInfo.belonged_column?.id,
                        data: {
                            id: card_id,
                            cards: belongedInfo.belonged_column?.cards?.map(i => i.id),
                            message: 'refetch card datam please'
                        }
                    });
                }

                return res
            }
        }
    },
    async delete(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let card_id = Number(ctx.params.id);
        
        if(!user_id) {
            ctx.throw(401, '您无权访问该数据')
        }
        if(!card_id) {
            ctx.throw(400, '需要提供卡片ID')
        }
        // 已出售的内容不能删除
        const canRemove = await strapi.service('api::card.card').checkRemoveLock({
            card_id: card_id
        })
        if(canRemove.locked){
            return canRemove.message
        }
        
        let auth
        const collection = 'card'
        const { read, create, modify, remove, is_blocked, role_names, ACL, authed_fields } =
            await strapi.service('api::card.card').clac_finalAuth_byCardID(card_id, user_id, collection);
        auth = remove;

        if(auth) {
            await strapi.service('api::overview.overview').remove_overview(card_id);
            
            const _card = await strapi.entityService.delete('api::card.card', card_id);
            if(_card) {
                if(ctx.room_name){
                    strapi.$publish('card:deleted', [ctx.room_name], {
                        team_id: ctx.default_team?.id,
                        card_id: card_id
                    });
                }
                return _card
            }
        } else {
            ctx.throw(403, '您无权访问该数据')
        }
    },
    async findOne(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user?.id);
        let card_id = Number(ctx.params.id);
        // console.log('card_id', card_id)
        
        
        if(!card_id) {
            ctx.throw(400, '需要提供卡片ID')
        }
        
        let props = 'classroom'
        let card = await strapi.service('api::card.card').find_cardByID(card_id, props);
        if(!card){
            ctx.throw(404,'没有找到对应的卡片')
        }
        if(card.pulled){
            return {
                id: card_id,
                type: card.type,
                message: '该内容已下架',
                cardState: {
                    isPulled: true
                }
            }
        }
        // --- 开始处理课程card请求
        if(card.type === 'classroom'){
            // 需要处理的状况：1.免费的；2.购买了的，3.是创建者，4.不免费 且 没购买 且 不是创建者
            card = await strapi.service('api::card.card').find_cardByID(card_id, props);
            // 状况1：卡片是课程且免费，直接返回数据
            if(!card.price || card.price === 0){
                card.hasDetialAuth = true
                return card
            }
            // 状况2：如果是购买的，返回数据
            const ispaied = await strapi.service('api::order.order').ispaied(user_id,card_id)
            if(ispaied){
                card.hasDetialAuth = true
                card.isBuyer = true
                return card
            }
            // 状况3：如果是创建者，返回数据
            const isCreator = await strapi.service('api::card.card').isCreator(card_id,user_id);
            if(isCreator){ // 如果是创建者，返回数据
                card.hasDetialAuth = true
                card.isCreator = true
                return card
            }
            // 状况4：如果不是创建者，也没有购买，且card是个课程，那么返回此信息告诉前端，此内容没有购买
            return {
                id: card.id,
                type: card.type,
                hasDetialAuth: false
            }
        }
        // --- 结束课程card请求处理
        
        props = card.type
        card = await strapi.service('api::card.card').find_cardByID(card_id, props);
        const { share_code, share_by, feedback } = ctx.request.query;
        if((!share_code || !share_by) && (share_code || share_by)){
            ctx.throw(404, '无效的共享连接')
        }
        cant_share_as_types
        let _share_code
        const check_sharecode = (_share_codes) => {
            // console.log('_card', _card)
            if(_share_codes?.length > 0 && _share_codes.map(i => i.code).includes(share_code)){
                _share_code = _share_codes.find(i => i.code === share_code);
            }
            
            // console.log('_share_code', _share_code, share_code, share_by)
            if(_share_code){
                // console.log('共享连接',_share_code.creator?.id, share_by)
                if(_share_code.creator?.id !== Number(share_by)){
                    ctx.throw(404, '无效的共享连接')
                }

                const now = new Date ();
                if(_share_code.disable){
                    ctx.throw(400, '该共享码已被禁用')
                } else if(_share_code.max_count < 1){
                    ctx.throw(400, '该共享码已超过使用次数')
                } else if(_share_code.up_time && _share_code.up_time < new Date ()){
                    ctx.throw(400, '该共享码已超过使用期限')
                } else {
                    return true
                }
            } else {
                return false
            }
        }
        let isValid;
        
        // console.log('share_code, share_by', share_code, share_by)
        let findBySharecode
        if(share_code && share_by){
            if(cant_share_as_types.includes(card.type)){
                ctx.throw(403,'当前类型内容不能通过分享查看')
            }
            findBySharecode = true
            // console.log('card', card)
            if(card?.disable_share){
                ctx.throw(400, '当前内容共享已被禁止')
            }
            // console.log('card.feedback', card.feedback)
            const findSharecodesByBelongedCardID = async (_card_id) => {
                const belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(_card_id);
                if(belongedInfo?.belonged_card){
                    if(belongedInfo?.belonged_card?.share_codes){
                        isValid = check_sharecode(belongedInfo?.belonged_card.share_codes);
                        if(isValid){
                            card.isSubCard = true
                        }
                    } else {
                        await findSharecodesByBelongedCardID(belongedInfo?.belonged_card.id)
                    }
                }
            }
            // 直接从Card自身获取共享码
            let _share_codes = card.share_codes;
            // 如果Card自身没有共享码，那么就递归查找其所属Card的共享码，要么找到为止，要么找到最上层不是子Card的Card
            if(!_share_codes || _share_codes.length === 0){
                try {  
                    await findSharecodesByBelongedCardID(card_id);
                } catch (error) {  
                    console.error('Error fetching share codes:', error);  
                }
            }
            if(!_share_codes || _share_codes.length === 0){
                ctx.throw(404, '请求目标Card不存在共享码')
            }
            
            let share_code
            if(_share_codes){
                isValid = check_sharecode(_share_codes)
            }
            
            if(isValid && _share_code){
                if(feedback){
                    ctx.body = card.feedback;
                }
                const maxCount_donw = async (_card, _share_code) => {
                    
                    await strapi.entityService.update('api::card.card',card_id,{
                        data: {
                            share_codes: _card.share_codes.map((i) => ({
                                ...i,
                                max_count: i.id === _share_code.id ? --_share_code.max_count : i.max_count
                            }))
                        }
                    })
                }

                if(!card.isSubCard || !user_id || _share_code.creator.id !== user_id){
                    await maxCount_donw(card, _share_code);
                }
                card = strapi.service('api::card.card').removeSharecodesByOthers(card, user_id);
                const process_card = (_card) => {
                    // 删除共享查看者不应该看到的数据
                    delete _card.card_members;
                    delete _card.member_roles;
                    delete _card.creator;
                    delete _card.followed_bies;
                    delete _card.mm_thread;
                    delete _card.share_codes;
                    // 删除添加的临时数据
                    if(card.isSubCard){
                        delete card.isSubCard
                    }
                    const enables = _share_code.props?.filter(i => i.enable)?.map(j => j.val);
                    // console.log('enables', enables)
                    if(_card.card_kanban && !enables.includes('card_kanban')){
                        delete _card.card_kanban;
                    } else if(_card.card_kanban?.columns?.length > 0){
                        _card.card_kanban = {
                            ..._card.card_kanban,
                            columns: _card.card_kanban.columns?.map(column => ({
                                ...column,
                                cards: column.cards?.map(subCard => process_card(subCard))
                            }))
                        }
                    }
                    if(!enables.includes('card_todo')){
                        delete _card.todogroups;
                    }
                    if(!enables.includes('card_documents')){
                        delete _card.card_documents;
                    }
                    if(!enables.includes('card_storage')){
                        delete _card.storage;
                    }
                    if(!enables.includes('card_schedule')){
                        delete _card.schedule;
                    }
                    _card.props = _share_code.props
                    return _card
                }
                // 需要Mattermost商业版授权，这里通过开关来控制是否加入Mattermost group
                let join_feedbackGroup = false
                if(user_id && join_feedbackGroup && card?.mm_feedback_group){
                    const user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id,{
                        fields: ['id','username','email','mm_profile'],
                    })
                    if(user?.mm_profile && card?.mm_feedback_group){
                        const mmapi = strapi.plugin('mattermost').service('mmapi');
                        const group_id = card?.mm_feedback_group.id;
                        const users = [user?.mm_profile.id];
                        await mmapi.addToGroup(group_id,users);
                    }
                }
                // console.log('card', card)
                if(feedback){
                    ctx.body = card.feedback
                } else {
                    ctx.body = process_card(card);
                }
            } else {
                ctx.throw(404, '无效的共享码')
            }
        }
        
        if(!findBySharecode){
            const collection = 'card'
            const { read } = await strapi.service('api::card.card').clac_finalAuth_byCardID(card_id,user_id, collection);
            const belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(card_id);
            
            if(read && feedback && card.feedback){
                const _gid_feedback = card.feedback.id
                const _feedback = await strapi.entityService.findOne('api::todogroup.todogroup',_gid_feedback,{
                    populate: {
                        todos: {
                            populate: {
                                attachment: {
                                    fields: ['id','ext','url']
                                }
                            }
                        }
                    }
                })
                if(_feedback) {
                    return _feedback
                }
            } else if (read) {
                const processReturnData = async () => {
                    // 只有在开启card弹框时，才会触发findOne，在此时再选择是否添加对应模块，
                    // 如果用户设置card的类型非task、或者从来没有开启过card详情，没有必要附加从来都不用的模块
                    // 因此此时再选择新建某些模块
                    const res = await strapi.service('api::card.card').initFullCard(card)
                    if(res) {
                        if(card.schedule?.share_codes){
                            card.schedule.share_codes = card.schedule?.share_codes.map(i => i.creator.id === user_id);
                        }
                        if(card.share_codes?.length > 0){
                            card = strapi.service('api::card.card').removeSharecodesByOthers(card);
                        }
                        if(belongedInfo){
                            // 向前端反馈“所属”数据，可以根据需要在此处删除多余 或 敏感 数据
                            if(belongedInfo.belonged_project){
                                belongedInfo.belonged_project = {
                                    id: belongedInfo.belonged_project.id
                                }
                            }
                            if(belongedInfo.belonged_card){
                                belongedInfo.belonged_card = {
                                    id: belongedInfo.belonged_card.id
                                }
                            }
                            card.belongedInfo = belongedInfo
                        }
                        return card
                    } else {
                        ctx.throw(500, '初始化数据时出错, 如果您不是在调试时看到此信息，请联系管理人员')
                    }
                }
                return processReturnData()
            } else {
                ctx.throw(401, '您无权访问该数据');
                return
            }
        }
    },
    async findShareCardStorage(ctx) {
        const { card_id, storage_id } = ctx.params;
        const { share_code, share_by } = ctx.request.query;
        if((!share_code || !share_by) && (share_code || share_by)){
            ctx.throw(404, '无效的共享连接')
        }
        
        let isValid;
        const check_sharecode = (_share_codes) => {
            let _share_code
            if(_share_codes?.length > 0 && _share_codes.map(i => i.code).includes(share_code)){
                _share_code = _share_codes.find(i => i.code === share_code);
            }
            
            if(_share_code){
                // console.log('共享连接',_share_code.creator?.id, share_by)
                if(_share_code.creator?.id !== Number(share_by)){
                    ctx.throw(404, '无效的共享连接')
                }

                const now = new Date ();
                if(_share_code.disable){
                    ctx.throw(400, '该共享码已被禁用')
                } else if(_share_code.max_count < 1){
                    ctx.throw(400, '该共享码已超过使用次数')
                } else if(_share_code.up_time && _share_code.up_time < new Date ()){
                    ctx.throw(400, '该共享码已超过使用期限')
                } else {
                    return true
                }
            } else {
                return false
            }
        };
        const card = await strapi.entityService.findOne('api::card.card',card_id,{
            populate: {
                share_codes: {
                    populate: {
                        creator: {
                            fields: ['id']
                        }
                    }
                }
            }
        })
        if(cant_share_as_types.includes(card.type)){
            ctx.throw(403,'当前类型内容不能通过分享查看')
        }
        if(card?.disable_share){
            ctx.throw(400, '当前内容共享已被禁止')
        } else if(card?.share_codes){
            isValid = check_sharecode(card?.share_codes);
            const find_belongedCard_byStorageID = async (_storage_id) => {
                const _storage = await strapi.entityService.findOne('api::storage.storage',_storage_id,{
                    populate: {
                        storage: {
                            fields: ['id']
                        },
                        belonged_card: {
                            populate: {
                                share_codes: {
                                    populate: {
                                        creator: {
                                            fields: ['id']
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
                if(_storage?.belonged_card?.share_codes){
                    isValid = check_sharecode(_storage?.belonged_card?.share_codes);
                } else if(_storage?.storage && !isValid){
                    await find_belongedCard_byStorageID(_storage?.storage.id)
                } else {
                    ctx.throw(403,'提取码有误，请检查')
                }
            }
            if(isValid){
                const res = await strapi.entityService.findOne('api::storage.storage',storage_id,{
                    populate: {
                        sub_folders: true,
                        storage_files: {
                            populate: {
                                file: {
                                    fields: ['id','ext','url']
                                }
                            }
                        }
                    }
                })
                if(res){
                    return res
                }
            }
        } else {
            ctx.throw(403,'所属共享卡片不存在')
        }
    },
    async checkPaied(ctx) {
        /** 
            要求前端提供数据格式：
            {
                subject: 'card', //购买的商品类型，
                data: {
                    check_ids: [***] // 需要检查的商品id的数组
                }
            }
        */
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if (!user_id) {
            ctx.throw(401, '您无权访问该数据');
        }
    
        const { subject, data } = ctx.request.body;
        if (!subject) {
            ctx.throw(403, '需要提供购买商品的类型');
        }
    
        if (subject === 'card' && Array.isArray(data?.check_ids)) {
            if (data.check_ids.length === 0) {
                return [];
            }
    
            // Promise.all 等待所有异步操作完成
            const results = await Promise.all(
                data.check_ids.map(async (card_id) => {
                    const isCreator = await strapi.service('api::card.card').isCreator(card_id,user_id);
                    const isPaied = await strapi.service('api::order.order').ispaied(user_id, card_id);
                    const cardState = { isCreator, isPaied }
                    return {
                        card_id,
                        cardState
                    };
                })
            );
    
            return results;
        }
    }
}));