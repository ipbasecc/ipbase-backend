'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('mattermost')
      .service('myService')
      .getWelcomeMessage();
  },
});
