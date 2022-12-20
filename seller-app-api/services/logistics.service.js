import {v4 as uuidv4} from 'uuid';
import config from "../lib/config";
import HttpRequest from "../utils/HttpRequest";
import {getProducts, getSelect, getInit, getConfirm,getTrack,getSupport} from "../utils/schemaMapping";
import {sequelize, Sequelize,InitRequest, ConfirmRequest, SelectRequest} from '../models'

const strapiAccessToken = config.get("strapi").apiToken
const strapiURI = config.get("strapi").serverUrl
const BPP_ID = config.get("sellerConfig").BPP_ID
const BPP_URI = config.get("sellerConfig").BPP_URI

class LogisticsService {

    async search(payload = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            console.log("payload.context----->", payload.context);

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
                        "bap_id": config.get("sellerConfig").BPP_ID,
                        "bap_uri": config.get("sellerConfig").BPP_URI,
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
                            "type": "Prepaid",
                            "start": {
                                "location": {
                                    "gps": "12.938382,77.651775",
                                    "address": {
                                        "area_code": "560087"
                                    }
                                }
                            },
                            "end": {
                                "location": {
                                    "gps": "12.997989,77.622650",
                                    "address": {
                                        "area_code": "560005"
                                    }
                                }
                            }
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
                this.buildSelectRequest(logisticsMessageId, selectMessageId)
            }, 10000); //TODO move to config

            return searchRequest
        } catch (err) {
            throw err;
        }
    }


    async buildSelectRequest(logisticsMessageId, selectMessageId) {

        try {
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, selectMessageId, 'select')
            //2. if data present then build select response

            let selectResponse = await this.productSelect(logisticsResponse)

            //3. post to protocol layer
            await this.postSelectResponse(selectResponse);

        } catch (e) {
            console.log(e)
            return e
        }
    }

    //get all logistics response from protocol layer
    async getLogistics(logisticsMessageId, retailMessageId, type) {
        try {

            console.log(`[getLogistics]==logisticsMessageId ${logisticsMessageId} selectMessageId ${retailMessageId}`)
            let headers = {};
            let query = ''
            if (type === 'select') {
                query = `logisticsOnSearch=${logisticsMessageId}&select=${retailMessageId}`
            } else if (type === 'init') {
                query = `logisticsOnInit=${logisticsMessageId}&init=${retailMessageId}`
            } else if (type === 'confirm') {
                query = `logisticsOnConfirm=${logisticsMessageId}&confirm=${retailMessageId}`
            }else if (type === 'track') {
                query = `logisticsOnTrack=${logisticsMessageId}&track=${retailMessageId}`
            }else if (type === 'status') {
                query = `logisticsOnStatus=${logisticsMessageId}&status=${retailMessageId}`
            }else if (type === 'update') {
                query = `logisticsOnUpdate=${logisticsMessageId}&update=${retailMessageId}`
            }else if (type === 'cancel') {
                query = `logisticsOnCancel=${logisticsMessageId}&cancel=${retailMessageId}`
            }else if (type === 'support') {
                query = `logisticsOnSupport=${logisticsMessageId}&support=${retailMessageId}`
            }
            let httpRequest = new HttpRequest(
                config.get("sellerConfig").BPP_URI,
                `/protocol/v1/response/network-request-payloads?${query}`,
                'get',
                {},
                headers
            );

            console.log(httpRequest)

            let result = await httpRequest.send();

            console.log(`[getLogistics]==result.data ${result.data}`)

            return result.data

        } catch (e) {
            console.log("ee----------->", e)
            return e
        }

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
                if (logisticData1.context.bpp_id === "flash-api.staging.shadowfax.in") {
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


    //return select response to protocol layer
    async postSelectResponse(selectResponse) {
        try {

            let headers = {};
            let httpRequest = new HttpRequest(
                config.get("sellerConfig").BPP_URI,
                `/protocol/v1/on_select`,
                'POST',
                selectResponse,
                headers
            );

            console.log(httpRequest)

            let result = await httpRequest.send();

            return result.data

        } catch (e) {
            console.log("ee----------->", e)
            return e
        }

    }


    async init(payload = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            console.log("payload.context----->", payload.context);

            const selectRequest = await SelectRequest.findOne({
                where: {
                    transactionId: payload.context.transaction_id
                }
            })

            console.log("selected logistics--------selectRequest------->", selectRequest);

            const logistics = selectRequest.selectedLogistics;

            console.log("selected logistics--------selectRequest-----logistics-->", logistics);
            console.log("selected logistics--------selectRequest----context--->", logistics.context);

            const order = payload.message.order;
            const selectMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one
            //
            // const initRequest = [{
            //     "context":
            //         {
            //             "domain": "nic2004:60232",
            //             "country": "IND",
            //             "city": "std:080",
            //             "action": "init",
            //             "core_version": "1.0.0",
            //             "bap_id": config.get("sellerConfig").BPP_ID,
            //             "bap_uri": config.get("sellerConfig").BPP_URI+'/protocol/v1',
            //             "bpp_id": logistics.context.bpp_id,//STORED OBJECT
            //             "bpp_uri": logistics.context.bpp_uri, //STORED OBJECT
            //             "transaction_id":  payload.context.transaction_id,
            //             "message_id": logisticsMessageId,
            //             "timestamp": "2022-06-13T07:22:45.363Z",
            //             "ttl": "PT30S"
            //         },
            //     "message":
            //         {
            //             "order":
            //                 {
            //                     "provider":
            //                         {
            //                             "id": logistics.message.catalog["bpp/providers"][0].id, //STORED object
            //                             "locations":
            //                                 [
            //                                     {
            //                                         "id": "18275-Location-1" //TODO: TBD
            //                                     }
            //                                 ]
            //                         },
            //                     "items": order.items,
            //                     "fulfillments":
            //                         [
            //                             {
            //                                 "id": "Fulfillment1",
            //                                 "type": "CoD", //TODO: type payment check
            //                                 "start":
            //                                     {
            //                                         "location":config.get("sellerConfig").sellerPickupLocation.location,
            //                                         "contact":config.get("sellerConfig").sellerPickupLocation.contact
            //                                     },
            //                                 "end":order.fulfillments.end
            //                             }
            //                         ],
            //                     "billing":order.billing,
            //                     "payment":
            //                         {
            //                             "type": "POST-FULFILLMENT",
            //                             "collected_by": "BAP",
            //                             "@ondc/org/settlement_window": "P2D",
            //                             "@ondc/org/settlement_details": config.get("sellerConfig").settlement_details
            //
            //                         }
            //                 }
            //         }
            // }
            // ]


            const initRequest = [{
                "context": {
                    "domain": "nic2004:60232",
                    "country": "IND",
                    "city": "std:080",
                    "action": "init",
                    "core_version": "1.0.0",
                    "bap_id": config.get("sellerConfig").BPP_ID,
                    "bap_uri": config.get("sellerConfig").BPP_URI,
                    "bpp_id": logistics.context.bpp_id,//STORED OBJECT
                    "bpp_uri": logistics.context.bpp_uri, //STORED OBJECT
                    "transaction_id": payload.context.transaction_id,
                    "message_id": logisticsMessageId,
                    "timestamp":new Date(),
                    "ttl": "PT30S"
                },
                "message": {
                    "order": {
                        "provider": {
                            "id": logistics.message.catalog["bpp/providers"][0].id,
                            "locations": [{
                                "id": "18275-Location-1"
                            }]
                        },
                        "items": logistics.message.catalog["bpp/providers"][0].items,
                        "fulfillments": [{
                            "id": "Fulfillment1",
                            "type": "Prepaid",
                            "start": {
                                "location": config.get("sellerConfig").sellerPickupLocation.location,
                                "contact": config.get("sellerConfig").sellerPickupLocation.contact
                            },
                            "end": order.fulfillments[0].end
                        }],
                        billing:      { //TODO: move to config
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
                            "tax_number": "29AAACU1901H1ZK",
                            "phone": "98860 98860",
                            "email": "abcd.efgh@gmail.com"
                        },
                        "payment": {
                            "type": "POST-FULFILLMENT",
                            "collected_by": "BAP",
                            "@ondc/org/settlement_window": "P2D"
                        }
                    }
                }
            }]
            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            setTimeout(() => {
                this.buildInitRequest(logisticsMessageId, selectMessageId)
            }, 5000); //TODO move to config

            return initRequest
        } catch (err) {
            throw err;
        }
    }

    async buildInitRequest(logisticsMessageId, initMessageId) {

        try {
            console.log("buildInitRequest---------->");
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'init')
            //2. if data present then build select response

            console.log("logisticsResponse---------->", logisticsResponse);

            let selectResponse = await this.productInit(logisticsResponse)

            //3. post to protocol layer
            await this.postInitResponse(selectResponse);

        } catch (e) {
            console.log(e)
            return e
        }
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


    //return init response to protocol layer
    async postInitResponse(initResponse) {
        try {

            let headers = {};
            let httpRequest = new HttpRequest(
                config.get("sellerConfig").BPP_URI,
                `/protocol/v1/on_init`,
                'POST',
                initResponse,
                headers
            );

            console.log(httpRequest)

            let result = await httpRequest.send();

            return result.data

        } catch (e) {
            console.log("ee----------->", e)
            return e
        }

    }


    async confirm(payload = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            console.log("payload.context----->", payload.context);

            const selectRequest = await SelectRequest.findOne({
                where: {
                    transactionId: payload.context.transaction_id
                }
            })

            console.log("selected logistics--------selectRequest------->", selectRequest);

            const logistics = selectRequest.selectedLogistics;

            console.log("selected logistics--------selectRequest-----logistics-->", logistics);
            console.log("selected logistics--------selectRequest----context--->", logistics.context);

            const order = payload.message.order;
            const selectMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            const logisticsOrderId = uuidv4();
            const initRequest = [{
                "context": {
                    "domain": "nic2004:52110",
                    "action": "confirm",
                    "core_version": "1.0.0",
                    "bap_id": config.get("sellerConfig").BPP_ID,
                    "bap_uri": config.get("sellerConfig").BPP_URI,
                    "bpp_id": logistics.context.bpp_id,//STORED OBJECT
                    "bpp_uri": logistics.context.bpp_uri, //STORED OBJECT
                    "transaction_id": payload.context.transaction_id,
                    "message_id": logisticsMessageId,
                    "city": "std:080",
                    "country": "IND",
                    "timestamp": new Date()
                },
                "message": {
                    "order": {
                        "id": logisticsOrderId, //FIXME:  logistics order id should be created per order
                        "state":"Created",
                        "provider": {
                            "id": logistics.message.catalog["bpp/providers"][0].id,
                            "locations": [
                                {
                                    "id": "GFFBRTFR1649830006"
                                }
                            ],
                            "rateable": "true"
                        },
                        "items": logistics.message.catalog["bpp/providers"][0].items,
                        "billing":      { //TODO: move to config
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
                            "tax_number": "29AAACU1901H1ZK",
                            "phone": "98860 98860",
                            "email": "abcd.efgh@gmail.com"
                        },
                        "fulfillments": [
                            {
                                "id": "Fulfillment1",
                                "@ondc/org/provider_name": "Loadshare",//TODO: find name
                                "state": {
                                    "descriptor": {
                                        "name": "Pending",
                                        "code": "Pending"
                                    }
                                },
                                "type": "Prepaid",
                                "tracking": false,
                                "start": {
                                    "location": config.get("sellerConfig").sellerPickupLocation.location,
                                    "contact": config.get("sellerConfig").sellerPickupLocation.contact,
                                    "time": {
                                        "range": {
                                            "start": "2022-05-10T20:02:19.609Z",
                                            "end": "2022-05-10T20:32:19.609Z"
                                        }
                                    },
                                    "instructions": {
                                        "name": "Status for pickup",
                                        "short_desc": "Pickup Confirmation Code"
                                    },

                                },
                                "end": order.fulfillments[0].end,
                                "rateable": "true"
                            }
                        ],
                        "quote": {
                            "price": {
                                "currency": "INR",
                                "value": "5551.0"
                            },
                            "breakup": [
                                {
                                    "@ondc/org/item_id": "18275-ONDC-1-9",
                                    "@ondc/org/item_quantity": {
                                        "count": 1
                                    },
                                    "title": "SENSODYNE SENSITIVE TOOTH BRUSH",
                                    "@ondc/org/title_type": "item",
                                    "price": {
                                        "currency": "INR",
                                        "value": "5.0"
                                    }
                                },
                                {
                                    "title": "Delivery charges",
                                    "@ondc/org/title_type": "delivery",
                                    "price": {
                                        "currency": "INR",
                                        "value": "0.0"
                                    }
                                },
                                {
                                    "title": "Packing charges",
                                    "@ondc/org/title_type": "packing",
                                    "price": {
                                        "currency": "INR",
                                        "value": "0.0"
                                    }
                                },
                                {
                                    "@ondc/org/item_id": "18275-ONDC-1-9",
                                    "title": "Tax",
                                    "@ondc/org/title_type": "tax",
                                    "price": {
                                        "currency": "INR",
                                        "value": "0.0"
                                    }
                                }
                            ]
                        },
                        "payment": {
                            "uri": "https://ondc.transaction.com/payment",
                            "tl_method": "http/get",
                            "params": {
                                "currency": "INR",
                                "transaction_id": "3937",
                                "amount": "5.0"
                            },
                            "status": "PAID",
                            "type": "ON-ORDER",
                            "collected_by": "BAP",
                            "@ondc/org/buyer_app_finder_fee_type": "Percent",
                            "@ondc/org/buyer_app_finder_fee_amount": "0.0",
                            "@ondc/org/withholding_amount": "0.0",
                            "@ondc/org/return_window": "0",
                            "@ondc/org/settlement_basis": "Collection",
                            "@ondc/org/settlement_window": "P2D",
                            "@ondc/org/settlement_details": config.get("sellerConfig").settlement_details,
                            "documents": [
                                {
                                    "url": "https://invoice_url",
                                    "label": "Invoice"
                                }
                            ],
                            "tags": [
                                {
                                    "code": "bap_terms_fee",
                                    "list": [
                                        {
                                            "code": "finder_fee_type",
                                            "value": "percent"
                                        },
                                        {
                                            "code": "finder_fee_amount",
                                            "value": "3"
                                        },
                                        {
                                            "code": "accept",
                                            "value": "Y"
                                        }
                                    ]
                                },
                                {
                                    "code": "bpp_terms_liability",
                                    "list": [
                                        {
                                            "code": "max_liability_cap",
                                            "value": "10000"
                                        },
                                        {
                                            "code": "max_liability",
                                            "value": "2"
                                        },
                                        {
                                            "code": "accept",
                                            "value": "Y"
                                        }
                                    ]
                                },
                                {
                                    "code": "bpp_terms_arbitration",
                                    "list": [
                                        {
                                            "code": "mandatory_arbitration",
                                            "value": "false"
                                        },
                                        {
                                            "code": "court_jurisdiction",
                                            "value": "KA"
                                        },
                                        {
                                            "code": "accept",
                                            "value": "Y"
                                        }
                                    ]
                                },
                                {
                                    "code": "bpp_terms_charges",
                                    "list": [
                                        {
                                            "code": "delay_interest",
                                            "value": "1000"
                                        },
                                        {
                                            "code": "accept",
                                            "value": "Y"
                                        }
                                    ]
                                },
                                {
                                    "code": "bpp_seller_gst",
                                    "list": [
                                        {
                                            "code": "GST",
                                            "value": "XXXXXXXXXXXXXXX"
                                        }
                                    ]
                                }
                            ],
                            "created_at": "2022-05-10T18:01:53.000Z",
                            "updated_at": "2022-05-10T18:02:19.000Z"
                        }
                    }
                }
            }
            ]

            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            setTimeout(() => {
                this.buildConfirmRequest(logisticsMessageId, selectMessageId)
            }, 5000); //TODO move to config

            return initRequest
        } catch (err) {
            throw err;
        }
    }

    async buildConfirmRequest(logisticsMessageId, initMessageId) {

        try {
            console.log("buildInitRequest---------->");
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'confirm')
            //2. if data present then build select response

            console.log("logisticsResponse---------->", logisticsResponse);

            let selectResponse = await this.productConfirm(logisticsResponse)

            //3. post to protocol layer
            await this.postConfirmResponse(selectResponse);

        } catch (e) {
            console.log(e)
            return e
        }
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


    //return confirm response to protocol layer
    async postConfirmResponse(confirmResponse) {
        try {

            let headers = {};
            let httpRequest = new HttpRequest(
                config.get("sellerConfig").BPP_URI,
                `/protocol/v1/on_confirm`,
                'POST',
                confirmResponse,
                headers
            );

            console.log(httpRequest)

            let result = await httpRequest.send();

            return result.data

        } catch (e) {
            console.log("ee----------->", e)
            return e
        }

    }


    async track(payload = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            console.log("payload.context----->", payload.context);

            const confirmRequest = await ConfirmRequest.findOne({
                where: {
                    transactionId: payload.context.transaction_id ,
                    retailOrderId: payload.message.order_id
                }
            })

            console.log("selected logistics--------selectRequest------->", confirmRequest);

            const logistics = confirmRequest.selectedLogistics;

            console.log("selected logistics--------selectRequest-----logistics-->", logistics);
            console.log("selected logistics--------selectRequest----context--->", logistics.context);

            const order = payload.message.order;
            const selectMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            const trackRequest = [{
                "context": {
                    "domain": "nic2004:52110",
                    "action": "track",
                    "core_version": "1.0.0",
                    "bap_id": config.get("sellerConfig").BPP_ID,
                    "bap_uri": config.get("sellerConfig").BPP_URI,
                    "bpp_id": logistics.context.bpp_id,//STORED OBJECT
                    "bpp_uri": logistics.context.bpp_uri, //STORED OBJECT
                    "transaction_id": confirmRequest.transactionId,
                    "message_id": logisticsMessageId,
                    "city": "std:080",
                    "country": "IND",
                    "timestamp": new Date()
                },
                "message":
                    {
                        "order_id": confirmRequest.orderId,//payload.message.order_id,
                    }

            }
            ]

            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            setTimeout(() => {
                this.buildTrackRequest(logisticsMessageId, selectMessageId)
            }, 5000); //TODO move to config

            return trackRequest
        } catch (err) {
            throw err;
        }
    }

    async buildTrackRequest(logisticsMessageId, initMessageId) {

        try {
            console.log("buildTrackRequest---------->");
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'track')
            //2. if data present then build select response

            console.log("logisticsResponse---------->", logisticsResponse);

            let selectResponse = await this.productTrack(logisticsResponse)

            //3. post to protocol layer
            await this.postTrackResponse(selectResponse);

        } catch (e) {
            console.log(e)
            return e
        }
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


    //return track response to protocol layer
    async postTrackResponse(trackResponse) {
        try {

            let headers = {};
            let httpRequest = new HttpRequest(
                config.get("sellerConfig").BPP_URI,
                `/protocol/v1/on_track`,
                'POST',
                trackResponse,
                headers
            );

            console.log(httpRequest)

            let result = await httpRequest.send();

            return result.data

        } catch (e) {
            console.log("ee----------->", e)
            return e
        }

    }


    async status(payload = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            console.log("payload.context----->", payload.context);

            const selectRequest = await SelectRequest.findOne({
                where: {
                    transactionId: payload.context.transaction_id //FIXME: find by order id
                }
            })

            console.log("selected logistics--------selectRequest------->", selectRequest);

            const logistics = selectRequest.selectedLogistics;

            console.log("selected logistics--------selectRequest-----logistics-->", logistics);
            console.log("selected logistics--------selectRequest----context--->", logistics.context);

            const order = payload.message.order;
            const selectMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            const trackRequest = [{
                "context": {
                    "domain": "nic2004:52110",
                    "action": "status",
                    "core_version": "1.0.0",
                    "bap_id": config.get("sellerConfig").BPP_ID,
                    "bap_uri": config.get("sellerConfig").BPP_URI,
                    "bpp_id": logistics.context.bpp_id,//STORED OBJECT
                    "bpp_uri": logistics.context.bpp_uri, //STORED OBJECT
                    "transaction_id": payload.context.transaction_id,
                    "message_id": logisticsMessageId,
                    "city": "std:080",
                    "country": "IND",
                    "timestamp": new Date()
                },
                "message":
                    {
                        "order_id": payload.message.order_id,
                    }

            }
            ]

            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            setTimeout(() => {
                this.buildStatusRequest(logisticsMessageId, selectMessageId)
            }, 5000); //TODO move to config

            return trackRequest
        } catch (err) {
            throw err;
        }
    }

    async buildStatusRequest(logisticsMessageId, initMessageId) {

        try {
            console.log("buildTrackRequest---------->");
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'status')
            //2. if data present then build select response

            console.log("logisticsResponse---------->", logisticsResponse);

            let selectResponse = await this.productStatus(logisticsResponse)

            //3. post to protocol layer
            await this.postStatusResponse(selectResponse);

        } catch (e) {
            console.log(e)
            return e
        }
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


    //return track response to protocol layer
    async postStatusResponse(statusResponse) {
        try {

            let headers = {};
            let httpRequest = new HttpRequest(
                config.get("sellerConfig").BPP_URI,
                `/protocol/v1/on_status`,
                'POST',
                statusResponse,
                headers
            );

            console.log(httpRequest)

            let result = await httpRequest.send();

            return result.data

        } catch (e) {
            console.log("ee----------->", e)
            return e
        }

    }



    async support(payload = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            console.log("payload.context----->", payload.context);
            console.log("payload.context----->", payload.message);

            const selectRequest = await ConfirmRequest.findOne({
                where: {
                    transactionId: payload.context.transaction_id ,
                    retailOrderId: payload.message.ref_id
                }
            })

            console.log("selected logistics--------selectRequest------->", selectRequest);

            const logistics = selectRequest.selectedLogistics;

            console.log("selected logistics--------selectRequest-----logistics-->", logistics);
            console.log("selected logistics--------selectRequest----context--->", logistics.context);

            const order = payload.message.order;
            const selectMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            const trackRequest = [{
                "context": {
                    "domain": "nic2004:52110",
                    "action": "support",
                    "core_version": "1.0.0",
                    "bap_id": config.get("sellerConfig").BPP_ID,
                    "bap_uri": config.get("sellerConfig").BPP_URI,
                    "bpp_id": logistics.context.bpp_id,//STORED OBJECT
                    "bpp_uri": logistics.context.bpp_uri, //STORED OBJECT
                    "transaction_id": selectRequest.transactionId,
                    "message_id": logisticsMessageId,
                    "city": "std:080",
                    "country": "IND",
                    "timestamp": new Date()
                },
                "message":
                    {
                        "ref_id": selectRequest.orderId,
                    }

            }
            ]

            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            setTimeout(() => {
                this.buildSupportRequest(logisticsMessageId, selectMessageId)
            }, 5000); //TODO move to config

            return trackRequest
        } catch (err) {
            throw err;
        }
    }

    async buildSupportRequest(logisticsMessageId, initMessageId) {

        try {
            console.log("buildTrackRequest---------->");
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'support')
            //2. if data present then build select response

            console.log("logisticsResponse---------->", logisticsResponse);

            let selectResponse = await this.productSupport(logisticsResponse)

            //3. post to protocol layer
            await this.postSupportResponse(selectResponse);

        } catch (e) {
            console.log(e)
            return e
        }
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


    //return track response to protocol layer
    async postSupportResponse(trackResponse) {
        try {

            let headers = {};
            let httpRequest = new HttpRequest(
                config.get("sellerConfig").BPP_URI,
                `/protocol/v1/on_support`,
                'POST',
                trackResponse,
                headers
            );

            console.log(httpRequest)

            let result = await httpRequest.send();

            return result.data

        } catch (e) {
            console.log("ee----------->", e)
            return e
        }

    }


}

export default LogisticsService;
