'use strict';

/**
 * team controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::team.team',({strapi}) => ({
    async find(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id){
            ctx.throw(400, '请先登陆')
        } else {
            let user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id);
            if(user?.blocked){
                ctx.throw(401, '当前账户被禁用，如需解禁，请联系管理员申诉')
            }
        }

        let teams = await strapi.entityService.findMany('api::team.team',{
            filters: {
                members: {
                    by_user: {
                        id: user_id
                    }
                }
            },
            populate: {
                team_logo: {
                    fields: ['id','url','ext']
                },
                members: {
                    populate: {
                        by_user: {
                            fields: ['id']
                        },
                        member_roles: {
                            fields: ['subject']
                        }
                    }
                }
            }
        })
        if(teams){
            let filter = teams.filter(i => i.publishedAt);
            // @ts-ignore
            filter = filter?.length > 0 && filter.map((i) => {
                const user_roles = i.members?.filter(i => i.by_user.id === user_id).map(i => i.member_roles).flat(2);
                // console.log('user_roles',user_roles)
                const unconfirmeds = user_roles.filter(j => j.subject === 'unconfirmed');
                const blockeds = user_roles.filter(j => j.subject === 'blocked');
                // console.log('unconfirmeds',unconfirmeds)
                if(unconfirmeds?.length > 0){
                    delete i.members // 未正式加入的成员，不要向其发送成员数据
                    return {
                        ...i,
                        status: 'unconfirmed'
                    }
                } else if(blockeds?.length > 0){
                    delete i.members // 未正式加入的成员，不要向其发送成员数据
                    return {
                        ...i,
                        status: 'blocked'
                    }
                } else {
                    return i
                }
            })
            return filter
        }
    },
    async findOne(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let team_id = Number(ctx.params.id);
        if(!user_id){
            ctx.throw(400, '请先登陆')
        } else {
            let user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id);
            if(user?.blocked){
                ctx.throw(401, '当前账户被禁用，如需解禁，请联系管理员申诉')
            }
        }
        const populate = strapi.service('api::team.team').populate_template();
        let team = await strapi.entityService.findOne('api::team.team',team_id,{
            populate: populate
        })
        if(team){
            // @ts-ignore
            const user_members = team.members?.filter(i => i.by_user.id == user_id)

            const isIn = user_members?.length > 0;
            if(isIn){
                if(!team.publishedAt){
                    ctx.throw(404, '改团队已被归档')
                } else {
                    // @ts-ignore
                    if(team.team_channels?.length > 0){
                        // @ts-ignore
                        team.team_channels = team.team_channels.filter(i => i.publishedAt);
                    }

                    const isUnconfirmed = user_members.map(i => i.member_roles).flat(2).filter(j => j.subject === 'unconfirmed')?.length > 0
                    const isBlocked = user_members.map(i => i.member_roles).flat(2).filter(j => j.subject === 'blocked')?.length > 0
                    // console.log('status', isUnconfirmed, isBlocked)
                    if(isUnconfirmed){
                        const res = {
                            id: team.id,
                            name: team.name,
                            display_name: team.display_name,
                            team_logo: team.team_logo,
                            status: 'unconfirmed'
                        }
                        return res
                    } else if(isBlocked){
                        const res = {
                            id: team.id,
                            name: team.name,
                            display_name: team.display_name,
                            team_logo: team.team_logo,
                            status: 'blocked'
                        }
                        return res
                    } else {
                        const _team = await strapi.service('api::team.team').filterByAuth(team, user_id);
                        return _team
                    }
                }
            } else {
                ctx.throw(403, '仅限团队成员访问')
            }
        }
    },
    async create(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        // @ts-ignore
        const { data } = ctx.request.body;

        let user
        if(!user_id){
            ctx.throw(400, '请先登陆')
        } else {
            user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id,{
              populate: {
                config: true
              }
            });
            if(user?.blocked){
                ctx.throw(401, '当前账户被禁用，如需解禁，请联系管理员申诉')
            }
        }
        if(!data){
            ctx.throw(401, '请提供必要的数据以便创建团队')
        }

        const init = await strapi.service('api::team.team').initRole(user_id);
        // console.log('init',init)
        if(init){
            const { roles, members } = init;
            const member_ids = members?.map(i => i.id);
            const roles_ids = roles?.map(i => i.value.id);
            // console.log('roles_ids',roles_ids);
            const params = {
                name: data.name,
                display_name: data.display_name,
                members: member_ids,
                member_roles: roles_ids,
                publishedAt: new Date(),
                config:{
                  mode: "toMany",
                  disabled: []
                }
            }
            if(data.mm_team){
                params.mm_team = data.mm_team
            }
            let team = await strapi.entityService.create('api::team.team',{
                data: params
            })
            if(team) {
                team.team_channels = []
                if(data.mm_channels && data.mm_team){
                    for(const i of data.mm_channels) {
                        const params = {
                            name: i.name,
                            type: i.type,
                            mm_channel: i
                        }
                        if(i.name === 'town-square' || i.display_name === 'town-square'){
                            params.name = user?.config?.lang === 'zh-CN' ? '公共频道' : 'town-square'
                        }
                        if(i.name === 'off-topic' || i.display_name === 'off-topic'){
                          params.name = user?.config?.lang === 'zh-CN' ? '闲聊' : 'off-topic'
                        }
                        const _channel = await strapi.service('api::team.team').createChannel(user_id,team.id,params)
                        team.team_channels.push(_channel);
                    }
                }
                return team
            }
        }
    },
    async update(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let team_id = Number(ctx.params.id);
        // @ts-ignore
        const { data } = ctx.request.body
        if(!user_id){
            ctx.throw(400, '请先登陆')
        } else {
            let user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id);
            if(user?.blocked){
                ctx.throw(401, '当前账户被禁用，如需解禁，请联系管理员申诉')
            }
        }
        let auth  = await strapi.service('api::team.team').getRole(user_id,team_id,'team');
        if(auth?.modify){
            let params = {};
            if(data.name || data.display_name){
                params.display_name = data.name || data.display_name;

                const team = await strapi.entityService.findOne('api::team.team',team_id);
                if(team?.mm_team){
                    const mmapi = strapi.plugin('mattermost').service('mmapi');
                    const _params = {
                        team_id: team.mm_team?.id,
                        display_name: params.display_name
                    }
                    // @ts-ignore
                    const _mm_team = await mmapi.PathTeam(team.mm_team?.id, _params);
                    if(_mm_team?.data){
                        params.mm_team = _mm_team.data
                    }
                }
            }
            if(data.team_logo){
                params.team_logo = data.team_logo
            }
            if(data.config){
                params.config = data.config
            }
            const populate = strapi.service('api::team.team').populate_template();
            const update = await strapi.entityService.update('api::team.team',team_id,{
                data: params,
                populate: populate
            })
            if(data.introduce){
                params.introduce = data.introduce
            }
            if(update){
                return update
            }
        }
    },
    async delete(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let team_id = Number(ctx.params.id);

        let user
        if(!user_id){
            ctx.throw(400, '请先登陆')
        } else {
            user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id);
            if(user?.blocked){
                ctx.throw(401, '当前账户被禁用，如需解禁，请联系管理员申诉')
            }
        }
        let auth  = await strapi.service('api::team.team').getRole(user_id,team_id,'team');
        if(auth?.delete){
            const team = await strapi.service('api::team.team').findTeamByID(team_id);
            // console.log(team);
            if(team){
                const mmapi = strapi.plugin('mattermost').service('mmapi');
                if(team.team_channels && team.team_channels.length > 0) {
                   team.team_channels.map( async (i) => {
                       const mm_channel_id = i.mm_channel?.id;
                       if(mm_channel_id){
                          await mmapi.deleteChannel(mm_channel_id)
                       }
                   })
                }
                if(team.projects && team.projects.length > 0) {
                    team.projects.map(async(i) => {
                        // 这里后续需要补充递归删除项目中所有的board,group,kanban,column,document,schedule,storage
                        await strapi.entityService.delete('api::project.project',i.id);
                    })
                }
                if(team.members && team.members.length > 0) {
                    team.members.map(async(i) => {
                        await strapi.entityService.delete('api::member.member',i.id);
                    })
                }
                if(team.member_roles && team.member_roles.length > 0) {
                    team.members.map(async(i) => {
                        await strapi.entityService.delete('api::member-role.member-role',i.id);
                    })
                }
                const mm_team = team?.mm_team;
                await mmapi.deleteTeam(mm_team.id);
            }

            const remove = await strapi.entityService.delete('api::team.team',team_id);
            if(remove){
                const res = {
                    removed_team: team_id
                }
                return res
            }
        }
    },
    async genInvite(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let { team_id } = ctx.params;
        team_id = Number(team_id);
        const data = ctx.request.body

        const team = await strapi.service('api::team.team').findTeamByID(team_id);
        let auth  = await strapi.service('api::team.team').getRole(user_id,team_id,'team','invite_uris');
        if(auth.isBlock){
            ctx.throw(401, '您无权邀请成员')
        }

        if(auth.field) {
            const makeid = (length) => {
                let result = '';
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                const charactersLength = characters.length;
                for (let i = 0; i < length; i++) {
                result += characters.charAt (Math.floor (Math.random () * charactersLength));
                }
                return result;
            }
            let invite_code = makeid(24);
            let _invite_uris = team.invite_uris;
            let new_invite_uri = {
                invite_code: invite_code,
                // @ts-ignore
                max_total: data.max_total,
                // @ts-ignore
                up_time: data.up_time,
                invitor: user_id
            }
            // @ts-ignore
            _invite_uris.push(new_invite_uri);
            // @ts-ignore
            const update_project = await strapi.entityService.update('api::team.team',team_id,{
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
            ctx.throw(401, '您无权邀请成员')
        }
    },
    async visitInvite(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { team_id, invite_code } = ctx.params;
        if(!user_id) {
            ctx.throw(401, '请先登陆')
            return
        }
        if(!team_id) {
            ctx.throw(401, '缺少团队ID')
            return
        }
        if(!invite_code) {
            ctx.throw(401, '缺少邀请码')
            return
        }
        const team = await strapi.service('api::team.team').findTeamByID(team_id);
        if(team){
            // 判断当前邀请码是不是有效的
            const invite = team.invite_uris.find(i => i.invite_code === invite_code);
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

                if(invite.max_total < 1) {
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

            let auth  = await strapi.service('api::team.team').getRole(user_id,team_id,'team','invite_uris');

            if(auth.unconfirmed) {
                // ctx.throw(204, '您已经接受了邀请，请等待团队管理员审核')
                const res = {
                    error: {
                        message: '您已经接受了邀请，请等待团队管理员审核'
                    }
                }
                return res
            }

            if(auth.isBlock){
                ctx.throw(401, '您已被团队管理员屏蔽，如需申诉，请联系管理员')
            } else {
                let __ = team.invite_uris.find(i => i.invite_code == invite_code)
                let res = {
                    name: team.display_name || team.name,
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
        const { team_id, invite_code } = ctx.params;
        if(!team_id) {
            ctx.throw(401, '团队ID不能缺少')
        }

        let isInvitor;
        let isUnconfirmed;
        let invite;
        let unconfirmed_memberRole;
        const team = await strapi.service('api::team.team').findTeamByID(team_id);

        if(team){
            // 如果团队没有未确认角色，那么先创建一个
            unconfirmed_memberRole = team.member_roles?.find(i => i.subject === 'unconfirmed')?.id || null;
            if(!unconfirmed_memberRole){
                const { roleBase } = require('../services/roleBase.js');
                const __ = await roleBase();
                const role_base = __.find(i => i.role === 'unconfirmed')

                const new_memberRole = await strapi.entityService.create('api::member-role.member-role',{
                    data: {
                        by_team: team.id,
                        subject: role_base.role,
                        ACL: role_base.ACL,
                    }
                })
                if(new_memberRole){
                    unconfirmed_memberRole = new_memberRole.id
                }
            }
            // 获取当前用户的角色信息，用来判断是不是已经是团队成员了
            let auth  = await strapi.service('api::team.team').getRole(user_id,team_id,'team','invite_uris');
            // 判断当前邀请码是不是有效的
            invite = team.invite_uris.find(i => i.invite_code === invite_code);
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

                if(invite.max_total < 1) {
                    invite.enable = false; // todo 待验证
                    ctx.throw(401, '该邀请链接已超过使用次数');
                    return
                } else if(invite.up_time && endTimeStamp < currentTimeStamp) {
                    ctx.throw(401, '该邀请链接已过保质期');
                    return
                }
            }

            isInvitor = team.invite_uris.map(i => i.invitor.id === user_id && i.invite_code).includes(invite_code);
            if(auth.unconfirmed) {
                let Resps = {
                    message: '您已经接受了邀请，请等待团队管理员审核'
                }
                return Resps
            }
            if(isInvitor && !isUnconfirmed) {
                let Resps = {
                    message: '您是该邀请链接的创建者，可以直接进入团队，无需使用此链接'
                }
                return Resps
            }

            if(auth.isBlock){
                let Resps = {
                    message: '您已被团队管理员屏蔽，如需申诉，请联系管理员'
                }
                return Resps
            }
        }
        // console.log(project);
        if(invite) {
            const add_user = await strapi.service('api::team.team').addUser(team,user_id,unconfirmed_memberRole);

            if(add_user) {
                // 将当前用户添加到受邀请成员中
                invite.was_inviteds.push({ id: user_id });
                // 团队邀请列表中先移除当前操作的邀请
                team.invite_uris = team.invite_uris.filter(i => i.invite_code != invite_code);
                // 再将已经已添加受邀成员的链接加回团队邀请列表
                team.invite_uris.push(invite);
                // 定义完整的新的邀请链接列表，供更新团队时使用
                let new_invite_uris = team.invite_uris;
                // console.log('new_invite_uris',new_invite_uris,'role',role);

                // 处理邀请码的可用次数
                let index = new_invite_uris.findIndex(i => i.invite_code == invite_code);
                if (index > -1) {
                    if (new_invite_uris[index].max_total > 0) {
                        new_invite_uris[index].max_total--;
                    }
                }
                // 更新团队邀请码
                await strapi.entityService.update('api::team.team',team_id, {
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
                let Resps = {
                    message: '加入成功，请等待管理员核验后再访问频道'
                }
                return Resps
            }
        }
    },
    async removeUser(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { team_id } = ctx.params;
        const body = ctx.request.body
        // @ts-ignore
        const removeMember_id = Number(body.data.removeMember_id)


        let auth //鉴权当前用户
        let user_id_by_willRemove // 将要移除的用户ID
        const team = await strapi.service('api::team.team').findTeamByID(team_id);
        const member = await strapi.entityService.findOne('api::member.member',removeMember_id,{
            populate: {
                by_user: {
                    fields: ['id','mm_profile']
                },
                by_project: {
                    fields: ['id']
                },
                member_roles: true
            }
        })
        if(team && member){
            user_id_by_willRemove = member.by_user.id;
            const members = team.members;
            const users = members.map(i => i.by_user.id);
            if(!users.includes(user_id_by_willRemove)){
                ctx.throw(503, '该成员不在本团队中')
            }

            auth  = await strapi.service('api::team.team').getRole(user_id,team_id,'team','manageMember');

            if(auth?.isBlock){
                ctx.throw(401, '您已被团队管理员屏蔽，如需申诉，请联系管理员')
            }
        }

        if(auth) {
            const mmapi = strapi.plugin('mattermost').service('mmapi');
            const mm_team = team.mm_team;
            // @ts-ignore
            const mm_user_id = member.by_user?.mm_profile?.id;

            let response = {}
            // “待确认”成员，要么一直没被转正，就一直不会在Mattermost频道中，要么被重新“待确认”，那在当时就已经被移出了Mattermost团队频道
            // 因此，如果将要移除的成员不是“待确认”身份，那么先将其移出Mattermost团队频道
            // @ts-ignore
            if(!auth.unconfirmed){
                await mmapi.RemoveUserFromTeam(mm_team.id,mm_user_id);
            }
            const leave = await strapi.entityService.delete('api::member.member',removeMember_id);
            // 移除该用户在当前团队中所有开放频道的成员
            const allOpenChannels = team.team_channels.filter(i => i.type === 'O');
            // console.log('allOpenChannels',allOpenChannels)
            if(allOpenChannels?.length > 0){
                const user_of_remove = member.by_user?.id;
                // console.log('user_of_remove',user_of_remove)
                const all_removeMember_of_openChannels = allOpenChannels.map(i => i.members).flat(2).filter(j => j.by_user.id === user_of_remove)?.map(k => k.id)
                // console.log('all_removeMember_of_openChannels',all_removeMember_of_openChannels)
                if(all_removeMember_of_openChannels?.length > 0){
                    Promise.allSettled(all_removeMember_of_openChannels.map(async(i) => {
                        await strapi.entityService.delete('api::member.member', i);
                    }))
                }
            }
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
        const { team_id } = ctx.params;
        // @ts-ignore
        const body = ctx.request.body.update_member
        // console.log(body);

        if(!user_id) {
            ctx.throw(401, '无效的登陆用户ID')
        }
        if(!team_id) {
            ctx.throw(401, '需要提供团队ID')
        }
        if(!body.member_id) {
            ctx.throw(401, '需要提供用成员ID')
        }
        if(!body.new_roles) {
            ctx.throw(401, '需要提供用户ID')
        }


        let auth;
        let unconfirmed_roleId;
        let blocked_roleId;
        const team = await strapi.service('api::team.team').findTeamByID(team_id);
        if(team){
            unconfirmed_roleId = team.member_roles.find(i => i.subject === 'unconfirmed')?.id
            blocked_roleId = team.member_roles.find(i => i.subject === 'blocked')?.id
            auth  = await strapi.service('api::team.team').getRole(user_id,team_id,'team','manageMember');

            if(auth.isBlock){
                auth = false
                ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
            } else if(team?.publishedAt == null) {
                auth = false
                ctx.throw(404, '团队已归档，不能修改')
            } else if(auth.unconfirmed){
                auth = false
                return '您无权执行此操作'
            }
        }

        // auth?.field 返回该字段的modify值（真/假）
        if(auth?.field) {
            const mmapi = strapi.plugin('mattermost').service('mmapi');
            const member_id = Number(body.member_id);
            const target_member = await strapi.entityService.findOne('api::member.member',member_id,{
                populate: {
                    member_roles: true,
                    by_user: {
                        fields: ['id','mm_profile']
                    }
                }
            })
            const mm_team = team.mm_team;
            // @ts-ignore
            const mm_user_id = target_member.by_user?.mm_profile?.id
            // 如果该成员是从“待审核”状态转换到其它身份，那么将该成员拉入团队-团队频道中
            // 在迭代版本中开启
            // if(target_member){
            //     if(mm_team && mm_user_id){
            //         let params = {
            //             "team_id": mm_team.id,
            //             // @ts-ignore
            //             "user_id": mm_user_id
            //           }
            //         await mmapi.addMemberToTeam(mm_team.id,mm_user_id);
            //     }
            // }
            // 如果要将目标成员的身份设置为“待审核”，那么将其移出团队Mattermost频道
            if(body.new_roles.includes(unconfirmed_roleId)){
                await mmapi.RemoveUserFromTeam(mm_team.id,mm_user_id);
            }

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
            const allRoles_by_user = target_member.member_roles.map(i => i.id);
            const allRoles_by_team =  team.member_roles.map(i => i.id);
            const userRoles_no_team = allRoles_by_user.filter(i => !allRoles_by_team.includes(i));
            const update_member = await strapi.entityService.update('api::member.member',member_id,{
                data: {
                    member_roles: {
                        set: [...body.new_roles, ...userRoles_no_team]
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
            const target_memberRoles = target_member.member_roles?.map(i => i.subject)
            const needJoin = target_memberRoles?.includes('unconfirmed') || target_memberRoles?.includes('blocked')
            if(needJoin){
                // 加入所有开放频道
                const allOpenChannels = team.team_channels.filter(i => i.type === 'O');
                // console.log('body.new_roles',body.new_roles)
                const dontJoin = body.new_roles.includes(unconfirmed_roleId) || body.new_roles.includes(blocked_roleId);
                if(!dontJoin){
                    await strapi.service('api::team.team').joinPublicChannel(team,target_member);
                }
            }
            if(update_member){
                return update_member
            }
        }
    },
    async leaveTeam(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { team_id } = ctx.params;

        const team = await strapi.service('api::team.team').findTeamByID(team_id);
        if(team){
            const allAdmins = team.member_roles.filter(j => j.subject === 'admin')
            const user_member = team.members.find(i => i.by_user.id === user_id)
            const isAdmin = user_member.member_roles.filter(j => j.subject === 'admin').length > 0;
            // console.log('allAdmins',allAdmins,allAdmins?.length)
            if(user_member){
                if(isAdmin && allAdmins?.length === 1){
                    const res = {
                        message: '你是团队唯一的的管理员，请通过成员管理功能，再设置至少一名其它管理员后，再执行离开操作',
                        status: 'error'
                    }
                    return res
                } else {
                    const leave = await strapi.entityService.delete('api::member.member',user_member.id);
                    if(leave){
                        const res = {
                            message: '您已成功离开团队',
                            status: 'sucess'
                        }
                        const user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id);
                        await strapi.entityService.update('plugin::users-permissions.user',user_id,{
                            data: {
                                default_team: null
                            }
                        });
                        const mm_team = team.mm_team;
                        // @ts-ignore
                        const mm_user_id = user.mm_profile?.id;
                        if(mm_team && mm_user_id){
                            const mmapi = strapi.plugin('mattermost').service('mmapi');
                            await mmapi.RemoveUserFromTeam(mm_team?.id,mm_user_id)
                        }
                        return res
                    }
                }
            } else {
                ctx.throw(404, '当前团队中不存在该用户对应的成员')
            }
        }
    }
}));
