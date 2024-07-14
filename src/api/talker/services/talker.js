'use strict';

/**
 * talker service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::talker.talker');
