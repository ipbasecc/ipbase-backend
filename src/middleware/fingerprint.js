// middlewares/fingerprint.js
module.exports = (strapi) => {
  return async (ctx, next) => {
    // 从请求头中获取 X-Fingerprint
    const fingerprint = ctx.request.headers['x-fingerprint'];

    // 将指纹保存到 ctx.request 中，以便于全局访问
    if(fingerprint){
        ctx.fingerprint = fingerprint;
    }

    // 继续执行请求处理流程
    await next();
  };
};
