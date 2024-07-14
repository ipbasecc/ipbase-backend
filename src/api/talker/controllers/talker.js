'use strict';

/**
 * talker controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::talker.talker');
