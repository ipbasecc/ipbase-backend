'use strict';

/**
 * popularize service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::popularize.popularize');
