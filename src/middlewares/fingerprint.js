// middlewares/customheader.js
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // 从请求头中获取 X-Fingerprint
    const fingerprint = ctx.request.headers['x-fingerprint'];
    // const teamid = ctx.request.headers['x-teamid'];
    // 将指纹保存到 ctx.request 中，以便于全局访问
    if(fingerprint){
        ctx.fingerprint = fingerprint;
    }
    
    const authorization = ctx.request.headers?.authorization;
    if (authorization) {
        // 判断是否是来自后端管理员
        const referer = ctx.request.headers?.referer;
        if ((referer && !referer.includes('dashboard')) || !referer) {
            const jwt = require('jsonwebtoken');
            const token = authorization.replace('Bearer ', '');
          
            try {
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              if(decoded){
                  let user = await strapi.entityService.findOne('plugin::users-permissions.user',decoded.id, {
                      populate: {
                          default_team: true
                      }
                  });
                  if(user.default_team?.id){
                      ctx.default_team = user.default_team
                      ctx.room_name = `team_room_${user.default_team?.id}`;
                  }
              }
            } catch (err) {
              console.log('Token is invalid:', err);
            }
        }
    }
    // 继续执行请求处理流程
    await next();
  };
};
