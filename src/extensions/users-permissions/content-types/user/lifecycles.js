// @ts-nocheck
module.exports = {
    async afterCreate(event) {
        const { result, params } = event;
        const userId = result.id;
        const init = async () => {
            try {
                const user = result
                // 创建用户自媒体频道
                let new_post
                if(!user.contact){
                    await strapi.entityService.create('api::contact.contact',{
                        data: {
                            owner: userId
                        }
                    })
                }
                if(!user.user_channel) {
                    new_post = await strapi.entityService.create('api::post.post', {
                        data: {
                        title: `${user.username}'s channel_post`,
                        publishedAt: Date.now()
                        },
                    });
                    if(new_post) {
                        await strapi.entityService.create('api::channel.channel', {
                            data: {
                                title: `${user.username}'s channel`,
                                description: '该用户尚未补充频道介绍',
                                slogan: '易乎APP初始化的频道',
                                cover: [process.env.DEFAULT_CHANNEL_COVER],
                                brand: [process.env.DEFAULT_CHANNEL_BRAND],
                                avatar: [process.env.DEFAULT_CHANNEL_AVATAR],
                                channel_owner: user.id,
                                storageCount: 0,
                                post: new_post.id,
                                publishedAt: Date.now(),
                            },
                        });
                    }
                };
                // 创建用户profile
                let profile
                if(!user.profile) {
                    profile = await strapi.entityService.update(
                        'plugin::users-permissions.user',
                        userId,
                        {
                        data: {
                            profile: {
                                title: `${user.username}的称谓`,
                                description: '该用户尚未补充自我介绍',
                                bio: '该用户没啥心声',
                                cover: [process.env.DEFAULT_USER_COVER],
                                brand: [process.env.DEFAULT_USER_BRAND],
                                avatar: [process.env.DEFAULT_USER_AVATAR],
                            },
                        },
                        }
                    );
                }
                // 创建用户默认微名片
                let default_bizcard;
                if(!user.bizcards || user.bizcards.length === 0) {
                    const new_bizcard = await strapi.entityService.create('api::bizcard.bizcard', {
                        data: {
                        name: user.username,
                        title: `${user.username}'的微名片`,
                        email:user.email,
                        description: '该用户尚未补充频道介绍',
                        publishedAt: Date.now(),
                        user:user.id
                        },
                    });
                    default_bizcard = new_bizcard?.id
                }
                await strapi.entityService.update(
                    'plugin::users-permissions.user',
                    userId,
                    {
                        data: {
                            config: {
                                lang: 'zh-CN',
                                theme: 'lighter',
                                default_bizcard: default_bizcard
                            },
                            storageCount: 0,
                        },
                    }
                );
            } catch (error) {
                console.log(error);
            }
        }
        await init();
    }
}