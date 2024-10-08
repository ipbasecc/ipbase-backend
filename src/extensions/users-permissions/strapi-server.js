const user = require('./content-types/user');

module.exports = (plugin) => {
    //...

    plugin.contentTypes.user = user;
    const processMembers = (_team, user_id) => {
      // 如果用户是 “外部成员”，只返回基础数据，删除敏感数据
      const userMember = _team?.members?.find(i => i.by_user.id === user_id);
      const roles_byMember = userMember.member_roles.map(i => i.id);
      const roles_byTeam = _team.member_roles.map(i => i.id);
      const userMember_byTeam = roles_byTeam.filter(i => roles_byMember.includes(i));
      const userMemberRoles = _team.member_roles.filter(role => userMember_byTeam.includes(role.id));

      const process_external_data = () => {
        _team.members = [ userMember ];
        delete _team.member_roles;
        delete _team.team_channels;
        _team.projects = _team.projects?.filter(i => i.project_members?.map(j => j.id).includes(userMember.id));
        _team.projects = _team.projects.map(i => {
            i.project_members = [ userMember ];
            return i
        })
        _team.isExternal = true
      }
      const process_unconfirmed_data = () => {
        return {
          id: _team.id,
          name: _team.name,
          display_name: _team.display_name,
          team_logo: _team.team_logo,
          status: 'unconfirmed'
        }
      }
      const process_blocked_data = () => {
        return {
          id: _team.id,
          name: _team.name,
          display_name: _team.display_name,
          team_logo: _team.team_logo,
          status: 'blocked'
        }
      }
      if(userMemberRoles?.length > 0){
          const _userRoles = userMemberRoles.map(i => i.subject);
          if(_userRoles.includes('external')){
            process_external_data();
          }
          if(_userRoles.includes('unconfirmed')){
            _team = process_unconfirmed_data();
          }
          if(_userRoles.includes('blocked')){
            _team = process_blocked_data();
          }
      } else if (userMemberRoles?.length === 0) {
          process_external_data();
      }
      return _team
    }
    plugin.controllers.user.init = async (ctx) => {
        const user_id = Number(ctx.state.user.id);
        if(!user_id) {
            ctx.throw(403, '请先登陆')
        }
        let user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id,{
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
                        team_channels: true,
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
                }
            }
        })
        if(user) {
            // @ts-ignore
            if(user.default_team){
                // @ts-ignore
                let _team = await strapi.service('api::team.team').filterByAuth(user.default_team, user_id);
                user.default_team = processMembers(_team, user_id);
            }
            return user
        }
    }
    plugin.controllers.user.updateTodogroups = async (ctx) => {
        const user_id = Number(ctx.state.user.id);
        const {data} = ctx.request.body;
        if(!user_id) {
            ctx.throw(403, '请先登陆')
        }
        let user = await strapi.entityService.update('plugin::users-permissions.user',user_id,{
            data: data,
            populate: {
                todogroups: {
                    populate: {
                        todos: true
                    }
                },
            }
        })
        if(user) {
            return user.todogroups
        }
    }

    plugin.controllers.user.updateAvatar = async (ctx) => {
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
    }
    plugin.controllers.user.modifyConfig = async (ctx) => {
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
    }
    plugin.controllers.user.setDefaultTeam = async (ctx) => {
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
                    populate: populate
                }
            }
        })
        if(update){
            // @ts-ignore
            if(update.default_team){
                // @ts-ignore
                let _team = await strapi.service('api::team.team').filterByAuth(update.default_team, user_id);

                update.default_team = processMembers(_team, user_id);
            }
            return update.default_team
        }
    }
    plugin.controllers.user.update = async (ctx) => {
        const user_id = Number(ctx.state.user.id);
        const { data } = ctx.request.body;
        let target_id = Number(ctx.params.id);
        // console.log('data',data);
        if(!user_id) {
          ctx.throw(403, '请先登陆')
        }
        if(target_id && target_id !== user_id) {
          ctx.throw(403, '没有权限')
        }
        let params = {}
        params.initialization = data?.initialization || false;
        if(data?.feature_key){
          params.feature_key = data.feature_key;
        }
        let user = await strapi.entityService.update('plugin::users-permissions.user',user_id,{
            data: params,
            fields: ['initialization','feature_key']
        })
        if(user) {
        //   console.log('user',user);
          return user
        }
    }

    const register = plugin.controllers.auth.register;
    const resetPassword = plugin.controllers.auth.resetPassword;
    const changePassword = plugin.controllers.auth.changePassword;

    plugin.controllers.auth.register = async (ctx) => {
        const { username, password, email } = ctx.request.body;
        console.log('body',{ username, password, email });
        // 实在不知道如何将password传递到生命周期中来创建Mattermost team，所以先创建
        // console.log('password',password);
        const mmapi = strapi.plugin('mattermost').service('mmapi');
        function formatString(str) {
          // 使用正则表达式替换首尾空格
          str = str.trim();
          // 使用正则表达式替换中间的空格为下划线
          str = str.replace(/\s+/g, '_');
          return str;
        }
        const _params = {
            email: email,
            username: formatString(username),
            password: password,
        }
        const createMmUser = await mmapi.createUser(_params);
        if(createMmUser?.data){
            ctx.request.body.mm_profile = createMmUser.data;
            await register(ctx);
        }
    };

    plugin.controllers.auth.resetPassword = async (ctx) => {
        const { code, password, passwordConfirmation } = ctx.request.body;
        // console.log('code',{ code, password, passwordConfirmation });
        // const user = await strapi.entityService.findOne('plugin::users-permissions.user',{ resetPasswordToken: code });

        const user = await strapi.db.query('plugin::users-permissions.user').findOne({
            select: ['id','mm_profile'],
            where: { resetPasswordToken: code },
        })
        // console.log('user',user);
        if(user?.mm_profile){
            const _params = {
                // @ts-ignore
                user_id: user.mm_profile?.id,
                new_password: password,
            }
            const mmapi = strapi.plugin('mattermost').service('mmapi');
            await mmapi.changeUserPassword(user.mm_profile?.id,_params);
        }
        await resetPassword(ctx);
    };

    plugin.controllers.auth.changePassword = async (ctx) => {
        const { currentPassword, password, passwordConfirmation } = ctx.request.body;
        const user_id = Number(ctx.state.user.id);
        const user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id);
        if(user?.mm_profile){
            const _params = {
                // @ts-ignore
                user_id: user.mm_profile?.id,
                new_password: password,
            }
            const mmapi = strapi.plugin('mattermost').service('mmapi');
            await mmapi.changeUserPassword(user.mm_profile?.id,_params);
        }
        await changePassword(ctx);
    };

    plugin.routes['content-api'].routes.push(
      {
          method: 'GET',
          path: '/user/me/init',
          handler: 'user.init',
          config: {
              perfix: '',
              policies: []
          }
      },
      {
          method: 'PUT',
          path: '/user/me/todogroups',
          handler: 'user.updateTodogroups',
          config: {
              perfix: '',
              policies: []
          }
      },
      {
          method: 'POST',
          path: '/user/me/avatar',
          handler: 'user.updateAvatar',
          config: {
              perfix: '',
              policies: []
          }
      },
      {
          method: 'POST',
          path: '/user/me/config',
          handler: 'user.modifyConfig',
          config: {
              perfix: '',
              policies: []
          }
      },
      {
          method: 'PUT',
          path: '/user/me/default_team',
          handler: 'user.setDefaultTeam',
          config: {
              perfix: '',
              policies: []
          }
      },
    )

    //...

    return plugin;
}
