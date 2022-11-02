module.exports = {
  list: async () => {
    try {
      // fetching data
      const entries = await strapi.entityService.findMany(
        "api::order.order",
      );
      return entries
    } catch (err) {
      return err;
    }
  },
  create: async (data) => {
    try {
      // fetching data
      const entries = await strapi.entityService.create(
        "api::order.order",data
      );


      if(entries.id){

        console.log("entries.id------------------------------------->",entries.id)

       let items = data.data.items

        for(let item of items){

          console.log("entries.id----------------item--------------------->",item)
          let itemData = {}
          itemData.product_id = item.id;
          itemData.qty = item.quantity.count;

          console.log("entries.id----------------itemData--------------------->",itemData)

          const entry = await strapi.entityService.create(
            "api::order-items.order-items",{data:itemData}
          );

          console.log("entries.id----------------entries--------------------->",entry)
        }}

      return entries
    } catch (err) {
      return err;
    }
  },
};
