'use strict';

/**
 * favorite controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::favorite.favorite', ({strapi}) => ({
    async find(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const start = ctx.query.start ? Number(ctx.query.start) : 0;
        const limit = ctx.query.limit ? Number(ctx.query.limit) : 100;
        
        const res = await strapi.db.query('api::favorite.favorite').findMany({
            where: {
                owner: user_id
            },
            offset: start,
            limit: limit
        })
        if(res){
            return res
        } else {
            ctx.throw(404, 'error in find favorites')
        }
    },
    async queryItems(ctx){
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
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
                            select: ['id', 'name', 'description', 'price'],
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
    }
}));
