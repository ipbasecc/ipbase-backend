// @ts-nocheck
'use strict';

/**
 * todo controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::todo.todo', ({strapi}) => ({
    async create(ctx) {
      await this.validateQuery(ctx);
      const user_id = Number(ctx.state.user?.id);
      let { data, todogroup_id, shareInfo } = ctx.request.body;
      let params = data;
      if(!todogroup_id) {
          ctx.throw(401, '必须指定待办分组ID')
      } else {
          params.todogroup = {
              set: [todogroup_id]
          }
      }
      const create_todoFn = async () => {
          let create_todo = await strapi.entityService.create('api::todo.todo', {
              data: params
          });
          return create_todo
      }
      if(shareInfo){
          const { props, code, by } = shareInfo;
          let res
          if(!props){
              ctx.throw(400, '必须提供反馈对象数据')
          }
          if(props.card_id){
              const _belonged_card = await strapi.entityService.findOne('api::card.card',props.card_id,{
                  fields: ['id'],
                  populate: {
                      share_codes: {
                          populate: {
                              creator: {
                                  fields: ['id','username'],
                              }
                          }
                      },
                      feedback: true
                  }
              });
              if(_belonged_card?.feedback){
                  if(_belonged_card?.feedback.type !== 'feedback'){
                      ctx.throw(400, '当前待办分组类型不是 feedback !')
                  }
                  const filterSharecode = _belonged_card.share_codes.find(i => i.code === code && i.creator.id === Number(by));
                  if(filterSharecode){
                      if(data.fingerprint){
                        params.fingerprint = data.fingerprint
                      }
                      // 统计出当前卡片反馈的总数
                      const count_byFeedback = await strapi.db.query("api::todo.todo").count({
                          where: {
                              todogroup: {
                                id: _belonged_card.feedback.id
                              }
                          }
                      });
                      // 判断当前卡片反馈总数是否超限
                      const count_byFeedback_limit = process.env.FEEDBACK_TOTAL_LIMITE
                      console.log('count_byFeedback', count_byFeedback, count_byFeedback_limit)
                      if(count_byFeedback >= count_byFeedback_limit){
                          ctx.throw(400, '当前内容允许反馈的总数量已经超过')
                      } else {
                          // 统计出当前用户对当前卡片提交的反馈总数
                          const count_byPerson = await strapi.db.query("api::todo.todo").count({
                              where: {
                                  todogroup: {
                                    id: _belonged_card.feedback.id
                                  },
                                  fingerprint: data.fingerprint
                              }
                          });
                          // 判断当前用户向当前卡片提交的反馈总是是否超限
                          const count_byPerson_limit = process.env.FEEDBACK_PERSON_LIMITE
                          console.log('count_byPerson', count_byPerson, count_byPerson_limit)
                          if(count_byPerson >= count_byPerson_limit){
                              ctx.throw(400, '您提交的反馈总数量已经超过限制')
                          } else {
                              // 满足可以提交反馈的条件后，创建反馈并清理Redis缓存
                              res = await create_todoFn();
                              strapi.service('api::card.card').clearRedisCacheByCardID(props.card_id);
                          }
                      }
                  } else {
                      ctx.throw(400, '您正在尝试提供反馈，但是提供的反馈关联数据有错误')
                  }
              } else {
                  ctx.throw(400, '无法跟你您提供的信息定位到对应的卡片')
              }
          }
          return res
      }

      if(!ctx.state.user || !ctx.state.user.id) {
          ctx.throw(401, '访问未授权')
      }

      let auth;
      let project
      let members
      let collection;
      const calc_auth = (members,member_roles) => {
          const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);

          if(is_blocked){
              ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
          }

          const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,collection);
          auth = create

      }
      let todogroup = await strapi.service('api::todogroup.todogroup').find_todogroup_byID(todogroup_id);
      if(todogroup?.creator?.id === user_id || todogroup?.user?.id === user_id) {
          auth = true
      }
      if(todogroup?.card){
          const card_id = todogroup?.card.id
          const belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(card_id);
          if(belongedInfo?.belonged_project){
              project = belongedInfo.belonged_project
          }
          const card = await strapi.service('api::card.card').find_cardByID(card_id);
          if(card){
              const member_roles = card.member_roles;
              members = card.card_members;
              collection = 'todo'
              if(members.map(i => i.by_user.id).includes(user_id)){
                  calc_auth(members,member_roles);
              } else if(belongedInfo){
                  let members;
                  if(belongedInfo.belonged_card){
                      const member_roles = belongedInfo.belonged_card.member_roles;
                      members = belongedInfo.belonged_card.card_members;
                      if(members.map(i => i.by_user.id).includes(user_id)){
                          calc_auth(members,member_roles);
                      }
                  } else if(belongedInfo.belonged_project){
                      collection = 'card_todo'
                      const member_roles = belongedInfo.belonged_project.member_roles;
                      members = belongedInfo.belonged_project.project_members;
                      if(members.map(i => i.by_user.id).includes(user_id)){
                          calc_auth(members,member_roles);
                      }
                  }
              }
          }
      }
      if(todogroup?.project){
          const project_id = todogroup?.project.id
          project = todogroup?.project
          collection = 'todo'
          const project = await strapi.service('api::project.project').find_projectByID(project_id);
          if(project){
              const member_roles = project.member_roles;
              const members = belongedInfo.belonged_project.project_members;
              if(members.map(i => i.by_user.id).includes(user_id)){
                  calc_auth(members,member_roles);
              } else {
                  auth = false;
              }
          }
      }
      if(auth){
          let create_todo = await create_todoFn();
          if(todogroup?.card){
              const card = todogroup?.card
              strapi.service('api::card.card').clearRedisCacheByCardID(card.id);
              const mmChannel_id = project?.mm_channel?.id
              const mmapi = strapi.plugin('mattermost').service('mmapi');
              // const cardName = strapi.service('api::card.card').clac_cardName(card);
              let params = {
                  "channel_id": mmChannel_id,
                  "message": `卡片：${card.name ? card.name : 'id:' + card.id} 新增了待办：${create_todo.content}`,
                  "props": {
                      "strapi": {
                        "data": {
                          "is": "todo",
                          "by_user": user_id,
                          "card_id": card.id,
                          "group_id": todogroup_id,
                          "action": "card_todo_created",
                          "body": create_todo,
                        },
                      },
                  }
              }
              const mmMsg = await mmapi.createPost(params);
              // console.log('create_todo',create_todo)
              if(mmMsg?.data && create_todo){
                  const update = await strapi.entityService.update('api::todo.todo',create_todo.id,{
                      data: {
                          mm_thread: mmMsg.data
                      }
                  })
                  return update
              }
          } else {
              return create_todo
          }
      }
    },
    async update(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user?.id);
        const { id } = ctx.params;
        const todo_id = Number(id);
        const { data, props } = ctx.request.body;

        // console.log('fingerprint',props.fingerprint)
        if(!props.fingerprint && !ctx.state.user) {
            ctx.throw(401, '访问未授权')
        }

        // 如果有收到更新mm_thread的请求，直接从Mattermost读取当前卡片的thread并直接更新
        // 此处无须返回，前端Mattermost的thread并更新UI，这里只是更新Strapi中的数据，方便下次读取
        if(data?.mm_thread){
            const todo = await strapi.entityService.findOne('api::todo.todo', id);
            if(todo?.id === todo_id){
                const post_id = todo.mm_thread.id;
                const mmapi = strapi.plugin('mattermost').service('mmapi');
                const thread = await mmapi.getPost(post_id);
                if(thread?.data) {
                    await strapi.entityService.update('api::todo.todo', todo_id,{
                        data: {
                            mm_thread: thread.data
                        }
                    });
                }
            }
        }

        const todo = await strapi.entityService.findOne('api::todo.todo', id);
        let auth = props?.fingerprint === todo?.fingerprint;
        let isFeedbackOwner = auth;
        // console.log('auth',auth)
        let belonged_user;
        let collection;
        let members;
        let fields_permission = [];
        const calc_auth = (members,member_roles) => {
            const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);

            if(is_blocked){
                ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
            }

            const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,collection);
            auth = modify

            fields_permission = strapi.service('api::project.project').clac_authed_fields(ACL,collection);

        }

        let todogroup = await strapi.service('api::todo.todo').find_belonged_todogroup(todo_id);
        if(todogroup?.creator?.id === user_id || todogroup?.user?.id === user_id) {
            auth = true
            belonged_user = true
        }

        if(!auth){
            let card_id;
            if(props?.card_id){
                card_id = props?.card_id;
            }
            if(todogroup?.card){
                card_id = todogroup.card.id;
            }
            if(card_id){
                const card = await strapi.service('api::card.card').find_cardByID(card_id);
                if(card){
                    const member_roles = card.member_roles;
                    members = card.card_members;
                    collection = 'todo'
                    if(members.map(i => i.by_user.id).includes(user_id)){
                        calc_auth(members,member_roles);
                    } else {
                        const belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(card_id);
                        if(belongedInfo){
                            let members;
                            if(belongedInfo.belonged_card){
                                const member_roles = belongedInfo.belonged_card.member_roles;
                                members = belongedInfo.belonged_card.card_members;
                                if(members.map(i => i.by_user.id).includes(user_id)){
                                    calc_auth(members,member_roles);
                                }
                            } else if(belongedInfo.belonged_project){
                                collection = 'card_todo'
                                const member_roles = belongedInfo.belonged_project.member_roles;
                                members = belongedInfo.belonged_project.project_members;
                                if(members.map(i => i.by_user.id).includes(user_id)){
                                    calc_auth(members,member_roles);
                                }
                            }
                        }
                    }
                }
            }
            if(todogroup?.project){
                collection = 'todo'
                const project_id = todogroup.project.id;
                const project = await strapi.service('api::project.project').find_projectByID(project_id);
                if(project){
                    const member_roles = project.member_roles;
                    const members = belongedInfo.belonged_project.project_members;
                    if(members.map(i => i.by_user.id).includes(user_id)){
                        calc_auth(members,member_roles);
                    } else {
                        auth = false;
                    }
                }
            }
        }


        if(auth) {
            const params = strapi.service('api::todo.todo').process_updateTodo_params(data,fields_permission,belonged_user,isFeedbackOwner)

            let update_todo = await strapi.entityService.update('api::todo.todo', todo_id, {
                data: params,
                populate: {
                    attachment: true
                }
            });
            if(props?.card_id){
                strapi.service('api::card.card').clearRedisCacheByCardID(props.card_id);
            }
            return update_todo
        } else {
            ctx.throw(401, '您无权执行此操作')
        };
    },
    async delete(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user?.id);
        const { id } = ctx.params;
        const todogroup_id = Number(ctx.query.group_id);
        let project_id = Number(ctx.query.project_id);
        const card_id = Number(ctx.query.card_id);
        const fingerprint = ctx.query.fingerprint;

        if(!fingerprint && !ctx.state.user?.id) {
            ctx.throw(401, '访问未授权')
        }

        const todo = await strapi.entityService.findOne('api::todo.todo', id)
        let auth = todo?.fingerprint == fingerprint;
        let collection;
        let members;
        let card
        const calc_auth = (members,member_roles) => {
            const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);

            if(is_blocked){
                ctx.throw(500, '您已被管理员屏蔽，请联系管理员申诉')
            }

            const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,collection);
            auth = remove
        }

        if(card_id && !auth){
            card = await strapi.service('api::card.card').find_cardByID(card_id);
        }
        const getAuthByCard = async (_card) => {
            const member_roles = _card.member_roles;
            members = _card.card_members;
            collection = 'todo'
            if(members.map(i => i.by_user.id).includes(user_id)){
                calc_auth(members,member_roles);
            } else {
                const belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(card_id);
                if(belongedInfo){
                    let members;
                    if(belongedInfo.belonged_card){
                        const member_roles = belongedInfo.belonged_card.member_roles;
                        members = belongedInfo.belonged_card.card_members;
                        if(members.map(i => i.by_user.id).includes(user_id)){
                            calc_auth(members,member_roles);
                        }
                    } else if(belongedInfo.belonged_project){
                        collection = 'card_todo'
                        const member_roles = belongedInfo.belonged_project.member_roles;
                        members = belongedInfo.belonged_project.project_members;
                        if(members.map(i => i.by_user.id).includes(user_id)){
                            calc_auth(members,member_roles);
                        }
                    }
                }
            }
        }
        if(card && !auth){
            await getAuthByCard(card)
        }
        if(!auth){
            let todogroup = await strapi.service('api::todo.todo').find_belonged_todogroup(id);
            // console.log('todogroup', todogroup)
            if(!todogroup){
                auth = false
            } else {
                if((todogroup?.creator?.id === user_id || todogroup?.user?.id === user_id)) {
                    auth = true
                }
                if(todogroup?.card && !auth){
                    const card_id = todogroup?.card.id
                    const _card = await strapi.service('api::card.card').find_cardByID(card_id);
                    if(_card){
                        await getAuthByCard(_card)
                    }
                }
                if(todogroup?.project && !auth){
                    collection = 'todo'
                    const project_id = todogroup?.project.id
                    const project = await strapi.service('api::project.project').find_projectByID(project_id);
                    if(project){
                        const member_roles = project.member_roles;
                        const members = belongedInfo.belonged_project.project_members;
                        if(members.map(i => i.by_user.id).includes(user_id)){
                            calc_auth(members,member_roles);
                        } else {
                            auth = false;
                        }
                    }
                }
            }
        }

        if(auth) {
            let delete_todo = await strapi.entityService.delete('api::todo.todo', id);
            if(card?.feedback?.id === id){
                strapi.service('api::card.card').clearRedisCacheByCardID(card.id);
            }
            if(delete_todo) return '待办已删除'
        } else {
            ctx.throw(401, '您无权修改该待办分组内容')
        };
    }
}));
