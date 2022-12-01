import {v4 as uuidv4} from 'uuid';
import config from "../lib/config";
import HttpRequest from "../utils/HttpRequest";
import {getProducts, getSelect, getInit, getConfirm} from "../utils/schemaMapping";
import {ProductService} from '../services';
// import {getSelect} from "../utils/schemaMapping";
//
// const productService = new ProductService();
const strapiAccessToken = config.get("strapi").apiToken
const strapiURI = config.get("strapi").serverUrl
const BPP_ID = config.get("sellerConfig").BPP_ID
const BPP_URI = config.get("sellerConfig").BPP_URI

class LogisticsService {

    async search(payload = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            console.log("payload.context----->",payload.context);

            const order = payload.message.order;
            const selectMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            const searchRequest = [{
                "context":
                    {
                        "domain": "nic2004:60232",
                        "country": "IND",
                        "city": "std:080",
                        "action": "search",
                        "core_version": "1.0.0",
                        "bap_id": config.get("sellerConfig").BAP_ID,
                        "bap_uri": config.get("sellerConfig").BAP_URI+'/protocol/v1',
                        "transaction_id": payload.context.transaction_id,
                        "message_id": logisticsMessageId,
                        "timestamp": new Date(),
                        "ttl": "PT30S"
                    },
                "message": {
                    "intent": {
                        "category": {
                            "id": "Immediate Delivery"
                        },
                        "provider": { //TBD: what values should go here. i think it should be config based
                            "time": {
                                "days": "1,2,3,4,5,6,7",
                                "schedule": {
                                    "holidays": [
                                        "2022-08-15",
                                        "2022-08-19"
                                    ],
                                    "frequency": "PT4H",
                                    "times": [
                                        "1100",
                                        "1900"
                                    ]
                                },
                                "range": {
                                    "start": "1100",
                                    "end": "2100"
                                }
                            }
                        },
                        "fulfillment": {
                            "type": "CoD",
                            "start": config.get("sellerConfig").sellerPickupLocation,
                            "end": order.fulfillments[0].end
                        },
                        "payment": {
                            "@ondc/org/collection_amount": "30000"
                        },
                        "@ondc/org/payload_details": {
                            "weight": {
                                "unit": "Kilogram",
                                "value": 10
                            },
                            "dimensions": {
                                "length": {
                                    "unit": "meter",
                                    "value": 1
                                },
                                "breadth": {
                                    "unit": "meter",
                                    "value": 1
                                },
                                "height": {
                                    "unit": "meter",
                                    "value": 1
                                }
                            },
                            "category": "Mobile Phone", //TODO: taken from product category
                            "value": {
                                "currency": "INR",
                                "value": "50000" // sum of total items
                            }
                        }
                    }
                }

            }]

            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            setTimeout(() => {
                this.buildSelectRequest(logisticsMessageId,selectMessageId)
            }, 5000);

            return searchRequest
        } catch (err) {
            throw err;
        }
    }


    async buildSelectRequest(logisticsMessageId,selectMessageId){

        try{
            //1. look up for logistics
                let logisticsResponse =await this.getLogistics(logisticsMessageId,selectMessageId)
            //2. if data present then build select response

            let selectResponse = await this.productSelect(logisticsResponse)

            //3. post to protocol layer
            await this.postSelectResponse(selectResponse);

        }catch (e){
            console.log(e)
            return e
        }
    }

    //get all logistics response from protocol layer
    async getLogistics(logisticsMessageId,selectMessageId){
        try{

            console.log(`[getLogistics]==logisticsMessageId ${logisticsMessageId} selectMessageId ${selectMessageId}`)
            let headers = {};
            let httpRequest = new HttpRequest(
                config.get("sellerConfig").BAP_URI,
                `/protocol/v1/response/network-request-payloads?logisticsOnSearch=${logisticsMessageId}&select=${selectMessageId}`,
                'get',
                {},
                headers
            );

            console.log(httpRequest)

            let result = await httpRequest.send();

            console.log(`[getLogistics]==result.data ${result.data}`)

            return result.data

        }catch(e){
            console.log("ee----------->",e)
            return e
        }

    }

    async productSelect(requestQuery) {

        console.log("requestQuery------------->",requestQuery);
        console.log("requestQuery-------data------>",requestQuery.data);
        console.log("requestQuery---------retail_select---->",requestQuery.retail_select);
        console.log("requestQuery---------logistics_on_search---->",requestQuery.logistics_on_search);
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


    //return select response to protocol layer
    async postSelectResponse(selectResponse){
        try{

            let headers = {};
            let httpRequest = new HttpRequest(
                config.get("sellerConfig").BAP_URI,
                `/protocol/v1/on_select`,
                'POST',
                selectResponse,
                headers
            );

            console.log(httpRequest)

            let result = await httpRequest.send();

            return result.data

        }catch(e){
            console.log("ee----------->",e)
            return e
        }

    }


    async init(context = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            /*TODO:
               1 .store logistics select/onsearch request
               2. map transaction id with provider id
               3. use psql db to cache these details
               4. add cron to remove entries after 1 day - can be taken up in next phase
               5.
            *  */
            const initRequest = {
                "context":
                    {
                        "domain": "nic2004:60232",
                        "country": "IND",
                        "city": "std:080",
                        "action": "init",
                        "core_version": "1.0.0",
                        "bap_id": "ondc.gofrugal.com/ondc/18275", //CONFIG
                        "bap_uri": "https://ondc.gofrugal.com/ondc/seller/adaptor",//CONFIG
                        "bpp_id": "shiprocket.com/ondc/18275",//STORED OBJECT
                        "bpp_uri": "https://shiprocket.com/ondc", //STORED OBJECT
                        "transaction_id": "9fdb667c-76c6-456a-9742-ba9caa5eb765",
                        "message_id": "1651742565654",
                        "timestamp": "2022-06-13T07:22:45.363Z",
                        "ttl": "PT30S"
                    },
                "message":
                    {
                        "order":
                            {
                                "provider":
                                    {
                                        "id": "18275-Provider-1", //STORED object
                                        "locations":
                                            [
                                                {
                                                    "id": "18275-Location-1" //TODO: TBD
                                                }
                                            ]
                                    },
                                "items": //TODO: take it from request
                                    [
                                        {
                                            "id": "18275-Item-1",
                                            "category_id": "Immediate Delivery"
                                        }
                                    ],
                                "fulfillments":
                                    [
                                        {
                                            "id": "Fulfillment1",
                                            "type": "CoD", //TODO: type payment check
                                            "start":
                                                {
                                                    "location":
                                                        {
                                                            "gps": "12.4535445,77.9283792",
                                                            "address":
                                                                {
                                                                    "name": "Fritoburger",
                                                                    "building": "12 Restaurant Tower",
                                                                    "locality": "JP Nagar 24th Main",
                                                                    "city": "Bengaluru",
                                                                    "state": "Karnataka",
                                                                    "country": "India",
                                                                    "area_code": "560041"
                                                                }
                                                        },
                                                    "contact": //TODO: take from config
                                                        {
                                                            "phone": "98860 98860",
                                                            "email": "abcd.efgh@gmail.com"
                                                        }
                                                },
                                            "end":
                                                {
                                                    "location":
                                                        {
                                                            "gps": "12.4535445,77.9283792",
                                                            "address":
                                                                {
                                                                    "name": "D 000",
                                                                    "building": "Prestige Towers",
                                                                    "locality": "Bannerghatta Road",
                                                                    "city": "Bengaluru",
                                                                    "state": "Karnataka",
                                                                    "country": "India",
                                                                    "area_code": "560076"
                                                                }
                                                        },
                                                    "contact":
                                                        {
                                                            "phone": "98860 98860",
                                                            "email": "abcd.efgh@gmail.com"
                                                        }
                                                }
                                        }
                                    ],
                                "billing":
                                    {
                                        "name": "XXXX YYYYY",
                                        "address":
                                            {
                                                "name": "D000, Prestige Towers",
                                                "locality": "Bannerghatta Road",
                                                "city": "Bengaluru",
                                                "state": "Karnataka",
                                                "country": "India",
                                                "area_code": "560076"
                                            },
                                        "phone": "98860 98860",
                                        "email": "abcd.efgh@gmail.com"
                                    },
                                "payment":
                                    {
                                        "type": "POST-FULFILLMENT",
                                        "collected_by": "BAP",
                                        "@ondc/org/settlement_window": "P2D",
                                        "@ondc/org/settlement_details": //TODO: put this in the config
                                            [
                                                {
                                                    "settlement_counterparty": "buyer-app",
                                                    "settlement_type": "upi",
                                                    "upi_address": "gft@oksbi",
                                                    "settlement_bank_account_no": "XXXXXXXXXX",
                                                    "settlement_ifsc_code": "XXXXXXXXX"
                                                }
                                            ]
                                    }
                            }
                    }
            }


            return searchRequest
        } catch (err) {
            throw err;
        }
    }


    async confirm(context = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            const searchRequest = {
                //            "context":
                //                {
                //                    "domain": "nic2004:60232",
                //                    "country": "IND",
                //                    "city": "std:080",
                //                    "action": "confirm",
                //                    "core_version": "1.0.0",
                //                    "bap_id": "ondc.gofrugal.com/ondc/18275",
                //                    "bap_uri": "https://ondc.gofrugal.com/ondc/seller/adaptor",
                //                    "bpp_id": "shiprocket.com/ondc/18275",
                //                    "bpp_uri": "https://shiprocket.com/ondc",
                //                    "transaction_id": "9fdb667c-76c6-456a-9742-ba9caa5eb765",
                //                    "message_id": "1651742565654",
                //                    "timestamp": "2022-06-13T07:22:45.363Z",
                //                    "ttl": "PT30S"
                //                },
                //            "message":
                //                {
                //                    "order":
                //                        {
                // "id": "0799f385-5043-4848-8433-4643ad511a14",
                // "state": "Created",
                //            "provider":
                //        {
                //            "id": "18275-Provider-1",
                //    "locations":
                //            [
                //                {
                //        "id": "18275-Location-1"
                //        }
                //        ]
                //        },
                //        "items":
                //        [
                //            {
                //                "id": "18275-Item-1",
                //                "category_id": "Same Day Delivery"
                //            }
                //        ],
                //            "quote":
                //        {
                //            "price":
                //            {
                //                "currency": "INR",
                //                "value": "7.0"
                //            },
                //            "breakup":
                //            [
                //                {
                //        "@ondc/org/item_id": "18275-Item-1",
                //        "@ondc/org/title_type": "Delivery Charge",
                //            "price":
                //            {
                //                "currency": "INR",
                //                "value": "5.0"
                //            }
                //        },
                //            {
                //                "title": "RTO charges",
                //        "@ondc/org/title_type": "RTO Charge",
                //                "price":
                //                {
                //                    "currency": "INR",
                //                    "value": "2.0"
                //                }
                //            }
                //        ]
                //        },
                //        "fulfillments":
                //        [
                //            {
                //    "id": "Fulfillment1",
                //        "type": "CoD",
                //            "@ondc/org/awb_no": "1227262193237777",
                //            "start":
                //        {
                //            "person":
                //            {
                //                "name": "Ramu"
                //            },
                //            "location":
                //            {
                //                "gps": "12.4535445,77.9283792",
                //                "address":
                //                {
                //                    "name": "Fritoburger",
                //                    "building": "12 Restaurant Tower",
                //                    "locality": "JP Nagar 24th Main",
                //                    "city": "Bengaluru",
                //                    "state": "Karnataka",
                //                    "country": "India",
                //                    "area_code": "560041"
                //                }
                //            },
                //            "contact":
                //            {
                //                "phone": "98860 98860",
                //                "email": "abcd.efgh@gmail.com"
                //            },
                //            "instructions":
                //            {
                //                "short_desc": "XYZ1",
                //                "long_desc": "QR code will be attached to package",
                //                "additional_desc":
                //                {
                //                "content_type":"text/html",
                //                    "url":"URL for instructions"
                //                },
                //                "images":
                //                    [
                //                    "URL or data string as per spec"
                //                    ]
                //            }
                //        },
                //        "end":
                //        {
                //            "person":
                //            {
                //                "name": "Ramu"
                //            },
                //            "location":
                //            {
                //                "gps": "12.4535445,77.9283792",
                //                "address":
                //                {
                //                    "name": "D 000",
                //                    "building": "Prestige Towers",
                //                    "locality": "Bannerghatta Road",
                //                    "city": "Bengaluru",
                //                    "state": "Karnataka",
                //                    "country": "India",
                //                    "area_code": "560076"
                //                }
                //            },
                //            "contact":
                //            {
                //                "phone": "98860 98860",
                //                "email": "abcd.efgh@gmail.com"
                //            },
                //            "instructions":
                //            {
                //                "short_desc": "XYZ2",
                //                "long_desc": "drop package at security gate"
                //            }
                //        },
                //        "tags": "",
                //        "@ondc/org/order_ready_to_ship": "Yes"
                //    }
                //    ],
                //        "billing":
                //        {
                //            "tax_number": "29AAACU1901H1ZK"
                //        },
                //        "payment":
                //        {
                //            "@ondc/org/collection_amount": "30000",
                //            "type": "ON-ORDER",
                //            "@ondc/org/settlement_details":
                //            [
                //                {
                //                    "settlement_counterparty": "seller-app",
                //                    "settlement_type": "upi",
                //                    "upi_address": "gft@oksbi",
                //                    "settlement_bank_account_no": "XXXXXXXXXX",
                //                    "settlement_ifsc_code": "XXXXXXXXX",
                //                    "settlement_status": "PAID",
                //                    "settlement_reference": "XXXXXXXXX",
                //                    "settlement_timestamp": "2022-09-11T18:01:53.000Z"
                //        }
                //        ]
                //        },
                //        "@ondc/org/linked_order":
                //        {
                //            "items":
                //            [
                //             "category_id": "Grocery",
                //            "descriptor":
                //            {
                //            "name": "Atta"
                //            },
                //            "quantity":
                //            {
                //                "count": "2"
                //                "measure":
                //                {
                //                    "unit": "Kilogram",
                //                    "value": 5
                //                },
                //            },
                //            "price":
                //            {
                //                "currency": "INR",
                //                "value": "300"
                //            }
                //        ],
                //            "provider":
                //            {
                //            "descriptor":
                //                {
                //                    "name": "Aadishwar Store"
                //                },
                //                "address":
                //                {
                //                    "name": "KHB Towers",
                //                    "street": "6th Block",
                //                    "locality": "Koramangala",
                //                    "city": "Bengaluru",
                //                    "state": "Karnataka",
                //                    "area_code": "560070"
                //                }
                //            },
                //            "order":
                //            {
                //                "id": "ABCDEFGH",
                //                "weight":
                //                {
                //                    "unit": "Kilogram",
                //                    "value": 10
                //                }
                //            }
                //        }
                //    }
                //    }
            }


            return searchRequest
        } catch (err) {
            throw err;
        }
    }
}

export default LogisticsService;
