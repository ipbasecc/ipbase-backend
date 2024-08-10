// @ts-nocheck
'use strict';

/**
 * project controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

// 结构优化功能、待确定
// const { getPermission } = require ('../../../services/getPermission.js')

module.exports = createCoreController('api::project.project',({strapi}) => ({
    async find(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const page = Number(ctx.query.page);
        const per_page = Number(ctx.query.per_page);

        if(!page || !per_page){
            ctx.throw(400, '需要提供分页数据')
        }
        if(!page > 1){
            ctx.throw(500, '首页内容已经加载')
        }
        let projects
        let total
        const _projects = await strapi.entityService.findMany('api::project.project',{
            limit: per_page,
            start: (page -1) * per_page,
            filters: {
                project_members: {
                    by_user: {
                    id: user_id,
                }
            }},
            populate: {
                overviews: {
                    populate: {
                        media: {
                            fields: ['ext','url']
                        }
                    }
                },
                project_members: {
                    populate: {
                        member_roles: {
                            fields: ['subject']
                        },
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
        })
        if(_projects){
            projects = _projects.filter(i => i.publishedAt != null);
            projects = projects.map((i) => {
                let _ = i.project_members?.find(i => i.by_user.id === user_id)
                // console.log('_',_);
                let __ = _.member_roles?.filter(j => j.subject === 'unconfirmed')
                // console.log('__',__);
                const unconfirmed = __?.length === 1 && __[0].subject === 'unconfirmed';
                return unconfirmed && {
                    id: i.id,
                    name: i.name,
                    description: i.description,
                    overviews: i.overviews,
                    unconfirmed: true
                } || i;
            });

            // 获取 _cards 的总数
            total = await strapi.query('api::project.project').count({
                project_members: {
                    by_user: {
                        id: user_id,
                    },
                },
            });

            return {projects,total,page,per_page}
        } else {
            projects = [];
            total = 0;
            return {_empty,total,page,per_page}
        }
    },
    async findOne(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const proj_id = ctx.request.params.id;

        let auth;
        let __ACL;
        let fields_permission = []
        const project = await strapi.service('api::project.project').find_projectByID(proj_id);
        if(project){
            const {
                read, create, modify, remove, is_blocked, role_names, ACL
            } = await strapi.service('api::project.project').clac_project_auth(project, user_id);
            auth = read
            __ACL = ACL
            // console.log('auth',auth,'ACL',__ACL);

            let authed_fields = strapi.service('api::project.project').clac_authed_fields(ACL,'project');
            fields_permission = [...fields_permission, ...authed_fields];

            if(is_blocked){
                ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
            } else if(project?.publishedAt == null) {
                ctx.throw(404, '项目已归档，您无权查看')
            } else if(role_names.includes('unconfirmed')){
                return '您已加入项目，请等待管理员核验后再访问'
            } else if(role_names.includes('external') && auth){
                let allCards_for_externalMember = await strapi.service('api::project.project').find_allCard_for_externalMember(project,user_id);
                if(allCards_for_externalMember){
                    let _project = {
                        id: project.id,
                        name: project.name,
                        description: project.description,
                        type: project.type,
                        jsonContent: project.jsonContent,
                        overviews: project.overviews,
                        default_version: project.default_version,
                        mm_channel: project.mm_channel,
                        cards: allCards_for_externalMember,
                        isExternal: true
                    }
                    return _project
                }
            }
        }
        const process_schedule_share = (project) => {
            let _project = project
            let schedules = project.schedules.map((i) => ({
              ...i,
              share_codes: i.share_codes.filter(j => j.creator.id == user_id)
            }))
            _project.schedules = schedules;
            return _project
        }
        if(project?.type === 'O') {
            return process_schedule_share(project)
        }

        if(auth && __ACL){
            // console.log('ACL',__ACL);
            const response = strapi.service('api::project.project').process_response(project,__ACL);
            if(auth) {
                return process_schedule_share(response)
            } else {
                return '您无权访问该项目'
            }
        }
    },
    async update(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { id } = ctx.params;
        const data = ctx.request.body
        // console.log(data);

        if(!data){
            ctx.throw(500, '需要提供修改数据')
        }

        let auth;
        let fields_permission = [];
        let orderBoards;
        let orderSchedules;
        let orderDocuments;
        let __ACL
        const project = await strapi.service('api::project.project').find_projectByID(id);
        if(project){
            const {
                read, create, modify, remove, is_blocked, role_names, ACL
            } = await strapi.service('api::project.project').clac_project_auth(project, user_id);
            auth = modify

            __ACL = ACL

            let authed_fields = strapi.service('api::project.project').clac_authed_fields(ACL,'project');
            fields_permission = [...fields_permission, ...authed_fields];


            function arraysEqual(arr1, arr2) {
                const set1 = new Set(arr1);
                const set2 = new Set(arr2);
                return set1.size === set2.size;
            }

            if(data.boards){
                const project_boards_ids = project.boards.map(i => Number(i.id));
                const number_it = data.boards.map(i => Number(i));

                if(arraysEqual(project_boards_ids,number_it)){
                    let authed_fields_of_board = strapi.service('api::project.project').clac_authed_fields(ACL,'board');
                    orderBoards = authed_fields_of_board.includes('order')
                    // console.log(orderBoards);
                } else {
                    ctx.throw(404, '错误的任务集ID列表')
                }
            }

            if(data.schedules){
                const project_schedules_ids = project.schedules.map(i => Number(i.id));
                const number_it = data.schedules.map(i => Number(i));

                if(arraysEqual(project_schedules_ids,number_it)){
                    let authed_fields_of_schedule = strapi.service('api::project.project').clac_authed_fields(ACL,'schedule');
                    orderSchedules = authed_fields_of_schedule.includes('order')
                } else {
                    ctx.throw(404, '错误的规划ID列表')
                }
            }

            if(data.project_documents){
                const project_documents_ids = project.project_documents.map(i => Number(i.id));
                const number_it = data.project_documents.map(i => Number(i));

                if(arraysEqual(project_documents_ids,number_it)){
                    let authed_fields_of_documents = strapi.service('api::project.project').clac_authed_fields(ACL,'document');
                    orderDocuments = authed_fields_of_documents.includes('order')
                    // console.log(orderDocuments);
                } else {
                    ctx.throw(404, '错误的文档ID列表')
                }
            }

            if(is_blocked){
                auth = false
                ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
            } else if(project?.publishedAt == null) {
                auth = false
                ctx.throw(404, '项目已归档，不能修改')
            } else if(role_names.includes('unconfirmed')){
                auth = false
                return '您已加入项目，请等待管理员核验后再访问'
            }else if(role_names.includes('external')){
                auth = false
                ctx.throw(400, '外部成员不允许修改项目')
            }
        }

        // console.log('auth',auth);
        if(auth) {
            const props = {
                orderBoards: orderBoards,
                orderSchedules: orderSchedules,
                orderDocuments: orderDocuments
            }
            let params = await strapi.service('api::project.project').process_updateProject_params(data,fields_permission,props);
            const populate = strapi.service('api::project.project').response_template();
            const update = await strapi.entityService.update('api::project.project',id, {
                data: params,
                populate: populate
            })
            let _mm_channel
            if(update.mm_channel){
                _mm_channel = await strapi.service('api::team-channel.team-channel').tickWsSyncByChannle(update);
            }
            let response = strapi.service('api::project.project').process_response(update,__ACL);
            if(_mm_channel?.data){
              response.mm_channel = _mm_channel.data
            }

            return response
        } else {
            ctx.throw(401, '您无权执行此操作')
        }
    },
    async create(ctx) {
        await this.validateQuery(ctx);
        const { roleBase } = require ('./role_template');
        const { preferenceBase } = require ('./preference_template.js');
        const user_id = Number(ctx.state.user.id);
        const data = ctx.request.body;

        if(!user_id) {
            ctx.throw(401, '您无权执行此操作')
        } else {
            let user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id);
            if(user?.blocked){
                ctx.throw(401, '当前账户被禁用，如需解禁，请联系管理员申诉')
            }
        }
        // 未来可能允许用户创建独立的项目，而不是隶属于某个团队的项目
        // 因此可以允许by_team为空，但是如果by_team不为空，则要鉴权
        let team
        let _member_by_team
        if(data.by_team){
            team = await strapi.service('api::team.team').findTeamByID(data.by_team);
            _member_by_team = await strapi.service('api::team.team').findTeamMemberByUserID(user_id,data.by_team);
            if(!_member_by_team){
                ctx.throw(404, '没有找到对应的团队成员')
            }
            let auth
            const _memberRole_by_team = await strapi.service('api::team.team').findTeamRoleByMember(_member_by_team.id, data.by_team?.id, 'project');
            if(_memberRole_by_team){
                const { create } = _memberRole_by_team;
                auth = create
            };
            if(!auth) {
                ctx.throw(401, '您没有新建项目的权限')
            }
        }

        let now = new Date();
        let iso = now.toISOString();
        let new_overview;
        let new_column;
        let new_kanban;
        let new_group;
        let new_board;
        let new_project;
        let new_schedule;
        const init_member_roles = await strapi.service('api::project.project').initRole(user_id,team);
        if(init_member_roles){
            new_overview = await strapi.entityService.create('api::overview.overview',{
                data: {
                    name: 'Initial_Version',
                    version: 1,
                    publishedAt: iso,
                    media: {
                        // 新建项目时，可能会提前指定预览图、如果没有指定，则默认给一个预览、在env中设置 strapi的 media ID
                        set: [data.overview_media || process.env.DEFAULT_PROJECT_OVERVIEW_MEIDA]
                    }
                }
            })
        }
        new_column = await strapi.entityService.create('api::column.column',{
            data: {
                name: 'Initial_Column',
                publishedAt: iso,
                status: 'pending'
            }
        })
        if(new_column){
            new_kanban = await strapi.entityService.create('api::kanban.kanban',{
                data: {
                    title: 'Initial_Kanban',
                    columns: {
                        connect: [new_column.id]
                    },
                    publishedAt: iso
                }
            })}
        if(new_kanban){
            new_group = await strapi.entityService.create('api::group.group',{
                data: {
                    name: 'Initial_Group',
                    kanbans: {
                        connect: [new_kanban.id]
                    },
                    publishedAt: iso
                }
            })}
        if(new_group){
            new_board = await strapi.entityService.create('api::board.board',{
                data: {
                    name: 'Workspace',
                    groups: {
                        connect: [new_group.id]
                    },
                    publishedAt: iso
                }
            })
        }
        if(new_board){
            new_schedule = await strapi.entityService.create('api::schedule.schedule',{
                data: {
                    name: 'Project_schedule',
                    type: 'P',
                    can_read_user: {
                        set: [user_id]
                    },
                    can_write_user: {
                        set: [user_id]
                    },
                    publishedAt: iso
                }
            })
        }
        if(new_schedule){
            let preferences = await preferenceBase();
            new_project = await strapi.entityService.create('api::project.project',{
                data: {
                    name: data.name,
                    description: data.description || '',
                    type: data.type || 'P',
                    publishedAt: iso,
                    preferences: preferences,
                    project_members: {
                        set: init_member_roles.members?.map(i => i.id)
                    },
                    member_roles: {
                        set: init_member_roles.roles?.map(i => i.value.id)
                    },
                    overviews: {
                        connect: [new_overview.id]
                    },
                    default_version: new_overview.id,
                    boards: {
                        connect: [new_board.id]
                    },
                    schedules: {
                        connect: [new_schedule.id]
                    },
                    creator: {
                        set: [user_id]
                    },
                    by_team: {
                        set: [data.by_team]
                    },
                    mm_channel: data.mm_channel
                },
                populate: {
                    overviews: {
                        populate: {
                            media: {
                                fields: ['ext','url']
                            }
                        }
                    }
                }
            })
        }
        return new_project
    },
    async delete(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { id } = ctx.params;
        let option = ctx.query.option;


        let auth;
        const project = await strapi.service('api::project.project').find_projectByID(id);
        if(project){
            const {
                read, create, modify, remove, is_blocked, role_names
            } = await strapi.service('api::project.project').clac_project_auth(project, user_id);
            auth = remove

            if(is_blocked){
                auth = false
                ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
            } else if(role_names.includes('unconfirmed')){
                auth = false
                return '您无权删除当前项目'
            }else if(role_names.includes('external')){
                auth = false
                ctx.throw(400, '外部成员不允许删除项目')
            }
        }

        if(auth) {
            // 先发送一条消息，项目被删除了
            const mmChannel_id = project.mm_channel?.id;

            const mmapi = strapi.plugin('mattermost').service('mmapi');
            let params = {
                "channel_id": mmChannel_id,
                "message": `当前项目已经被删除`,
                "props": {
                    "strapi": {
                        "data": {
                            "is": 'project',
                            "by_user": user_id,
                            "project_id": project.id,
                            "action": 'delete'
                        }
                    }
                }
            }
            const res = await mmapi.createPost(params);
            if(res){
                // 从Mattermost中删除此频道
                await mmapi.deleteChannel(mmChannel_id);
            }
            if(option === 'archive') {
                const update_project = await strapi.entityService.update('api::project.project',id,{
                    data: {
                        publishedAt: null
                    },
                    fields: ['id']
                })
                // 如果后期用户需要恢复归档，那么需要调用Mattermost的恢复频道API
                // 同时恢复该项目关联的Mattermost频道
                if(update_project) return update_project
            } else {
                const delete_project = await strapi.entityService.delete('api::project.project',id);
                if(delete_project) {
                    return delete_project
                }
            }
        } else {
            ctx.throw(401, '您无权删除该项目')
        }
    },
    async genInvite(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let { project_id } = ctx.params;
        project_id = Number(project_id);
        const data = ctx.request.body

        let auth
        const project = await strapi.service('api::project.project').find_projectByID(project_id);
        if(project){
            const members = project.project_members
            const member_roles = project.member_roles;
            // console.log('members',members);
            const {ACL, is_blocked, role_names} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);

            auth = strapi.service('api::project.project').calc_field_ACL(ACL,'project','invite_uris');

            if(is_blocked || role_names.includes('unconfirmed') || role_names.includes('external')){
                auth = false
                return '您无权邀请用户'
            }
        }


        if(auth) {
            function makeid (length) {
                let result = '';
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                const charactersLength = characters.length;
                for (let i = 0; i < length; i++) {
                result += characters.charAt (Math.floor (Math.random () * charactersLength));
                }
                return result;
            }
            let invite_code = makeid(24);
            let _invite_uris = project.invite_uris;
            let new_invite_uri = {
                invite_code: invite_code,
                max_total: data.max_total,
                up_time: data.up_time,
                invitor: user_id
            }
            _invite_uris.push(new_invite_uri);
            const update_project = await strapi.entityService.update('api::project.project',project_id,{
                data: {
                    invite_uris: _invite_uris
                },
                populate: {
                    invite_uris: {
                        populate: {
                            invitor: {
                                fields: ['id']
                            },
                            was_invited: {
                                fields: ['id']
                            }
                        }
                    }
                }
            })
            if(update_project) {
                // console.log(update_project);
                return new_invite_uri
            }

        } else {
            ctx.throw(401, '您无权删除该项目')
        }
    },
    async visitInvite(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { project_id, invite_code } = ctx.params;
        if(!user_id) {
            ctx.throw(401, '请先登陆')
            return
        }
        if(!project_id) {
            ctx.throw(401, '缺少项目ID')
            return
        }
        if(!invite_code) {
            ctx.throw(401, '缺少邀请码')
            return
        }
        const project = await strapi.service('api::project.project').find_projectByID(project_id);
        if(project){
            // 判断当前邀请码是不是有效的
            const invite = project.invite_uris.find(i => i.invite_code === invite_code);
            // console.log('invite',invite);
            if(!invite){
                ctx.throw(400, '邀请码无效')
            } else {
                const isCreator = invite.invitor.id === user_id;
                if(isCreator){
                    const data = {
                        props: 'isCreator',
                        message: '您是该邀请链接的创建者，请直接进入项目。'
                    }
                    return data
                }
                // 对比当前时间与截至时间
                let currentDate = new Date ().toISOString ();
                let endDate = invite.up_time;
                let currentDateObj = new Date (currentDate);
                let endDateObj = new Date (endDate);
                let currentTimeStamp = currentDateObj.getTime ();
                let endTimeStamp = endDateObj.getTime ();

                if(invite.max_total === invite.was_inviteds.length) {
                    invite.enable = false; // todo 待验证
                    // ctx.throw(401, '该邀请链接已超过使用次数');
                    const res = {
                        error: {
                            message: '该邀请链接已超过使用次数'
                        }
                    }
                    return res
                } else if(invite.up_time && endTimeStamp < currentTimeStamp) {
                    // ctx.throw(401, '该邀请链接已过保质期');
                    const res = {
                        error: {
                            message: '邀请码已过有效期'
                        }
                    }
                    return res
                }
            }

            const {
                read, create, modify, remove, is_blocked, role_names
            } = await strapi.service('api::project.project').clac_project_auth(project, user_id);

            const isUnconfirmed = role_names.includes('unconfirmed');
            if(isUnconfirmed) {
                // ctx.throw(204, '您已经接受了邀请，请等待项目管理员审核')
                const res = {
                    error: {
                        message: '您已经接受了邀请，请等待项目管理员审核'
                    }
                }
                return res
            }

            if(is_blocked){
                ctx.throw(401, '您已被项目管理员屏蔽，如需申诉，请联系管理员')
            } else {
                let __ = project.invite_uris.find(i => i.invite_code == invite_code)
                let res = {
                    name: project.name,
                    message: __.message,
                    by: {
                        username: __.invitor.username,
                        avatar: __.invitor.profile.avatar,
                    }
                }
                return res
            }
        }

    },
    async acceptInvite(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id) {
            ctx.throw(401, '登陆后才能使用邀请链接')
        }
        const { project_id, invite_code } = ctx.params;
        if(!project_id) {
            ctx.throw(401, '项目ID不能缺少')
        }
        let isInvitor;
        let isUnconfirmed;
        let invite;
        let unconfirmed_memberRole;
        const project = await strapi.service('api::project.project').find_projectByID(project_id);
        if(project){
            // 如果项目没有未确认角色，那么先创建一个
            unconfirmed_memberRole = project.member_roles?.find(i => i.subject === 'unconfirmed')?.id || null;
            if(!unconfirmed_memberRole){
                const { roleBase } = require('../services/roleBase.js');
                const __ = await roleBase();
                const role_base = __.find(i => i.role === 'unconfirmed')

                const new_memberRole = await strapi.entityService.create('api::member-role.member-role',{
                    data: {
                        by_project: project.id,
                        subject: role_base.role,
                        ACL: role_base.ACL,
                    }
                })
                if(new_memberRole){
                    unconfirmed_memberRole = new_memberRole.id
                }
            }
            // 获取当前用户的角色信息，用来判断是不是已经是项目成员了
            const {
                read, create, modify, remove, is_blocked, role_names
            } = await strapi.service('api::project.project').clac_project_auth(project, user_id);
            // 判断当前邀请码是不是有效的
            invite = project.invite_uris.find(i => i.invite_code === invite_code);
            if(!invite){
                ctx.throw(400, '邀请码无效')
            } else {
                // 对比当前时间与截至时间
                let currentDate = new Date ().toISOString ();
                let endDate = invite.up_time;
                let currentDateObj = new Date (currentDate);
                let endDateObj = new Date (endDate);
                let currentTimeStamp = currentDateObj.getTime ();
                let endTimeStamp = endDateObj.getTime ();

                if(invite.max_total === invite.was_inviteds.length) {
                    invite.enable = false; // todo 待验证
                    ctx.throw(401, '该邀请链接已超过使用次数');
                    return
                } else if(invite.up_time && endTimeStamp < currentTimeStamp) {
                    ctx.throw(401, '该邀请链接已过保质期');
                    return
                }
            }

            isInvitor = project.invite_uris.map(i => i.invitor.id === user_id && i.invite_code).includes(invite_code);
            isUnconfirmed = role_names.includes('unconfirmed');
            if(isUnconfirmed) {
                ctx.throw(204, '您已经接受了邀请，请等待项目管理员审核')
            }
            if(isInvitor && !isUnconfirmed) {
                ctx.throw(204, '您是该邀请链接的创建者，可以直接进入项目，无需使用此链接')
            }

            if(is_blocked){
                ctx.throw(401, '您已被项目管理员屏蔽，如需申诉，请联系管理员')
            }
        }
        // console.log(project);
        if(invite) {
            // 是否已经是团队成员了
            let teamMember = await strapi.service('api::team.team').findTeamMemberByUserID(user_id,project.by_team?.id);
            // 如果不是，加入团队并设为普通成员，并加入所有开放频道
            if(!teamMember){
                const team = project.by_team;
                const member_role_of_team = team.member_roles.find(i => i.subject === 'member');
                teamMember = await strapi.service('api::team.team').addUser(team, user_id, member_role_of_team?.id);
                await strapi.service('api::team.team').joinPublicChannel(team,teamMember);
            }
            const add_user_to_project = await strapi.service('api::project.project').addUser(project, teamMember, unconfirmed_memberRole)

            if(add_user_to_project) {
                // 将当前用户添加到受邀请成员中
                invite.was_inviteds.push({ id: user_id });
                // 项目邀请列表中先移除当前操作的邀请
                project.invite_uris = project.invite_uris.filter(i => i.invite_code != invite_code);
                // 再将已经已添加受邀成员的链接加回项目邀请列表
                project.invite_uris.push(invite);
                // 定义完整的新的邀请链接列表，供更新项目时使用
                let new_invite_uris = project.invite_uris;
                // console.log('new_invite_uris',new_invite_uris,'role',role);

                // 处理邀请码的可用次数
                let index = new_invite_uris.findIndex(i => i.invite_code == invite_code);
                if (index > -1) {
                    if (new_invite_uris[index].max_total > 0) {
                        new_invite_uris[index].max_total--;
                    }
                }
                // 更新项目邀请码
                const update_project = await strapi.entityService.update('api::project.project',project_id, {
                    data: {
                        invite_uris: new_invite_uris
                    },
                    populate: {
                        invite_uris: {
                            populate: {
                                invitor: {
                                    fields: ['id']
                                },
                                was_inviteds: {
                                    fields: ['id']
                                }
                            }
                        }
                    }
                })
                // 项目更新完毕以后，发送一条申请加入的消息，由管理人员继续操作
                if(update_project) {
                    return add_user_to_project
                }
            }
        }
    },
    async removeUser(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { project_id } = ctx.params;
        const body = ctx.request.body
        const removeMember_id = Number(body.data.removeMember_id)


        let auth //鉴权当前用户
        let user_id_by_willRemove // 将要移除的用户ID
        let isUnconfirmed // 将要移除的成员是否是“待确认”身份
        const project = await strapi.service('api::project.project').find_projectByID(project_id);
        const member = await strapi.entityService.findOne('api::member.member',removeMember_id,{
            populate: {
                by_user: {
                    fields: ['id']
                },
                by_project: {
                    fields: ['id']
                },
                member_roles: true
            }
        })
        if(project && member){
            user_id_by_willRemove = member.by_user.id;
            const members = project.project_members;
            const users = members.map(i => i.by_user.id);
            if(!users.includes(user_id_by_willRemove)){
                ctx.throw(503, '该成员不在本项目中')
            }

            isUnconfirmed = member.member_roles.map(i => i.subject).includes('unconfirmed');

            const member_roles = project.member_roles;
            const {ACL, is_blocked, role_names} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
            auth = strapi.service('api::project.project').calc_field_ACL(ACL,'project','manageMember');

            if(is_blocked){
                ctx.throw(401, '您已被项目管理员屏蔽，如需申诉，请联系管理员')
            }
        }

        if(auth) {
            let response = {}
            // “待确认”成员，要么一直没被转正，就一直不会在Mattermost频道中，要么被重新“待确认”，那在当时就已经被移出了Mattermost项目频道
            // 因此，如果将要移除的成员不是“待确认”身份，那么先将其移出Mattermost项目频道
            if(!isUnconfirmed){
                const cur_user_id = user_id
                response.mm_remove = await strapi.service('api::project.project').removeUer_from_mmChannel(project,cur_user_id,user_id_by_willRemove,removeMember_id)
            }
            const leave = await strapi.entityService.update('api::project.project',project_id, {
                data: {
                    project_members: {
                        disconnect: [removeMember_id]
                    }
                }
            })
            if(leave){
                response.leave = {
                    removedUser: user_id_by_willRemove
                }
            }
            return response

        } else {
            ctx.throw(401, '您无权执行此操作')
        }
    },
    async setRole(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { project_id } = ctx.params;
        const body = ctx.request.body.data
        // console.log(body);

        if(!user_id) {
            ctx.throw(401, '无效的登陆用户ID')
        }
        if(!project_id) {
            ctx.throw(401, '需要提供项目ID')
        }
        if(!body.member_id) {
            ctx.throw(401, '需要提供用成员ID')
        }
        if(!body.new_roles) {
            ctx.throw(401, '需要提供用户ID')
        }

        let auth;
        let unconfirmed_roleId;
        let project = await strapi.service('api::project.project').find_projectByID(project_id);
        if(project){
            const {
                read, create, modify, remove, is_blocked, role_names, ACL
            } = await strapi.service('api::project.project').clac_project_auth(project, user_id);
            unconfirmed_roleId = project.member_roles?.find(i => i.subject === 'unconfirmed')?.id;

            if(is_blocked){
                auth = false
                ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
            } else if(project?.publishedAt == null) {
                auth = false
                ctx.throw(404, '项目已归档，不能修改')
            } else if(role_names.includes('unconfirmed')){
                auth = false
                return '您无权执行此操作'
            }else if(role_names.includes('external')){
                auth = false
                ctx.throw(400, '外部成员不允许修改项目')
            }

            const projcet_members_roles_IDs = project.member_roles.map(i => i.id);
            const new_roles_isIN = body.new_roles.every(i => projcet_members_roles_IDs.includes(i));

            auth = new_roles_isIN && strapi.service('api::project.project').calc_field_ACL(ACL,'project','manageRole');
        }

        if(auth) {
            const member_id = Number(body.member_id);
            const target_member = await strapi.entityService.findOne('api::member.member',member_id,{
                populate: {
                    member_roles: true,
                    by_user: {
                        fields: ['id']
                    }
                }
            })

            // *****
            // *****
            // *****
            // 严重注意：在同一个team中，每个用户对应的成员只有一个
            // 但是这个成员在团队、频道、项目、卡片中可以对应不同的角色
            // 因此在设置角色时，务必注意要保留其它角色，仅更新当前所属功能区的角色
            // 例如，在设置频道角色时：逻辑应该是：
            // 1. 找出当前成员的所有角色；
            // 2. 删除找出的所有角色中数据频道的角色；
            // 3. 删除后剩余的所有角色与要设置的新角色拼接，作为当前成员的所有角色
            // *****
            // *****
            // *****
            const team = project.by_team;
            const all_userRoles = target_member.member_roles.map(i => i.id);
            // console.log('all_userRoles',all_userRoles);
            const all_projectRoles = project.member_roles.map(i => i.id);
            // console.log('all_projectRoles',all_projectRoles);
            const role_notBelongProject = all_userRoles.filter(i => !all_projectRoles.includes(i));
            // console.log('role_notBelongProject',role_notBelongProject);
            // 如果用户在team中是未确认状态，那么在频道中将其设置为其它角色时，同时将其在team中的角色设置为“成员”
            const UnconfirmedOfTeam = team.member_roles.find(i => i.subject === 'unconfirmed');
            const isUnconfirmedInTeam = team.members.some(i => i.by_user.id === user_id && i.member_roles.some(j => j.id === UnconfirmedOfTeam.id));
            if(isUnconfirmedInTeam){
                // 获取团队中角色：“成员”
                const memberRole_of_team = team.member_roles.find(i => i.subject === 'member');
                // 将该用户在Team中的“成员角色”设置为“成员”
                await strapi.entityService.update('api::member.member',member_id,{
                    data: {
                        member_roles: {
                            set: [memberRole_of_team.id, ...role_notBelongProject]
                        }
                    }
                })
            }
            // 如果该成员是从“待审核”状态转换到其它身份，那么将该成员拉入团队-项目频道中
            // addUser_to_mmChannel 方法已经包含了加入到Mattermost团队的动作
            let target_user_id
            if(target_member){
                target_user_id = target_member.by_user.id;
                const isUnconfirmed = target_member.member_roles?.filter(i => i.subject === 'unconfirmed')?.length > 0;
                const isExternal = target_member.member_roles?.filter(i => i.subject === 'external')?.length > 0;
                // console.log('isUnconfirmed',isUnconfirmed);
                if(isUnconfirmed || isExternal){
                    if(!body.new_roles.includes(unconfirmed_roleId)){
                        // console.log('addUser_to_mmChannel');
                        try {
                            await strapi.service('api::project.project').addUser_to_mmChannel(project,target_user_id,target_member);
                        } catch (error) {
                            console.error(error);
                        }
                    }
                } else {
                    // 如果要将目标成员的身份设置为“待审核”，那么将其移出项目Mattermost频道
                    // console.log('body.new_roles.includes(unconfirmed_roleId)',body.new_roles,unconfirmed_roleId);
                    if(body.new_roles.includes(unconfirmed_roleId)){
                        await strapi.service('api::project.project').remove_member_from_mmChannel(project,target_user_id,target_member);
                    }
                }
            }
            const update_member = await strapi.entityService.update('api::member.member',member_id,{
                data: {
                    member_roles: {
                        set: [...body.new_roles, ...role_notBelongProject]
                    }
                },
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
            })
            if(update_member){

                const channel_id = project.mm_channel?.id;
                const mmapi = strapi.plugin('mattermost').service('mmapi');
                let params = {
                    "channel_id": channel_id,
                    "message": `成员角色被更新`,
                    "props": {
                        "strapi": {
                            "data": {
                                "is": 'project',
                                "by_user": user_id,
                                "project_id": project.id,
                                "action": 'member_updated',
                                "updatedMember": update_member
                            }
                        }
                    }
                }
                await mmapi.createPost(params);
                project.project_members = project.project_members.map(i => i.id === member_id && update_member || i)
                // console.log('project.project_members',project.project_members,'update_member',update_member);
                return project
            }
        }
    },
    async mmFindOne(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let mm_channel_id = ctx.params.mm_channel_id;
        // console.log(mm_channel_id);

        // entityService 查询时需要ID，这里根据mm_channel_id来查询，因此使用 Query Engine API
        const project = await strapi.db.query('api::project.project').findOne({
            select: ['mm_channel_id','id'],
            where: { mm_channel_id: mm_channel_id }
        });
        if(project) {
            return project
        } else {
            return 'null'
        }
    }
}));
