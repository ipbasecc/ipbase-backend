'use strict';

/**
 * team service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::team.team',({strapi}) => ({
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
        const team = await strapi.entityService.findOne('api::team.team',team_id,{
            populate: {
                members: {
                    fields: ['id'],
                    populate: {
                        by_user: {
                            fields: ['id']
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
        })
        if(team){
            const roles = team.members?.filter(i => i.by_user.id === user_id).map(j => j.member_roles).flat(2);
            if(roles?.length === 0){
                return false
            }
            const _ACLs = roles?.map(i => i.ACL).flat(2)?.filter(j => j.collection === collection).flat(2);
            // @ts-ignore
            auth = {
                create: _ACLs.filter(i => i.create)?.length > 0,
                delete: _ACLs.filter(i => i.delete)?.length > 0,
                read: _ACLs.filter(i => i.read)?.length > 0,
                modify: _ACLs.filter(i => i.modify)?.length > 0
            }
            if(field){
                const _field = _ACLs.map(i => i.fields_permission)?.flat(2)?.filter(j => j.field === field && j.modify)
                auth.field = _field?.length > 0 // 鉴定提供的字段是否是modify
            }
            const blocks = team.members?.filter(i => i.by_user.id === user_id).map(j => j.member_roles).flat(2).filter(k => k.subject === 'blocked');
            const unconfirmeds = team.members?.filter(i => i.by_user.id === user_id).map(j => j.member_roles).flat(2).filter(k => k.subject === 'unconfirmed');
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
            }}
        )
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
        const getChannelAuth = async (channel_id) => {
            return await strapi.service('api::team-channel.team-channel').getRole(user_id,channel_id,'channel');
        }
        const getProjectAuth = async (project_id) => {
            const project = await strapi.service('api::project.project').find_projectByID(project_id);
            return strapi.service('api::project.project').clac_project_auth(project,user_id);
        }

        // @ts-ignore
        if(team.team_channels?.length > 0){
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
                const { read } = await getProjectAuth(i.id);
                // console.log('getProjectAuth auth',read);
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
                        }
                    }
                }
                return res
            }))
        }
        return team
    },
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
    }
}));
