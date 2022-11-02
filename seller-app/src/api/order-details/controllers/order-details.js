'use strict';

/**
 * A set of functions called "actions" for `order-details`
 */

module.exports = {
  list: async (ctx, next) => {
    try {

      const data = await strapi
        .service("api::order-details.order-details")
        .list();
      console.log(data, "data");

      ctx.body = data;
    } catch (err) {
      ctx.body = err;
    }
  },
  create: async (ctx, next) => {
    try {

      const unparsedBody = ctx.request.body;

      unparsedBody.data.publishedAt = new Date();
      unparsedBody.data.created_by_id = 1
      unparsedBody.data.updated_by_id = 1
      unparsedBody.data.publishedAt = new Date();
      unparsedBody.data.order_id =unparsedBody.data.id
      delete unparsedBody.data.id

      const data = await strapi
        .service("api::order-details.order-details")
        .create(unparsedBody);


      ctx.body = data;
    } catch (err) {
      ctx.body = err;
    }
  }
};
