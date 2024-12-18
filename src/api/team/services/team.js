'use strict';

/**
 * team service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::team.team',({strapi, socket}) => ({
    populate_template(){
        const populate = {
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
                            },
                            contact: {
                                fields: ['id','accept_friend','friend_request_question']
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
            member_roles: {
                populate: {
                    ACL: {
                        populate: {
                            fields_permission: true
                        }
                    }
                }
            },
            team_logo: {
                fields: ['id','url','ext']
            },
            team_channels: {
                populate: {
                    members: {
                        populate: {
                            by_user: {
                                fields: ['id'],
                            },
                            member_roles: {
                                fields: ['id','subject']
                            }
                        }
                    }
                }
            },
            projects: {
                populate: {
                    overviews: {
                        populate: {
                            media: {
                                fields: ['id','url','ext']
                            }
                        }
                    },
                    sub_projects: {
                        populate: {
                            overviews: {
                                populate: {
                                    media: {
                                        fields: ['id','url','ext']
                                    }
                                }
                            }
                        }
                    },
                    project_members: {
                        populate: {
                            by_user: {
                                fields: ['id'],
                            },
                            member_roles: {
                                fields: ['id','subject']
                            }
                        }
                    }
                }
            }
        }
        return populate
    },
    async initRole(...args) {
        const ctx = strapi.requestContext.get();
        const [user_id] = args;
        const { roleBase } = require('./roleBase.js');
        try {
          const role_base = await roleBase();
          
          const roleBaseResults = await Promise.allSettled(role_base?.map(async (i) => {
            const res = await strapi.entityService.create('api::member-role.member-role', {
              data: {
                subject: i.role,
                ACL: i.ACL,
              }
            });
            return res;
          }));
    
          const successfulResults = roleBaseResults.filter((result) => result.status === 'fulfilled');
          // @ts-ignore
          const role_admin = successfulResults.find((result) => result.value.subject === 'admin');
          
          // console.log('successfulResults',successfulResults);
          if (role_admin) {
            const admin = await strapi.entityService.create('api::member.member', {
              // @ts-ignore
              data: {
                  by_user: user_id,
                  member_roles: {
                    // @ts-ignore
                    set: [role_admin.value.id],
                  },
              },
            });
    
            if (admin) {
              const data = { roles: successfulResults, members: [admin] };
              return data;
            }
          }
        } catch (error) {
          console.error('Error during initialization:', error);
          throw error;
        }
    },
    async getRole(...args) {
        const [ user_id, team_id, collection, field ] = args;
        let auth = {}
        const memberRoles = await strapi.db.query('api::member-role.member-role').findMany({
          where: {
            members: {
                by_user: {
                    id: user_id
                }
            },
            by_team: {
                id: team_id
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
        if(memberRoles){
            if(memberRoles?.length === 0){
                return false
            }
            const _ACLs = memberRoles?.map(i => i.ACL).flat(2)?.filter(j => j.collection === collection).flat(2);
            // @ts-ignore
            auth = {
                create: _ACLs.filter(i => i.create)?.length > 0,
                delete: _ACLs.filter(i => i.delete)?.length > 0,
                read: _ACLs.filter(i => i.read)?.length > 0,
                modify: _ACLs.filter(i => i.modify)?.length > 0
            }
            if(field){
                const _field = _ACLs.map(i => i.fields_permission)?.flat(2)?.filter(j => j.field === field && j.modify)
                auth[field] = _field?.length > 0 // 鉴定提供的字段是否是modify
            }
            const blocks = memberRoles.filter(k => k.subject === 'blocked');
            const unconfirmeds = memberRoles.filter(k => k.subject === 'unconfirmed');
            auth.isBlock = blocks?.length > 0
            auth.unconfirmed = unconfirmeds?.length > 0
        }
        return auth
    },
    async createChannel(...args){
        const [ user_id, team_id, params ] = args;
        let channel
        const init = await strapi.service('api::team-channel.team-channel').initRole(user_id,team_id);
        // console.log('init', init)
        if(init){
            const { roles, members } = init;
            // console.log(roles, members)
            const member_ids = members?.map(i => i.id);
            const roles_ids = roles?.map(i => i.value.id);
            const populate = strapi.service('api::team-channel.team-channel').populate_template();
            channel = await strapi.entityService.create('api::team-channel.team-channel',{
                data: {
                    mm_channel: params.mm_channel,
                    team: team_id,
                    name: params.name,
                    purpose: params.purpose,
                    type: params.type,
                    members: member_ids,
                    member_roles: roles_ids,
                    publishedAt: new Date()
                },
                populate: populate
            })
        }
        return channel
    },
    async findTeamByID(...args) {
        const [ team_id ] = args;

        const team = strapi.entityService.findOne('api::team.team',team_id,{
            populate: {
                members: {
                    populate: {
                        by_user: {
                            fields: ['id','username','mm_profile']
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
                invite_uris: {
                    populate: {
                        invitor: {
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
                        was_inviteds: {
                            fields: ['id']
                        }
                    }
                },
                team_channels: {
                    populate: {
                        members: {
                            populate: {
                                by_user: {
                                    fields: ['id']
                                }
                            }
                        },
                        member_roles: true
                    }
                },
                projects: true
            }
        })
        if(team){
            return team
        }
    },
    async findTeamMemberByUserID(...args) {
        const [ user_id, team_id ] = args;
        const _team_member = await strapi.entityService.findMany('api::member.member',{
            filters: {
                $and: [
                  {
                    by_team: {
                        id: team_id
                    },
                  },
                  {
                    by_user: {
                        id: user_id
                    },
                  },
                ],
            },
            populate: {
                by_user: {
                    fields: ['id']
                }
            }
        })
        if(_team_member?.length > 0){
            return _team_member[0]
        } else {
            return null
        }
    },
    async findTeamRoleByMember(...args){
        const [ member_id, team_id, collection ] = args;
        const _roles = await strapi.entityService.findMany('api::member-role.member-role',{
            filters: {
                'by_team.id': team_id,
                'members.id': member_id
            },
            populate: {
                ACL: {
                    populate: {
                        fields_permission: true
                    }
                }
            }
        });
        if(_roles?.length === 0){
            const ctx = strapi.requestContext.get();
            ctx.throw(404,'该用户不属于此团队')
        } else {
            const ACLs = _roles.map(i => i.ACL).flat(2)?.filter(j => j.collection === collection);
            const create = ACLs.filter(i => i.read)?.length > 0;
            const remove = ACLs.filter(i => i.read)?.length > 0;
            const read = ACLs.filter(i => i.read)?.length > 0;
            const modify = ACLs.filter(i => i.read)?.length > 0;
            return { create, remove, read, modify }
        }
    },
    // 根据用户权限，对返回的数据执行过滤
    async filterByAuth(...args) {
        let [ team, user_id ] = args;
        const curUserMember = team.members?.find(i => i.by_user?.id === user_id);
        if(!curUserMember){
            return null
        }
        const getChannelAuth = async (channel_id) => {
            return await strapi.service('api::team-channel.team-channel').getRole(user_id,channel_id,'channel');
        }

        // @ts-ignore
        if(team.team_channels?.length > 0){
            // 找到所有公开频道
            const unjoined_public_channels = team.team_channels.filter(i => !i.members?.map(j => j.id).includes(curUserMember?.id) && i.mm_channel.type === 'O');
            // console.log('public_channels', curUserMember.id, public_channels)
            if(unjoined_public_channels?.length > 0){
                await Promise.allSettled(unjoined_public_channels.map(async(channel) => {
                    // 如果成员不在公开频道中，加入
                    await strapi.entityService.update('api::team-channel.team-channel', channel.id, {
                        data: {
                            members: {
                                connect: [curUserMember.id]
                            }
                        }
                    })
                    // 更新team数据
                    team.team_channels.find(i => i.id === channel.id).members.push(curUserMember)
                    // 找到当前频道 member 角色
                    const member_role = channel.member_roles.find(i => i.subject === 'member');
                    // 将刚刚加入的成员角色设置为 member
                    await strapi.entityService.update('api::member-role.member-role', member_role.id, {
                        data: {
                            members: {
                                connect: [curUserMember.id]
                            }
                        }
                    })
                    // 更新team数据
                    team.team_channels.find(i => i.id === channel.id).member_roles.find(j => j.subject === 'member')?.members.push(curUserMember)
                    const mmapi = strapi.plugin('mattermost').service('mmapi');
                    
                    // 同时加入到 Mattermost 频道
                    const mm_channel = channel.mm_channel
                    let joined_user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id)
                    if(mm_channel){
                        let params = {
                            "channel_id": mm_channel.id,
                            // @ts-ignore
                            "user_id": joined_user.mm_profile?.id,
                          }
                        //   console.log('params',params);
                        await mmapi.addMemberToChannel(mm_channel.id,params);
                    }
                }))
            }
            // team = await strapi.service('api::team.team').findTeamByID(team.id);
            team.team_channels = team.team_channels.filter(i => i.members?.map(j => j.id).includes(curUserMember?.id));
            // @ts-ignore
            team.team_channels = await Promise.all(team.team_channels.map(async(i) => {
                let res = {}
                const auth = await getChannelAuth(i.id);
                // console.log('getChannelAuth auth',auth);
                if(auth?.read){
                    return {
                        ...i,
                        auth: {
                            read: true
                        }
                    }
                } else {
                    res = {
                        id: i.id,
                        name: i.name,
                        type: i.type || i.mm_channel?.type,
                        mm_channel: {
                            id: i.mm_channel.id,
                            type: i.mm_channel.type
                        },
                        auth: auth
                    }
                }
                return res
            }))
        }
        // @ts-ignore
        if(team.projects?.length > 0){
            // @ts-ignore
            team.projects = await Promise.all(team.projects.map(async(i) => {
                let res = {}
                let read;
                let user_roles = []
                let is_project_member
                const role_of_project = await strapi.db.query('api::member-role.member-role').findMany({
                    where: {
                        members: {
                            by_user: user_id
                        },
                        by_project: i.id
                    },
                    populate: {
                        ACL: {
                            populate: {
                                fields_permission: true
                            }
                        }
                    }
                })
                if(role_of_project?.length > 0){
                    const ACLs = role_of_project.map(i => i.ACL).flat(2)
                    const collections = ACLs.filter(j => j.collection === 'project')
                    // console.log('ACLs',ACLs);
                    read = collections.filter(i => i.read)?.length > 0
                    user_roles = role_of_project.map(i => i.subject)
                    is_project_member = true
                    
                    const can_approve = collections.map(i => i.fields_permission.filter(j => j.modify && j.field === 'approve_join_request')).flat(2)?.length > 0;
                    if(!can_approve){
                        delete i.join_requests
                    }
                } else {
                    read = false
                }
                if(read){
                    return {
                        ...i,
                        auth: {
                            read: true
                        }
                    }
                } else {
                    res = {
                        id: i.id,
                        name: i.name,
                        overviews: i.overviews,
                        auth: {
                            read: false
                        },
                        roles: user_roles,
                        type: i.type
                    }
                    
                    if(i.type === 'service'){
                        res.jsonContent = i.jsonContent
                        res.price = i.price
                    } else if(!is_project_member){
                        res.is_project_member = false
                        res.allow_join_requests = i.preferences?.project_settings?.find(j => j.val === 'allow_join_requests')?.enable || true
                    }
                }
                return res
            }))
        }
        return team
    },
    
    /**
     * 添加用户到团队
     * @param {Object} team - 团队对象
     * @param {string} user_id - 用户ID
     * @param {Number} memberRole - 用户角色ID
     */
    async addUser(...args) {
        const [ team, user_id, memberRole ] = args;
        //为当前用户创建一个成员
        const create_member_for_newUser = await strapi.entityService.create('api::member.member',{
            // @ts-ignore
            data: {
                by_user: user_id,
                by_team: team.id,
                member_roles: {
                    set: [memberRole]
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
        if(create_member_for_newUser){
            let joined_user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id)
            const mm_team = team.mm_team;
            if(joined_user?.mm_profile && mm_team){
                const mmapi = strapi.plugin('mattermost').service('mmapi');
                let params = {
                    "team_id": mm_team.id,
                    // @ts-ignore
                    "user_id": joined_user.mm_profile?.id
                  }
                await mmapi.addMemberToTeam(mm_team.id, params);
            }
            return create_member_for_newUser
        }
    },
    async joinPublicChannel(...args) {
        const [ team, target_member ] = args;
        const allOpenChannels = team.team_channels.filter(i => i.type === 'O');
        if(allOpenChannels?.length > 0){
            // console.log('create_channel_member')
            const res = Promise.allSettled(allOpenChannels.map(async(i) => {
                const role_of_member_ByChannel = i.member_roles.find(j => j.subject === 'member');
                // console.log('role_of_member_ByChannel',role_of_member_ByChannel)
                await strapi.entityService.update('api::member-role.member-role',role_of_member_ByChannel.id, {
                    // @ts-ignore
                    data: {
                        members: {
                          connect: [target_member?.id]
                        }
                    },
                });
                await strapi.entityService.update('api::team-channel.team-channel',i.id, {
                    // @ts-ignore
                    data: {
                        members: {
                          connect: [target_member?.id]
                        }
                    },
                });
            })).catch(error => console.error(error));
            if(res) {
                return res
            }
        }
    },
    getRoles_byMembers(...args) {
        const [ user_id, members, member_roles ] = args;
        
        function hasIntersection(A, B) {
        //   console.log('A', A)
        //   console.log('B', B)
          const setA = new Set(A);
          const setB = new Set(B);
          return [...setA].some(element => setB.has(element));
        }
        function getIntersection(A, B) {
          // 将数组A和数组B转换为集合
          const setA = new Set(A);
          const setB = new Set(B);
        
          // 使用filter方法找出两个集合的共同元素
          const intersection = [...setA].filter(element => setB.has(element));
        
          // 返回交集数组
          return intersection;
        }
        // @ts-ignore
        // 用户在团队中的成员
        const user_members = members?.filter(i =>  i.by_user.id == user_id);
        // 用户成员的所有角色
        const user_memberRoles = user_members.map(i => i.member_roles).flat(2);
        // 用户成员的所有角色ID
        const user_memberRoles_ids = user_memberRoles.map(i => i.id);
        // 团队角色ID
        const _roles_ids = member_roles.map(i => i.id);
        // 成员在团队中的角色ID（成员的角色ID 与 团队角色ID的交集）
        const intersection = getIntersection(user_memberRoles_ids, _roles_ids);
        // 用户在团队中所有角色
        return user_memberRoles.filter(i => intersection.includes(i.id))
    },
    async getMemberRolesByTeam(...args){
        const [user_id, team_id] = args;
        const memberRoles_inTeam = await strapi.db.query('api::member-role.member-role').findMany({
            where: {
                by_team: team_id,
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
    },
    join(...args) {
      const [ team_id ] = args;
      // 使用团队ID创建房间名称
      const room_name = `team_room_${team_id}`;
      let ctx = strapi.requestContext.get();
      const user_id = Number(ctx.state.user.id);
      ctx.room_name = room_name;
      // 将客户端加入房间
      strapi.socket.join(room_name);
      strapi.$io.raw({ event: 'room:join', rooms: [room_name], data: { message: 'joined team room' } });
      // strapi.$io.emit({ event: 'room:join', schema, data });
      const self_room = `user_room_${user_id}`
      strapi.socket.join(self_room);
      strapi.$io.raw({ event: 'room:join', rooms: [self_room], data: { message: 'joined self room' } });
    },
    leave(...args) {
      const [ team_id ] = args;
      // 使用团队ID创建房间名称
      const room_name = `team_room_${team_id}`;
      let ctx = strapi.requestContext.get();
      ctx.room_name = `team_room_${user.default_team?.id}`;
      // 将客户端加入房间
      strapi.socket.leave(room_name);
    },
    async getTeamLevelLimit (args) {
        const {team_id} = args;
        
        const owner_member = await strapi.db.query('api::member.member').findOne({
            where: {
                by_team: team_id,
                member_roles: {
                    subject: 'admin'
                }
            },
            populate: {
                by_user: {
                    fields: ['id','username']
                }
            }
        })
        // console.log('owner_user', owner_member)
        const owner_user = owner_member.by_user
        const team_admin = await strapi.entityService.findOne('plugin::users-permissions.user',owner_user.id, {
            fields: ['partner_level', 'level_expiry_time']
        });
        // console.log('team_admin', team_admin)
        
        const level_entry = await strapi.db.query('api::system.system').findOne({
            where: {
                id: 1
            },
            populate: {
                user_level: true
            }
        })
        // console.log('level_entry', level_entry)
        let level = team_admin.partner_level || 'Regular'
        
        // 为兼容旧字段做的判断
        if(level === 'level 1'){
            level = 'Regular'
        }
        if(level === 'level 2'){
            level = 'Professional'
        }
        if(level === 'level 3'){
            level = 'Enterprise'
        }
        
        let level_detail = level_entry.user_level.find(i => i.title === level);
        // console.log('level_detail', level_detail)
        level_detail.expiry_time = team_admin.level_expiry_time
        
        return level_detail
    },
    async countCardsNumber(args) {
        const { team_id, project_id } = args;
        let by_members = {};
        if(team_id){
            by_members = {
                by_team: team_id
            }
        }
        if(project_id){
            by_members = {
                by_project: project_id
            }
        }
        const countCards = await strapi.db.query('api::card.card').count({
            where: {
                creator: {
                    by_members: by_members
                }
            }
        })
        // console.log('countCards', countCards)

        return countCards
    },
    async countMember(args) {
        const { team_id, project_id } = args;
        let params = {};
        if(team_id){
            params = {
                by_team: team_id
            }
        }
        if(project_id){
            params = {
                by_project: project_id
            }
        }
        // console.log('params', params)
        const count = await strapi.db.query('api::member.member').count({
            where: params
        })
        // console.log('count', count)
        

        return count
    },
    async countOverviewSize (args) {
        const { team_id, project_id } = args;
        let by_members = {};
        if(team_id){
            by_members = {
                by_team: team_id
            }
        }
        if(project_id){
            by_members = {
                by_project: project_id
            }
        }
        // 查询所有相关的 overview
        const count = await strapi.db.query('api::overview.overview').count({
            where: {
                creator: {
                    by_members: by_members
                },
            }
        });
    
        let totalSize = 0;
        let offset = 0;
        let fetchedCount = 0; // 当前已获取的数量
    
        do {
            // console.log('开始执行查询')
            const overviews = await strapi.db.query('api::overview.overview').findMany({
                where: {
                    creator: {
                        by_members: by_members
                    },
                },
                select: ['id'],
                offset: offset,
                limit: offset,
                populate: {
                    media: {
                        select: ['size']
                    },
                },
            });
    
            const sizes = overviews.filter(i => i.media?.size)?.map(j => j.media.size);
            // console.log('获取所有size', sizes)
            totalSize += sizes.reduce((accumulator, currentValue) => {
                return accumulator + currentValue; // 累加当前值
            }, 0);
            // console.log('获取所有size', sizes)
    
            fetchedCount = overviews.length; // 更新当前已获取的数量
            // console.log('更新当前已获取的数量', fetchedCount)
            offset += fetchedCount; // 更新偏移量
            // console.log('更新偏移量', offset)
    
        } while (fetchedCount > 0 && offset < count); // 当获取到的数据量大于0且未达到总数时继续查询
    
        // console.log(result)
        return totalSize
    },
    async countStorageFileSize (args) {
        const { team_id, project_id } = args;
        let by_members = {};
        if(team_id){
            by_members = {
                by_team: team_id
            }
        }
        if(project_id){
            by_members = {
                by_project: project_id
            }
        }
        // 查询所有相关的 overview
        const count = await strapi.db.query('api::storage-file.storage-file').count({
            where: {
                creator: {
                    by_members: by_members
                },
            }
        });
    
        let totalSize = 0;
        let offset = 0;
        let fetchedCount = 0; // 当前已获取的数量
    
        do {
            // console.log('开始执行查询')
            const files = await strapi.db.query('api::storage-file.storage-file').findMany({
                where: {
                    creator: {
                        by_members: by_members
                    },
                },
                select: ['id'],
                offset: offset,
                limit: offset,
                populate: {
                    file: {
                        select: ['size']
                    },
                },
            });
    
            const sizes = files.filter(i => i.file?.size)?.map(j => j.file.size);
            // console.log('获取所有size', sizes)
            totalSize += sizes.reduce((accumulator, currentValue) => {
                return accumulator + currentValue; // 累加当前值
            }, 0);
            // console.log('获取所有size', sizes)
    
            fetchedCount = files.length; // 更新当前已获取的数量
            // console.log('更新当前已获取的数量', fetchedCount)
            offset += fetchedCount; // 更新偏移量
            // console.log('更新偏移量', offset)
    
        } while (fetchedCount > 0 && offset < count); // 当获取到的数据量大于0且未达到总数时继续查询
    
        // console.log(result)
        return totalSize
    },
    async countTodoAttachmentSize (args) {
        const { team_id, project_id } = args;
        let by_members = {};
        if(team_id){
            by_members = {
                by_team: team_id
            }
        }
        if(project_id){
            by_members = {
                by_project: project_id
            }
        }
        // 查询所有相关的 overview
        const count = await strapi.db.query('api::todo.todo').count({
            where: {
                creator: {
                    by_members: by_members
                },
            }
        });
    
        let totalSize = 0;
        let offset = 0;
        let fetchedCount = 0; // 当前已获取的数量
    
        do {
            // console.log('开始执行查询')
            const todos = await strapi.db.query('api::todo.todo').findMany({
                where: {
                    creator: {
                        by_members: by_members
                    },
                },
                select: ['id'],
                offset: offset,
                limit: offset,
                populate: {
                    attachment: {
                        select: ['size']
                    },
                },
            });
    
            const sizes = todos.filter(i => i.attachment?.size)?.map(j => j.attachment.size);
            // console.log('获取所有size', sizes)
            totalSize += sizes.reduce((accumulator, currentValue) => {
                return accumulator + currentValue; // 累加当前值
            }, 0);
            // console.log('获取所有size', sizes)
    
            fetchedCount = todos.length; // 更新当前已获取的数量
            // console.log('更新当前已获取的数量', fetchedCount)
            offset += fetchedCount; // 更新偏移量
            // console.log('更新偏移量', offset)
    
        } while (fetchedCount > 0 && offset < count); // 当获取到的数据量大于0且未达到总数时继续查询
    
        // console.log(result)
        return totalSize
    },
    async countStorageSize(args) {
        const { team_id, project_id } = args;
        let params = {};
        if(team_id){
            params = {
                by_team: team_id
            }
        }
        if(project_id){
            params = {
                by_project: project_id
            }
        }
        const overviewSize = await strapi.service('api::team.team').countOverviewSize(team_id, project_id)
        const fileSize = await strapi.service('api::team.team').countStorageFileSize(team_id, project_id)
        const todoAttachmentSize = await strapi.service('api::team.team').countTodoAttachmentSize(team_id, project_id)
        
        return overviewSize + fileSize + todoAttachmentSize
    },
    
    async statistics (args) {
        const { team_id, project_id } = args;
        // console.log('team_id, project_id', team_id, project_id)
        let params = {};
        if(team_id){
            params = {
                by_team: team_id
            }
        }
        if(project_id){
            params = {
                by_project: project_id
            }
        }
        // console.log('params a', params)
        const storage_size = await strapi.service('api::team.team').countStorageSize({team_id, project_id})
        const cards_number = await strapi.service('api::team.team').countCardsNumber({team_id, project_id})
        const member_number = await strapi.service('api::team.team').countMember({team_id, project_id})
        return {
            storage_size,
            cards_number,
            member_number
        }
    }
}));
