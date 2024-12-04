'use strict';

/**
 * daily-transaction router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::daily-transaction.daily-transaction');
