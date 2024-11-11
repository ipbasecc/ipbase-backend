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
                  if(user){
                      if(user?.blocked){
                          ctx.throw(403, '当前账户被禁用，如需解禁，请联系管理员申诉')
                      }
                      if(user.default_team?.id){
                          ctx.default_team = user.default_team
                          ctx.room_name = `team_room_${user.default_team?.id}`;
                          let roles = await strapi.db.query('api::member-role.member-role').findMany({
                              where: {
                                  by_team: user.default_team.id,
                                  members: {
                                      by_user: user.id
                                  }
                              }
                          })
                          user.roles = roles?.length > 0 ? [...new Set(roles.map(i => i.subject))] : []
                      }
                      ctx.user = user
                    //   console.log('ctx.user:', ctx.user);
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
