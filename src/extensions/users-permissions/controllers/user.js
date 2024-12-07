// src/extensions/users-permissions/controllers/user.js
const userService = require('../services/userService');
const team_populate = {
    creator: {
        fields: ['id']
    },
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
    fields: ['id','username','email','self_tags','mm_profile', 'initialization', 'feature_key','income','withdraw','partner_level','need_fill_business_account'],
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
                creator: {
                    fields: ['id']
                },
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
                        join_requests: {
                            fields: ['id','approved']
                        }
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

module.exports = ({ strapi, originalController }) => {
    return {
        init: async (ctx) => {
            const user_id = Number(ctx.state.user.id);
            if(!user_id) {
                ctx.throw(403, '请先登陆')
            }
            let user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id, responseUser);
            if(user) {
                const level_entry = await strapi.db.query('api::system.system').findOne({
                    where: {
                        id: 1
                    },
                    populate: {
                        user_level: true
                    }
                })
                const level = user.partner_level || 'Regular'
                user.user_level = level_entry.user_level.find(i => i.title === level)
                if(user.default_team){
                    const team_id = user.default_team.id;
                    if (team_id) {
                      strapi.service('api::team.team').join(team_id);
                        const statistics = await strapi.service('api::team.team').statistics({
                            team_id: team_id
                        })
                        if(statistics){
                            user.default_team.statistics = statistics
                        }
                    }
                    user.default_team.level_detail = await strapi.service('api::team.team').getTeamLevelLimit({team_id: team_id})
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
                // return user
                return await userService.processUserdata(user, user_id)
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
                      update.default_team.level_detail = await strapi.service('api::team.team').getTeamLevelLimit({team_id: team_id})
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
            // console.log('data',data);
            const _has = (val) => {
                // console.log('data',data);
                return data.hasOwnProperty(val)
            }
            if(_has('initialization')){
                // console.log('initialization', data?.initialization);
                params.initialization = data?.initialization
            }
            if(_has('feature_key')){
              params.feature_key = data.feature_key;
            }
            params.business_account = {};
            if(data?.reel_name){
                params.business_account.real_name = data.reel_name
            }
            if(data?.alipay_account){
                params.business_account.accountNo = data.alipay_account
            }
            if(data?.exchange_code && (data?.old_exchange_code || data?.password)){
                const user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id, {
                    fields: ['id', 'password','need_fill_business_account'],
                    populate: {
                        business_account: true
                    }
                })
                // console.log('validate start user', user)
                const validate_by_password = async () => {
                    return await strapi.plugins['users-permissions'].services.user.validatePassword(
                        data.password,
                        user.password
                    );
                }
                const validate_by_old_exchange_code = async () => {
                    return await strapi.plugins['users-permissions'].services.user.validatePassword(
                        data.old_exchange_code,
                        user.business_account.exchange_code
                    );
                }
                let validate = false
                // ctx.user 由全局中间件传入
                // tip: 其它业务逻辑中旧的验证用户登陆或检查字段时，可以按需要修改全局中间件
                if(user.need_fill_business_account){//该字段默认为true，所有户都需要补充此内容，第一次补充时验证用户登陆密码
                    validate = await validate_by_password();
                    // console.log('validate_by_password need_fill_business_account', validate)
                    if(!validate){
                        ctx.throw(403, '用户密码错误')
                    }
                } else {// 优先使用操作密码验证，允许用户忘记操作密码时使用登陆密码验证，前端要注意：使用逻辑限定只能传一个验证字段
                    if(data?.old_exchange_code){
                        validate = await validate_by_old_exchange_code();
                        // console.log('validate_by_old_exchange_code !need_fill_business_account', validate)
                        if(!validate){
                            ctx.throw(403, '旧操作密码错误')
                        }
                    } else if (data?.password) {
                        validate = await validate_by_password();
                        // console.log('validate_by_password !need_fill_business_account', validate)
                        if(!validate){
                            ctx.throw(403, '用户密码错误')
                        }
                    }
                }
                // console.log('hashPassword a', data.exchange_code)
                const bcrypt = require('bcryptjs');
                const salt = await bcrypt.genSalt(10);
                data.exchange_code = await bcrypt.hash(data.exchange_code, salt);
                // console.log('hashPassword b', data.exchange_code)
                params.business_account.exchange_code = data.exchange_code
                params.need_fill_business_account = false
            }
            
            let user = await strapi.entityService.update('plugin::users-permissions.user',user_id,{
                data: params,
                ...responseUser
            })
            if(user) {
            //   console.log('user',user);
              await userService.processUserdata(user, user_id)
              return await originalController.update(ctx);
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
        },
        queryFavoritedCards: async (ctx) => {
            const user = ctx.state.user;
            const user_id = user.id
            if (!user) {
                return ctx.badRequest('用户信息无效');
            }
            const start = ctx.query.start ? Number(ctx.query.start) : 0;
            const limit = ctx.query.limit ? Number(ctx.query.limit) : 100;
            const { element } = ctx.query;
            if(!element){
                ctx.throw(403, '要查询的 element 是什么？')
            }
            // console.log('element', element, 'element', start, 'limit', limit )
            if(element === 'card'){
                const cards = await strapi.db.query('plugin::users-permissions.user').findOne({
                    where: {
                        id: user_id
                    },
                    select: ['id'],
                    populate: {
                        favorite_cards: {
                            offset: start,
                            limit: limit,
                            populate: {
                                select: ['id', 'name', 'description', 'price', 'type', 'resource_type'],
                                cover: {
                                    select: ['id', 'ext', 'url']
                                },
                                creator: {
                                    select: ['id','username'],
                                    populate: {
                                        profile: {
                                            populate: {
                                                avatar: {
                                                    select: ['id','ext','url']
                                                }
                                            }
                                        }
                                    }
                                },
                                favorite_by_users: {
                                    where: {
                                        id: user_id
                                    },
                                    select: ['id']
                                },
                                by_like_users: {
                                    where: {
                                        id: user_id
                                    },
                                    select: ['id']
                                },
                                orders: {
                                    where: {
                                        buyer: user_id
                                    },
                                    select: ['id']
                                }
                            }
                        }
                    }
                })
                // console.log('cards', cards )
                const count = await strapi.db.query('api::card.card').count({
                    where: {
                        favorite_by_users: user_id
                    }
                })
                // console.log('count', count )
                if(cards){
                    return {
                        cards: cards.favorite_cards,
                        count: count
                    }
                }
            }
        },
        favoriteCard: async(ctx) => {
            const user = ctx.state.user;
            if (!user) {
                return ctx.badRequest('用户信息无效');
            }
            const { data } = ctx.request.body;
            if (!data) {
                return ctx.throw(403, '缺少参数');
            }
            const { card_id } = data;
            if (!card_id) {
                return ctx.throw(403, '请提供 card_id');
            }
            const update = await strapi.db.query('plugin::users-permissions.user').update({
                where: {
                    id: user.id
                },
                data: {
                    favorite_cards: {
                        connect: [
                            { id: card_id, position: { start: true } }
                        ]
                    }
                }
            })
            if(update){
                return 'success'
            } else {
                ctx.throw(503, '更新时出错，请刷新后再试')
            }
        },
        removefavoriteCard: async(ctx) => {
            const user = ctx.state.user;
            if (!user) {
                return ctx.badRequest('用户信息无效');
            }
            const { data } = ctx.request.body;
            if (!data) {
                return ctx.throw(403, '缺少参数');
            }
            const { card_id } = data;
            if (!card_id) {
                return ctx.throw(403, '请提供 card_id');
            }
            const update = await strapi.db.query('plugin::users-permissions.user').update({
                where: {
                    id: user.id
                },
                data: {
                    favorite_cards: {
                        disconnect: card_id
                    }
                }
            })
            if(update){
                return 'success'
            } else {
                ctx.throw(503, '更新时出错，请刷新后再试')
            }
        },
        queryLikedCards: async (ctx) => {
            const user = ctx.state.user;
            const user_id = user.id
            if (!user) {
                return ctx.badRequest('用户信息无效');
            }
            const start = ctx.query.start ? Number(ctx.query.start) : 0;
            const limit = ctx.query.limit ? Number(ctx.query.limit) : 100;
            const { element } = ctx.query;
            if(!element){
                ctx.throw(403, '要查询的 element 是什么？')
            }
            // console.log('element', element, 'element', start, 'limit', limit )
            if(element === 'card'){
                const cards = await strapi.db.query('plugin::users-permissions.user').findOne({
                    where: {
                        id: user_id
                    },
                    select: ['id'],
                    populate: {
                        like_cards: {
                            offset: start,
                            limit: limit,
                            populate: {
                                select: ['id', 'name', 'description', 'price', 'type', 'resource_type'],
                                cover: {
                                    select: ['id', 'ext', 'url']
                                },
                                creator: {
                                    select: ['id','username'],
                                    populate: {
                                        profile: {
                                            populate: {
                                                avatar: {
                                                    select: ['id','ext','url']
                                                }
                                            }
                                        }
                                    }
                                },
                                favorite_by_users: {
                                    where: {
                                        id: user_id
                                    },
                                    select: ['id']
                                },
                                by_like_users: {
                                    where: {
                                        id: user_id
                                    },
                                    select: ['id']
                                },
                                orders: {
                                    where: {
                                        buyer: user_id
                                    },
                                    select: ['id']
                                }
                            }
                        }
                    }
                })
                // console.log('cards', cards )
                const count = await strapi.db.query('api::card.card').count({
                    where: {
                        by_like_users: user_id
                    }
                })
                // console.log('count', count )
                if(cards){
                    return {
                        cards: cards.like_cards,
                        count: count
                    }
                }
            }
        },
        likeCard: async(ctx) => {
            const user = ctx.state.user;
            if (!user) {
                return ctx.badRequest('用户信息无效');
            }
            const { data } = ctx.request.body;
            if (!data) {
                return ctx.throw(403, '缺少参数');
            }
            const { card_id } = data;
            if (!card_id) {
                return ctx.throw(403, '请提供 card_id');
            }
            const update = await strapi.db.query('plugin::users-permissions.user').update({
                where: {
                    id: user.id
                },
                data: {
                    like_cards: {
                        connect: [
                            { id: card_id, position: { start: true } }
                        ]
                    }
                }
            })
            if(update){
                return 'success'
            } else {
                ctx.throw(503, '更新时出错，请刷新后再试')
            }
        },
        removeLikeCard: async(ctx) => {
            const user = ctx.state.user;
            if (!user) {
                return ctx.badRequest('用户信息无效');
            }
            const { data } = ctx.request.body;
            if (!data) {
                return ctx.throw(403, '缺少参数');
            }
            const { card_id } = data;
            if (!card_id) {
                return ctx.throw(403, '请提供 card_id');
            }
            const update = await strapi.db.query('plugin::users-permissions.user').update({
                where: {
                    id: user.id
                },
                data: {
                    like_cards: {
                        disconnect: card_id
                    }
                }
            })
            if(update){
                return 'success'
            } else {
                ctx.throw(503, '更新时出错，请刷新后再试')
            }
        },
        unlikeCard: async(ctx) => {
            const user = ctx.state.user;
            if (!user) {
                return ctx.badRequest('用户信息无效');
            }
            const { data } = ctx.request.body;
            if (!data) {
                return ctx.throw(403, '缺少参数');
            }
            const { card_id } = data;
            if (!card_id) {
                return ctx.throw(403, '请提供 card_id');
            }
            const update = await strapi.db.query('plugin::users-permissions.user').update({
                where: {
                    id: user.id
                },
                data: {
                    unlike_cards: {
                        connect: [
                            { id: card_id, position: { start: true } }
                        ]
                    }
                }
            })
            if(update){
                return 'success'
            } else {
                ctx.throw(503, '更新时出错，请刷新后再试')
            }
        },
        removeUnlikeCard: async(ctx) => {
            const user = ctx.state.user;
            if (!user) {
                return ctx.badRequest('用户信息无效');
            }
            const { data } = ctx.request.body;
            if (!data) {
                return ctx.throw(403, '缺少参数');
            }
            const { card_id } = data;
            if (!card_id) {
                return ctx.throw(403, '请提供 card_id');
            }
            const update = await strapi.db.query('plugin::users-permissions.user').update({
                where: {
                    id: user.id
                },
                data: {
                    unlike_cards: {
                        disconnect: card_id
                    }
                }
            })
            if(update){
                return 'success'
            } else {
                ctx.throw(503, '更新时出错，请刷新后再试')
            }
        },
        
        // 此方法是更新所有用户的Mattermost密码，因为开发过程中对Mattermost用户的处理方案变化，需要在Strapi存储Mattermost用户密码，并且不再由用户前端发起Mattermost登陆
        batchUpdateMattermostPasswords: async(ctx) => {
            return `don't do this without auth`
            const mattermostProvider = require('../providers/mattermost');
            try {
                const mmapi = strapi.plugin('mattermost').service('mmapi');
                // 获取所有有 mm_profile 的用户
                const users = await strapi.db.query('plugin::users-permissions.user').findMany({
                    select: ['id', 'email', 'mm_profile'],
                    where: {
                        mm_profile: { $ne: null }  // 只获取有 mm_profile 的用户
                    }
                });

                let results = [];
                for (const user of users) {
                    try {
                        const mm_userId = user.mm_profile?.id;
                        if (mm_userId) {
                            // 生成新密码
                            const newPassword = mattermostProvider.generateStrongPassword();
                            // 加密密码
                            const encryptedPassword = mattermostProvider.encryptPassword(newPassword);

                            // 更新 Mattermost 密码
                            await mmapi.updateUserPassword(mm_userId, newPassword);  // 使用 mm_userId 而不是 userId

                            // 更新 Strapi 用户
                            await strapi.db.query('plugin::users-permissions.user').update({
                                where: { id: user.id },
                                data: { mm_password: encryptedPassword }  // 直接使用加密后的密码
                            });

                            results.push({
                                email: user.email,  // 添加邮箱便于追踪
                                update_user_id: user.id,
                                update_mm_user_id: mm_userId,
                                status: 'success'
                            });
                        }
                    } catch (userError) {
                        console.error(`Failed to update user ${user.email}:`, userError);
                        results.push({
                            email: user.email,
                            update_user_id: user.id,
                            update_mm_user_id: user.mm_profile?.id,
                            status: 'error',
                            error: userError.message
                        });
                    }
                }

                ctx.body = {  // 使用 ctx.body 返回结果
                    total: users.length,
                    success: results.filter(r => r.status === 'success').length,
                    failed: results.filter(r => r.status === 'error').length,
                    results
                };
            } catch (error) {
                console.error('Batch update error:', error);
                ctx.throw(500, error);
            }
        }
    }
};