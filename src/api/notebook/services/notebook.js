'use strict';

/**
 * notebook service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::notebook.notebook');
