import HttpRequest from '../utils/HttpRequest';
import {getProducts, getSelect, getInit, getConfirm, getTrack, getSupport} from "../utils/schemaMapping";
import {ConfirmRequest, InitRequest, SelectRequest} from "../models";

var config = require('../lib/config');
// const strapiAccessToken = '1465d1ca50726c39d0a764ba345121bc594f4923367de7d8ce57c779c0b3a3fd64eecbd4268e5e8818a57068f0f48b1b7d3a4ec20cfeb55e48bf902283c318b8b9fbe7f6fd9e86e813eab18acbd38075a2389bd5e5eb73fe1ba9607d3f9e7b00a5cc46c8dcf617734f52ec0e91b90d167a180bba4ed1f0a7d7ad026f28c5aad2'
const strapiAccessToken = config.get("strapi").apiToken
const strapiURI = config.get("strapi").serverUrl
const BPP_ID = config.get("sellerConfig").BPP_ID
const BPP_URI = config.get("sellerConfig").BPP_URI

// import BppSearchService from './logistics.service'
// // const BPP_ID = config.get("sellerConfig").BPP_ID
//
// let bppSearchService = new BppSearchService()

class ProductService {

    async list() {

        let headers = {};
        // headers['Authorization'] = `Bearer ${strapiAccessToken}`;

        let httpRequest = new HttpRequest(
            strapiURI,
            '/api/products',
            'get',
            {},
            headers
        );

        let result = await httpRequest.send();

        return result.data
    }

    async search(requestQuery) {

        //get search criteria
        const searchProduct = requestQuery.message.intent.item.descriptor.name
        //const searchCategory = requestQuery.message.intent.category.descriptor?.name??""

        let headers = {};
        // headers['Authorization'] = `Bearer ${strapiAccessToken}`;


        let httpRequest = new HttpRequest(
            strapiURI,
            `/api/products?filters[name][$eq]=${searchProduct}`, //TODO: allow $like query
            'get',
            {},
            headers
        );

        let result = await httpRequest.send();

        console.log("search result================>", result)

        const productData = await getProducts({data: result.data, context: requestQuery.context});

        console.log("search result=======productData=========>", productData);

        return productData
    }


    async select(requestQuery) {

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
                strapiURI,
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
                strapiURI,
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
                strapiURI,
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
                strapiURI,
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
            strapiURI,
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

        let httpRequest = new HttpRequest(
            strapiURI,
            `/api/products/${id}`,
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
            strapiURI,
            `/api/orders?populate[0]=order_items&populate[1]=order_items.product`,
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
            strapiURI,
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
            strapiURI,
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

        const trackRequest = requestQuery.retail_status[0]//select first select request
        const logisticData = requestQuery.logistics_on_status[0]


        //TODO: update order status from logistics status api.
        //1, update order level status
        //2. update item level fullfillment status

        console.log("trackRequest=============>",trackRequest);
        console.log("logisticData=============>",logisticData);
        const productData = await getTrack({
            context: trackRequest.context,
            logisticData: logisticData
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
                strapiURI,
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

        //select logistic based on criteria-> for now first one will be picked up
        let deliveryCharges = {
            "title": "Delivery charges",
            "@ondc/org/title_type": "delivery",
            "price": {
                "currency": '' + logisticData.message.order.quote.price.currency,
                "value": '' + logisticData.message.order.quote.price.value
            }
        }//TODO: need to map all items in the catalog to find out delivery charges

        let totalPriceObj = {value: totalPrice, currency: "INR"}

        detailedQoute.push(deliveryCharges);

        let headers = {};

        let confirmData = confirmRequest.message.order

        let orderItems = []
        // let confirmData = requestQuery.message.order
        for (let item of confirmData.items) {

            let productItems = {
                product: item.id,
                status: 'Created',
                qty: item.quantity.count

            }
            let httpRequest = new HttpRequest(
                strapiURI,
                `/api/order-items`,
                'POST',
                {data: productItems},
                headers
            );
            let result = await httpRequest.send();
            console.log("result--------------->", result.data.data.id)
            orderItems.push(result.data.data.id);
        }


        confirmData["order_items"] = orderItems
        confirmData.order_id = confirmData.id
        delete confirmData.id

        console.log("orderItems-------confirmData-------->", confirmData)

        let confirm = {}
        let httpRequest = new HttpRequest(
            strapiURI,
            `/api/orders`,
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
            totalPrice: totalPriceObj,
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
        for (let item of items) {
            let headers = {};

            let qouteItemsDetails = {}
            let httpRequest = new HttpRequest(
                strapiURI,
                `/api/products/${item.id}`,
                'get',
                {},
                headers
            );

            let result = await httpRequest.send();

            if (result?.data?.data.attributes) {

                let price = result?.data?.data?.attributes?.price * item.quantity.count
                totalPrice += parseInt(price)
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

        //select logistic based on criteria-> for now first one will be picked up
        let deliveryCharges = {
            "title": "Delivery charges",
            "@ondc/org/title_type": "delivery",
            "price": {
                "currency": '' + logisticData.message.order.quote.price.currency,
                "value": '' + logisticData.message.order.quote.price.value
            }
        }//TODO: need to map all items in the catalog to find out delivery charges

        let totalPriceObj = {value: ""+totalPrice, currency: "INR"}

        detailedQoute.push(deliveryCharges);

        console.log("qouteItems------------------", qouteItems)
        console.log("totalPriceObj------------------", totalPriceObj)
        console.log("detailedQoute------------------", detailedQoute)

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

        console.log("requestQuery------------->", requestQuery);
        console.log("requestQuery-------data------>", requestQuery.data);
        console.log("requestQuery---------retail_select---->", requestQuery.retail_select);
        console.log("requestQuery---------logistics_on_search---->", requestQuery.logistics_on_search);
        //get search criteria
        const selectData = requestQuery.retail_select[0]//select first select request
        const items = selectData.message.order.items
        const logisticData = requestQuery.logistics_on_search

        let qouteItems = []
        let detailedQoute = []
        let totalPrice = 0
        for (let item of items) {
            let headers = {};

            let qouteItemsDetails = {}
            let httpRequest = new HttpRequest(
                strapiURI,
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

        let logisticProvider = {}
        for (let logisticData1 of logisticData) { //check if any logistics available who is serviceable
            if (logisticData1.message) {
                if (logisticData1.context.bpp_id === "flash-api.staging.shadowfax.in") {//TODO: move to env
                    logisticProvider = logisticData1
                }else{
                    logisticProvider = logisticData1
                }
            }
        }

        if (Object.keys(logisticProvider).length === 0) {
            return {
                context: {...selectData.context, action: 'on_select'}, error: {
                    "type": "CORE-ERROR",
                    "code": "60001",
                    "message": "Pickup not servicable"
                }
            }
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
