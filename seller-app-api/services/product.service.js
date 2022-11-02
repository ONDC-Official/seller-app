import HttpRequest from '../utils/HttpRequest';
import {getProducts,getSelect,getInit,getConfirm} from "../utils/schemaMapping";

var config = require('../lib/config');
// const strapiAccessToken = '1465d1ca50726c39d0a764ba345121bc594f4923367de7d8ce57c779c0b3a3fd64eecbd4268e5e8818a57068f0f48b1b7d3a4ec20cfeb55e48bf902283c318b8b9fbe7f6fd9e86e813eab18acbd38075a2389bd5e5eb73fe1ba9607d3f9e7b00a5cc46c8dcf617734f52ec0e91b90d167a180bba4ed1f0a7d7ad026f28c5aad2'
const strapiAccessToken = config.get("strapi").apiToken
const strapiURI = config.get("strapi").serverUrl
const BPP_ID = config.get("sellerConfig").BPP_ID
// const BPP_ID = config.get("sellerConfig").BPP_ID
class CategoryService {

    async list(){

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

    async search(requestQuery){

        //get search criteria
        const searchProduct = requestQuery.message.intent.item.descriptor.name
        //const searchCategory = requestQuery.message.intent.category.descriptor?.name??""

        let headers = {};
        // headers['Authorization'] = `Bearer ${strapiAccessToken}`;


        let httpRequest = new HttpRequest(
            strapiURI,
            `/api/products?filters[name][$eq]=${searchProduct}`,
            'get',
            {},
            headers
        );

        let result = await httpRequest.send();

        console.log("search result================>",result)

        const productData =await getProducts({data:result.data,context:requestQuery.context});

        console.log("search result=======productData=========>",productData);

        return productData
    }

    async select(requestQuery){

        //get search criteria
        const items = requestQuery.message.order.items

        let qouteItems = []
        let detailedQoute  = []
        let totalPrice = 0
        for(let item of items){
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

            if(result?.data?.data.attributes){

                let price = result?.data?.data?.attributes?.price*item.quantity.count
                totalPrice += price
                item.price = {value:price,currency:"INR"}
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

        let totalPriceObj = {value:totalPrice,currency:"INR"}

        detailedQoute.push(deliveryCharges);

        const productData =await getSelect({qouteItems:qouteItems,order:requestQuery.message.order,totalPrice:totalPriceObj,detailedQoute:detailedQoute,context:requestQuery.context});

        return productData
    }

    async init(requestQuery){

        //get search criteria
        const items = requestQuery.message.order.items

        let qouteItems = []
        let detailedQoute  = []
        let totalPrice = 0
        for(let item of items){
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

            if(result?.data?.data.attributes){

                let price = result?.data?.data?.attributes?.price*item.quantity.count
                totalPrice += price
                item.price = {value:price,currency:"INR"}
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

        let totalPriceObj = {value:totalPrice,currency:"INR"}

        detailedQoute.push(deliveryCharges);

        console.log("qouteItems------------------",qouteItems)
        console.log("totalPriceObj------------------",totalPriceObj)
        console.log("detailedQoute------------------",detailedQoute)

        const productData =await getInit({qouteItems:qouteItems,totalPrice:totalPriceObj,detailedQoute:detailedQoute,context:requestQuery.context,message:requestQuery.message});

        console.log("productData------------------",productData)

        return productData
    }


    async confirm(requestQuery){

        //get search criteria
        const items = requestQuery.message.order.items

        let qouteItems = []
        let detailedQoute  = []
        let totalPrice = 0
        for(let item of items){
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

            if(result?.data?.data.attributes){

                let price = result?.data?.data?.attributes?.price*item.quantity.count
                totalPrice += price
                item.price = {value:price,currency:"INR"}
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

        let totalPriceObj = {value:totalPrice,currency:"INR"}

        detailedQoute.push(deliveryCharges);

        let headers = {};

        let confirm = {}
        let httpRequest = new HttpRequest(
            strapiURI,
            `/api/order-details`,
            'POST',
            {},
            headers
        );

        let result = await httpRequest.send();

        console.log("confirm---------result---------",result.data.data)

        const productData =await getConfirm({qouteItems:qouteItems,totalPrice:totalPriceObj,detailedQoute:detailedQoute,context:requestQuery.context,message:requestQuery.message});

        //create order

        //crate order items productId, orderId , qty , fulfillment

        // console.log("productData------------------",productData)

        return productData
    }

    async get(id){

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

    async orderList(id){

        let headers = {};
        // headers['Authorization'] = `Bearer ${strapiAccessToken}`;

        let httpRequest = new HttpRequest(
            strapiURI,
            `/api/orders?populate=*`,
            'get',
            {},
            headers
        );

        let result = await httpRequest.send();

        return result.data
    }

    async update(data,id){

        let headers = {};
        // headers['Authorization'] = `Bearer ${strapiAccessToken}`;

        console.log(data)
        let httpRequest = new HttpRequest(
            strapiURI,
            `/api/products/${id}`,
            'put',
            {data:data},
            headers
        );

        let result = await httpRequest.send();

        return result.data
    }

    async create(data){

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
}

module.exports = CategoryService;
