// src/extensions/users-permissions/controllers/user.js
const userService = require('../services/userService');
const team_populate = {
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
                        fields: ['id','accept_friend','friend_request_question'],
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
    team_channels: {
        populate: {
            members: {
                populate: {
                    by_user: {
                        fields: ['id','username','mm_profile'],
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
    },
    team_logo: {
        fields: ['id','url','ext']
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
                        fields: ['id','username','mm_profile'],
                    },
                    member_roles: true
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
}
const responseUser = {
    fields: ['id','username','email','self_tags','mm_profile', 'initialization', 'feature_key'],
    populate: {
        todogroups: {
            populate: {
                todos: true,
                kanban: {
                    fields: ['id']
                }
            }
        },
        config: true,
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
        contact: {
          fields: ['id','accept_friend','friend_request_question'],
          populate: {
              contacters: {
                  fields: ['id','username','mm_profile','email'],
                  populate: {
                      profile: {
                          avatar: {
                              fields: ['id','ext','url']
                          },
                          cover: {
                              fields: ['id','ext','url']
                          },
                          brand: {
                              fields: ['id','ext','url']
                          },
                      }
                  }
              },
              friend_requests: {
                  populate: {
                      sender: {
                          fields: ['id','username','mm_profile','email'],
                          populate: {
                              profile: {
                                  avatar: {
                                      fields: ['id','ext','url']
                                  },
                              }
                          }
                      }
                  }
              },
              blockeds: {
                  fields: ['id','username','mm_profile','email'],
                  populate: {
                      profile: {
                          avatar: {
                              fields: ['id','ext','url']
                          },
                      }
                  }
              }
          }  
        },
        user_channel: {
            fields: ['id', 'title', 'description', 'slogan'],
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
                workingday: true,
                post: true
            }
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
        default_team: {
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
                                },
                                contact: {
                                    fields: ['id','accept_friend','friend_request_question'],
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
                team_channels: {
                    populate: {
                        members: {
                            populate: {
                                by_user: {
                                    fields: ['id','username','mm_profile'],
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
                },
                team_logo: {
                    fields: ['id','url','ext']
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
                                    fields: ['id','username','mm_profile'],
                                },
                                member_roles: true
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
            }
        },
        followed: {
            fields: ['id', 'username','email', 'mm_profile'],
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
                }
            }
            
        },
        notebooks: true
    }
};

module.exports = (strapi) => {
    return {
        init: async (ctx) => {
            const user_id = Number(ctx.state.user.id);
            if(!user_id) {
                ctx.throw(403, '请先登陆')
            }
            let user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id, responseUser);
            if(user) {
                if(user.default_team){
                    const team_id = user.default_team.id;
                    if (team_id) {
                      strapi.service('api::team.team').join(team_id);
                    }
                } else {
                    let teams = await strapi.entityService.findMany('api::team.team',{
                        filters: {
                            members: {
                                by_user: {
                                    id: user_id
                                }
                            }
                        },
                    })
                    if(teams?.length > 0){
                        const update_user = await strapi.entityService.update('plugin::users-permissions.user',user_id,{
                            data: {
                                default_team: teams[0].id
                            },
                            populate: {
                                default_team: {
                                    populate: team_populate
                                }
                            }
                        })
                        if(update_user){
                            const team_id = update_user.default_team.id;
                            if (team_id) {
                              strapi.service('api::team.team').join(team_id);
                            }
                        }
                    }
                }
                if(!user.contact){
                    const contact = await strapi.entityService.create('api::contact.contact',{
                        data: {
                            owner: user_id
                        },
                        populate: {
                          contacters: {
                              fields: ['id','username','mm_profile','email'],
                              populate: {
                                  profile: {
                                      avatar: {
                                          fields: ['id','ext','url']
                                      },
                                      cover: {
                                          fields: ['id','ext','url']
                                      },
                                      brand: {
                                          fields: ['id','ext','url']
                                      },
                                  }
                              }
                          }
                        } 
                    })
                    if(contact){
                        user.contact = contact
                    }
                }
                return user
                // return await userService.processUserdata(user, user_id)
            }
        },
        updateTodogroups: async (ctx) => {
            const user_id = Number(ctx.state.user.id);
            const {data} = ctx.request.body;
            if(!user_id) {
                ctx.throw(403, '请先登陆')
            }
            await strapi.entityService.update('plugin::users-permissions.user',user_id,{
                data: {
                    todogroups: {
                        disconnect: data.todogroups,
                    }
                }
            })
            let user = await strapi.entityService.update('plugin::users-permissions.user',user_id,{
                data: {
                    todogroups: {
                        connect: data.todogroups
                    }
                },
                populate: {
                    todogroups: {
                        populate: {
                            todos: true,
                            kanban: {
                                fields: ['id']
                            }
                        }
                    },
                }
            })
            if(user) {
                return user.todogroups
            }
        },
        updateAvatar: async (ctx) => {
            const user_id = Number(ctx.state.user.id);
            const { data } = ctx.request.body;
            if(!user_id) {
                ctx.throw(403, '请先登陆')
            }
            let user = await strapi.entityService.update('plugin::users-permissions.user',user_id,{
                data: {
                    profile: {
                        avatar: Number(data.avatar)
                    }
                },
                populate: {
                    profile: {
                        populate: {
                            avatar: {
                                fields: ['id','ext','url']
                            }
                        }
                    }
                }
            })
            if(user) {
    
                return user.profile
            }
        },
        modifyConfig: async (ctx) => {
            const user_id = Number(ctx.state.user.id);
            const { data } = ctx.request.body;
            if(!user_id) {
                ctx.throw(403, '请先登陆')
            }
            let user = await strapi.entityService.update('plugin::users-permissions.user',user_id,{
                data: {
                    config: data
                },
                populate: {
                    config: {
                        populate: {
                            default_bizcard: true
                        }
                    }
                }
            })
            if(user) {
                return user.config
            }
        },
        updateFollowed: async (ctx) => {
            const user_id = Number(ctx.state.user.id);
            const { new_follow, unfollow } = ctx.request.body.data;
            if(!user_id) {
                ctx.throw(403, '请先登陆')
            }
            let data
            if(new_follow){
                data = {
                    followed: {
                        connect: [new_follow]
                    }
                }
            }
            if(unfollow){
                data = {
                    followed: {
                        disconnect: [unfollow]
                    }
                }
            }
            let user = await strapi.entityService.update('plugin::users-permissions.user',user_id,{
                data: data,
                populate: {
                    followed: {
                        fields: ['id', 'username','email', 'mm_profile'],
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
                            }
                        }
                        
                    }
                }
            })
            if(user) {
                return user.followed
            }
        },
        setDefaultTeam: async (ctx) => {
            const user_id = Number(ctx.state.user.id);
            const {data} = ctx.request.body;
            if(!user_id) {
                ctx.throw(403, '请先登陆')
            }
            if(!data?.default_team) {
                ctx.throw(403, '请提供默认团队的ID')
            }
            const populate = strapi.service('api::team.team').populate_template();
            let update = await strapi.entityService.update('plugin::users-permissions.user',user_id,{
                data: {
                    default_team: data.default_team
                },
                populate: {
                    default_team: {
                        populate: team_populate
                    }
                }
            })
            if(update){
                // @ts-ignore
                if(update.default_team){
                    const team_id = update.default_team.id;
                    if (team_id) {
                      strapi.service('api::team.team').join(team_id);
                    }
                }
                update = await userService.processUserdata(update, user_id)
                return update.default_team
            }
        },
        update: async (ctx) => {
            const user_id = Number(ctx.state.user.id);
            const { data } = ctx.request.body;
            // console.log('data',data);
            if(!data){
                return ''
            }
            if(data?.config?.id){
                delete data.config.id
            }
            if(data?.profile?.id){
                delete data.profile.id
            }
            let target_id = Number(ctx.params.id);
            // console.log('target_id',target_id, 'user_id', user_id, '===', target_id === user_id);
            if(!user_id) {
              ctx.throw(403, '请先登陆')
            }
            if(target_id && target_id !== user_id) {
              ctx.throw(403, '没有权限')
            }
            let params = {};
            const _has = (val) => {
                // console.log('data',data);
                return data.hasOwnProperty(val)
            }
            if(_has('initialization')){
                params.initialization = data?.initialization
            }
            if(_has('feature_key')){
              params.feature_key = data.feature_key;
            }
            let user = await strapi.entityService.update('plugin::users-permissions.user',user_id,{
                data: data,
                ...responseUser
            })
            if(user) {
            //   console.log('user',user);
              return await userService.processUserdata(user, user_id)
            }
        },
        findKanbanByTodogroup: async (ctx) => {
            const user_id = Number(ctx.state.user.id);
            let kanban_id = Number(ctx.params.id);
            if(!kanban_id){
                ctx.throw(404, '缺少看板ID')
            } else {
                const kanban = await strapi.entityService.findOne('api::kanban.kanban', kanban_id, {
                    populate: {
                        group: {
                            fields: ['id'],
                            populate: {
                                board: {
                                    fields: ['id'],
                                    populate: {
                                        project: {
                                            fields: ['id'],
                                            populate: {
                                                by_team: {
                                                    fields: ['id']
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
                if(kanban){
                    return kanban
                }
            }
        },
        refreshToken: async (ctx) => {
            
            try {
              const user = ctx.state.user;
              // 检查用户信息是否有效
              if (!user) {
                return ctx.badRequest('用户信息无效');
              }
              
              // 生成新的 JWT
              const jwt = require('jsonwebtoken');
              const newToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET,{ expiresIn: '1d' });
        
              if(newToken){
                  return newToken
              }
            } catch (err) {
              return ctx.internalServerError('服务错误');
            }
        }
    }
};