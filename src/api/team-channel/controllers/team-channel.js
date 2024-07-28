// @ts-ignore
'use strict';

/**
 * team-channel controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::team-channel.team-channel',({strapi}) => ({
    async find(ctx) {
        return '请进入对应团队后，获取相应频道'
    },
    async findOne(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let channel_id = Number(ctx.params.id);

        let user
        if(!user_id) {
            ctx.throw(401, '您无权访问该数据')
        } else {
            user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id);
            if(user?.blocked){
                ctx.throw(401, '当前账户被禁用，如需解禁，请联系管理员申诉')
            }
        }
        if(!channel_id) {
            ctx.throw(400, '需要提供频道ID')
        }
        let channelAuth;
        let teamAuth
        let auth
        let _userMember_inChannel
        const channel = await strapi.service('api::team-channel.team-channel').findChannelByID(channel_id);
        if(!channel){
            ctx.throw(404, '指定频道不存在')
        }
        // 查询用户在频道中的数据
        _userMember_inChannel = await strapi.entityService.findMany('api::member.member',{
            filters: {
                $and: [
                  {
                    by_team_channels: {
                        id: channel?.id
                    }
                  },
                  {
                    by_user: {
                        id: user_id
                    },
                  },
                ],
            }}
        )
        if(_userMember_inChannel?.length > 0){
            channelAuth  = await strapi.service('api::team-channel.team-channel').getRole(user_id,channel_id,'channel');
            auth = channelAuth.read
        } else {
            teamAuth  = await strapi.service('api::team.team').getRole(user_id,channel?.team?.id,'channel');
            auth = teamAuth.read
        }

        if(auth){
            const populate = strapi.service('api::team-channel.team-channel').populate_template();
            const channel = await strapi.entityService.findOne('api::team-channel.team-channel',channel_id,{
                populate: populate
            });
            if(channel){
                // ***
                // ***
                // todo 此处逻辑需要验证
                // ***
                // ***

                // 逻辑：如果频道类型为：“公开频道” - "O"，那么成员均可访问，需要执行以下逻辑：
                // 用户访问时，判断用户是否在频道中，如果不在，则拉入，并设置角色为“普通成员”，同时拉入Mattermost 频道
                // 如果没有找到，说明用户还不在频道中，执行加入频道逻辑
                // 如果找到了，则直接下一步
                if(_userMember_inChannel?.length === 0){
                    // 找到该用户在团队中对应的成员
                    const _team_member = await strapi.entityService.findMany('api::member.member',{
                        filters: {
                            $and: [
                              {
                                by_team: {
                                    id: channel?.team?.id
                                },
                              },
                              {
                                by_user: {
                                    id: user_id
                                },
                              },
                            ],
                        }}
                    )
                    // console.log(_team_member)
                    if(_team_member?.length === 0){
                        ctx.throw(404, '没有找到您对应的团队成员数据，请刷新页面重试或联系管理人员检查')
                    }
                    // 找到频道中 “普通成员” 的角色数据
                    // @ts-ignore
                    const role_of_member_by_channel = channel?.member_roles.find(i => i.subject === 'member');
                    // 将该用户对应的成员添加到频道成员中
                    // console.log(role_of_member_by_channel)
                    await strapi.entityService.update('api::team-channel.team-channel',channel_id,{
                        data: {
                            members: {
                                connect: [ _team_member[0].id ] //一个用户在一个team中只能有一个成员，这里一定书数组第一个
                            }
                        }
                    });
                    // 将该用户对应的成员添加到频道“普通成员”角色中
                    await strapi.entityService.update('api::member-role.member-role',role_of_member_by_channel?.id,{
                        data: {
                            members: {
                                connect: [ _team_member[0].id ]
                            }
                        }
                    });
                    // 处理Mattermost频道
                    const mmapi = strapi.plugin('mattermost').service('mmapi');
                    let params = {
                        // @ts-ignore
                        "channel_id": channel?.mm_channel.id,
                        // @ts-ignore
                        "user_id": user.mm_profile?.id,
                      }
                    //   console.log('params',params);
                    // @ts-ignore
                    await mmapi.addMemberToChannel(channel?.mm_channel.id,params);
                }
                return channel
            }
        } else {
            ctx.throw(400, '您无权访问当前频道')
        }
    },
    async create(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        // @ts-ignore
        const { data, team_id } = ctx.request.body;
        // @ts-ignore
        const { mm_channel } = data
        if(!mm_channel){
            ctx.throw(400, '请先创建 Mattermost 频道后，一起提交对应频道数据')
        }
        if(!team_id){
            ctx.throw(400, '缺少team_id')
        }

        if(!user_id){
            ctx.throw(400, '请先登陆')
        } else {
            let user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id);
            if(user?.blocked){
                ctx.throw(401, '当前账户被禁用，如需解禁，请联系管理员申诉')
            }
        }
        if(!data){
            ctx.throw(401, '请提供必要的数据以便创建频道')
        }
        // console.log('data',data);
        let auth  = await strapi.service('api::team.team').getRole(user_id,team_id,'channel');
        // console.log('auth',auth);
        if(auth.create) {
            const params = {
                name: data.name,
                type: data.type,
                purpose: data.purpose,
                mm_channel: mm_channel
            }
            const create = await strapi.service('api::team.team').createChannel(user_id,team_id,params);
            if(create){
                return create
            }
        }
    },
    async update(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        // @ts-ignore
        const { data, channel_id } = ctx.request.body;
        if(!channel_id){
            ctx.throw(401, '需要频道ID')
        }
        if(!user_id){
            ctx.throw(400, '请先登陆')
        } else {
            let user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id);
            if(user?.blocked){
                ctx.throw(401, '当前账户被禁用，如需解禁，请联系管理员申诉')
            }
        }
        if(!data){
            ctx.throw(401, '请提供必要的数据以便创建频道')
        }

        const channel = await strapi.service('api::team-channel.team-channel').findChannelByID(channel_id);
        // console.log('channel',channel);
        let auth  = await strapi.service('api::team-channel.team-channel').getRole(user_id,channel_id,'channel');
        if(auth.modify) {
            const mmapi = strapi.plugin('mattermost').service('mmapi');
            let params = {};
            if(data.type){
                params.type = data.type
            }
            if(data.purpose){
                params.purpose = data.purpose
            }
            if(data.name){
                params.name = data.name;

                if(channel.mm_channel){
                    const _params = {
                        channel_id: channel.mm_channel.id,
                        display_name: data.name
                    }
                    if(params.purpose){
                        _params.purpose = params.purpose
                    }
                    // @ts-ignore
                    const _mm_channel = await mmapi.PathChannel(channel.mm_channel?.id, _params);
                    if(_mm_channel.data){
                        params.mm_channel = _mm_channel.data
                    }
                    if(data.type){
                        const _privacy = {
                          "privacy": data.type
                        }
                        const _mm_channel_privacy = await mmapi.updateChannelPrivacy(channel.mm_channel?.id, _privacy);
                        params.mm_channel = _mm_channel_privacy?.data
                    }
                }
            }
            const update = await strapi.entityService.update('api::team-channel.team-channel',channel_id,{
                data: params
            })
            if(update){
                return update
            }
        }
    },
    async delete(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let channel_id = Number(ctx.params.id);

        let user
        if(!user_id) {
            ctx.throw(401, '您无权访问该数据')
        } else {
            user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id);
            if(user?.blocked){
                ctx.throw(401, '当前账户被禁用，如需解禁，请联系管理员申诉')
            }
        }
        if(!channel_id) {
            ctx.throw(400, '需要提供频道ID')
        }
        const channel = await strapi.service('api::team-channel.team-channel').findChannelByID(channel_id);
        let channelAuth  = await strapi.service('api::team-channel.team-channel').getRole(user_id,channel_id,'channel');
        let teamAuth  = await strapi.service('api::team.team').getRole(user_id,channel.team.id,'channel');
        if(channelAuth.delete || teamAuth.delete){
            const mmapi = strapi.plugin('mattermost').service('mmapi');
            await mmapi.deleteChannel(channel.mm_channel?.id);
            const remove = await strapi.entityService.delete('api::team-channel.team-channel',channel_id);
            if(remove){
                const msg = {
                    message: '频道已删除',
                    channel_id: channel.id
                }
                return msg
            }
        }
    },
    async genInvite(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        let { channel_id } = ctx.params;
        channel_id = Number(channel_id);
        const data = ctx.request.body

        const channel = await strapi.service('api::team-channel.team-channel').findChannelByID(channel_id);
        let auth  = await strapi.service('api::team-channel.team-channel').getRole(user_id,channel_id,'channel','invite_uris');
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
            let _invite_uris = channel.invite_uris;
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
            const update_channel = await strapi.entityService.update('api::team-channel.team-channel',channel_id,{
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
            if(update_channel) {
                return new_invite_uri
            }

        } else {
            ctx.throw(401, '您无权邀请成员')
        }
    },
    async visitInvite(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { channel_id, invite_code } = ctx.params;
        if(!user_id) {
            ctx.throw(401, '请先登陆')
            return
        }
        if(!channel_id) {
            ctx.throw(401, '缺少频道ID')
            return
        }
        if(!invite_code) {
            ctx.throw(401, '缺少邀请码')
            return
        }
        const channel = await strapi.service('api::team-channel.team-channel').findChannelByID(channel_id);
        if(channel){
            // 判断当前邀请码是不是有效的
            const invite = channel.invite_uris.find(i => i.invite_code === invite_code);
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

            let auth  = await strapi.service('api::team-channel.team-channel').getRole(user_id,channel_id,'channel','invite_uris');

            if(auth.unconfirmed) {
                // ctx.throw(204, '您已经接受了邀请，请等待频道管理员审核')
                const res = {
                    error: {
                        message: '您已经接受了邀请，请等待频道管理员审核'
                    }
                }
                return res
            }

            if(auth.isBlock){
                ctx.throw(401, '您已被频道管理员屏蔽，如需申诉，请联系管理员')
            } else {
                let __ = channel.invite_uris.find(i => i.invite_code == invite_code)
                let res = {
                    name: channel.name,
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
        const { channel_id, invite_code } = ctx.params;
        if(!channel_id) {
            ctx.throw(401, '频道ID不能缺少')
        }
        let isInvitor;
        let isUnconfirmed;
        let invite;
        let unconfirmed_memberRole;
        const channel = await strapi.service('api::team-channel.team-channel').findChannelByID(channel_id);
        // console.log('channel',channel);
        if(channel){
            // 如果频道没有未确认角色，那么先创建一个
            unconfirmed_memberRole = channel.member_roles?.find(i => i.subject === 'unconfirmed')?.id || null;
            if(!unconfirmed_memberRole){
                const { roleBase } = require('../services/roleBase.js');
                const __ = await roleBase();
                const role_base = __.find(i => i.role === 'unconfirmed')

                const new_memberRole = await strapi.entityService.create('api::member-role.member-role',{
                    data: {
                        by_team_channel: channel.id,
                        subject: role_base.role,
                        ACL: role_base.ACL,
                    }
                })
                if(new_memberRole){
                    unconfirmed_memberRole = new_memberRole.id
                }
            }
            // 获取当前用户的角色信息，用来判断是不是已经是频道成员了
            // 这里auth必须返回 false ， 否则该成员就已经存在与频道中了，则无需执行邀请流程了
            let auth  = await strapi.service('api::team-channel.team-channel').getRole(user_id,channel_id,'channel','invite_uris');
            // console.log('unconfirmed_memberRole',unconfirmed_memberRole);
            // 判断当前邀请码是不是有效的
            invite = channel.invite_uris.find(i => i.invite_code === invite_code);
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

            isInvitor = channel.invite_uris.map(i => i.invitor.id === user_id && i.invite_code).includes(invite_code);
            if(auth.unconfirmed) {
                ctx.throw(204, '您已经接受了邀请，请等待频道管理员审核')
            }
            if(isInvitor && !isUnconfirmed) {
                ctx.throw(204, '您是该邀请链接的创建者，可以直接进入频道，无需使用此链接')
            }

            if(auth.isBlock){
                ctx.throw(401, '您已被频道管理员屏蔽，如需申诉，请联系管理员')
            }
        }
        if(invite) {
            const team = await strapi.service('api::team.team').findTeamByID(channel.team?.id);

            let joined_user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id)
            const mm_channel = channel.mm_channel;
            const mmapi = strapi.plugin('mattermost').service('mmapi');
            const mm_team = channel.team.mm_team

            let teamMember_of_curUser = await strapi.service('api::team.team').findTeamMemberByUserID(user_id, team?.id);
            if(!teamMember_of_curUser){ // 如果该用户不在被邀请加入频道的Team中，那么拉进Team和Mattermost Team
                const member_role_of_team = team.member_roles.find(i => i.subject === 'member');
                teamMember_of_curUser = await strapi.service('api::team.team').addUser(team, user_id, member_role_of_team?.id);
                await strapi.service('api::team.team').joinPublicChannel(team,teamMember_of_curUser);
            }
            //将当前用户在Team中的成员，添加到频道成员中，并且设置角色为“未确认”
            const addMemberToChannel = await strapi.entityService.update('api::member.member',teamMember_of_curUser.id,{
                // @ts-ignore
                data: {
                    by_team_channels: {
                        connect: [ channel_id ]
                    },
                    member_roles: {
                        connect: [ unconfirmed_memberRole ]
                    }
                }
            })

            if(addMemberToChannel) {
                // 将当前用户添加到受邀请成员中
                invite.was_inviteds.push({ id: user_id });
                // 频道邀请列表中先移除当前操作的邀请
                channel.invite_uris = channel.invite_uris.filter(i => i.invite_code != invite_code);
                // 再将已经已添加受邀成员的链接加回频道邀请列表
                channel.invite_uris.push(invite);
                // 定义完整的新的邀请链接列表，供更新频道时使用
                let new_invite_uris = channel.invite_uris;
                // console.log('new_invite_uris',new_invite_uris,'role',role);

                // 处理邀请码的可用次数
                let index = new_invite_uris.findIndex(i => i.invite_code == invite_code);
                if (index > -1) {
                    if (new_invite_uris[index].max_total > 0) {
                        new_invite_uris[index].max_total--;
                    }
                }
                // 更新频道邀请码
                const update_channel = await strapi.entityService.update('api::team-channel.team-channel',channel_id, {
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

                // 频道更新完毕以后，加入到Mattermost channel
                if(update_channel) {
                    // mm_profile

                    if(joined_user?.mm_profile && mm_channel){
                        let joinTeam_params = {
                            "team_id": mm_team.id,
                            // @ts-ignore
                            "user_id": joined_user.mm_profile?.id
                        }
                        await mmapi.addMemberToTeam(mm_team.id, joinTeam_params);

                        let params = {
                            "channel_id": mm_channel.id,
                            // @ts-ignore
                            "user_id": joined_user.mm_profile?.id,
                          }
                        //   console.log('params',params);
                        const res = await mmapi.addMemberToChannel(mm_channel.id,params);
                        if(res){
                            let Resps = {
                                message: '加入成功，请等待管理员核验后再访问频道'
                            }
                            return Resps
                        }
                    }
                }
            }
        }
    },
    async removeUser(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { channel_id } = ctx.params;
        const body = ctx.request.body
        // @ts-ignore
        const removeMember_id = Number(body.data.removeMember_id)


        let auth //鉴权当前用户
        let user_id_by_willRemove // 将要移除的用户ID
        const channel = await strapi.service('api::team-channel.team-channel').findChannelByID(channel_id);
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
        if(channel && member){
            user_id_by_willRemove = member.by_user.id;
            const members = channel.members;
            const users = members.map(i => i.by_user.id);
            if(!users.includes(user_id_by_willRemove)){
                ctx.throw(503, '该成员不在本频道中')
            }

            auth  = await strapi.service('api::team-channel.team-channel').getRole(user_id,channel_id,'channel','manageMember');

            if(auth?.isBlock){
                ctx.throw(401, '您已被频道管理员屏蔽，如需申诉，请联系管理员')
            }
        }

        if(auth) {
            const mmapi = strapi.plugin('mattermost').service('mmapi');
            const mm_channel = channel.mm_channel;
            // @ts-ignore
            const mm_user_id = member.by_user?.mm_profile?.id;

            let response = {}
            // “待确认”成员，要么一直没被转正，就一直不会在Mattermost频道中，要么被重新“待确认”，那在当时就已经被移出了Mattermost频道频道
            // 因此，如果将要移除的成员不是“待确认”身份，那么先将其移出Mattermost频道频道
            // @ts-ignore
            if(!auth.unconfirmed){
                await mmapi.RemoveUserFromChannel(mm_channel.id,mm_user_id);
            }
            const leave = await strapi.entityService.update('api::team-channel.team-channel',channel_id, {
                data: {
                    members: {
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
        const { channel_id } = ctx.params;
        // @ts-ignore
        const body = ctx.request.body.update_member
        // console.log(body);

        if(!user_id) {
            ctx.throw(401, '无效的登陆用户ID')
        }
        if(!channel_id) {
            ctx.throw(401, '需要提供频道ID')
        }
        if(!body.member_id) {
            ctx.throw(401, '需要提供用成员ID')
        }
        if(!body.new_roles) {
            ctx.throw(401, '需要提供用户ID')
        }


        let auth;
        const channel = await strapi.service('api::team-channel.team-channel').findChannelByID(channel_id);
        if(channel){
            auth  = await strapi.service('api::team-channel.team-channel').getRole(user_id,channel_id,'channel','manageMember');

            if(auth.isBlock){
                auth = false
                ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
            } else if(channel?.publishedAt == null) {
                auth = false
                ctx.throw(404, '频道已归档，不能修改')
            } else if(auth.unconfirmed){
                auth = false
                return '您无权执行此操作'
            }
        }

        if(auth?.field) {
            // *** 注意：用户在同意加入时，已经将其拉入到了Mattermost team，或者channel中了，因此在此处确认时，不需要执行Mattermost中的更新
            const member_id = Number(body.member_id);
            // 如果用户在team中是未确认状态，那么在频道中将其设置为其它角色时，同时将其在team中的角色设置为“成员”
            const team = await strapi.service('api::team.team').findTeamByID(channel.team?.id);

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

            const userMember = channel.members.find(i => i.id === member_id);
            const all_userRoles = userMember.member_roles.map(i => i.id);
            // console.log('all_userRoles',all_userRoles);
            const all_channelRoles = channel.member_roles.map(i => i.id);
            // console.log('all_projectRoles',all_projectRoles);
            const role_notBelongChannel = all_userRoles.filter(i => !all_channelRoles.includes(i));

            const isUnconfirmedInTeam = team.members.some(i => i.by_user.id === user_id && i.member_roles.some(j => j.subject === 'unconfirmed'));
            // 频道角色不存在“待确认”状态，因此不需要判断新设角色是不是“待确认”
            if(isUnconfirmedInTeam){
                // 获取团队中角色：“成员”
                const memberRole_of_team = team.member_roles.find(i => i.subject === 'member');
                const unconfirmed_memberRole_team = team.member_roles.find(i => i.subject === 'unconfirmed');
                // 将该用户在Team中的“成员角色”设置为“成员”
                await strapi.entityService.update('api::member.member',member_id,{
                    data: {
                        member_roles: {
                            disconnect: [unconfirmed_memberRole_team.id],
                            connect: [memberRole_of_team.id]
                        }
                    }
                })
            }
            const update_member = await strapi.entityService.update('api::member.member',member_id,{
                data: {
                    member_roles: {
                        set: [...body.new_roles, ...role_notBelongChannel]
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
                return update_member
            }
        }
    },
}));
