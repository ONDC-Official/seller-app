
import Order from '../../models/order.model';
import Product from '../../../product/models/product.model';
import ProductService from "../../../product/v1/services/product.service";

class OrderService {
    async create(data) {
        try {
            let query = {};

            console.log("data----->",data);
            // const organizationExist = await Product.findOne({productName:data.productName});
            // if (organizationExist) {
            //     throw new DuplicateRecordFoundError(MESSAGES.PRODUCT_ALREADY_EXISTS);
            // }
            data.data.organization=data.data.provider.id
            let order = new Order(data.data);
            let savedOrder= await order.save();

            return savedOrder;
        } catch (err) {
            console.log(`[OrderService] [create] Error in creating product ${data.organizationId}`,err);
            throw err;
        }
    }

    async list(params) {
        try {
            let query={};
            if(params.organization){
                query.organization =params.organization;
            }
            const data = await Order.find(query).sort({createdAt:1}).skip(params.offset).limit(params.limit).lean();

            for(const order of data ){

                console.log("ordre----->",order);
                console.log("ordre----itemsss->",order.items);
                console.log("ordre----itemsss->0",order.items[0]);

                let items = []
                for(const itemDetails of order.items){

                    console.log("ordre----item->",itemDetails);

                    let item = await Product.findOne({_id:itemDetails.id})
                    itemDetails.details = item; //TODO:return images
                    items.push(itemDetails)
                }
                order.items=items
                console.log("items-----",items);
            }
            console.log("data.items---->",data.items);
            const count = await Order.count(query)
            let orders={
                count,
                data
            };
            return orders;
        } catch (err) {
            console.log('[OrderService] [getAll] Error in getting all organization ',err);
            throw err;
        }
    }


    async get(orderId) {
        try {
            let order = await Order.findOne({_id:orderId}).lean();

            let items = []
            for(const itemDetails of order.items){

                console.log("ordre----item->",itemDetails);

                let item = await Product.findOne({_id:itemDetails.id})
                itemDetails.details = item; //TODO:return images
                items.push(itemDetails)
            }
            order.items=items

            return order;

        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id -}`,err);
            throw err;
        }
    }
    async getONDC(orderId) {
        try {
            let order = await Order.findOne({orderId:orderId}).lean();

            return order;

        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id -}`,err);
            throw err;
        }
    }

    async update(orderId,data) {
        try {
            let order = await Order.findOne({orderId:orderId}).lean();

            order.state = data.state

            await order.save();

            return order;

        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id -}`,err);
            throw err;
        }
    }

}
export default OrderService;
