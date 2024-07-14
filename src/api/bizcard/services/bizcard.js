'use strict';

/**
 * bizcard service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::bizcard.bizcard');
