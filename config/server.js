module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  url: env('HOST_URL', 'http://127.0.0.1:1337'),
  // 生产环境关闭日志
  middleware: {
    settings: {
      logger: env('NODE_ENV') === 'production' ? false : true,
    },
  },
});
