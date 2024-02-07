import Order from '../../models/order.model';
import Fulfillment from '../../models/fulfillments.model';
import Product from '../../../product/models/product.model';
import ProductCustomization from '../../../product/models/productCustomization.model';
import ReturnItem from '../../models/returnItem.model';
import HttpRequest from '../../../../lib/utils/HttpRequest';
import {mergedEnvironmentConfig} from '../../../../config/env.config';
import {ConflictError} from '../../../../lib/errors';
import MESSAGES from '../../../../lib/utils/messages';
import {RETURN_REASONS} from '../../../../lib/utils/constants';
import BadRequestParameterError from '../../../../lib/errors/bad-request-parameter.error';
import {uuid} from 'uuidv4';

class OrderService {
    async create(data) {
        try {
            let query = {};

            console.log('data----->', data);
            console.log('data---items-->', data.data.items);
            // const organizationExist = await Product.findOne({productName:data.productName});
            // if (organizationExist) {
            //     throw new DuplicateRecordFoundError(MESSAGES.PRODUCT_ALREADY_EXISTS);
            // }
            //update item qty in product inventory

            for (let item of data.data.items) {
                let tags = item.tags;
                if (tags && tags.length > 0) {
                    let tagData = tags.find((tag) => {
                        return tag.code === 'type';
                    });
                    let tagTypeData = tagData.list.find((tagType) => {
                        return tagType.code === 'type';
                    });
                    let itemType = tagTypeData.value;
                    // if (itemType === 'customization') {
                    //     if (item.quantity.count) {
                    //         //reduce item quantity
                    //         let product =await Product.findOne({_id: item.id});
                    //         product.available = product.available - item.quantity.count;
                    //         if (product.quantity < 0) {
                    //             throw new ConflictError();
                    //         }
                    //         await product.save();
                    //     }
                    // } else {
                    if (item.quantity.count) {
                        //reduce item quantity
                        let product = await Product.findOne({_id: item.id});

                        console.log({qty: product?.quantity, id: item.id});
                        console.log({qtyCount: item.quantity.count});
                        product.quantity = product.quantity - item.quantity.count;
                        if (product.quantity < 0) {
                            throw new ConflictError();
                        }
                        await product.save();
                    }
                    // }
                } else {
                    if (item.quantity.count) {
                        //reduce item quantity
                        let product = await Product.findOne({_id: item.id});

                        console.log({qty: product?.quantity, id: item.id});
                        console.log({qtyCount: item.quantity.count});
                        product.quantity = product.quantity - item.quantity.count;
                        if (product.quantity < 0) {
                            throw new ConflictError();
                        }
                        await product.save();
                    }
                }

            }
            data.data.createdOn=data.data.createdAt;

            console.log('data---->',data);
            // data.data.organization=data.data.provider.id;
            let order = new Order(data.data);
            let savedOrder = await order.save();

            return savedOrder;
        } catch (err) {
            console.log(`[OrderService] [create] Error in creating product ${data.organizationId}`, err);
            throw err;
        }
    }

    async listReturnRequests(params) {
        try {
            let query = {'request.type':'Return'};
            if (params.organization) {
                query.organization = params.organization;
            }
            const data = await Fulfillment.find(query).populate([{
                path: 'organization',
                select: ['name', '_id', 'storeDetails']
            }]).sort({createdAt: -1}).skip(params.offset * params.limit).limit(params.limit).lean();
            for (const order of data) {

                console.log('order',order);
                let itemId = order.request.tags[0].list.find((tag) => {
                    return tag.code === 'item_id';
                });

                let reason_id = order.request.tags[0].list.find((tag) => {
                    return tag.code === 'reason_id';
                });

                let images = order.request.tags[0].list.find((tag) => {
                    return tag.code === 'images';
                });


                let qty = order.request.tags[0].list.find((tag) => {
                    return tag.code === 'item_quantity';
                });

                let item = await Product.findOne({_id: itemId.value}).lean();

                let code = RETURN_REASONS.find((codes) => {
                    return codes.key === reason_id.value;
                });

                let orderDetails = await Order.findOne({_id:order.order});



                console.log('reason--->', code);
                order.reason = code?.value;
                order.item = item;
                order.image = images.value.split(',');
                order.qty = qty?.value;
                order.state = order?.request?.state?.descriptor?.code;
                order.orderId = orderDetails?.orderId??'';
                order._id = order.id;
            }
            const count = await Fulfillment.count(query);
            let orders = {
                count,
                data
            };
            return orders;
        } catch (err) {
            console.log('[OrderService] [getAll] Error in getting all return requests ', err);
            throw err;
        }
    }

    async list(params) {
        try {
            let query = {};
            if (params.organization) {
                query.organization = params.organization;
            }
            const data = await Order.find(query).populate([{
                path: 'organization',
                select: ['name', '_id', 'storeDetails']
            }]).sort({createdAt: -1}).skip(params.offset * params.limit).limit(params.limit).lean();

            for (const order of data) {

                console.log('ordre----->', order);
                console.log('ordre----itemsss->', order.items);
                console.log('ordre----itemsss->0', order.items[0]);

                let items = [];
                for (const itemDetails of order.items) {

                    console.log('ordre----item->', itemDetails);

                    let item = await Product.findOne({_id: itemDetails.id});
                    itemDetails.details = item; //TODO:return images
                    items.push(itemDetails);
                }
                order.items = items;
                console.log('items-----', items);
            }
            console.log('data.items---->', data.items);
            const count = await Order.count(query);
            let orders = {
                count,
                data
            };
            return orders;
        } catch (err) {
            console.log('[OrderService] [getAll] Error in getting all organization ', err);
            throw err;
        }
    }


    async get(orderId) {
        try {
            let order = await Order.findOne({_id: orderId}).lean();

            console.log('order---->', order);
            let items = [];
            for (const itemDetails of order.items) {

                console.log('ordre----item->', itemDetails);

                let item = await Product.findOne({_id: itemDetails.id});
                itemDetails.details = item; //TODO:return images
                items.push(itemDetails);
            }
            order.items = items;

            return order;

        } catch (err) {
            console.log('[OrganizationService] [get] Error in getting organization by id -}', err);
            throw err;
        }
    }

    async updateOrderStatus(orderId, data) {
        try {
            let order = await Order.findOne({_id: orderId}).lean();

            //update order state
            order.state = data.status;

            //notify client to update order status ready to ship to logistics
            let httpRequest = new HttpRequest(
                mergedEnvironmentConfig.intraServiceApiEndpoints.client,
                '/api/v2/client/status/updateOrder',
                'PUT',
                {data: order},
                {}
            );
            await httpRequest.send();

            return order;

        } catch (err) {
            console.log('[OrganizationService] [get] Error in getting organization by id -}', err);
            throw err;
        }
    }

    async cancelItems(orderId, data) {
        try {
            let order = await Order.findOne({orderId: orderId});//.lean();

            //update order item level status

            let cancelRequest = new  Fulfillment();

            cancelRequest.id = uuid();

            cancelRequest.request = {
                'type':'Cancel',
                'state':
                {
                    'descriptor':
                    {
                        'code':'Cancelled'
                    }
                },
                'tags':
                [
                    {
                        'code':'cancel_request',
                        'list':
                            [
                                {
                                    'code':'reason_id',
                                    'value':data.cancellation_reason_id
                                },
                                {
                                    'code':'initiated_by',
                                    'value':'ref-app-seller-staging-v2.ondc.org'  //TODO: take it from env
                                }
                            ]
                    }
                ]
            };

            // cancelRequest.request['@ondc/org/provider_name'] = 'LSP courier 1';


            cancelRequest.organization = order.organization;
            cancelRequest.order = order._id;
            await cancelRequest.save();

            // updatedFulfillment['@ondc/org/provider_name'] = 'LSP courier 1'; //TODO: hard coded

            // console.log({updatedFulfillment});
            //1. append item list with this item id and fulfillment id

            console.log({items:order.items});
            let itemIndex = order.items.findIndex(x => x.id ===data.id);
            let itemToBeUpdated= order.items.find(x => x.id ===data.id);
            console.log({itemToBeUpdated});
            itemToBeUpdated.quantity.count = itemToBeUpdated.quantity.count - parseInt(data.quantity);
            order.items[itemIndex] = itemToBeUpdated; //Qoute needs to be updated here.

            let cancelledItem =         {
                'id':data.id,
                'fulfillment_id':cancelRequest.id,
                'quantity':
                    {
                        'count':parseInt(data.quantity)
                    }
            };
            order.items.push(cancelledItem);

            //get product price
            let productItem= await Product.findOne({_id:data.id});

            console.log({productItem});

            let qouteTrail = {
                'code': 'quote_trail',
                'list':
                        [
                            {
                                'code': 'type',
                                'value': 'item'
                            },
                            {
                                'code': 'id',
                                'value': data.id
                            },
                            {
                                'code': 'currency',
                                'value': 'INR'
                            },
                            {
                                'code': 'value',
                                'value': '-'+( productItem.MRP*data.quantity) //TODO: actual value of order item
                            }
                        ]
            };

            cancelRequest.quote_trail = qouteTrail;
            let updatedFulfillment = {};
            updatedFulfillment.state = {
                'descriptor':
                    {
                        'code': 'Cancelled'
                    }
            };
            updatedFulfillment.type= 'Cancel';
            updatedFulfillment.id= cancelRequest.id;
            updatedFulfillment.tags =[];
            updatedFulfillment.tags.push(cancelRequest.request.tags[0]);
            updatedFulfillment.tags.push(qouteTrail);
            //updatedFulfillment.organization =order.organization;

            order.fulfillments.push(updatedFulfillment);


            //2. append qoute trail

            order.quote = await this.updateQoute(order.quote,data.quantity,data.id);
                
            
            // await order.save();
            await Order.findOneAndUpdate({orderId:orderId},{items:order.items,fulfillments:order.fulfillments,quote:order.quote});

            console.log({order});
            //notify client to update order status ready to ship to logistics
            let httpRequest = new HttpRequest(
                mergedEnvironmentConfig.intraServiceApiEndpoints.client,
                '/api/v2/client/status/updateOrderItems',
                'PUT',
                {data: order},
                {}
            );
            await httpRequest.send();

            return order;

        } catch (err) {
            console.log('[OrganizationService] [get] Error in getting organization by id -}', err);
            throw err;
        }
    }

    async updateReturnItem(orderId, data) {
        try {
            let order = await Order.findOne({orderId: orderId});//.lean();

            let returnRequest = await Fulfillment.findOne({id: data.id, orderId: orderId});
            //update order item level status

            console.log({returnRequest});
            if (data.state === 'Rejected') {

                //https://docs.google.com/spreadsheets/d/1_qAtG6Bu2we3AP6OpXr4GVP3X-32v2xNRNSYQhhR6kA/edit#gid=594583443

                returnRequest.request['@ondc/org/provider_name'] = 'LSP courier 1';
                returnRequest.state = {
                    'descriptor':
                        {
                            'code': 'Return_Rejected',
                            'Short_desc': '001', //HARD coded for now
                        }
                };
                returnRequest.request.state = {
                    'descriptor':
                        {
                            'code': 'Return_Rejected',
                            'Short_desc': '001', //HARD coded for now
                        }
                };

                let updatedFulfillment = order.fulfillments.find(x => x.id == data.id);

                updatedFulfillment.state = {
                    'descriptor':
                        {
                            'code': 'Return_Rejected',
                            'Short_desc': '001', //TODO: HARD coded for now
                        }
                };
                updatedFulfillment['@ondc/org/provider_name'] = 'LSP courier 1';
                let foundIndex = order.fulfillments.findIndex(x => x.id == data.id);

                let item = returnRequest.request.tags[0].list.find(x => x.code === 'item_id').value;

                let itemObject = {
                    'id': item,
                    'fulfillment_id': data.id,
                    'quantity':
                        {
                            'count': 0
                        }
                };
                order.items.push(itemObject);

                order.fulfillments[foundIndex] = updatedFulfillment;

                console.log({updatedFulfillment});

            }

            if (data.state === 'Liquidated') {
                returnRequest.request['@ondc/org/provider_name'] = 'LSP courier 1';
                returnRequest.state = {
                    'descriptor':
                        {
                            'code': 'Liquidated'
                        }
                };
                returnRequest.request.state = {
                    'descriptor':
                        {
                            'code': 'Liquidated'
                        }
                };

                let updatedFulfillment = order.fulfillments.find(x => x.id == data.id);

                updatedFulfillment.state = {
                    'descriptor':
                        {
                            'code': 'Liquidated'
                        }
                };
                updatedFulfillment['@ondc/org/provider_name'] = 'LSP courier 1'; //TODO: hard coded
                let foundIndex = order.fulfillments.findIndex(x => x.id == data.id);

                console.log({updatedFulfillment});
                //1. append item list with this item id and fulfillment id
                let item = returnRequest.request.tags[0].list.find(x => x.code === 'item_id').value;
                let quantity = returnRequest.request.tags[0].list.find(x => x.code === 'item_quantity').value;

                let itemIndex = order.items.findIndex(x => x.id ===item);
                let itemToBeUpdated= order.items.find(x => x.id ===item);
                itemToBeUpdated.quantity.count = itemToBeUpdated.quantity.count - parseInt(quantity);
                order.items[itemIndex] = itemToBeUpdated; //Qoute needs to be updated here.

                //get product price
                let productItem= await Product.findOne({_id:item});

                console.log({productItem});

                let qouteTrail = {
                    'code': 'quote_trail',
                    'list':
                        [
                            {
                                'code': 'type',
                                'value': 'item'
                            },
                            {
                                'code': 'id',
                                'value': item
                            },
                            {
                                'code': 'currency',
                                'value': 'INR'
                            },
                            {
                                'code': 'value',
                                'value': '-'+( productItem.MRP*quantity) //TODO: actual value of order item
                            }
                        ]
                };

                returnRequest.quote_trail = qouteTrail;
                updatedFulfillment.tags =[];
                updatedFulfillment.tags.push(returnRequest.request.tags[0]);
                updatedFulfillment.tags.push(qouteTrail);

                order.fulfillments[foundIndex] = updatedFulfillment;

                let itemObject = {
                    'id': item,
                    'fulfillment_id': data.id,
                    'quantity':
                        {
                            'count': quantity
                        }
                };
                order.items.push(itemObject);

                //2. append qoute trail

                order.quote = await this.updateQoute(order.quote,quantity,item);

            }

            await Fulfillment.findOneAndUpdate({_id:returnRequest._id},{request:returnRequest.request,quote_trail:returnRequest.quote_trail});
            // await Fulfillment.findOneAndUpdate({_id:returnRequest._id},{request:returnRequest.request,quote_trail:returnRequest.quote_trail});
            await returnRequest.save();
            // await order.save();
            // await Order.findOneAndUpdate({orderId:orderId},{items:order.items,fulfillments:order.fulfillments,quote:order.quote});

            await Order.findOneAndUpdate({orderId:orderId},{items:order.items,fulfillments:order.fulfillments,quote:order.quote});

            //notify client to update order status ready to ship to logistics
            let httpRequest = new HttpRequest(
                mergedEnvironmentConfig.intraServiceApiEndpoints.client,
                '/api/v2/client/status/updateOrderItems',
                'PUT',
                {data: order},
                {}
            );
            await httpRequest.send();

            return order;

        } catch (err) {
            console.log('[OrganizationService] [get] Error in getting organization by id -}', err);
            throw err;
        }
    }

    async updateQoute(data,quantity,item){
        try{

            let itemIndex = data.breakup.findIndex(x => x['@ondc/org/item_id'] ===item);
            let itemToBeUpdated= data.breakup.find(x => x['@ondc/org/item_id'] ===item);

            console.log({itemToBeUpdated});
            let priceToReduce = parseFloat(itemToBeUpdated.item.price.value)*quantity;
            itemToBeUpdated['@ondc/org/item_quantity'].count=itemToBeUpdated['@ondc/org/item_quantity'].count-quantity;
            itemToBeUpdated['price'].value=''+(parseFloat(itemToBeUpdated['price'].value)-priceToReduce);
            data.breakup[itemIndex] = itemToBeUpdated;

            data.price.value = ''+(parseFloat(data.price.value) -priceToReduce);
            return data;
        }catch (e) {
            throw e;
        }
    }
    async cancel(orderId, data) {
        try {
            let order = await Order.findOne({_id: orderId}).lean();

            //update order state
            order.state = 'Cancelled';
            order.cancellation_reason_id = data.cancellation_reason_id;
            order.orderId = order.orderId;


            let cancelRequest = new  Fulfillment();

            cancelRequest.id = uuid();

            cancelRequest.request = {
                'type':'Cancel',
                'state':
                    {
                        'descriptor':
                            {
                                'code':'Cancelled'
                            }
                    },
                'tags':
                    [
                    ]
            };

            // cancelRequest.request['@ondc/org/provider_name'] = 'LSP courier 1';


            cancelRequest.organization = order.organization;
            cancelRequest.order = order._id;
            await cancelRequest.save();

            // let itemIndex = order.items.findIndex(x => x.id ===data.id);
            // let itemToBeUpdated= order.items.find(x => x.id ===data.id);
            // console.log({itemToBeUpdated});
            // itemToBeUpdated.quantity.count = itemToBeUpdated.quantity.count - parseInt(data.quantity);
            // order.items[itemIndex] = itemToBeUpdated; //Qoute needs to be updated here.
            //
            // let cancelledItem =         {
            //     'id':data.id,
            //     'fulfillment_id':cancelRequest.id,
            //     'quantity':
            //         {
            //             'count':data.quantity
            //         }
            // };
            // order.items.push(cancelledItem);

            let qouteTrails = [];
            let newItemsWithNewFulfillmentId = [];
            for(let itemToBeUpdated of order.items) {
                //get product price
                let productItem = await Product.findOne({_id: itemToBeUpdated.id}).lean();

                // console.log({productItem});

                let qouteTrail = {
                    'code': 'quote_trail',
                    'list':
                        [
                            {
                                'code': 'type',
                                'value': 'item'
                            },
                            {
                                'code': 'id',
                                'value': itemToBeUpdated.id
                            },
                            {
                                'code': 'currency',
                                'value': 'INR'
                            },
                            {
                                'code': 'value',
                                'value': '-' + (productItem.MRP * itemToBeUpdated.quantity.count) //TODO: actual value of order item
                            }
                        ]
                };
                qouteTrails.push(qouteTrail);

                const newItems =JSON.parse(JSON.stringify(itemToBeUpdated));
                let oldItems = JSON.parse(JSON.stringify(itemToBeUpdated));
                oldItems.fulfillment_id = cancelRequest.id;
                newItemsWithNewFulfillmentId.push(oldItems);

                newItems.quantity.count = 0;
                newItemsWithNewFulfillmentId.push(newItems);
            }
            order.items=newItemsWithNewFulfillmentId;
            // cancelRequest.quote_trail = qouteTrail;
            let updatedFulfillment = {};
            updatedFulfillment.state = {
                'descriptor':
                        {
                            'code': 'Cancelled'
                        }
            };
            updatedFulfillment.type= 'Cancel';
            updatedFulfillment.id= cancelRequest.id;
            updatedFulfillment.tags =[];
            // updatedFulfillment.tags.push(cancelRequest.request.tags[0]);
            updatedFulfillment.tags= qouteTrails;
            //updatedFulfillment.organization =order.organization;


            let deliveryFulfillment =  order.fulfillments.find((data)=>{return data.type==='Delivery';});

            deliveryFulfillment.tags=
            [
                {
                    'code':'cancel_request',
                    'list':
                        [
                            {
                                'code':'reason_id',
                                'value':data.cancellation_reason_id
                            },
                            {
                                'code':'initiated_by',
                                'value':'ref-app-seller-staging-v2.ondc.org' //TODO: take it from ENV
                            }
                        ]
                },
                {
                    'code':'precancel_state',
                    'list':
                        [
                            {
                                'code':'fulfillment_state',
                                'value':deliveryFulfillment.state.descriptor.code
                            },
                            {
                                'code':'updated_at',
                                'value':order.updatedAt
                            }
                        ]
                }
            ];

            order.fulfillments =[];
            order.fulfillments.push(updatedFulfillment);
            order.fulfillments.push(deliveryFulfillment);

            //2. append qoute trail
            //order.quote = await this.updateQoute(order.quote,data.quantity,data.id);
            // await order.save();
            //TODO:Uncomment this
            await Order.findOneAndUpdate({orderId:orderId},{items:order.items,fulfillments:order.fulfillments,quote:order.quote,state:order.state});

            //add cancellation reason
            order.cancellation=
                {
                    'cancelled_by':cancelRequest?.context?.bppId??'ref-app-seller-staging-v2.ondc.org',
                    'reason':
                        {
                            'id':`${data.cancellation_reason_id}`
                        }
                };

            //notify client to update order status ready to ship to logistics
            let httpRequest = new HttpRequest(
                mergedEnvironmentConfig.intraServiceApiEndpoints.client,
                '/api/v2/client/status/cancel',
                'POST',
                {data: order},
                {}
            );
            await httpRequest.send();

            return order;

        } catch (err) {
            console.log('[OrganizationService] [get] Error in getting organization by id -}', err);
            throw err;
        }
    }

    async cancelOrder(orderId, data) {
        try {
            let order = await Order.findOne({orderId: orderId}).lean();

            //update order state
            order.state = 'Cancelled';
            order.cancellation_reason_id = data.cancellation_reason_id;
            order.orderId = order.orderId;


            let cancelRequest = new  Fulfillment();

            cancelRequest.id = uuid();

            cancelRequest.request = {
                'type':'Cancel',
                'state':
                    {
                        'descriptor':
                            {
                                'code':'Cancelled'
                            }
                    },
                'tags':
                    [
                    ]
            };

            // cancelRequest.request['@ondc/org/provider_name'] = 'LSP courier 1';


            cancelRequest.organization = order.organization;
            cancelRequest.order = order._id;
            await cancelRequest.save();

            // let itemIndex = order.items.findIndex(x => x.id ===data.id);
            // let itemToBeUpdated= order.items.find(x => x.id ===data.id);
            // console.log({itemToBeUpdated});
            // itemToBeUpdated.quantity.count = itemToBeUpdated.quantity.count - parseInt(data.quantity);
            // order.items[itemIndex] = itemToBeUpdated; //Qoute needs to be updated here.
            //
            // let cancelledItem =         {
            //     'id':data.id,
            //     'fulfillment_id':cancelRequest.id,
            //     'quantity':
            //         {
            //             'count':data.quantity
            //         }
            // };
            // order.items.push(cancelledItem);

            let qouteTrails = [];
            let newItemsWithNewFulfillmentId = [];
            for(let itemToBeUpdated of order.items) {
                //get product price
                let productItem = await Product.findOne({_id: itemToBeUpdated.id}).lean();

                // console.log({productItem});

                let qouteTrail = {
                    'code': 'quote_trail',
                    'list':
                        [
                            {
                                'code': 'type',
                                'value': 'item'
                            },
                            {
                                'code': 'id',
                                'value': itemToBeUpdated.id
                            },
                            {
                                'code': 'currency',
                                'value': 'INR'
                            },
                            {
                                'code': 'value',
                                'value': '-' + (productItem.MRP * itemToBeUpdated.quantity.count) //TODO: actual value of order item
                            }
                        ]
                };
                qouteTrails.push(qouteTrail);

                const newItems =JSON.parse(JSON.stringify(itemToBeUpdated));
                let oldItems = JSON.parse(JSON.stringify(itemToBeUpdated));
                oldItems.fulfillment_id = cancelRequest.id;
                newItemsWithNewFulfillmentId.push(oldItems);

                newItems.quantity.count = 0;
                newItemsWithNewFulfillmentId.push(newItems);
            }
            order.items=newItemsWithNewFulfillmentId;
            // cancelRequest.quote_trail = qouteTrail;
            let updatedFulfillment = {};
            updatedFulfillment.state = {
                'descriptor':
                        {
                            'code': 'Cancelled'
                        }
            };
            updatedFulfillment.type= 'Cancel';
            updatedFulfillment.id= cancelRequest.id;
            updatedFulfillment.tags =[];
            // updatedFulfillment.tags.push(cancelRequest.request.tags[0]);
            updatedFulfillment.tags =qouteTrails;
            //updatedFulfillment.organization =order.organization;


            let deliveryFulfillment =  order.fulfillments.find((data)=>{return data.type==='Delivery';});

            deliveryFulfillment.tags=
            [
                {
                    'code':'cancel_request',
                    'list':
                        [
                            {
                                'code':'reason_id',
                                'value':data.cancellation_reason_id
                            },
                            {
                                'code':'initiated_by',
                                'value':data.initiatedBy //TODO: take it from ENV
                            }
                        ]
                },
                {
                    'code':'precancel_state',
                    'list':
                        [
                            {
                                'code':'fulfillment_state',
                                'value':deliveryFulfillment.state.descriptor.code
                            },
                            {
                                'code':'updated_at',
                                'value':order.updatedAt
                            }
                        ]
                }
            ];

            order.fulfillments =[];
            order.fulfillments.push(updatedFulfillment);
            order.fulfillments.push(deliveryFulfillment);

            //2. append qoute trail
            order.quote = await this.updateQoute(order.quote,data.quantity,data.id);
            // await order.save();
            //TODO:Uncomment this
            await Order.findOneAndUpdate({orderId:orderId},{items:order.items,fulfillments:order.fulfillments,quote:order.quote,state:order.state});

            //add cancellation reason
            order.cancellation=
                {
                    'cancelled_by':cancelRequest?.context?.bppId,
                    'reason':
                        {
                            'id':`${data.cancellation_reason_id}`
                        }
                };

            // //notify client to update order status ready to ship to logistics
            // let httpRequest = new HttpRequest(
            //     mergedEnvironmentConfig.intraServiceApiEndpoints.client,
            //     '/api/v2/client/status/cancel',
            //     'POST',
            //     {data: order},
            //     {}
            // );
            // await httpRequest.send();

            return order;

        } catch (err) {
            console.log('[OrganizationService] [get] Error in getting organization by id -}', err);
            throw err;
        }
    }

    async getONDC(orderId) {
        try {
            let order = await Order.findOne({orderId: orderId}).lean();

            return order;

        } catch (err) {
            console.log('[OrganizationService] [get] Error in getting organization by id -}', err);
            throw err;
        }
    }

    async update(orderId, data) {
        try {
            let order = await Order.findOne({orderId: orderId}).lean();

            order.state = data.state;

            await order.save();

            return order;

        } catch (err) {
            console.log('[OrganizationService] [get] Error in getting organization by id -}', err);
            throw err;
        }
    }

    async OndcUpdate(orderId, data) {
        try {

            let oldOrder = await Order.findOne({orderId: orderId}).lean();

            console.log('oldOrder--->', orderId, oldOrder);
            delete data.data._id;

            for (let fl of data.data.fulfillments) {

                //create fl if not exist
                let fulfilment = await Fulfillment.findOne({id: fl.id, orderId: orderId});

                if (!fulfilment) { //create new
                    let newFl = new Fulfillment();
                    newFl.id = fl.id;
                    newFl.orderId = orderId;
                    newFl.request = fl;
                    newFl.organization = oldOrder.organization;
                    newFl.order = oldOrder._id;
                    await newFl.save();
                }

                // if(item.state=='Return_Initiated'){ //check if old item state
                //     //reduce item quantity
                //     // let product = await Product.findOne({_id:item.id});
                //     // product.quantity = product.quantity-item.quantity.count;
                //     // if(product.quantity<0){
                //     //     throw new ConflictError();
                //     // }
                //     // await product.save();
                //
                //     //step 1. add item to return model
                //     let returnData = {
                //         itemId: item.id,
                //         orderId:orderId,
                //         state:item.state,
                //         qty:item.quantity.count,
                //         organization:oldOrder.organization,
                //         reason:item.reason_code
                //     };
                //
                //     let returnItem = await ReturnItem.findOne({orderId:orderId,itemId:item.id});
                //     if(!returnItem){
                //         await new ReturnItem(returnData).save();
                //     }
                // }
            }

            let order = await Order.findOneAndUpdate({orderId: orderId}, data.data);

            return order;

        } catch (err) {
            console.log('[OrganizationService] [get] Error in getting organization by id -}', err);
            throw err;
        }
    }

}

export default OrderService;
