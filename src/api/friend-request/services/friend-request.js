'use strict';

/**
 * friend-request service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::friend-request.friend-request');
