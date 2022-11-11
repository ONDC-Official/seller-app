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


      let itemIds = [];

      for(let item of items){

        console.log("entries.id----------------item--------------------->",item)
        let itemData = {}
        itemData.product_id = item.id;
        itemData.qty = item.quantity.count;
        itemData.order_id = entries.id;

        console.log("entries.id----------------itemData--------------------->",itemData)

        const savedItem = await strapi.entityService.create(
          "api::order-item.order-item",{data:itemData}
        );

        itemIds.push(savedItem);

        console.log("entries.id----------------entries--------------------->",entry)
      }

      //add order with order items

      data.data.order_items = itemIds
      
      // fetching data
      const entries = await strapi.entityService.create(
        "api::order.order",data
      );


      // if(entries.id){
      //
      //   console.log("entries.id------------------------------------->",entries.id)
      //
      //  let items = data.data.items
      // }

      return entries
    } catch (err) {
      return err;
    }
  },
};
