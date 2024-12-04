'use strict';

/**
 * daily-transaction service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::daily-transaction.daily-transaction');
