import HttpRequest from '../utils/HttpRequest';
import {getProducts, getSelect, getInit, getConfirm, getTrack, getSupport,getStatus,getCancel} from "../utils/schemaMapping";
import {ConfirmRequest, InitRequest, SelectRequest} from "../models";
import logger from "../lib/logger";

var config = require('../lib/config');
const serverUrl = config.get("seller").serverUrl
const BPP_ID = config.get("sellerConfig").BPP_ID
const BPP_URI = config.get("sellerConfig").BPP_URI

class ProductService {

    async list() {

        let headers = {};
        let httpRequest = new HttpRequest(
            serverUrl,
            '/api/v1/products/search',
            'get',
            {},
            headers
        );

        let result = await httpRequest.send();

        return result.data
    }

    async search(requestQuery) {

        try{
            logger.log('info', `[Product Service] search product : param :`,requestQuery);

            //get search criteria
            const searchProduct = requestQuery.message.intent.item.descriptor.name

            let headers = {};

            let httpRequest = new HttpRequest(
                serverUrl,
                `/api/v1/products/search`, //TODO: allow $like query
                'get',
                {name:searchProduct},
                headers
            );

            let result = await httpRequest.send();

            logger.log('info', `[Product Service] search product : result :`, result.data);

            const productData = await getProducts({data: result.data, context: requestQuery.context});

            logger.log('info', `[Product Service] search product transformed: result :`, productData);

            return productData
        }catch (e) {
            console.log(e)
        }

    }


    async select(requestQuery) {

        logger.log('info', `[Product Service] product select :`, requestQuery);

        //get search criteria
        const selectData = requestQuery.retail_select
        const items = selectData.message.order.items
        const logisticData = requestQuery.logistics_on_search

        let qouteItems = []
        let detailedQoute = []
        let totalPrice = 0
        for (let item of items) {
            let headers = {};

            let qouteItemsDetails = {}
            let httpRequest = new HttpRequest(
                serverUrl,
                `/api/products/${item.id}`,
                'get',
                {},
                headers
            );

            let result = await httpRequest.send();

            if (result?.data?.data.attributes) {

                let price = result?.data?.data?.attributes?.price * item.quantity.count
                totalPrice += price
                item.price = {value: price, currency: "INR"}
            }

            //TODO: check if quantity is available

            qouteItemsDetails = {
                "@ondc/org/item_id": item.id,
                "@ondc/org/item_quantity": {
                    "count": item.quantity.count
                },
                "title": result?.data?.data?.attributes?.name,
                "@ondc/org/title_type": "item",
                "price": item.price
            }

            qouteItems.push(item)
            detailedQoute.push(qouteItemsDetails)
        }

        logger.log('info', `[Product Service] checking if logistics provider available from :`, logisticData);

        let logisticProvider = {}
        for (let logisticData1 of logisticData) { //check if any logistics available who is serviceable

            if (logisticData1.message) {
                logisticProvider = logisticData1
            }
        }

        if (Object.keys(logisticProvider).length === 0  ) {
            return {context: {...selectData.context,action:'on_select'},message:{
                "type": "CORE-ERROR",
                "code": "60001",
                "message": "Pickup not servicable"
            }}
        }

        logger.log('info', `[Product Service] logistics provider available  :`, logisticProvider);

        //select logistic based on criteria-> for now first one will be picked up
        let deliveryCharges = {
            "title": "Delivery charges",
            "@ondc/org/title_type": "delivery",
            "price": {
                "currency": '' + logisticProvider.message.catalog["bpp/providers"][0].items[0].price.currency,
                "value": '' + logisticProvider.message.catalog["bpp/providers"][0].items[0].price.value
            }
        }//TODO: need to map all items in the catalog to find out delivery charges

        //added delivery charges in total price
        totalPrice += logisticProvider.message.catalog["bpp/providers"][0].items[0].price.value

        let fulfillments = [
            {
                "id": "Fulfillment1", //TODO: check what needs to go here, ideally it should be item id
                "@ondc/org/provider_name": logisticProvider.message.catalog["bpp/descriptor"],
                "tracking": false,
                "@ondc/org/category": logisticProvider.message.catalog["bpp/providers"][0].category_id,
                "@ondc/org/TAT": "PT45M",
                "provider_id": logisticProvider.context.bpp_id,
                "state":
                    {
                        "descriptor":
                            {
                                "name": logisticProvider.message.catalog["bpp/providers"][0].descriptor.name
                            }
                    }, end: selectData.message.order.fulfillments[0].end
            }]

        //update fulfillment
        selectData.message.order.fulfillments = fulfillments

        let totalPriceObj = {value: totalPrice, currency: "INR"}

        detailedQoute.push(deliveryCharges);

        const productData = await getSelect({
            qouteItems: qouteItems,
            order: selectData.message.order,
            totalPrice: totalPriceObj,
            detailedQoute: detailedQoute,
            context: selectData.context
        });

        return productData
    }

    async init(requestQuery) {

        //get search criteria
        const items = requestQuery.message.order.items

        let qouteItems = []
        let detailedQoute = []
        let totalPrice = 0
        for (let item of items) {
            let headers = {};

            let qouteItemsDetails = {}
            let httpRequest = new HttpRequest(
                serverUrl,
                `/api/products/${item.id}`,
                'get',
                {},
                headers
            );

            let result = await httpRequest.send();

            if (result?.data?.data.attributes) {

                let price = result?.data?.data?.attributes?.price * item.quantity.count
                totalPrice += price
                item.price = {value: price, currency: "INR"}
            }

            qouteItemsDetails = {
                "@ondc/org/item_id": item.id,
                "@ondc/org/item_quantity": {
                    "count": item.quantity.count
                },
                "title": result?.data?.data?.attributes?.name,
                "@ondc/org/title_type": "item",
                "price": item.price
            }

            qouteItems.push(item)
            detailedQoute.push(qouteItemsDetails)
        }

        let deliveryCharges = {
            "title": "Delivery charges",
            "@ondc/org/title_type": "delivery",
            "price": {
                "currency": "INR",
                "value": "0"
            }
        }

        let totalPriceObj = {value: totalPrice, currency: "INR"}

        detailedQoute.push(deliveryCharges);

        console.log("qouteItems------------------", qouteItems)
        console.log("totalPriceObj------------------", totalPriceObj)
        console.log("detailedQoute------------------", detailedQoute)

        const productData = await getInit({
            qouteItems: qouteItems,
            totalPrice: totalPriceObj,
            detailedQoute: detailedQoute,
            context: requestQuery.context,
            message: requestQuery.message
        });

        console.log("productData------------------", productData)

        return productData
    }


    async confirm(requestQuery) {

        const items = requestQuery.message.order.items

        let qouteItems = []
        let detailedQoute = []
        let totalPrice = 0
        for (let item of items) {
            let headers = {};

            let qouteItemsDetails = {}
            let httpRequest = new HttpRequest(
                serverUrl,
                `/api/products/${item.id}`,
                'get',
                {},
                headers
            );

            let result = await httpRequest.send();

            if (result?.data?.data.attributes) {

                let price = result?.data?.data?.attributes?.price * item.quantity.count
                totalPrice += price
                item.price = {value: price, currency: "INR"}
            }

            qouteItemsDetails = {
                "@ondc/org/item_id": item.id,
                "@ondc/org/item_quantity": {
                    "count": item.quantity.count
                },
                "title": result?.data?.data?.attributes?.name,
                "@ondc/org/title_type": "item",
                "price": item.price
            }

            qouteItems.push(item)
            detailedQoute.push(qouteItemsDetails)
        }

        let deliveryCharges = {
            "title": "Delivery charges",
            "@ondc/org/title_type": "delivery",
            "price": {
                "currency": "INR",
                "value": "0"
            }
        }

        let totalPriceObj = {value: totalPrice, currency: "INR"}

        detailedQoute.push(deliveryCharges);

        let headers = {};

        let confirmData = requestQuery.message.order

        let orderItems = []
        // let confirmData = requestQuery.message.order
        for(let item  of confirmData.items){

            let productItems = {
                product:item.id,
                status:'Created',
                qty:item.quantity.count

            }
            let httpRequest = new HttpRequest(
                serverUrl,
                `/api/order-items`,
                'POST',
                {data: productItems},
                headers
            );
            let result = await httpRequest.send();
            console.log("result--------------->",result.data.data.id)
            orderItems.push(result.data.data.id);
        }


        confirmData["order_items"] =orderItems
        confirmData.order_id = confirmData.id
        delete confirmData.id

        console.log("orderItems-------confirmData-------->",confirmData)

        let confirm = {}
        let httpRequest = new HttpRequest(
            serverUrl,
            `/api/orders`,
            'POST',
            {data: confirmData},
            headers
        );

        let result = await httpRequest.send();

        console.log("confirm---------result---------", result.data.data)

        const productData = await getConfirm({
            qouteItems: qouteItems,
            totalPrice: totalPriceObj,
            detailedQoute: detailedQoute,
            context: requestQuery.context,
            message: requestQuery.message
        });

        return productData
    }

    async get(id) {

        let headers = {};
        // headers['Authorization'] = `Bearer ${strapiAccessToken}`;

        return 0/3;

        let httpRequest = new HttpRequest(
            serverUrl,
            `/api/v1/products/${id}`,
            'get',
            {},
            headers
        );

        let result = await httpRequest.send();

        return result.data
    }

    async getForOndc(id) {

        let headers = {};
        // headers['Authorization'] = `Bearer ${strapiAccessToken}`;

        let httpRequest = new HttpRequest(
            serverUrl,
            `/api/v1/products/${id}/ondcGet`,
            'get',
            {},
            headers
        );

        let result = await httpRequest.send();

        return result.data
    }

    async orderList(id) {

        let headers = {};
        // headers['Authorization'] = `Bearer ${strapiAccessToken}`;

        let httpRequest = new HttpRequest(
            serverUrl,
            `/api/orders?populate[0]=order_items&populate[1]=order_items.product`,
            'get',
            {},
            headers
        );

        let result = await httpRequest.send();

        return result.data
    }

    async getOrderById(id) {

        let headers = {};
        // headers['Authorization'] = `Bearer ${strapiAccessToken}`;

        let httpRequest = new HttpRequest(
            serverUrl,
            `/api/orders/${id}?populate[0]=order_items&populate[1]=order_items.product`,
            'get',
            {},
            headers
        );

        let result = await httpRequest.send();

        return result.data
    }

    async update(data, id) {

        let headers = {};
        // headers['Authorization'] = `Bearer ${strapiAccessToken}`;

        console.log(data)
        let httpRequest = new HttpRequest(
            serverUrl,
            `/api/products/${id}`,
            'put',
            {data: data},
            headers
        );

        let result = await httpRequest.send();

        return result.data
    }

    async create(data) {

        let headers = {};
        // headers['Authorization'] = `Bearer ${strapiAccessToken}`;

        console.log(data);

        let httpRequest = new HttpRequest(
            serverUrl,
            '/api/products',
            'post',
            {data},
            headers
        );

        let result = await httpRequest.send();

        return result.data
    }


    async productTrack(requestQuery) {

        const trackRequest = requestQuery.retail_track[0]//select first select request
        const logisticData = requestQuery.logistics_on_track[0]
        const productData = await getTrack({
            context: trackRequest.context,
            logisticData: logisticData
        });

        return productData
    }

    async productStatus(requestQuery) {

        const statusRequest = requestQuery.retail_status[0]//select first select request
        const logisticData = requestQuery.logistics_on_status[0]


        console.log("trackRequest=============>",statusRequest);

        let confirm = {}
        let httpRequest = new HttpRequest(
            serverUrl,
            `/api/orders?filters[order_id][$eq]=${statusRequest.message.order_id}`,
            'GET',
            {},
            {}
        );

        let result = await httpRequest.send();

        console.log("result---------------->",result.data.data[0]);

        let updateOrder = result.data.data[0].attributes

        updateOrder.state =logisticData.message.order.state

        //update order level state
        httpRequest = new HttpRequest(
            serverUrl,
            `/api/orders/${result.data.data[0].id}`,
            'PUT',
            {data:updateOrder},
            {}
        );

        let updateResult = await httpRequest.send();

        //update item level fulfillment status
        let items = updateOrder.items.map((item)=>{
            item.tags={status:updateOrder.state};
            item.fulfillment_id = item.id
            return item;
        });

        updateOrder.items = items;
        updateOrder.id = statusRequest.message.order_id;

        console.log("trackRequest=============>",statusRequest);
        console.log("logisticData=============>",logisticData);
        const productData = await getStatus({
            context: statusRequest.context,
            updateOrder:updateOrder
        });

        return productData
    }

    async productCancel(requestQuery) {

        const cancelRequest = requestQuery.retail_cancel[0]//select first select request
        const logisticData = requestQuery.logistics_on_cancel[0]


        console.log("trackRequest=============>",cancelRequest);

        let confirm = {}
        let httpRequest = new HttpRequest(
            serverUrl,
            `/api/orders?filters[order_id][$eq]=${cancelRequest.message.order_id}`,
            'GET',
            {},
            {}
        );

        let result = await httpRequest.send();

        console.log("result---------------->",result.data.data[0]);

        let updateOrder = result.data.data[0].attributes

        updateOrder.state =logisticData.message.order.state

        //update order level state
        httpRequest = new HttpRequest(
            serverUrl,
            `/api/orders/${result.data.data[0].id}`,
            'PUT',
            {data:updateOrder},
            {}
        );

        let updateResult = await httpRequest.send();

        //update item level fulfillment status
        let items = updateOrder.items.map((item)=>{
            item.tags={status:updateOrder.state};
            item.fulfillment_id = item.id
            return item;
        });

        updateOrder.items = items;
        updateOrder.id = cancelRequest.message.order_id;
        console.log("trackRequest=============>",cancelRequest);
        console.log("logisticData=============>",logisticData);
        const productData = await getCancel({
            context: cancelRequest.context,
            updateOrder:updateOrder
        });

        return productData
    }


    async productSupport(requestQuery) {

        const trackRequest = requestQuery.retail_support[0]//select first select request
        const logisticData = requestQuery.logistics_on_support[0]
        const productData = await getSupport({
            context: trackRequest.context,
            logisticData: logisticData
        });

        return productData
    }


    async productConfirm(requestQuery) {

        //get search criteria
        // const items = requestQuery.message.order.items

        const confirmRequest = requestQuery.retail_confirm[0]//select first select request
        const items = confirmRequest.message.order.items
        const logisticData = requestQuery.logistics_on_confirm[0]

        console.log("logisticData====>",logisticData);

        let qouteItems = []
        let detailedQoute = []
        let totalPrice = 0
        for (let item of items) {
            let headers = {};

            let qouteItemsDetails = {}
            let httpRequest = new HttpRequest(
                serverUrl,
                `/api/v1/products/${item.id}/ondcGet`,
                'get',
                {},
                headers
            );

            let result = await httpRequest.send();

            // if (result?.data?.data.attributes) {
            //
            //     let price = result?.data?.data?.attributes?.price * item.quantity.count
            //     totalPrice += price
            //     item.price = {value: price, currency: "INR"}
            // }

            // qouteItemsDetails = {
            //     "@ondc/org/item_id": item.id,
            //     "@ondc/org/item_quantity": {
            //         "count": item.quantity.count
            //     },
            //     "title": result?.data?.data?.attributes?.name,
            //     "@ondc/org/title_type": "item",
            //     "price": item.price
            // }

            // qouteItems.push(item)
            // detailedQoute.push(qouteItemsDetails)
        }

        //select logistic based on criteria-> for now first one will be picked up
        // let deliveryCharges = {
        //     "title": "Delivery charges",
        //     "@ondc/org/title_type": "delivery",
        //     "price": {
        //         "currency": '' + logisticData.message.order.quote.price.currency,
        //         "value": '' + logisticData.message.order.quote.price.value
        //     }
        // }//TODO: need to map all items in the catalog to find out delivery charges

        //let totalPriceObj = {value: totalPrice, currency: "INR"}

        //detailedQoute.push(deliveryCharges);

        let headers = {};

        let confirmData = confirmRequest.message.order

        let orderItems = []
        confirmData["order_items"] = orderItems
        confirmData.order_id = confirmData.id
        confirmData.transaction_id = confirmRequest.context.transaction_id
        confirmData.state ="Created"
        delete confirmData.id

        console.log("orderItems-------confirmData-------->", confirmData)

        let confirm = {}
        let httpRequest = new HttpRequest(
            serverUrl,
            `/api/v1/orders`,
            'POST',
            {data: confirmData},
            headers
        );

        let result = await httpRequest.send();

        console.log("confirm---------result---------", result.data.data)

        let savedLogistics = new ConfirmRequest()

        savedLogistics.transactionId = confirmRequest.context.transaction_id
        savedLogistics.packaging = "0"//TODO: select packaging option
        savedLogistics.providerId = "0"//TODO: select from items provider id
        savedLogistics.retailOrderId = confirmData.order_id
        savedLogistics.orderId = logisticData.message.order.id
        savedLogistics.selectedLogistics = logisticData

        await savedLogistics.save();


        const productData = await getConfirm({
            qouteItems: qouteItems,
            detailedQoute: detailedQoute,
            context: confirmRequest.context,
            message: confirmRequest.message,
            logisticData: logisticData
        });

        return productData
    }


    async productInit(requestQuery) {

        //get search criteria
        // const items = requestQuery.message.order.items

        const initData = requestQuery.retail_init[0]//select first select request
        const items = initData.message.order.items
        const logisticData = requestQuery.logistics_on_init[0]

        let qouteItems = []
        let detailedQoute = []
        let totalPrice = 0


        //select logistic based on criteria-> for now first one will be picked up
        let deliveryCharges = {
            "title": "Delivery charges",
            "@ondc/org/title_type": "delivery",
            "price": {
                "currency": '' + logisticData.message.order.quote.price.currency,
                "value": '' + logisticData.message.order.quote.price.value
            }
        }//TODO: need to map all items in the catalog to find out delivery charges

        console.log("qouteItems------------------", qouteItems)
        console.log("totalPriceObj------------------", totalPriceObj)
        console.log("detailedQoute------------------", detailedQoute)

        for (let item of items) {
            let headers = {};

            let qouteItemsDetails = {}
            let httpRequest = new HttpRequest(
                serverUrl,
                `/api/v1/products/${item.id}/ondcGet`,
                'get',
                {},
                headers
            );

            let result = await httpRequest.send();

            if (result?.data) {

                let price = result?.data?.MRP * item.quantity.count
                totalPrice += parseInt(price)
                item.price = {value: price, currency: "INR"}
            }

            qouteItemsDetails = {
                "@ondc/org/item_id": item.id,
                "@ondc/org/item_quantity": {
                    "count": item.quantity.count
                },
                "title": result?.data?.productName,
                "@ondc/org/title_type": "item",
                "price": item.price
            }

            item.fulfillment_id =  item.fulfillment_id
            qouteItems.push(item)
            detailedQoute.push(qouteItemsDetails)
        }

        console.log("totalPrice---->",totalPrice)
        console.log("logisticData.message.order.quote.price.currency---->",logisticData.message.order.quote.price.value)

        totalPrice = parseInt(logisticData.message.order.quote.price.value) + parseInt(totalPrice)
        let totalPriceObj = {value: ""+totalPrice, currency: "INR"}

        detailedQoute.push(deliveryCharges);

        let savedLogistics = new InitRequest()

        savedLogistics.transactionId = initData.context.transaction_id
        savedLogistics.packaging = "0"//TODO: select packaging option
        savedLogistics.providerId = "0"//TODO: select from items provider id
        savedLogistics.selectedLogistics = logisticData

        await savedLogistics.save();

        const productData = await getInit({
            qouteItems: qouteItems,
            totalPrice: totalPriceObj,
            detailedQoute: detailedQoute,
            context: initData.context,
            message: initData.message,
            logisticData: initData.logisticData
        });

        console.log("productData------------------", productData)

        return productData
    }


    async productSelect(requestQuery) {

        // console.log("requestQuery------------->", requestQuery);
        // console.log("requestQuery-------data------>", requestQuery.data);
        // console.log("requestQuery---------retail_select---->", requestQuery.retail_select);
        // console.log("requestQuery---------logistics_on_search---->", requestQuery.logistics_on_search);
        //get search criteria
        const selectData = requestQuery.retail_select[0]//select first select request
        const items = selectData.message.order.items
        const logisticData = requestQuery.logistics_on_search

        let qouteItems = []
        let detailedQoute = []
        let totalPrice = 0


        let logisticProvider = {}

        for (let logisticData1 of logisticData) {
            if (logisticData1.message) {
                if (logisticData1.context.bpp_id === "ondc-preprod.loadshare.net") {//TODO: move to env
                    logisticProvider = logisticData1
                }
            }
        }

        if (Object.keys(logisticProvider).length === 0) {
            for (let logisticData1 of logisticData) { //check if any logistics available who is serviceable
                if (logisticData1.message) {
                    logisticProvider = logisticData1
                }
            }
        }

        if (Object.keys(logisticProvider).length === 0) {
            return {
                context: {...selectData.context, action: 'on_select'}, error: { //TODO: return product details with valid code
                    "type": "CORE-ERROR",
                    "code": "60001",
                    "message": "Pickup not servicable"
                }
            }
        }

        for (let item of items) {
            let headers = {};

            let qouteItemsDetails = {}
            let httpRequest = new HttpRequest(
                serverUrl,
                `/api/v1/products/${item.id}/ondcGet`,
                'get',
                {},
                headers
            );

            let result = await httpRequest.send();

            console.log("product data------------>", result?.data);

            if (result?.data) {
                let price = result?.data?.MRP * item.quantity.count
                totalPrice += price
                item.price = {value: price, currency: "INR"}
            }

            //TODO: check if quantity is available

            qouteItemsDetails = {
                "@ondc/org/item_id": item.id,
                "@ondc/org/item_quantity": {
                    "count": item.quantity.count
                },
                "title": result?.data?.productName,
                "@ondc/org/title_type": "item",
                "price": item.price
            }

            item.fulfillment_id = logisticProvider.message.catalog["bpp/providers"][0].items[0].fulfillment_id //TODO: revisit for item level status
            qouteItems.push(item)
            detailedQoute.push(qouteItemsDetails)
        }

        let savedLogistics = new SelectRequest()

        savedLogistics.transactionId = selectData.context.transaction_id
        savedLogistics.packaging = "0"//TODO: select packaging option
        savedLogistics.providerId = "0"//TODO: select from items provider id
        savedLogistics.selectedLogistics = logisticProvider

        await savedLogistics.save();

        //select logistic based on criteria-> for now first one will be picked up
        let deliveryCharges = {
            "title": "Delivery charges",
            "@ondc/org/title_type": "delivery",
            "price": {
                "currency": '' + logisticProvider.message.catalog["bpp/providers"][0].items[0].price.currency,
                "value": '' + logisticProvider.message.catalog["bpp/providers"][0].items[0].price.value
            }
        }//TODO: need to map all items in the catalog to find out delivery charges

        //added delivery charges in total price
        totalPrice += parseInt(logisticProvider.message.catalog["bpp/providers"][0].items[0].price.value)

        let fulfillments = [
            {
                "id": logisticProvider.message.catalog["bpp/providers"][0].items[0].fulfillment_id, //TODO: check what needs to go here, ideally it should be item id
                "@ondc/org/provider_name": logisticProvider.message.catalog["bpp/descriptor"].name,
                "tracking": false,
                "@ondc/org/category": logisticProvider.message.catalog["bpp/providers"][0].category_id,
                "@ondc/org/TAT": "PT45M",
                "provider_id": logisticProvider.message.catalog["bpp/providers"][0].id,
                "type":"Delivery",//TODO: hard coded
                "state":
                    {
                        "descriptor":
                            {
                                "name": logisticProvider.message.catalog["bpp/providers"][0].descriptor.name //TODO: discuss with Prashant
                            }
                    }, end: selectData.message.order.fulfillments[0].end
            }]

        //update fulfillment
        selectData.message.order.fulfillments = fulfillments

        let totalPriceObj = {value: ""+totalPrice, currency: "INR"}

        detailedQoute.push(deliveryCharges);

        const productData = await getSelect({
            qouteItems: qouteItems,
            order: selectData.message.order,
            totalPrice: totalPriceObj,
            detailedQoute: detailedQoute,
            context: selectData.context
        });

        return productData
    }

}

module.exports = ProductService;
