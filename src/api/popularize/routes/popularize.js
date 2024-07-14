'use strict';

/**
 * popularize router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::popularize.popularize');
