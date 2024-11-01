'use strict';

/**
 * A set of functions called "actions" for `ali`
 */
const { STS } = require('ali-oss');
 
const sts = new STS({
//   endpoint: 'oss-cn-shanghai.aliyuncs.com', 
  accessKeyId: process.env.ALI_OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALI_OSS_ACCESS_KEY_SECRET,
});

module.exports = {
  getStsToken: async (ctx, next) => {
    try {
        // @ts-ignore
        const res = await sts.assumeRole('acs:ram::1176764569708254:role/ramosssts', ``, '3000', 'sessionstrapi');
        // const res1 = await sts.assumeRole(`acs:ram::${accountID}:role/${roleName}`, 'xxx');
        // console.log('res1',res1);

        // const res2 = await sts.getCallerIdentity();
        // console.log('res2',res2);

        // // @ts-ignore
        // let ststoken = sts.assumeRole('acs:ram::1176764569708254:role/ramosssts', ``, '3000', 'sessionstrapi').then((result) => {
            
        // }).catch((err) => {
        //     console.log(err);
        // });

        ctx.body = res.credentials;
        // console.log('看看啥结果',ctx.body);
    } catch (err) {
        ctx.body = err;
    }
  },
  queryMedias: async (ctx) => {
    const user_id = Number(ctx.state.user.id);
    if(!user_id) {
        ctx.throw(401, '您无权访问该数据')
    }
    const data = ctx.request.body.data;
    if(!data.overview_id){
        ctx.throw(401, 'need fileURLs')
    }
    const fileURL = await strapi.service('api::ali.ali').getMediaByOverviewID(data.overview_id);
    if(fileURL){
        const res = await strapi.service('api::ali.ali').queryMedias(fileURL);
        if(res){
            return res
        }
    } else {
        ctx.throw(404, 'media not exist')
    }
  },
  addMedia: async (ctx) => {
    const user_id = Number(ctx.state.user.id);
    if(!user_id) {
        ctx.throw(401, '您无权访问该数据')
    }
    
    const data = ctx.request.body.data;
    if(!data.overview_id){
        ctx.throw(401, 'need fileURLs')
    }
    const fileURL = await strapi.service('api::ali.ali').getMediaByOverviewID(data.overview_id);
    if(fileURL){
        const res = await strapi.service('api::ali.ali').addMedia(fileURL);
        if(res){
            return res
        }
    } else {
        ctx.throw(404, 'media not exist')
    }
  }
};
