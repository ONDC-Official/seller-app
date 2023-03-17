
import Order from '../../models/order.model';
import Product from '../../../product/models/product.model';
import HttpRequest from '../../../../lib/utils/HttpRequest'
import {mergedEnvironmentConfig} from "../../../../config/env.config";
import {ConflictError} from "../../../../lib/errors";

class OrderService {
    async create(data) {
        try {
            let query = {};

            console.log("data----->",data);
            // const organizationExist = await Product.findOne({productName:data.productName});
            // if (organizationExist) {
            //     throw new DuplicateRecordFoundError(MESSAGES.PRODUCT_ALREADY_EXISTS);
            // }
            //update item qty in product inventory

            for(let item of data.data.items){
                if(item.quantity.count){
                    //reduce item quantity
                    let product = await Product.findOne({_id:item.id});
                    product.quantity = product.quantity-item.quantity.count
                    if(product.quantity<0){
                        throw new ConflictError();
                    }
                    await product.save();
                }
            }
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
            const data = await Order.find(query).populate([{path:'organization',select:['name','_id','storeDetails']}]).sort({createdAt:-1}).skip(params.offset*params.limit).limit(params.limit).lean();

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

            console.log("order---->",order);
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

    async updateOrderStatus(orderId,data) {
        try {
            let order = await Order.findOne({_id:orderId}).lean();

            //update order state
            order.state = data.status;

            //notify client to update order status ready to ship to logistics
           let httpRequest = new HttpRequest(
               mergedEnvironmentConfig.intraServiceApiEndpoints.client,
                `/api/client/status/updateOrder`,
                'PUT',
                {data:order},
                {}
            );
           await httpRequest.send();

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

    async OndcUpdate(orderId,data) {
        try {

            let oldOrder = await Order.findOne({orderId:orderId}).lean()

            delete data.data._id

            if(data.data.state==='Cancelled'){
                for(let item of data.data.items){
                        //reduce item quantity
                        let product = await Product.findOne({_id:item.id});
                        product.quantity = product.quantity+item.quantity.count
                        await product.save();
                }
            }

            //check item level cancellation status
            for(let item of data.data.items){

                //let oldItemStatus = oldOrder.items.find((itemObj)=>{return itemObj.id==item.id})
                //if(item.state=='Cancelled' && oldItemStatus.state!=='Cancelled'){ //check if old item state
                if(item.state=='Cancelled'){ //check if old item state
                    //reduce item quantity
                    let product = await Product.findOne({_id:item.id});
                    product.quantity = product.quantity-item.quantity.count
                    if(product.quantity<0){
                        throw new ConflictError();
                    }
                    await product.save();
                }
            }
            let order = await Order.findOneAndUpdate({orderId:orderId},data.data)

            return order;

        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id -}`,err);
            throw err;
        }
    }

}
export default OrderService;
