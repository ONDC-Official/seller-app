import HttpRequest from '../utils/HttpRequest';
import {getProducts,getUpdate, getSelect, getInit, getConfirm, getTrack, getSupport,getStatus,getCancel} from "../utils/schemaMapping";
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
            const searchProduct = requestQuery.message.intent.item?.descriptor?.name??""
            const searchCategory = requestQuery.message.intent.category?.descriptor?.id??""

            let headers = {};

            let httpRequest = new HttpRequest(
                serverUrl,
                `/api/v1/products/search?name=${searchProduct}&category=${searchCategory}`, //TODO: allow $like query
                'get',
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

        const productData = await getInit({
            qouteItems: qouteItems,
            totalPrice: totalPriceObj,
            detailedQoute: detailedQoute,
            context: requestQuery.context,
            message: requestQuery.message
        });


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
            orderItems.push(result.data.data.id);
        }


        confirmData["order_items"] =orderItems
        confirmData.order_id = confirmData.id
        delete confirmData.id


        let confirm = {}
        let httpRequest = new HttpRequest(
            serverUrl,
            `/api/orders`,
            'POST',
            {data: confirmData},
            headers
        );

        let result = await httpRequest.send();

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

    async getOrgForOndc(id) {

        let headers = {};
        // headers['Authorization'] = `Bearer ${strapiAccessToken}`;

        let httpRequest = new HttpRequest(
            serverUrl,
            `/api/v1/organizations/${id}/ondcGet`,
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

    async productStatus(requestQuery,statusRequest={},unsoliciated,payload) {

        if(!unsoliciated){
            console.log("in eif")
            statusRequest = requestQuery.retail_status[0];//select first select request
        }else{
            console.log("in else")
            statusRequest = payload;

        }

        console.log("statusRequest---->",statusRequest.context)

        const logisticData = requestQuery.logistics_on_status[0]

        let confirm = {}
        let httpRequest = new HttpRequest(
            serverUrl,
            `/api/v1/orders/${statusRequest.message.order_id}/ondcGet`,
            'GET',
            {},
            {}
        );

        let result = await httpRequest.send();

        let updateOrder = result.data

        if(logisticData.message.order.fulfillments[0].state?.descriptor?.code ==='Pending'){
            updateOrder.state ='Created'
        }else{
            updateOrder.state =logisticData.message.order.state
        }

        //updateOrder.state =logisticData.message.order.state

        updateOrder.fulfillments[0].state =logisticData.message.order.fulfillments[0].state

        //update order level state
        httpRequest = new HttpRequest(
            serverUrl,
            `/api/v1/orders/${result.data._id}/ondcUpdate`,
            'PUT',
            {data:updateOrder},
            {}
        );

        let updateResult = await httpRequest.send();

        //update item level fulfillment status
        let items = updateOrder.items.map((item)=>{
            if(item.state=='Cancelled'){
                item.tags={status:'Cancelled'};
            }
           // item.tags={status:logisticData.message.order.fulfillments[0].state?.descriptor?.code};
            item.fulfillment_id = logisticData.message.order.fulfillments[0].id
            delete item.state
            return item;
        });

        console.log("items----->",items);
        console.log("items----->",items);
        updateOrder.items = items;
        updateOrder.order_id = updateOrder.orderId;

        const productData = await getStatus({
            context: statusRequest.context,
            updateOrder:updateOrder
        });

        return productData
    }

    async productUpdate(requestQuery) {

        const statusRequest = requestQuery.retail_update[0]//select first select request
        const logisticData = requestQuery.logistics_on_update[0]

        let confirm = {}
        let httpRequest = new HttpRequest(
            serverUrl,
            `/api/v1/orders/${statusRequest.message.order.id}/ondcGet`,
            'GET',
            {},
            {}
        );

        let result = await httpRequest.send();

        let updateOrder = result.data

        let updatedItems = []
        for (let item of updateOrder.items){
            let updateItem = statusRequest.message.order.items.find((itemObj) => {return itemObj.id === item.id});

            if(updateItem?.tags?.update_type==='cancel'){
                item.state = "Cancelled";
                item.reason_code = updateItem.tags.reason_code;
            }
            if(updateItem?.tags?.update_type==='return'){
                item.state = "Return_Initiated";
                item.reason_code = updateItem.tags.reason_code;
                //item.quantity=updateItem.quantity.count
            }
            updatedItems.push(item);
        }

        updateOrder.items =updatedItems;

        console.log("updatedItems--->",updatedItems);

        //update order level state
        httpRequest = new HttpRequest(
            serverUrl,
            `/api/v1/orders/${result.data.orderId}/ondcUpdate`,
            'PUT',
            {data:updateOrder},
            {}
        );

        let updateResult = await httpRequest.send();

        //update item level fulfillment status
        let items = updateOrder.items.map((item)=>{

            if(item.state=='Cancelled'){
                item.tags={status:'Cancelled'};
            }
            if(item.state=='Return_Initiated'){
                item.tags={status:'Return_Initiated'};
            }
           // item.tags={status:logisticData.message.order.fulfillments[0].state?.descriptor?.code};
            item.fulfillment_id = updateOrder.fulfillments[0].id
            delete item.state
            delete item.reason_code
            return item;
        });

        console.log("items--->",items);

        updateOrder.items = items;
        updateOrder.id = updateOrder.orderId;

        const productData = await getUpdate({
            context: statusRequest.context,
            updateOrder:updateOrder
        });

        return productData
    }
    async productUpdateItem(data,requestQuery) {

        const statusRequest = requestQuery.retail_update[0]//select first select request


        console.log("data-------->",data.items);
        console.log("data-------->",data);
        let updatedItems = []
        for (let item of data.message.order.items){

            //let updateItem = statusRequest.message.order.items.find((itemObj) => {return itemObj.id === item.id});
            //
            //
            // if(item.state==='Cancelled'){
            //     item.state = "Cancelled";
            //     item.reason_code = updateItem.tags.reason_code;
            // }

            updatedItems.push(item);
        }

        data.items =updatedItems;

        //update order level state
        // httpRequest = new HttpRequest(
        //     serverUrl,
        //     `/api/v1/orders/${result.data.orderId}/ondcUpdate`,
        //     'PUT',
        //     {data:updateOrder},
        //     {}
        // );

        // let updateResult = await httpRequest.send();

        //update item level fulfillment status
        let items = data.message.order.items.map((item)=>{

            console.log("item--->",item)
            if(item.state=='Cancelled'){
                item.tags={status:'Cancelled'};
            }
            if(item.state=='Liquidated'){
                item.tags={status:'Liquidated'};
            }
            if(item.state=='Rejected'){
                item.tags={status:'Rejected'};
            }
           // item.tags={status:logisticData.message.order.fulfillments[0].state?.descriptor?.code};
            item.fulfillment_id = data.message.order.fulfillments[0].id
            delete item.state
            delete item.reason_code
            return item;
        });

        data.message.order.items = items;
        data.message.order.id = data.message.order.orderId;

        const productData = await getUpdate({
            context: data.context,
            updateOrder:data.message.order
        });

        return productData
    }

    async productOrderStatus(requestQuery,statusRequest) {

        const logisticData = requestQuery.logistics_on_update[0]

        let confirm = {}


        let updateOrder = statusRequest.message.order

        updateOrder.state =logisticData.message.order.state //set to inprogress

        //update order level state
       let httpRequest = new HttpRequest(
            serverUrl,
            `/api/v1/orders/${updateOrder.orderId}/ondcUpdate`,
            'PUT',
            {data:updateOrder},
            {}
        );

        let updateResult = await httpRequest.send();

        updateOrder.order_id = updateOrder.orderId;
        delete updateOrder._id

       // updateOrder.fulfillments[0].state =logisticData.message.order.fulfillments[0].state
        //update item level fulfillment status
        let items = updateOrder.items.map((item)=>{
            if(item.state=='Cancelled'){
                item.tags={status:'Cancelled'};
            }
           // item.tags={status:logisticData.message.order.fulfillments[0].state?.descriptor?.code};
            item.fulfillment_id = logisticData.message.order.fulfillments[0].id
            delete item.state
            return item;
        });

        updateOrder.items = items;
        //updateOrder.id = statusRequest.orderId;
        const productData = await getStatus({
            context: statusRequest.context, //TODO: build status context from confirm request
            updateOrder:updateOrder
        });

        return productData
    }

    async productCancel(requestQuery) {

        const cancelRequest = requestQuery.retail_cancel[0]//select first select request
        const logisticData = requestQuery.logistics_on_cancel[0]

        let confirm = {}
        let httpRequest = new HttpRequest(
            serverUrl,
            `/api/v1/orders/${cancelRequest.message.order_id}/ondcGet`,
            'GET',
            {},
            {}
        );

        let result = await httpRequest.send();

        let updateOrder = result.data

        updateOrder.state =logisticData.message.order.state
        updateOrder.cancellation_reason_id =cancelRequest.message.cancellation_reason_id

        //update order level state
        httpRequest = new HttpRequest(
            serverUrl,
            `/api/v1/orders/${result.data.orderId}/ondcUpdate`,
            'PUT',
            {data:updateOrder},
            {}
        );

        let updateResult = await httpRequest.send();

        //update item level fulfillment status
        // let items = updateOrder.items.map((item)=>{
        //     item.tags={status:updateOrder.state};
        //     item.fulfillment_id = item.id
        //     return item;
        // });

        //updateOrder.items = items;
        updateOrder.id = cancelRequest.message.order_id;
        const productData = await getCancel({
            context: cancelRequest.context,
            updateOrder:updateOrder
        });

        return productData
    }

    async productSellerCancel(cancelData,requestQuery) {

        const cancelRequest = requestQuery.retail_cancel[0]//select first select request
        const logisticData = requestQuery.logistics_on_cancel[0]

        console.log("cancelData----->",cancelData);
        console.log("logisticData----->",logisticData);


        let confirm = {}
        let httpRequest = new HttpRequest(
            serverUrl,
            `/api/v1/orders/${cancelData.message.order.orderId}/ondcGet`,
            'GET',
            {},
            {}
        );

        let result = await httpRequest.send();

        let updateOrder = result.data

        updateOrder.state =logisticData.message.order.state
        updateOrder.cancellation_reason_id =cancelData.message.order.cancellation_reason_id

        //update order level state
        httpRequest = new HttpRequest(
            serverUrl,
            `/api/v1/orders/${result.data.orderId}/ondcUpdate`,
            'PUT',
            {data:updateOrder},
            {}
        );

        let updateResult = await httpRequest.send();

        updateOrder.id = cancelData.message.order.orderId
        //update item level fulfillment status
        // let items = updateOrder.items.map((item)=>{
        //     item.tags={status:updateOrder.state};
        //     item.fulfillment_id = item.id
        //     return item;
        // });

        //updateOrder.items = items;
        //updateOrder.id = cancelData.order_id;
        const productData = await getCancel({
            context: cancelData.context,
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

        let confirmRequest = JSON.parse(JSON.stringify(requestQuery.retail_confirm[0]))//select first select request
        const items = confirmRequest.message.order.items
        const logisticData = requestQuery.logistics_on_confirm[0]

        //let qouteItems = []
       // let detailedQoute = []
        let totalPrice = 0

        let headers = {};

        let confirmData = confirmRequest.message.order

        let itemList = []
        let qouteItems = confirmRequest.message.order.items.map((item)=>{
            // item.tags={status:logisticData.message.order.fulfillments[0].state?.descriptor?.code};
            item.fulfillment_id = logisticData.message.order.fulfillments[0].id
            delete item.state
            return item;
        });

        let breakup = confirmData.quote.breakup

        let updatedBreakup = []
        for(let item of breakup){
            // item.tags={status:logisticData.message.order.fulfillments[0].state?.descriptor?.code};
            if(item['@ondc/org/title_type']==='item'){
               const product =  await this.getForOndc(item['@ondc/org/item_id'])
                item.item = { price: {
                    currency: "INR",
                        value: `${product.MRP}`
                }};
            }
            updatedBreakup.push(item);
        };

        confirmData.quote.breakup = updatedBreakup;
        confirmRequest.message.order.quote.breakup = updatedBreakup;
        console.log("qouteItems-->>>>--",qouteItems)
        console.log("qouteItems-->>>>breakup--",breakup)
        //confirmRequest.message.order.items = qouteItems;

        let org= await this.getOrgForOndc(confirmData.provider.id);

        let storeLocationEnd ={}
        if(org.providerDetail.storeDetails){
            storeLocationEnd =  {
            "location": {
                "id": org.providerDetail.storeDetails.location._id,
                    "descriptor": {
                    "name": org.providerDetail.name
                },
                "gps": `${org.providerDetail.storeDetails.location.lat},${org.providerDetail.storeDetails.location.long}`,

            },
            "contact": {
                phone: org.providerDetail.storeDetails.supportDetails.mobile,
                    email: org.providerDetail.storeDetails.supportDetails.email
            }
        }}

        confirmRequest.message.order.fulfillments[0].start = storeLocationEnd
        confirmRequest.message.order.fulfillments[0].tracking = false;
        confirmRequest.message.order.fulfillments[0].state= {
            "descriptor": {
                "code": "Pending"
            }
        }
        let today = new Date()
        let tomorrow = new Date()
        let endDate = new Date(tomorrow.setDate(today.getDate() + 1))
        confirmRequest.message.order.fulfillments[0].start.time=
            {
                "range":
                    {
                        "start":today, //TODO: need to take this from seller time
                        "end":endDate
                    }
            }
        confirmRequest.message.order.fulfillments[0].end.time=
            {
                "range":
                    {
                        "start":today,
                        "end":endDate
                    }
            }
        confirmRequest.message.order.fulfillments[0]["@ondc/org/provider_name"]='LoadShare Delivery' //TODO: hard coded
        confirmRequest.message.order.payment["@ondc/org/buyer_app_finder_fee_type"]='percentage' //TODO: hard coded

        let detailedQoute = confirmRequest.message.order.quote
        //confirmData["order_items"] = orderItems
        confirmData.items = qouteItems;
        confirmData.order_id = confirmData.id
        confirmData.orderId = confirmData.id
        // confirmData.state = confirmData.id
        confirmData.transaction_id = confirmRequest.context.transaction_id

        if(logisticData.message.order.fulfillments[0].state?.descriptor?.code ==='Pending'){
            confirmData.state ='Created'
        }else{
            confirmData.state =logisticData.message.order.state
        }

        delete confirmData.id

        let confirm = {}
        let httpRequest = new HttpRequest(
            serverUrl,
            `/api/v1/orders`,
            'POST',
            {data: confirmData},
            headers
        );

        let result = await httpRequest.send();




        //update fulfillments

        const productData = await getConfirm({
            qouteItems: qouteItems,
            detailedQoute: detailedQoute,
            context: confirmRequest.context,
            message: confirmRequest.message,
            logisticData: logisticData
        });

        let savedLogistics = new ConfirmRequest()

        savedLogistics.transactionId = confirmRequest.context.transaction_id
        savedLogistics.packaging = "0"//TODO: select packaging option
        savedLogistics.providerId = confirmRequest.message.order.provider.id//TODO: select from items provider id
        savedLogistics.retailOrderId = confirmData.order_id
        savedLogistics.orderId = logisticData.message.order.id
        savedLogistics.selectedLogistics = logisticData
        savedLogistics.confirmRequest = requestQuery.retail_confirm[0]
        savedLogistics.onConfirmRequest = productData
        savedLogistics.logisticsTransactionId = logisticData.context.transaction_id

        await savedLogistics.save();

        return productData
    }


    async productInit(requestQuery) {

        //get search criteria
        // const items = requestQuery.message.order.items

        const initData = JSON.parse(JSON.stringify(requestQuery.retail_init[0]))//select first select request
        const items = initData.message.order.items
        const logisticData = requestQuery.logistics_on_init[0]

        let qouteItems = []
        let detailedQoute = []
        let totalPrice = 0


        let org= await this.getOrgForOndc(initData.message.order.provider.id);

        let paymentDetails ={
                "@ondc/org/buyer_app_finder_fee_type": "percent", //TODO: for transaction id keep record to track this details
                "@ondc/org/buyer_app_finder_fee_amount": "3.0",
                "@ondc/org/settlement_details": [
                    {
                        "settlement_counterparty": "seller-app",
                        "settlement_phase": "sale-amount",
                        "settlement_type": "neft",
                        "settlement_bank_account_no": org.providerDetail.bankDetails.accNumber,
                        "settlement_ifsc_code": org.providerDetail.bankDetails.IFSC,
                        "beneficiary_name": org.providerDetail.bankDetails.accHolderName,
                        "bank_name": org.providerDetail.bankDetails.bankName,
                        "branch_name": org.providerDetail.bankDetails.branchName??"Pune"
                    }
                ]

        }

        //select logistic based on criteria-> for now first one will be picked up
        let deliveryCharges = {
            "title": "Delivery charges",
            "@ondc/org/title_type": "delivery",
            "@ondc/org/item_id": items[0].fulfillment_id,
            "price": {
                "currency": '' + logisticData.message.order.quote.price.currency,
                "value": '' + logisticData.message.order.quote.price.value
            }
        }//TODO: need to map all items in the catalog to find out delivery charges


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
                item.price = {value: ""+price, currency: "INR"}
            }

            qouteItemsDetails = {
                "@ondc/org/item_id": item.id,
                "@ondc/org/item_quantity": {
                    "count": item.quantity.count
                },
                "title": result?.data?.productName,
                "@ondc/org/title_type": "item",
                "price": item.price,
                "item": {
                    "price": {value:""+result?.data?.MRP,currency: "INR"}
                }
            }

            item.fulfillment_id =  item.fulfillment_id
            delete item.price
            qouteItems.push(item)
            detailedQoute.push(qouteItemsDetails)
        }

        totalPrice = parseInt(logisticData.message.order.quote.price.value) + parseInt(totalPrice)
        let totalPriceObj = {value: ""+totalPrice, currency: "INR"}

        detailedQoute.push(deliveryCharges);



        initData.message.order.payment = paymentDetails;
        const productData = await getInit({
            qouteItems: qouteItems,
            totalPrice: totalPriceObj,
            detailedQoute: detailedQoute,
            context: initData.context,
            message: initData.message,
            logisticData: initData.logisticData
        });

        let savedLogistics = new InitRequest()

        savedLogistics.transactionId = initData.context.transaction_id
        savedLogistics.packaging = "0"//TODO: select packaging option
        savedLogistics.providerId = initData.message.order.provider.id
        savedLogistics.selectedLogistics = logisticData
        savedLogistics.logisticsTransactionId = logisticData.context.transaction_id
        savedLogistics.initRequest = requestQuery.retail_init[0]
        savedLogistics.onInitResponse = productData

        await savedLogistics.save();

        return productData
    }


    async productSelect(requestQuery) {

        try{

            let savedLogistics = new SelectRequest();

            const selectData = JSON.parse(JSON.stringify(requestQuery.retail_select[0]));//select first select request

            const items = selectData.message.order.items;
            let logisticData = requestQuery.logistics_on_search;

            let qouteItems = []
            let detailedQoute = []
            let totalPrice = 0

            let isQtyAvailable=true
            let isServiceable=true

            let logisticProvider = {}


            const org = await this.getOrgForOndc(selectData.message.order.provider.id);
            let logisticsToSelect = config.get("sellerConfig").LOGISTICS_BAP_ID

            if(org.providerDetail.storeDetails.logisticsBppId){
                logisticsToSelect = org.providerDetail.storeDetails.logisticsBppId
            }

            console.log({logisticsToSelect});
            console.log(org.providerDetail.storeDetails);

            for (let logisticData1 of logisticData) {
                if (logisticData1.message) {
                    if (logisticData1.context.bpp_id === logisticsToSelect) {//TODO: move to env
                        if(logisticData1.message){
                            logisticProvider = logisticData1
                        }
                    }
                }
            }

            //TODO: uncomment to allow lookup for other providers
            // if (Object.keys(logisticProvider).length === 0) {
            //     for (let logisticData1 of logisticData) { //check if any logistics available who is serviceable
            //         if (logisticData1.message) {
            //             logisticProvider = logisticData1
            //         }
            //     }
            // }

            if (Object.keys(logisticProvider).length === 0) {
                isServiceable=false
            }
            let deliveryType = ''
            for (let item of items) {
                let headers = {};
                let itemObj =item
                let itemLevelQtyStatus = true
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
                    let price

                    if(result?.data?.quantity > result?.data?.maxAllowedQty){
                        result.data.quantity = result?.data?.maxAllowedQty //this is per user available qty
                    }
                    if(result?.data?.quantity < item.quantity.count){
                        isQtyAvailable=false
                        itemLevelQtyStatus=false
                        //add qty check
                        price= result?.data?.MRP * result?.data?.quantity
                        totalPrice += price //as item is not in qty
                    }else{
                        //add qty check
                        price= result?.data?.MRP * item.quantity.count
                        totalPrice += price
                    }

                    item.price = {value: ""+price, currency: "INR"}
                }

                qouteItemsDetails = {
                    "@ondc/org/item_id": item.id,
                    "@ondc/org/item_quantity": {
                        "count": itemLevelQtyStatus?item.quantity.count:result?.data?.quantity
                    },
                    "title": result?.data?.productName,
                    "@ondc/org/title_type": "item",
                    "price": item.price,//itemLevelQtyStatus?item.price:{value: "0", currency: "INR"},
                    "item": {
                        "price": {
                            "currency": "INR",
                            "value": `${result?.data?.MRP}`
                        },
                        "quantity": {
                            "available": {
                                "count": `${result?.data?.quantity}`
                            },
                            "maximum": {
                                "count": `${result?.data?.maxAllowedQty}`
                            }
                        }
                    }
                }

                if(isServiceable){
                    itemObj.fulfillment_id = logisticProvider.message.catalog["bpp/providers"][0].items[0].fulfillment_id //TODO: revisit for item level status

                    deliveryType = logisticProvider.message.catalog["bpp/providers"][0].items.find((element)=>{return element.category_id === config.get("sellerConfig").LOGISTICS_DELIVERY_TYPE});

                }else{
                    itemObj.fulfillment_id = '1'
                }
                delete itemObj.quantity;
                delete itemObj.location_id;
                delete itemObj.price;
                qouteItems.push(itemObj)
                detailedQoute.push(qouteItemsDetails)
            }

            let deliveryCharges ={}
            let fulfillments =[]

            if(isServiceable && deliveryType ){
                //select logistic based on criteria-> for now first one will be picked up
                deliveryCharges = {
                    "title": "Delivery charges",
                    "@ondc/org/title_type": "delivery",
                    "@ondc/org/item_id":deliveryType.fulfillment_id,
                    "price": {
                        "currency": '' + deliveryType.price.currency,
                        "value": '' + deliveryType.price.value
                    }
                }//TODO: need to map all items in the catalog to find out delivery charges

                //added delivery charges in total price
                totalPrice += parseInt(logisticProvider.message.catalog["bpp/providers"][0].items[0].price.value)

                let categories = logisticProvider.message.catalog["bpp/providers"][0].categories
                let duration = ''
                if(deliveryType?.time?.duration){
                    duration = deliveryType.time.duration
                }else{
                    let category = categories.find((cat)=>{
                        return deliveryType.category_id===cat.id
                    });
                    duration = category.time.duration
                }

                fulfillments = [

                    {
                        "id": deliveryType.fulfillment_id, //TODO: check what needs to go here, ideally it should be item id
                        "@ondc/org/provider_name": logisticProvider.message.catalog["bpp/descriptor"].name,
                        "tracking": true, //Hard coded
                        "@ondc/org/category": deliveryType.category_id,
                        "@ondc/org/TAT": duration,
                        "state":
                            {
                                "descriptor":
                                    {
                                        "code": "Serviceable"//Hard coded
                                    }
                            }
                    }]
            }else{

                //get org name from provider id

                deliveryCharges = {
                    "title": "Delivery charges",
                    "@ondc/org/title_type": "delivery",
                    "@ondc/org/item_id": '1',
                    "price": {
                        "currency": 'INR',
                        "value": '0'
                    }
                }
                fulfillments = [
                    {
                        "id": '1',
                        "@ondc/org/provider_name": org.providerDetail.name,//TODO: merchant name
                        "tracking": false, //Hard coded
                        "@ondc/org/category":config.get("sellerConfig").LOGISTICS_DELIVERY_TYPE ,
                        "@ondc/org/TAT":"P1D",
                        "provider_id": selectData.message.order.provider.id,
                        "type":"Delivery",
                        "state":
                            {
                                "descriptor":
                                    {
                                        "code": "Non-serviceable"//Hard coded
                                    }
                            }, end: selectData.message.order.fulfillments[0].end
                    }]
            }

            //update fulfillment
            selectData.message.order.fulfillments = fulfillments

            let totalPriceObj = {value: ""+totalPrice, currency: "INR"}

            detailedQoute.push(deliveryCharges);

            const productData = await getSelect({
                qouteItems: qouteItems,
                order: selectData.message.order,
                totalPrice: totalPriceObj,
                detailedQoute: detailedQoute,
                context: selectData.context,
                isQtyAvailable,
                isServiceable
            });

            savedLogistics.transactionId = selectData.context.transaction_id;
            savedLogistics.logisticsTransactionId = logisticProvider?.context?.transaction_id;
            savedLogistics.packaging = "default"//TODO: select packaging option;
            savedLogistics.providerId = selectData.message.order.provider.id;
            savedLogistics.selectedLogistics = logisticProvider;
            savedLogistics.selectRequest = requestQuery.retail_select[0];
            savedLogistics.onSelectResponse = productData;

            await savedLogistics.save();

            return productData;

        }catch (e){
            console.log(e)
        }
       }

}

module.exports = ProductService;
