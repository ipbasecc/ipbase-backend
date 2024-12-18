// @ts-nocheck
'use strict';

/**
 * project service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::project.project', ({ strapi }) => ({
    async initRole(...args) {
      const [user_id, team] = args;
      const { roleBase } = require('./roleBase.js');
      const role_base = await roleBase();
      try {
        const roleBaseResults = await Promise.allSettled(role_base.map(async (i) => {
          const res = await strapi.entityService.create('api::member-role.member-role', {
            data: {
              subject: i.role,
              ACL: i.ACL,
            },
          });
          return res;
        }));
  
        const successfulResults = roleBaseResults.filter((result) => result.status === 'fulfilled');
        const role_creator = successfulResults.find((result) => result.value.subject === 'creator');
        const role_owner = successfulResults.find((result) => result.value.subject === 'owner');
  
        if (role_creator && role_owner) {
            let initMember
            if(team){
                initMember = await strapi.service('api::team.team').findTeamMemberByUserID(user_id,team.id);
                if(!initMember){
                    ctx.throw(404, '当前用户不在团队中');
                }
                await strapi.entityService.update('api::member-role.member-role',role_creator.value.id,{
                    data: {
                        members: {
                            set: [ initMember.id ]
                        }
                    }
                })
                await strapi.entityService.update('api::member-role.member-role',role_owner.value.id,{
                    data: {
                        members: {
                            set: [ initMember.id ]
                        }
                    }
                })
            } else {
              initMember = await strapi.entityService.create('api::member.member', {
                data: {
                    by_user: user_id,
                    member_roles: {
                      set: [role_creator.value.id, role_owner.value.id],
                    },
                },
              });
            }
            
  
          if (initMember) {
            const data = { roles: successfulResults, members: [initMember] };
            return data;
          }
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        throw error;
      }
    },
    calc_ACL(...args) {
      // 入参：项目 所属分类 具体字段
      const [members,member_roles,user_id] = args;
      // 当前用户的成员条目集
      const user_members = members.filter(i => i.by_user.id === user_id);
      // 当前用户成员对应的成员权限ID集
      const member_role_id = user_members?.length > 0 ? user_members.map(j => j.member_roles.map(k => k.id)).flat(2) : [];
    //   console.log('member_role_id',member_role_id);

      // 计算出当前用户成员对应的所有权限
      const _member_roles = member_roles?.map(i => i.id);
    //   console.log('_member_roles',_member_roles);
      const ACL = member_roles?.filter(i => member_role_id?.includes(i.id));
      
    //   console.log('ACL ACL',ACL);
      // 分离出用户成员的名称、方便后续判断是否为特殊成员组
      const role_names = ACL.map(i => i.subject);
      
      // 当前用户是否被拉黑
      const _blocked = member_roles.find(i => i.subject === 'blocked');
      const is_blocked = member_role_id?.includes(_blocked?.id);
      return { ACL, is_blocked, role_names }
    },
    calc_collection_ACL(...args) {
      const [ACL,collection] = args;
      const collection_ACL = ACL.map(i => i.ACL.find(p => p.collection === collection));

      return collection_ACL
    },
    calc_collection_auth(...args) {
      const [ACL,collection] = args;
    //   console.log('collection',collection);
      const collection_ACL = ACL.map(i => i.ACL.find(p => p.collection === collection));
    //   console.log('collection_ACL', collection_ACL)
      let read = collection_ACL?.filter(i => i.read)?.length > 0;
      let create = collection_ACL?.filter(i => i.create)?.length > 0;
      let modify = collection_ACL?.filter(i => i.modify)?.length > 0;
      let remove = collection_ACL?.filter(i => i.delete)?.length > 0;
    //   console.log(read, create, modify, remove);

      return { read, create, modify, remove }
    },
    calc_field_ACL(...args) {
      const [ACL,collection,field] = args;
      const collection_ACL = ACL.map(i => i.ACL)?.flat(2)?.filter(p => p.collection === collection);
      
      return collection_ACL.map(i => i.fields_permission).flat(2).filter(j => j.modify && j.field === field)?.length > 0
    },
    clac_authed_fields(...args) {
      const [ACL,collection] = args;
      
      const collection_ACL = ACL.map(i => i.ACL).flat(2).filter(p => p.collection === collection);
      
      let authed_fields = collection_ACL?.map(i => i.fields_permission)?.flat(2).filter(i => i.modify).map(j => j.field);
      return authed_fields
    },
    async find_projectByID(...args) {
      const [project_id] = args
      const populate = strapi.service('api::project.project').response_template();
      
      let project = await strapi.entityService.findOne('api::project.project', project_id,{
        populate: populate
      });
      if(project){
        return project
      }
    },
    async find_projectMemberByUID(...args) {
        const [ user_id, project_id ] = args;
        const _project_member = await strapi.entityService.findMany('api::member.member',{
            filters: {
                $and: [
                  {
                    by_projects: {
                        id: project_id
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
        if(_project_member?.length > 0){
            return _project_member[0]
        } else {
            return null
        }
        
    },
    async find_allCard_for_externalMember(...args){
      const [project,user_id] = args;
      
      const member_byProject = project.project_members.find(i => i.by_user.id === user_id);
      let cards = await strapi.entityService.findMany('api::card.card',{
          filters: {
              card_members: {
                  id: member_byProject.id
              }
          },
          populate: {
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
      cards = cards.map((i) => ({
          ...i,
          card_members: i.card_members.filter(j => j.by_user.id === user_id)
      }))
      return cards
    },
    clac_project_auth(...args){
        const [ project, user_id ] = args;
        const ctx = strapi.requestContext.get();

        const members = project.project_members;
        const member_roles = project.member_roles;
        // console.log('ACL ACL',members,member_roles);
        const {ACL, is_blocked, role_names} = strapi.service('api::project.project').calc_ACL(members, member_roles, user_id);
        
        const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'project');
        const authed_fields = strapi.service('api::project.project').clac_authed_fields(ACL,'project');
        // console.log('authed_fields ACL',authed_fields);
        return { read, create, modify, remove, is_blocked, role_names, ACL, authed_fields }
    },
    async clac_projectCard_auth(...args){
        const [ project_id, user_id, collection ] = args;
        // console.log('collection', collection)
        const project_roles_by_user = await strapi.db.query('api::member-role.member-role').findMany({
            where: {
                by_project: project_id,
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
        
        // console.log('project_roles_by_user', project_roles_by_user)
        const role_names = project_roles_by_user.map(i => i.subject)
        const is_blocked = !!project_roles_by_user.find(i => i.subject === 'blocked')
        const ACL = project_roles_by_user.map(i => i.ACL).flat(2);
        
        const collectionAuth = (_collection) => {
            const ACLs = ACL.filter(i => i.collection === _collection);
            // console.log('project_roles_by_user ACLs', ACLs)
            return {
                read: ACLs.filter(i => i.read)?.length > 0,
                create: ACLs.filter(i => i.create)?.length > 0,
                modify: ACLs.filter(i => i.modify)?.length > 0,
                remove: ACLs.filter(i => i.delete)?.length > 0,
                authed_fields: [...new Set(ACLs.map(i => i.fields_permission).flat(2)?.filter(i => i.modify)?.map(j => j.field))]
            }
        }
        
        const { read, create, modify, remove, authed_fields } = collectionAuth(collection);
        // console.log('read 1',read);
        return { read, create, modify, remove, is_blocked, role_names, ACL, authed_fields }
    },
    async process_updateProject_params(...args){
      const [data,fields_permission,props] = args;
      // console.log('fields_permission',fields_permission);
      const ctx = strapi.requestContext.get();
      let params = {};
      if(data.name) {
          if(fields_permission.includes('name')) {
              params.name = data.name
          } else {
              ctx.throw(403, '您无权修改项目名称')
          }
      }
      if(data.description) {
          if(fields_permission.includes('description')) {
              params.description = data.description
          } else {
              ctx.throw(403, '您无权修改项目简介')
          }
      }
      if(data.type) {
          if(fields_permission.includes('type')) {
              params.type = data.type
          } else {
              ctx.throw(403, '您无权修改项目类型')
          }
      }
      if(data.cover) {
          if(fields_permission.includes('cover')) {
              params.cover = data.cover
          } else {
              ctx.throw(403, '您无权修改项目封面')
          }
      }
      if(data.default_version) {
          if(fields_permission.includes('default_version')) {
              params.default_version = data.default_version
          } else {
              ctx.throw(403, '您无权修改项目默认版本')
          }
      }
      if(data.invite_uris) {
          if(fields_permission.includes('invite_uris')) {
              params.invite_uris = data.invite_uris
          } else {
              ctx.throw(403, '您无权邀请成员')
          }
      }
      if(data.jsonContent) {
          if(fields_permission.includes('jsonContent')) {
              params.jsonContent = data.jsonContent
          } else {
              ctx.throw(403, '您无权修改项目详情')
          }
      }
      if(data.private) {
          if(fields_permission.includes('private')) {
              params.private = data.private
          } else {
              ctx.throw(403, '您无权修改项目隐私设置')
          }
      }
      if(data.boards) {
          if(props.orderBoards) {
              params.boards = data.boards
          } else {
              ctx.throw(403, '您无权对任务集进行排序')
          }
      }
      if(data.schedules) {
          if(props.orderSchedules) {
              params.schedules = {
                set: data.schedules
              }
          } else {
              ctx.throw(403, '您无权对规划进行排序')
          }
      }
      if(data.project_documents) {
        // console.log(data.project_documents);
          if(props.orderDocuments) {
              params.project_documents = {
                set: data.project_documents
              }
          } else {
              ctx.throw(403, '您无权对文档进行排序')
          }
      }
      if(data.storages) {
          if(props.orderStorages) {
              params.storages = {
                set: data.storages
              }
          } else {
              ctx.throw(403, '您无权对文档进行排序')
          }
      }
      if(data.member_roles) {
          if(fields_permission.includes('manageRole')) {
                // console.log(data);
                params.member_roles = data.member_roles
          } else {
              ctx.throw(403, '您无权修改项目权限设置')
          }
      }
      if(data.project_members) {
          if(fields_permission.includes('manageMember')) {
              params.project_members = data.project_members
          } else {
              ctx.throw(403, '您无权修改项目成员')
          }
      }
      if(data.preferences) {
        //   console.log(fields_permission?.includes('preferences'))
          if(fields_permission.includes('preferences')) {
              params.preferences = data.preferences
          } else {
              ctx.throw(403, '您无权执行此操作')
          }
      }
      if(data.price) {
        //   console.log(fields_permission?.includes('preferences'))
          if(fields_permission.includes('price')) {
              params.price = data.price
          } else {
              ctx.throw(403, '您无权修改价格')
          }
      }
      return params
    },
    process_response(...args) {
        const ctx = strapi.requestContext.get();
        const [ project, __ACL ] = args;
        // console.log('ACL',__ACL);

        const { read:read_board } = strapi.service('api::project.project').calc_collection_auth(__ACL,'board');
        const { read:read_group } = strapi.service('api::project.project').calc_collection_auth(__ACL,'group');
        const { read:read_kanban } = strapi.service('api::project.project').calc_collection_auth(__ACL,'kanban');
        const { read:read_storage } = strapi.service('api::project.project').calc_collection_auth(__ACL,'storage');
        const { read:read_schedule } = strapi.service('api::project.project').calc_collection_auth(__ACL,'schedule');
        const can_approve = strapi.service('api::project.project').calc_field_ACL(__ACL,'project','approve_join_request');
        
        if(!can_approve){
            delete project.join_requests
        }

        if(!read_board) {
            project.boards = []
        }
        if(!read_group) {
            project.boards = project.boards.map(b => ({
                ...b,
                groups: []
            }))
        }
        if(!read_kanban) {
            project.boards = project.boards.map(b => ({
                ...b,
                groups: b.groups.map(g => ({
                    ...g,
                    kanbans: []
                }))
            }))
        }
        if(!project.storages?.length>0){
            project.storages.map(i => {
                let creator = i.creator?.id;
                let readers = i.can_read_user?.map(j => j.id) || [];
                let writers = i.can_write_user?.map(j => j.id) || [];
                if((!i.private && read_storage) || creator === user_id || readers.includes(user_id) || writers.includes(user_id)){
                    i = i
                } else {
                    i = null
                }
            });
            project.storages = project.storages.filter(i => i != null);
        }
        if(project.schedules?.length>0) {
            if(!read_schedule){
                project.schedules = []
            } else {
                project.schedules.map(i => {
                    let creator = i.creator?.id;
                    let readers = i.can_read_user?.map(j => j.id) || [];
                    let writers = i.can_write_user?.map(j => j.id) || [];
                    if(!i.private || creator === user_id || readers.includes(user_id) || writers.includes(user_id)){
                        i = i
                    } else {
                        i = null
                    }
                });
            }
        }

        delete project.invite_uris
        return project
    },
    response_template() {
        let res = {
            overviews: {
                populate: {
                    media: {
                        fields: ['ext','url']
                    }
                }
            },
            boards: {
                populate: {
                    groups: {
                        populate: {
                            kanbans: true,
                            icon: {
                                fields: ['ext','url']
                            }
                        }
                    }
                }
            },
            blocked: {
                fields: ['id']
            },
            creator: {
                fields: ['id']
            },
            storages: {
                populate: {
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
                    },
                    can_read_user: {
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
                    can_write_user: {
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
            schedules: {
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
            project_documents: {
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
            project_members: {
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
            by_team: {
                populate: {
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
                    }
                }
            },
            join_requests: {
                fields: ['id','approved']
            }
        }
        return res
    },
    async removeUer_from_mmChannel(...args){
        const ctx = strapi.requestContext.get();
        const [ project,cur_user_id,user_id_by_willRemove,removeMember_id ] = args;
        const mmapi = strapi.plugin('mattermost').service('mmapi');

        const channel_id = project.mm_channel?.id;
        if(!channel_id){
            ctx.throw(404,'没有找到该项目关联的讨论频道')
        }

        let getMmuser = await strapi.entityService.findOne('plugin::users-permissions.user',user_id_by_willRemove);
        if(getMmuser){

            // @ts-ignore
            const mmuser_id = getMmuser.mm_profile?.id
            const mmChannel = await mmapi.getChannelMember(channel_id,mmuser_id);
            if(mmChannel){
                await mmapi.RemoveUserFromChannel(channel_id,mmuser_id);
            }
            return
        }
    },
    async addUser_to_mmChannel(...args){

        // https://your-mattermost-url.com/api/v4/channels/{channel_id}/members
        const [project,target_user_id] = args;

        let joined_user = await strapi.entityService.findOne('plugin::users-permissions.user',target_user_id);

        const team_id = project.by_team?.mm_team?.id;
        const channel_id = project.mm_channel?.id;
        const mm_user_id = joined_user.mm_profile.id;
        
        // console.log('project', project)
        // console.log('joined_user', joined_user)

        let member_team;
        let member_channel;
        const mmapi = strapi.plugin('mattermost').service('mmapi');

        const get_team = async () => {
            const _t = await mmapi.getTeamMember(team_id,mm_user_id);
            return _t
        }
        const join_team = async () => {
            const params = {
                "team_id":  team_id,
                "user_id": mm_user_id
            }
            
            const _join_team = await mmapi.addMemberToTeam(team_id,params)
            return _join_team
        }
        const get_channel = async () => {
            const _get_channel = await mmapi.getChannelMember(channel_id,mm_user_id);
            return _get_channel
        }
        const join_channel = async () => {
            const params = {
                "user_id": mm_user_id
            }
            const _join_channel = await mmapi.addMemberToChannel(channel_id,params)
            return _join_channel
        }

        // 确认用户团队
        const _get_team = await get_team();
            // console.log('_get_team',_get_team);
        if(!_get_team){
            let _team = await join_team();
            if(_team){
                member_team = _team
            }
        } else {
            member_team = _get_team
        }
        if(member_team){
            //确认用户频道
            const _get_channel = await get_channel();
            // console.log('_get_channel',_get_channel);
            if(!_get_channel){
                let _join_channel = await join_channel();
                if(_join_channel) {
                    member_channel = _join_channel
                }
            } else {
                member_channel = _get_channel
            }
        }
        // 用户加入当前项目关联的频道后，发送消息
        if(member_channel){
            return member_channel
        }
    },
    async remove_member_from_mmChannel(...args){
        const [project,target_user_id] = args;
        let target_user = await strapi.entityService.findOne('plugin::users-permissions.user',target_user_id);

        const channel_id = project.mm_channel?.id;
        const mm_user_id = target_user.mm_profile.id;

        const mmapi = strapi.plugin('mattermost').service('mmapi');

        const target_user_mmChannel = await mmapi.getChannelMember(channel_id,mm_user_id);
        if(target_user_mmChannel){
            await mmapi.RemoveUserFromChannel(channel_id,mm_user_id);
        }

    },
    async addUser(...args) {
        const [ project, teamMember, memberRole ] = args;
        // console.log('addUser',project, teamMember, memberRole);
        // const user_id = teamMember.by_user?.id;

        if(teamMember){
            const updateMember = await strapi.entityService.update('api::member.member',teamMember.id,{
                data: {
                    member_roles: {
                        connect: [ memberRole ]
                    },
                    by_projects: {
                        connect: [ project.id ]
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
            return updateMember
        } else {
            ctx.throw(501,'缺少加入项目的团队成员数据')
        }
    },
    filterResponseByAuth(...args){
        const [project, user_id] = args
        const getProjectAuth = (_project, _user_id) => {
            return strapi.service('api::project.project').clac_project_auth(_project,_user_id);
        }
            
        let res = {}
        const { read } = getProjectAuth(project, user_id);
        // console.log('getProjectAuth auth',read);
        if(read){
            return {
                ...project,
                auth: {
                    read: true
                }
            }
        } else {
            res = {
                id: project.id,
                name: project.name,
                overviews: project.overviews,
                auth: {
                    read: false
                }
            }
        }
        return res
    },
    async findHasAuthUserByField(args) {
        const {project_id, field} = args;
        const knex = strapi.db.connection;
        try {
            if (!project_id || typeof project_id !== 'number') {
                throw new Error('Invalid project_id');
            }
    
            const result = await knex.raw(`
                WITH authorized_roles AS (
                    SELECT DISTINCT mr.id as role_id
                    FROM member_roles mr
                    JOIN member_roles_by_project_links mrp ON mr.id = mrp.member_role_id
                    JOIN member_roles_components mrc ON mr.id = mrc.entity_id
                    JOIN components_project_collection_permissions cp ON cp.id = mrc.component_id
                    JOIN components_project_collection_permissions_components cpcp ON cp.id = cpcp.entity_id
                    JOIN components_project_fields_permissions fp ON fp.id = cpcp.component_id
                    WHERE mrp.project_id = ?
                    AND mrc.component_type = 'project.collection-permission'
                    AND cpcp.component_type = 'project.fields-permission'
                    AND fp.field = 'approve_join_request'
                    AND fp.modify = true
                )
                SELECT DISTINCT mbu.user_id
                FROM members m
                JOIN members_by_projects_links mpl ON m.id = mpl.member_id
                JOIN member_roles_members_links mrml ON m.id = mrml.member_id
                JOIN members_by_user_links mbu ON m.id = mbu.member_id
                WHERE mpl.project_id = ?
                AND mrml.member_role_id IN (SELECT role_id FROM authorized_roles)
            `, [project_id, project_id]);
    
            const userIds = result.rows.map(row => row.user_id);
    
            // 开发环境下的调试日志
            if (process.env.NODE_ENV === 'development') {
                console.log('Authorized user IDs:', userIds);
            }
    
            return userIds;
    
        } catch (error) {
            console.error('Error finding users with permission:', error);
            if (error.message === 'Invalid project_id') {
                throw new Error('Invalid project ID provided');
            }
            throw error;
        }
    }
  }));
  
