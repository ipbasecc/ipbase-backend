// @ts-nocheck
'use strict';

/**
 * team-channel service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::team-channel.team-channel',({strapi}) => ({
  populate_template(){
      const populate = {
          mm_channel: true,
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
          team: true
      }
      return populate
  },
    async initRole(...args) {
        const ctx = strapi.requestContext.get();
        const [user_id,team_id] = args;
        let memberInTeam = await strapi.service('api::team.team').findTeamMemberByUserID(user_id,team_id);
        if(!memberInTeam){
            ctx.throw(404, '没有找到对应的团队成员')
        }
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
          if (role_admin) {
            await strapi.entityService.update('api::member-role.member-role', role_admin.value.id, {
              // @ts-ignore
              data: {
                  members: {
                    set: [ memberInTeam.id ]
                  }
              },
            });
          const data = { roles: successfulResults, members: [memberInTeam] };
          return data;
          }
        } catch (error) {
          console.error('Error during initialization:', error);
          throw error;
        }
    },
    async getRole(...args) {
        const [ user_id, channel_id, collection, field ] = args;
        let auth = {
            create: false,
            delete: false,
            read: false,
            modify: false,
            isBlock: false,
            unconfirmed: false,
            field: false,
        }
        const channel = await strapi.entityService.findOne('api::team-channel.team-channel',channel_id,{
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
        if(channel){
            const roles = channel.members?.filter(i => i.by_user.id === user_id).map(j => j.member_roles).flat(2);
            if(roles?.length === 0){
                if(channel.mm_channel?.type === 'O'){
                    auth = {
                        read: true
                    }
                } else {
                    auth = false
                }
                return auth
            }
            const _ACLs = roles?.map(i => i.ACL).flat(2)?.filter(j => j.collection === collection).flat(2);
            // @ts-ignore
            auth = {
                create: _ACLs.filter(i => i.create)?.length > 0,
                delete: _ACLs.filter(i => i.delete)?.length > 0,
                read: channel.mm_channel?.type === 'O' ? true : _ACLs.filter(i => i.read)?.length > 0,
                modify: _ACLs.filter(i => i.modify)?.length > 0
            }
            if(field){
                const _field = _ACLs.map(i => i.fields_permission)?.flat(2)?.filter(j => j.field === field && j.modify)
                auth.field = _field?.length > 0 // 鉴定提供的字段是否是modify
            }
            const blocks = channel.members?.filter(i => i.by_user.id === user_id).map(j => j.member_roles).flat(2).filter(k => k.subject === 'blocked');
            const unconfirmeds = channel.members?.filter(i => i.by_user.id === user_id).map(j => j.member_roles).flat(2).filter(k => k.subject === 'unconfirmed');
            auth.isBlock = blocks?.length > 0
            auth.unconfirmed = unconfirmeds?.length > 0
        }
        return auth
    },
    async findChannelByID(...args) {
        const [ channel_id ] = args;

        const channel = strapi.entityService.findOne('api::team-channel.team-channel',channel_id,{
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
                team: {
                    fields: ['id','mm_team']
                }
            }
        })
        if(channel){
            return channel
        }
    }
}));
