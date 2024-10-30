'use strict';

/**
 * contact controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const contact_populate = {
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

module.exports = createCoreController('api::contact.contact',({strapi}) => ({
    async findOne(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id){
            ctx.throw(400, '请先登陆')
        }
        let id = Number(ctx.params.id);
        const contact = await strapi.entityService.findOne('api::contact.contact', id, {
            populate: {
                owner: {
                    fields: ['id']
                },
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
        if(!contact){
            ctx.throw(404, '未找到对应通讯录')
        }
        if(contact?.owner.id === user_id){
            return contact
        } else {
            ctx.throw(400, '此通讯录所有人不是当前用户')
        }
    },
    async processFriend(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id){
            ctx.throw(400, '请先登陆')
        }
        const { friend_id, action } = ctx.request.body;
        let friend_contact
        const friend = await strapi.entityService.findOne('plugin::users-permissions.user',friend_id, {
            populate: {
                contact: {
                    fields: ['id']
                }
            }
        });
        if(friend?.contact?.id){
            friend_contact = friend.contact
        }
        if(!friend_contact){
            ctx.throw(404, '没有找到好友的通讯录')
        }
        const user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id, {
            populate: {
                contact: {
                    fields: ['id']
                }
            }
        });
        if(user?.contact?.id){
            const contact_id = user?.contact?.id
            const processFn = async (friend_id, action) => {
                if(action === 'unblock'){
                    const res = await strapi.entityService.update('api::contact.contact', contact_id, {
                        data: {
                            contacters: {
                                connect: [friend_id]
                            },
                            blockeds: {
                                disconnect: [friend_id]
                            }
                        },
                        populate: contact_populate
                    })
                    return res
                }
                if(action === 'block'){
                    const res = await strapi.entityService.update('api::contact.contact', contact_id, {
                        data: {
                            contacters: {
                                disconnect: [friend_id]
                            },
                            blockeds: {
                                connect: [friend_id]
                            }
                        },
                        populate: contact_populate
                    })
                    return res
                }
                if(action === 'remove'){
                    const res = await strapi.entityService.update('api::contact.contact', contact_id, {
                        data: {
                            contacters: {
                                disconnect: [friend_id]
                            }
                        },
                        populate: contact_populate
                    })
                    await strapi.entityService.update('api::contact.contact', friend_contact.id, {
                        data: {
                            contacters: {
                                disconnect: [user_id]
                            }
                        }
                    })
                    return res
                }
            }
            const process = await processFn(friend_id, action);
            if(process){
                return process
            }
        } else {
            ctx.throw(401, '您尚未初始化自己的通讯录')
        }
    },
    async processRequest(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id){
            ctx.throw(400, '请先登陆')
        }
        const { request_id, status } = ctx.request.body;
        if(!request_id){
            ctx.throw(400, '缺少好友请求者ID')
        } else if(!status){
            ctx.throw(400, '缺少处理动作')
        } else {
            const user = await strapi.entityService.findOne('plugin::users-permissions.user',user_id, {
                populate: {
                    contact: {
                        fields: ['id']
                    }
                }
            });
            const request = await strapi.entityService.findOne('api::friend-request.friend-request', request_id, {
                populate: {
                    contact: {
                        fields: ['id']
                    },
                    sender: {
                        fields: ['id']
                    }
                }
            })
            const sender = await strapi.entityService.findOne('plugin::users-permissions.user',request?.sender?.id, {
                populate: {
                    contact: {
                        fields: ['id']
                    }
                }
            });
            if(!sender?.contact){
                await strapi.entityService.create('api::contact.contact', {
                    data: {
                        owner: sender.id
                    }
                })
            }
            if(user?.contact.id !== request?.contact.id){
                ctx.throw(401, '对应的通讯录不属于当前用户')
            }
            const processFn = async (contact_id, sender_id, status) => {
                // console.log(contact_id, sender_id, status)
                const process = await strapi.entityService.update('api::friend-request.friend-request', request_id, {
                    data: {
                        status: status === 'unblock' ? 'refuse' : status
                    }
                })
                let contact
                if(status === 'accept'){
                    contact = await strapi.entityService.update('api::contact.contact', contact_id, {
                        data: {
                            contacters: {
                                connect: [sender_id]
                            }
                        },
                        populate: contact_populate
                    })
                    await strapi.entityService.update('api::contact.contact', sender?.contact?.id, {
                        data: {
                            contacters: {
                                connect: [user.id]
                            }
                        }
                    })
                }
                if(contact){
                    return contact
                } else if(process){
                    return process
                }
            }
            if(user?.contact){
                const process = await processFn(user?.contact.id, request?.sender.id, status);
                if(process){
                    return process
                }
            } else {
                const _contact = await strapi.entityService.create('api::contact.contact', {
                    data: {
                        owner: user_id
                    }
                })
                const process = await processFn(_contact?.id, request?.sender.id, status);
                if(process){
                    return process
                }
            }
        }
    },
    async checkBlocked(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id){
            ctx.throw(400, '请先登陆')
        }
        const { target_id } = ctx.request.body;
        if(!target_id){
            ctx.throw(404, '缺少好友ID')
        }
        const friend = await strapi.db.query('api::contact.contact').findMany({
          where: {
            owner: target_id,
            blockeds: {
                id: user_id
            },
          },
        });
        const self = await strapi.db.query('api::contact.contact').findMany({
          where: {
            owner: user_id,
            blockeds: {
                id: target_id
            },
          },
        });
        return {
            isblocked: friend?.length > 0,
            wasblocked: self?.length > 0
        }
    }
}));
