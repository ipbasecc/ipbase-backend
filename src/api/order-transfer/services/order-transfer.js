'use strict';

/**
 * order-transfer service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::order-transfer.order-transfer');
