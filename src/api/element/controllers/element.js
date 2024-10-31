'use strict';

/**
 * element controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::element.element',({strapi}) => ({
    // beforeCreate(event) {
    //     throw new Error('请输入标题');
    // },
    async viewed(ctx) {
        // 获取各种ID
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id); // 获取用户ID
        const element_id = Number(ctx.params.id); // 获取内容ID

        // 更新已读者计数
        const element = await strapi.service('api::element.element').findOne(element_id);
        element.viewed_count++; //游客阅读也会记入统计，因此不能通过统计已读者的长度来定义此处
        const updatedElement = await strapi.service('api::element.element').update(
            element_id,
            {
                data: {
                    viewed_count: element.viewed_count,
                    viewed_by: {
                        connect: [user_id]
                    }
                }
            }
        );
        const new_viewed_count = updatedElement.viewed_count;

        return {new_viewed_count};

        // // 如果没有用户ID，说明是游客，直接返回更新后的结果
        // if(!user_id) {
        //     return { updatedElement }
        // };

        // // 开始生成返回给前端的数据
        // // 获取当前用户已阅读列表
        // const user = await strapi.entityService.findOne(
        //     'plugin::users-permissions.user',
        //     user_id,
        //     { populate: ['viewed_elements'] }
        // );
        // // 判断是否已阅读
        // const user_viewed_elements_ids = user.viewed_elements.map(i => i.id);
        // const have_viewed = user_viewed_elements_ids.includes(element_id);
        // if(have_viewed) {
        //     console.log('阅读列表内已存在此内容');
        // } else {
        //     // 将当前内容关联给当前用户的已阅读列表
        //     await strapi.entityService.update(
        //         'plugin::users-permissions.user',
        //         user_id,
        //         {
        //             data: {
        //                 viewed_elements: {
        //                     connect: [element_id] // 关联内容给用户阅读列表
        //                 }
        //             }
        //         }
        //     );
        // }

        // 获取最新的当前用户的已阅读列表
        // const new_viewed =  await strapi.entityService.findOne(
        //     'plugin::users-permissions.user',
        //     user_id,
        //     { populate: ['viewed_elements'] }
        // );
    },
    async favorite(ctx) {
        await this.validateQuery(ctx);

        const { params } = ctx.params;

        const user_id = Number(ctx.state.user.id); // 获取用户ID
        const element_id = Number(ctx.params.id); // 获取内容ID
        const favorite_id = Number(ctx.params.favorite_id); //获取收藏夹的ID

        const user = await strapi.entityService.findOne(
            'plugin::users-permissions.user',
            user_id,
            { populate: ['favorites'] }
        );

        const favorites = user.favorites;
        // 根据用户ID获取用户的收藏夹ID集合

        // 判断当前要操作的收藏夹是否在用户的收藏夹内
        const favorite_is_user_favorite = favorites.map(i => i.id).includes(favorite_id);
        // 如果在，操作合法，继续
        if(favorite_is_user_favorite) {

            const items_of_this_favorite = await strapi.service('api::favorite.favorite').findOne(favorite_id, {
                populate: {
                    elements: true
                },
            });
            const items_of_this_favorite_ids = items_of_this_favorite?.elements?.map(i => i.id);

            if(items_of_this_favorite_ids.includes(element_id)) {
                // 关联内容给收藏夹
                await strapi.service('api::favorite.favorite').update(favorite_id, {
                    data: {
                        elements: {
                        disconnect: [element_id]  // 从收藏夹移除关联内容
                      }
                    }
                });

            } else {
                await strapi.service('api::favorite.favorite').update(favorite_id, {
                    data: {
                        elements: {
                        connect: [element_id]
                      }
                    }
                });
            };

            // 更新收藏总数
            const total = await strapi.db.query("api::favorite.favorite").count({
                where: {
                    elements: {
                        id: element_id,
                    },
                }
            });
            const favorite_count = total;

            const updatedElement = await strapi.entityService.update('api::element.element',element_id,{
                data: {
                    favorite_count: favorite_count
                }
            });
            const new_favorite_count = updatedElement.favorite_count;

            // 找收藏夹： 1. 包含当前内容；2. 所有者是当前用户
            const favorites_has_this_element = await strapi.entityService.findMany('api::favorite.favorite', {
                filters: {
                    elements: {
                        id: {
                            $eq: element_id,
                        },
                    },
                    owner: {
                        id: {
                            $eq: user_id
                        }
                    }
                },
            });
            const favorites_has_this_element_Ids = favorites_has_this_element.map(i => i.id);
            return { favorites_has_this_element_Ids, new_favorite_count };

        } else {
            console.log('非法操作，该收藏夹不属于当前用户');
        }
    },
    async like(ctx) {
        await this.validateQuery(ctx);
        const { id } = ctx.params;
        const user_id = Number(ctx.state.user.id); // 获取用户ID
        const element_id = Number(id); // 获取内容ID

        const user = await strapi.entityService.findOne(
            'plugin::users-permissions.user',
            user_id,
            { populate: ['liked_element','unliked_element'] }
        );

        const user_unliked_elements_ids = user.unliked_element?.map(i => i.id) || [];
        const have_unliked = user_unliked_elements_ids.includes(element_id);
        // console.log(have_unliked);
        if(have_unliked) {
            // console.log('已经踩过了');
            return 'is_unliked'
        }

        const user_liked_elements_ids = user.liked_element?.map(i => i.id) || [];
        const have_liked = user_liked_elements_ids.includes(element_id);
        if(have_liked) {
            await strapi.entityService.update(
                'plugin::users-permissions.user',
                user_id,
                {
                    data: {
                        liked_element: {
                            disconnect: [element_id] // 关联内容给用户阅读列表
                        }
                    }
                }
            );
        } else {
            await strapi.entityService.update(
                'plugin::users-permissions.user',
                user_id,
                {
                    data: {
                        liked_element: {
                            connect: [element_id] // 关联内容给用户阅读列表
                        }
                    }
                }
            );
        }
        const element = await strapi.service('api::element.element').findOne(element_id, {
            populate: ['liked_by'],
        });
        const liked_count = element.liked_by.length;
        const updatedElement = await strapi.service('api::element.element').update(id, {data: {liked_count: liked_count}});

        const new_user_data =  await strapi.entityService.findOne(
            'plugin::users-permissions.user',
            user_id,
            { populate: ['liked_element'] }
        );

        const new_liked_ids = new_user_data.liked_element.map(i => i.id)
        const new_liked_count = updatedElement.liked_count;

        return { new_liked_ids, new_liked_count };
    },
    async unlike(ctx) {
        await this.validateQuery(ctx);
        const { id } = ctx.params;
        const user_id = Number(ctx.state.user.id); // 获取用户ID
        const element_id = Number(id); // 获取内容ID
        const user = await strapi.entityService.findOne(
            'plugin::users-permissions.user',
            user_id,
            { populate: ['liked_element','unliked_element'] }
        );

        const user_liked_elements_ids = user.liked_element?.map(i => i.id) || [];
        const have_liked = user_liked_elements_ids.includes(element_id);
        if(have_liked) {
            // console.log('已经赞过了');
            return 'is_liked'
        }

        const user_unliked_elements_ids = user.unliked_element?.map(i => i.id) || [];
        const have_unliked = user_unliked_elements_ids.includes(element_id);
        if(have_unliked) {
            await strapi.entityService.update(
                'plugin::users-permissions.user',
                user_id,
                {
                    data: {
                        unliked_element: {
                            disconnect: [element_id] // 关联内容给用户阅读列表
                        }
                    }
                }
            );
        } else {
            await strapi.entityService.update(
                'plugin::users-permissions.user',
                user_id,
                {
                    data: {
                        unliked_element: {
                            connect: [element_id] // 关联内容给用户阅读列表
                        }
                    }
                }
            );
        }
        const element = await strapi.service('api::element.element').findOne(element_id, {
            populate: ['unliked_by'],
        });
        const unliked_count = element.unliked_by.length;
        const updatedElement = await strapi.service('api::element.element').update(id, {data: {unliked_count: unliked_count}});

        const new_user_data =  await strapi.entityService.findOne(
            'plugin::users-permissions.user',
            user_id,
            { populate: ['unliked_element'] }
        );

        const new_unliked_ids = new_user_data.unliked_element.map(i => i.id)
        const new_unliked_count = updatedElement.unliked_count;

        return { new_unliked_ids, new_unliked_count };
    },
}));
