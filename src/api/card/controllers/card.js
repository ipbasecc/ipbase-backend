// @ts-nocheck
'use strict';

/**
 * card controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::card.card',({strapi}) => ({
    async find(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const page = Number(ctx.query.page);
        const per_page = Number(ctx.query.per_page);
        const team_id = Number(ctx.query.team_id);

        // console.log('team_id', team_id)
        if(!page || !per_page){
            ctx.throw(400, '需要提供分页数据')
        }
        const cards = await strapi.entityService.findMany('api::card.card',{
            start: (page - 1) * per_page,
            limit: per_page,
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
                            fields: ['ext','url']
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
        return {cards,total,page,per_page}
    },
    async findFollowed(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const page = Number(ctx.query.page);
        const per_page = Number(ctx.query.per_page);
        const team_id = Number(ctx.query.team_id);

        if(!page || !per_page){
            ctx.throw(400, '需要提供分页数据')
        }
        if(!page > 1){
            ctx.throw(500, '首页内容已经加载')
        }
        const cards = await strapi.entityService.findMany('api::card.card',{
            limit: per_page,
            start: (page -1) * per_page,
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

        return {cards,total,page,per_page}
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
        const belongedInfo = await strapi.service('api::column.column').find_belongedInfo_byColumnID(column_id);
        if(belongedInfo){
            let members;
            const calc_auth = (members,member_roles) => {
                // @ts-ignore
                const {ACL, is_blocked, role_names} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
                if(is_blocked){
                    ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
                }

                // @ts-ignore
                const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'card');
                auth = create

            }
            if(belongedInfo.belonged_project){
                belonged_project = belongedInfo.belonged_project;
                members = belongedInfo.belonged_project.project_members;
                const member_roles = belongedInfo.belonged_project.member_roles;
                calc_auth(members,member_roles);
            }
            if(belongedInfo.belonged_card && !auth){
                members = belongedInfo.belonged_card.card_members;
                const member_roles = belongedInfo.belonged_card.member_roles;
                calc_auth(members,member_roles);
            }
        } else {
            ctx.throw(404, '分栏ID有误，没有找到其所属项目')
        }

        if(auth) {
            // console.log(user_id,belonged_project?.id)
            const member_byCurUser = await strapi.service('api::project.project').find_projectMemberByUID(user_id,belonged_project?.id);
            if(!member_byCurUser){
                ctx.throw(404, '没有找到对应的团队成员')
            }
            // console.log(member_byCurUser);
            let init_member_roles = await strapi.service('api::card.card').initRole(user_id,member_byCurUser);
            let member_roles = init_member_roles?.roles?.map(i => i.value.id);

            // console.log('member_byCurUser',member_byCurUser)
            var now = new Date();
            var iso = now.toISOString();
            let cardEntry;
            let new_overview_media = void 0;
            if(data.media){
                new_overview_media = data.media;
                delete data.media
            }
            let new_overview = await strapi.entityService.create('api::overview.overview',{
                data: {
                    name: 'Initial_Version',
                    media: new_overview_media,
                    publishedAt: iso
                }
            })
            if(new_overview && init_member_roles){
                let params = data;
                params.overviews = [new_overview.id];
                params.default_version = new_overview.id;
                // params.creator = user_id;
                params.publishedAt = iso;
                params.type = data.type ? data.type : 'todo';
                if(!params.status){
                    params.status = 'pending'
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
                // console.log('params.card_members',params.card_members)
                cardEntry = await strapi.entityService.create('api::card.card', {
                    data: params,
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
                        }
                    }
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
                    if(columnEntry.kanban.type === 'kanban') {
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

                    if(belonged_project?.mm_channel){
                        const mmChannel_id = belonged_project?.mm_channel?.id
                        const mmapi = strapi.plugin('mattermost').service('mmapi');
                        let params = {
                            "channel_id": mmChannel_id,
                            "message": `新建卡片：${cardEntry.name ? cardEntry.name : 'id:' + cardEntry.id}`,
                            "props": {
                                "strapi": {
                                "data": {
                                    "is": "card",
                                    "by_user": user_id,
                                    "action": "cardCreated",
                                    "column_id": columnEntry.id,
                                    "body": cardEntry,
                                },
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
                            return update
                        } else {
                          return cardEntry
                        }
                    } else {
                        return cardEntry
                    }
                }
            };

        } else {
            ctx.throw(401, '您无权在此处创建卡片')
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
        // 如果有收到更新mm_thread的请求，直接从Mattermost读取当前卡片的thread并直接更新
        // 此处无须返回，前端Mattermost的thread并更新UI，这里只是更新Strapi中的数据，方便下次读取
        if(data.data?.mm_thread?.id === card.mm_thread.id){
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

        const { read, create, modify, remove, is_blocked, role_names, ACL, authed_fields } =
            await strapi.service('api::card.card').clac_finalAuth_byCardID(card_id,user_id);
        auth = modify;
        // console.log('auth',auth, authed_fields);
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
                const _targetMember = card.card_members.find(i => i.id === data?.remove_member);
                _targetMember?.member_roles?.map(async(i) => {
                    await strapi.entityService.update('api::member-role.member-role', i.id, {
                        data: {
                            members: {
                                disconnect: [ data?.remove_member ]
                            }
                        }
                    })
                })
                await strapi.entityService.update('api::card.card', card_id, {
                    data: {
                        card_members: {
                            disconnect: [ data?.remove_member ]
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
            const populate = strapi.service('api::card.card').card_populate_template();
            const update = await strapi.entityService.update('api::card.card', card_id,{
                data: params,
                populate: populate
            });
            if(update) {
                const card = strapi.service('api::card.card').removeSharecodesByOthers(update, user_id);
                if(belongedInfo?.belonged_project){
                    card.belonged_project = belongedInfo.belonged_project.id;
                }
                if(belongedInfo?.belonged_card){
                    card.belonged_card = belongedInfo.belonged_card.id;
                }
                const res = await strapi.service('api::card.card').initFullCard(card)
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

        const { remove } = await strapi.service('api::card.card').clac_finalAuth_byCardID(card_id,user_id);

        if(remove) {
            const _card = await strapi.entityService.delete('api::card.card', card_id);
            if(_card) {
                return _card
            }
        } else {
            ctx.throw(401, '您无权访问该数据')
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

        const { share_code, share_by, feedback } = ctx.request.query;
        if((!share_code || !share_by) && (share_code || share_by)){
            ctx.throw(404, '无效的共享连接')
        }

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
            findBySharecode = true
            let card = await strapi.service('api::card.card').find_cardByID(card_id);
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
            const { read } = await strapi.service('api::card.card').clac_finalAuth_byCardID(card_id,user_id);
            const belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(card_id);
            let card = await strapi.service('api::card.card').find_cardByID(card_id);

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
            }

            if(read) {
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
                }
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
        if(card?.share_codes){
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
    }
}));
