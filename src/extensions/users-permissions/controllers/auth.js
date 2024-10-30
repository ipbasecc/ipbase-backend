const jwt = require('jsonwebtoken');

module.exports = {
  async refreshToken(ctx) {
    try {
      const user = ctx.state.user;
      console.log('user', user)
      // 检查用户信息是否有效
      if (!user) {
        return ctx.badRequest('用户信息无效');
      }

      // 生成新的 JWT
      const newToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'default_secret', // 从环境变量中获取 secret 或使用默认值
            { expiresIn: '7d' } // Token 的有效期，可以根据需求调整
        );

      return ctx.send({ jwt: newToken });
    } catch (err) {
      return ctx.internalServerError('服务错误');
    }
  },
};
