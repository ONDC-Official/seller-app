import {v4 as uuidv4} from 'uuid';
import config from "../lib/config";
import HttpRequest from "../utils/HttpRequest";
import {getProducts, getSelect, getInit, getConfirm,getTrack,getSupport} from "../utils/schemaMapping";
import {sequelize, Sequelize,InitRequest, ConfirmRequest, SelectRequest} from '../models'

const BPP_ID = config.get("sellerConfig").BPP_ID
const BPP_URI = config.get("sellerConfig").BPP_URI
const sellerPickupLocation = config.get("sellerConfig").sellerPickupLocation
const storeOpenSchedule = config.get("sellerConfig").storeOpenSchedule

import ProductService from './product.service'
const productService = new ProductService();
import logger from '../lib/logger'

class LogisticsService {

    async productSearch(payload = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            logger.log('info', `[Logistics Service] search logistics payload : param :`,payload);

            const order = payload;
            const selectMessageId = payload.context.message_id;

            this.postSearchRequest(order, selectMessageId)

            return {}
        } catch (err) {
            logger.error('error', `[Logistics Service] search logistics payload - search logistics payload : param :`, err);
            throw err;
        }
    }

    async productSelect(payload = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            logger.log('info', `[Logistics Service] search logistics payload : param :`,payload);

            const order = payload.message.order;
            const selectMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            //TODO:add validation for qty check

            let totalProductValue = 0
            for(let items of payload.message.order.items){
                const product = await productService.getForOndc(items.id)
                totalProductValue+=product.MRP
                console.log("product------->",product);
            }


            const searchRequest = {
                "context": {
                    "domain": "nic2004:60232",
                    "country": "IND",
                    "city": "std:080",
                    "action": "search",
                    "core_version": "1.1.0",
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
                            "id": "Standard Delivery" //TODO: based on provider it should change
                        },
                        "provider": {
                            "time": { //TODO: HARD Coded
                                "days": "1,2,3,4,5,6,7",
                                "range": {
                                    "end": "2359",
                                    "start": "0000"
                                }
                            }
                        },
                        "fulfillment": {
                            "type": "Prepaid", //TODO: ONLY prepaid orders should be there
                            "start": {
                                "location": {
                                    "gps": "13.0007580000001, 77.6165090000001",
                                    "address": {
                                        "area_code": "560005"
                                    }
                                }
                            },
                            "end": payload.message.order.fulfillments[0].end
                        },
                        "@ondc/org/payload_details": { //TODO: HARD coded
                            "weight": {
                                "unit": "Kilogram",
                                "value": 10
                            },
                            "category": "Grocery", //TODO: @abhinandan Take it from Product schema
                            "value": {
                                "currency": "INR",
                                "value": `${totalProductValue}`
                            }
                        }
                    }
                }
            }

            //process select request and send it to protocol layer
            this.postSelectRequest(searchRequest,logisticsMessageId, selectMessageId)

            return searchRequest
        } catch (err) {
            logger.error('error', `[Logistics Service] search logistics payload - search logistics payload : param :`, err);
            throw err;
        }
    }

    async postSelectRequest(searchRequest,logisticsMessageId,selectMessageId){

        try{
            //1. post http to protocol/logistics/v1/search

            try {
                let headers = {};
                let httpRequest = new HttpRequest(
                    config.get("sellerConfig").BPP_URI,
                    `/protocol/logistics/v1/search`,
                    'POST',
                    searchRequest,
                    headers
                );


                let result = await httpRequest.send();

            } catch (e) {
                logger.error('error', `[Logistics Service] post http select response : `, e);
                return e
            }

            //2. wait async to fetch logistics responses

            //async post request
            setTimeout(() => {
                logger.log('info', `[Logistics Service] search logistics payload - timeout : param :`,searchRequest);
                this.buildSelectRequest(logisticsMessageId, selectMessageId)
            }, 10000); //TODO move to config
        }catch (e){
            logger.error('error', `[Logistics Service] post http select response : `, e);
            return e
        }
    }

    async buildSelectRequest(logisticsMessageId, selectMessageId) {

        try {
            logger.log('info', `[Logistics Service] search logistics payload - build select request : param :`, {logisticsMessageId,selectMessageId});
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, selectMessageId, 'select')
            //2. if data present then build select response
            let selectResponse = await productService.productSelect(logisticsResponse)
            //3. post to protocol layer
            await this.postSelectResponse(selectResponse);

        } catch (e) {
            logger.error('error', `[Logistics Service] search logistics payload - build select request : param :`, e);
            return e
        }
    }

    async postSearchRequest(searchRequest,selectMessageId){
        try{
                this.buildSearchRequest(searchRequest, selectMessageId)
        }catch (e){
            logger.error('error', `[Logistics Service] post http select response : `, e);
            return e;
        }
    }

    async buildSearchRequest(searchRequest, searchMessageId) {

        try {
            let searchResponse = await productService.search(searchRequest,searchMessageId)
            await this.postSearchResponse(searchResponse);

        } catch (e) {
            logger.error('error', `[Logistics Service] search logistics payload - build select request : param :`, e);
            return e
        }
    }

    //get all logistics response from protocol layer
    async getLogistics(logisticsMessageId, retailMessageId, type) {
        try {

            logger.log('info', `[Logistics Service] get logistics : param :`, {logisticsMessageId,retailMessageId,type});

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

            logger.log('info', `[Logistics Service] get logistics : response :`, result.data);

            return result.data

        } catch (e) {
            logger.error('error', `[Logistics Service] get logistics : response :`, e);
            return e
        }

    }

    //return select response to protocol layer
    async postSelectResponse(selectResponse) {
        try {

            logger.info('info', `[Logistics Service] post http select response : `, selectResponse);

            let headers = {};
            let httpRequest = new HttpRequest(
                config.get("sellerConfig").BPP_URI,
                `/protocol/v1/on_select`,
                'POST',
                selectResponse,
                headers
            );

            let result = await httpRequest.send();

            return result.data

        } catch (e) {
            logger.error('error', `[Logistics Service] post http select response : `, e);
            return e
        }

    }

    //return select response to protocol layer
    async postSearchResponse(searchResponse) {
        try {

            logger.info('info', `[Logistics Service] post http select response : `, searchResponse);

            let headers = {};
            let httpRequest = new HttpRequest(
                config.get("sellerConfig").BPP_URI,
                `/protocol/v1/on_search`,
                'POST',
                searchResponse,
                headers
            );

            let result = await httpRequest.send();

            return result.data

        } catch (e) {
            logger.error('error', `[Logistics Service] post http search response : `, e);
            return e
        }

    }


    async init(payload = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            logger.log('info', `[Logistics Service] init logistics payload : param :`,payload.message.order);

            const selectRequest = await SelectRequest.findOne({
                where: {
                    transactionId: payload.context.transaction_id
                }
            })

            //logger.log('info', `[Logistics Service] old select request :`,selectRequest);

            const logistics = selectRequest.selectedLogistics;

            //logger.log('info', `[Logistics Service] old selected logistics :`,logistics);

            const order = payload.message.order;
            const initMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            const initRequest = [{
                "context": {
                    "domain": "nic2004:60232",
                    "country": "IND",
                    "city": "std:080", //TODO: take city from retail context
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
                logger.log('info', `[Logistics Service] build init request :`, {logisticsMessageId,initMessageId: initMessageId});

                this.buildInitRequest(logisticsMessageId, initMessageId)
            }, 5000); //TODO move to config

            return initRequest
        } catch (err) {
        	console.log(err);    
	logger.error('error', `[Logistics Service] build init request :`, {error:err.stack,message:err.message});
            return err
        }
    }

    async productInit(payload = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            logger.log('info', `[Logistics Service] init logistics payload : param :`,payload.message.order);

            const selectRequest = await SelectRequest.findOne({
                where: {
                    transactionId: payload.context.transaction_id
                }
            })

  //          logger.log('info', `[Logistics Service] old select request :`,selectRequest);

            const logistics = selectRequest.selectedLogistics;

            //logger.log('info', `[Logistics Service] old selected logistics :`,logistics);

            const order = payload.message.order;
            const initMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            const initRequest2 = {
                "context": {
                    "domain": "nic2004:60232",
                    "country": "IND",
                    "city": "std:080", //TODO: take city from retail context
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
            }

            const contextTimeStamp =new Date()
            const initRequest =     {
                "context": {
                    "domain": "nic2004:60232",
                    "country": "IND",
                    "city": "std:080", //TODO: take city from retail context
                    "action": "init",
                    "core_version": "1.1.0",
                    "bap_id": config.get("sellerConfig").BPP_ID,
                    "bap_uri": config.get("sellerConfig").BPP_URI,
                    "bpp_id": logistics.context.bpp_id, //STORED OBJECT
                    "bpp_uri": logistics.context.bpp_uri, //STORED OBJECT
                    "transaction_id": payload.context.transaction_id,
                    "message_id": logisticsMessageId,
                    "timestamp": contextTimeStamp,
                    "ttl": "PT30S"
                },
                "message": {
                    "order": {
                        "provider": {
                            "id": logistics.message.catalog["bpp/providers"][0].id
                        },
                        "items": [logistics.message.catalog["bpp/providers"][0].items[0]],
                        "fulfillments": [{
                            "id": logistics.message.catalog["bpp/fulfillments"][0].id,
                            "type": logistics.message.catalog["bpp/fulfillments"][0].type,
                            "start": {
                                "location": config.get("sellerConfig").sellerPickupLocation.location,
                                "contact": config.get("sellerConfig").sellerPickupLocation.contact
                            },
                            "end": order.fulfillments[0].end
                        }],
                        "billing": { //
                            "name": order.billing.name,
                            "address": {
                                "name": order.billing.address.name,
                                "building": order.billing.address.building,
                                "locality": order.billing.address.locality,
                                "city": order.billing.address.city,
                                "state": order.billing.address.state,
                                "country": order.billing.address.country,
                                "area_code": order.billing.address.area_code
                            },
                            "tax_number": "pan_number", //FIXME: take provider details
                            "phone": "9999999999", //FIXME: take provider details
                            "email": "test@gmail.com", //FIXME: take provider details
                            "created_at": contextTimeStamp,
                            "updated_at": contextTimeStamp
                        },
                        "payment": {
                            "@ondc/org/settlement_details": []//order.payment['@ondc/org/settlement_details'] //TODO: need details of prepaid transactions to be settle for seller
                        }
                    }
                }
            }
                //logger.log('info', `[Logistics Service] build init request :`, {logisticsMessageId,initMessageId: initMessageId});

                this.postInitRequest(initRequest,logisticsMessageId, initMessageId)

            return {'status':'ACK'}
        } catch (err) {
            logger.error('error', `[Logistics Service] build init request :`, {error:err.stack,message:err.message});
        console.log(err)   
	 return err
        }
    }


    async postInitRequest(searchRequest,logisticsMessageId,selectMessageId){

        try{
            //1. post http to protocol/logistics/v1/search

            try {
                let headers = {};
                let httpRequest = new HttpRequest(
                    config.get("sellerConfig").BPP_URI,
                    `/protocol/logistics/v1/init`,
                    'POST',
                    searchRequest,
                    headers
                );


                let result = await httpRequest.send();
            } catch (e) {
                logger.error('error', `[Logistics Service] post http select response : `, e);
                return e
            }

            //2. wait async to fetch logistics responses

            //async post request
            setTimeout(() => {
                logger.log('info', `[Logistics Service] search logistics payload - timeout : param :`,searchRequest);
                this.buildInitRequest(logisticsMessageId, selectMessageId)
            }, 5000); //TODO move to config
        }catch (e){
            logger.error('error', `[Logistics Service] post http select response : `, e);
            return e
        }
    }

    async buildInitRequest(logisticsMessageId, initMessageId) {

        try {
            logger.log('info', `[Logistics Service] build init request :`, {logisticsMessageId,initMessageId});

            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'init')

            //2. if data present then build select response
            logger.log('info', `[Logistics Service] build init request - get logistics response :`, logisticsResponse);
            let selectResponse = await productService.productInit(logisticsResponse)

            //3. post to protocol layer
            await this.postInitResponse(selectResponse);

        } catch (err) {
            logger.error('error', `[Logistics Service] build init request :`, {error:err.stack,message:err.message});
            return err
        }
    }


    //return init response to protocol layer
    async postInitResponse(initResponse) {
        try {

            logger.info('info', `[Logistics Service] post init request :`, initResponse);

            let headers = {};
            let httpRequest = new HttpRequest(
                config.get("sellerConfig").BPP_URI,
                `/protocol/v1/on_init`,
                'POST',
                initResponse,
                headers
            );

            let result = await httpRequest.send();

            return result.data

        } catch (err) {
            logger.error('error', `[Logistics Service] post init request :`, {error:err.stack,message:err.message});
            return err
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

            let end = {...order.fulfillments[0].end,person:order.fulfillments[0].customer.person}

            end.location.address.locality = end.location.address.locality ?? end.location.address.city

            const confirmRequest  = [{
                "context": {
                    "domain": "nic2004:60232",
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
                        "id": payload.context.transaction_id,
                        "state": "Created",
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
                        "quote": order.qoute,
                        "payment": {
                            "type": "ON-ORDER",
                            "@ondc/org/settlement_details": [{
                                "settlement_counterparty": "seller-app",
                                "settlement_type": "upi",
                                "upi_address": "gft@oksbi",
                                "settlement_bank_account_no": "XXXXXXXXXX",
                                "settlement_ifsc_code": "XXXXXXXXX"
                            }]
                        },
                        "fulfillments": [{
                            "id": "Fulfillment1",
                            "type": "Prepaid",
                            "start": sellerPickupLocation,
                            "end":end,
                            "@ondc/org/awb_no": "1227262193237777", //TBD: do seller needs to generate this number?
                            "tags": {
                                "@ondc/org/order_ready_to_ship": "Yes" //
                            }
                        }],
                        "billing": { //TODO: take from config
                            "name": "XXXX YYYYY",
                            "address": {
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
                        "@ondc/org/linked_order": { //TBD: need more details how to build this object
                            "items": [{
                                "category_id": "Immediate Delivery",
                                "name": "SFX",
                                "quantity": {
                                    "count": 2,
                                    "measure": {
                                        "type": "CONSTANT",
                                        "value": 2,
                                        "estimated_value": 2,
                                        "computed_value": 2,
                                        "range": {
                                            "min": 2,
                                            "max": 5
                                        },
                                        "unit": "10"
                                    }
                                },
                                "price": {
                                    "currency": "INR",
                                    "value": "5000",
                                    "estimated_value": "5500",
                                    "computed_value": "5525",
                                    "listed_value": "5300",
                                    "offered_value": "4555",
                                    "minimum_value": "4000",
                                    "maximum_value": "5500"
                                }
                            }]
                        }
                    }
                }

            }]
            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            setTimeout(() => {
                this.buildConfirmRequest(logisticsMessageId, selectMessageId)
            }, 10000); //TODO move to config

            return confirmRequest
        } catch (err) {
            throw err;
        }
    }

    async productConfirm(payload = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            console.log("payload.context----->", payload.context);

            const selectRequest = await SelectRequest.findOne({
                where: {
                    transactionId: payload.context.transaction_id
                }
            })

            const initRequest = await InitRequest.findOne({
                where: {
                    transactionId: payload.context.transaction_id
                }
            })

            console.log("selected logistics--------selectRequest------->", selectRequest);
            console.log("selected logistics--------initRequest------->", initRequest);

            const logistics = selectRequest.selectedLogistics;
            const order = payload.message.order;
            const selectMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            const logisticsOrderId = uuidv4();

console.log("end logs------------->",order.fulfillments[0].end)
            let end = {...order.fulfillments[0].end}

            end.location.address.locality = end.location.address.locality ?? end.location.address.street

            const confirmRequest2  = {
                "context": {
                    "domain": "nic2004:60232",
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
                        "id": payload.context.transaction_id,
                        "state": "Created",
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
                        "quote": order.qoute,
                        "payment": {
                            "type": "ON-ORDER",
                            "@ondc/org/settlement_details": [{
                                "settlement_counterparty": "seller-app",
                                "settlement_type": "upi",
                                "upi_address": "gft@oksbi",
                                "settlement_bank_account_no": "XXXXXXXXXX",
                                "settlement_ifsc_code": "XXXXXXXXX"
                            }]
                        },
                        "fulfillments": [{
                            "id": "Fulfillment1",
                            "type": "Prepaid",
                            "start": sellerPickupLocation,
                            "end":end,
                            "@ondc/org/awb_no": "1227262193237777", //TBD: do seller needs to generate this number?
                            "tags": {
                                "@ondc/org/order_ready_to_ship": "Yes" //
                            }
                        }],
                        "billing": { //TODO: take from config
                            "name": "XXXX YYYYY",
                            "address": {
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
                        "@ondc/org/linked_order": { //TBD: need more details how to build this object
                            "items": [{
                                "category_id": "Immediate Delivery",
                                "name": "SFX",
                                "quantity": {
                                    "count": 2,
                                    "measure": {
                                        "type": "CONSTANT",
                                        "value": 2,
                                        "estimated_value": 2,
                                        "computed_value": 2,
                                        "range": {
                                            "min": 2,
                                            "max": 5
                                        },
                                        "unit": "10"
                                    }
                                },
                                "price": {
                                    "currency": "INR",
                                    "value": "5000",
                                    "estimated_value": "5500",
                                    "computed_value": "5525",
                                    "listed_value": "5300",
                                    "offered_value": "4555",
                                    "minimum_value": "4000",
                                    "maximum_value": "5500"
                                }
                            }]
                        }
                    }
                }

            }


            let itemDetails = []
            for(const items of payload.message.order.items){
                let item = await productService.getForOndc(items.id)

                let details = {
                    "descriptor": {
                        "name": item.productName
                    },
                    "price": {
                        "currency": "INR",
                        "value": ""+item.MRP
                    },
                    "category_id": item.categoryName,
                    "quantity": {
                        "count": items.quantity.count,
                        "measure": { //TODO: hard coded
                            "unit": "Kilogram",
                            "value": 1
                        }
                    }
                }
                itemDetails.push(details)
            }

            const contextTimestamp = new Date()
            const confirmRequest  = {
                "context": {
                    "domain": "nic2004:60232",
                    "action": "confirm",
                    "core_version": "1.1.0",
                    "bap_id": config.get("sellerConfig").BPP_ID,
                    "bap_uri": config.get("sellerConfig").BPP_URI,
                    "bpp_id": logistics.context.bpp_id,//STORED OBJECT
                    "bpp_uri": logistics.context.bpp_uri, //STORED OBJECT
                    "transaction_id": payload.context.transaction_id,
                    "message_id": logisticsMessageId,
                    "city": "std:080",
                    "country": "IND",
                    "timestamp": contextTimestamp
                },
                "message": {
                    "order": {
                        "@ondc/org/linked_order": {
                            "items": itemDetails,
                            "provider": {
                                "descriptor": {
                                    "name": "Spice 9"
                                },
                                "address": {
                                    "name": "Spice 9",
                                        "building": "12",
                                        "locality": "prashanth nagar",
                                        "city": "Bangalore",
                                        "state": "Karnataka",
                                        "country": "IND",
                                        "area_code": "560036"
                                }
                            },
                            "order": {
                                "id": order.id,
                                    "weight": {//TODO: hard coded
                                    "unit": "Kilogram",
                                        "value": 1
                                }
                            }
                        },
                        "id": order.id,
                        "items": [{
                            "id": "nextday",
                            "descriptor": {
                                "code": "P2P"
                            },
                            "category_id": "Next Day Delivery"
                        }],
                        "provider":initRequest.selectedLogistics.message.order.provider,
                        "fulfillments": [{
                            "id": "c60db0e3-6b07-4f5c-8e97-38bb5afcf3b0",
                            "type": "Prepaid",
                            "start": {
                                "location": {
                                    "gps": "12.926837, 77.5506810000001",
                                    "address": {
                                        "name": "Spice 9",
                                        "building": "12",
                                        "locality": "prashanth nagar",
                                        "city": "Bangalore",
                                        "state": "Karnataka",
                                        "country": "IND",
                                        "area_code": "560085"
                                    }
                                },
                                "instructions": {
                                    "short_desc": "",
                                    "long_desc": ""
                                },
                                "contact": {
                                    "phone": "9000912423",
                                    "email": "mohd.najeeb.ahmed@gmail.com"
                                },
                                "person": {
                                    "name": "Manager"
                                }
                            },
                            "end": {
                                "location": {
                                    "gps": "12.926837, 77.5506810000001",
                                    "address": {
                                        "name": "Najeeb",
                                        "building": "Sarjapur road",
                                        "locality": "82/2 3rd floor, Gold Sand, Doddakannalli, Mahadevapura, Sarjapur road, bengaluru, 560035",
                                        "city": "Bengaluru",
                                        "state": "Karnataka",
                                        "country": "IND",
                                        "area_code": "560085"
                                    }
                                },
                                "instructions": {
                                    "short_desc": "",
                                    "long_desc": ""
                                },
                                "contact": {
                                    "phone": "9000912423",
                                    "email": "masterblaster775@gmail.com"
                                },
                                "person": {
                                    "name": "Najeeb"
                                }
                            },
                            "tags": {
                                "@ondc/org/order_ready_to_ship": "Yes" //TODO: hard coded
                            }
                        }],
                            "quote": initRequest.selectedLogistics.message.order.quote,
                        "payment": {
                            "type": "ON-ORDER",
                                "collected_by": "BAP",
                                "@ondc/org/settlement_details": []
                        },
                        "billing": {
                            "name": "Ek Second Technologies",
                                "email": "najeeb@eksecon.in",
                                "phone": "9000912423",
                                "created_at": "2023-03-03T14:36:16.538Z",
                                "updated_at": "2023-03-03T14:36:16.538Z",
                                "address": {
                                "name": "EkSecond Pvt Ltd",
                                    "building": "8-7-171/10/14/B",
                                    "locality": "Old Bowenpally",
                                    "city": "secunderabad",
                                    "state": "Telangana",
                                    "country": "India",
                                    "area_code": "500011"
                            },
                            "tax_number": "ADFSDF34343"
                        },
                        "state": "Created",
                        created_at:contextTimestamp,
                        updated_at:contextTimestamp
                    }
                }

            }            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
           // setTimeout(() => {

logger.info('info', `[Logistics Service] post init request :confirmRequestconfirmRequestconfirmRequestconfirmRequestconfirmRequestconfirmRequest`, confirmRequest);
                this.postConfirmRequest(confirmRequest,logisticsMessageId, selectMessageId)
            //}, 10000); //TODO move to config

            return {status:"ACK"}
        } catch (err) {
            throw err;
        }
    }


    async postConfirmRequest(searchRequest,logisticsMessageId,selectMessageId){

        try{
            //1. post http to protocol/logistics/v1/search

            try {

                console.log("------->>>",searchRequest,selectMessageId,logisticsMessageId)
                console.log("------result ->>>",config.get("sellerConfig").BPP_URI )
                let headers = {};
                let httpRequest = new HttpRequest(
                    config.get("sellerConfig").BPP_URI,
                    `/protocol/logistics/v1/confirm`,
                    'POST',
                    searchRequest,
                    headers
                );


                let result = await httpRequest.send();
                console.log("------result ->>>",result )

            } catch (e) {
                logger.error('error', `[Logistics Service] post http select response : `, e);
                return e
            }

            //2. wait async to fetch logistics responses

            //async post request
            setTimeout(() => {
                logger.log('info', `[Logistics Service] search logistics payload - timeout : param :`,searchRequest);
                this.buildConfirmRequest(logisticsMessageId, selectMessageId)
            }, 10000); //TODO move to config
        }catch (e){
            logger.error('error', `[Logistics Service] post http select response : `, e);
            return e
        }
    }


    async buildConfirmRequest(logisticsMessageId, initMessageId) {

        try {
            console.log("buildInitRequest---------->");
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'confirm')
            //2. if data present then build select response

            console.log("logisticsResponse---------->", logisticsResponse);

            let selectResponse = await productService.productConfirm(logisticsResponse)

            //3. post to protocol layer
            await this.postConfirmResponse(selectResponse);

        } catch (e) {
            console.log(e)
            return e
        }
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

            const trackRequest = {
                "context": {
                    "domain": "nic2004:60232",
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


            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            setTimeout(() => {
                this.buildTrackRequest(logisticsMessageId, selectMessageId)
            }, 5000); //TODO move to config

            return trackRequest
        } catch (err) {
            throw err;
        }
    }
    async productTrack(payload = {}, req = {}) {
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

            const trackRequest = {
                "context": {
                    "domain": "nic2004:60232",
                    "action": "track",
                    "core_version": "1.1.0",
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


            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            //setTimeout(() => {
                this.postTrackRequest(trackRequest,logisticsMessageId, selectMessageId)
           // }, 5000); //TODO move to config

            return {status:'ACK'}
        } catch (err) {
            throw err;
        }
    }


    async postTrackRequest(searchRequest,logisticsMessageId,selectMessageId){

        try{
            //1. post http to protocol/logistics/v1/search

            try {

                console.log("------->>>",searchRequest,selectMessageId,logisticsMessageId)
                console.log("------result ->>>",config.get("sellerConfig").BPP_URI )
                let headers = {};
                let httpRequest = new HttpRequest(
                    config.get("sellerConfig").BPP_URI,
                    `/protocol/logistics/v1/track`,
                    'POST',
                    searchRequest,
                    headers
                );


                let result = await httpRequest.send();
                console.log("------result ->>>",result )

            } catch (e) {
                logger.error('error', `[Logistics Service] post http select response : `, e);
                return e
            }

            //2. wait async to fetch logistics responses

            //async post request
            setTimeout(() => {
                logger.log('info', `[Logistics Service] search logistics payload - timeout : param :`,searchRequest);
                this.buildTrackRequest(logisticsMessageId, selectMessageId)
            }, 10000); //TODO move to config
        }catch (e){
            logger.error('error', `[Logistics Service] post http select response : `, e);
            return e
        }
    }

    async buildTrackRequest(logisticsMessageId, initMessageId) {

        try {
            console.log("buildTrackRequest---------->");
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'track')
            //2. if data present then build select response

            console.log("logisticsResponse---------->", logisticsResponse);

            let selectResponse = await productService.productTrack(logisticsResponse)

            //3. post to protocol layer
            await this.postTrackResponse(selectResponse);

        } catch (e) {
            console.log(e)
            return e
        }
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
                    "domain": "nic2004:60232",
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
                        "order_id": confirmRequest.orderId,
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

    async productStatus(payload = {}, req = {}) {
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

            const trackRequest = {
                "context": {
                    "domain": "nic2004:60232",
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
                        "order_id": confirmRequest.orderId,
                    }

            }


            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            //setTimeout(() => {
                this.buildStatusRequest(trackRequest,logisticsMessageId, selectMessageId)
            //}, 5000); //TODO move to config

            return {status:'ACK'}
        } catch (err) {
            throw err;
        }
    }


    async postStatusRequest(searchRequest,logisticsMessageId,selectMessageId){

        try{
            //1. post http to protocol/logistics/v1/search

            try {

                console.log("------->>>",searchRequest,selectMessageId,logisticsMessageId)
                console.log("------result ->>>",config.get("sellerConfig").BPP_URI )
                let headers = {};
                let httpRequest = new HttpRequest(
                    config.get("sellerConfig").BPP_URI,
                    `/protocol/logistics/v1/status`,
                    'POST',
                    searchRequest,
                    headers
                );


                let result = await httpRequest.send();
                console.log("------result ->>>",result )

            } catch (e) {
                logger.error('error', `[Logistics Service] post http select response : `, e);
                return e
            }

            //2. wait async to fetch logistics responses

            //async post request
            setTimeout(() => {
                logger.log('info', `[Logistics Service] search logistics payload - timeout : param :`,searchRequest);
                this.buildStatusRequest(logisticsMessageId, selectMessageId)
            }, 10000); //TODO move to config
        }catch (e){
            logger.error('error', `[Logistics Service] post http select response : `, e);
            return e
        }
    }
    async cancel(payload = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            console.log("payload.context-cancel---->", payload.context);

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
                    "domain": "nic2004:60232",
                    "action": "cancel",
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
                        "order_id": confirmRequest.orderId,
                        "cancellation_reason_id": payload.message.cancellation_reason_id
                    }

            }
            ]

            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            setTimeout(() => {
                this.buildCancelRequest(logisticsMessageId, selectMessageId)
            }, 5000); //TODO move to config

            return trackRequest
        } catch (err) {
            throw err;
        }
    }



    async productCancel(payload = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            console.log("payload.context-cancel---->", payload.context);

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

            const trackRequest = {
                "context": {
                    "domain": "nic2004:60232",
                    "action": "cancel",
                    "core_version": "1.1.0",
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
                        "order_id": confirmRequest.orderId,
                        "cancellation_reason_id": payload.message.cancellation_reason_id
                    }

            }


            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            //setTimeout(() => {
                this.postCancelRequest(trackRequest,logisticsMessageId, selectMessageId)
            //}, 5000); //TODO move to config

            return {status:'ACK'}
        } catch (err) {
            throw err;
        }
    }

    async postCancelRequest(searchRequest,logisticsMessageId,selectMessageId){

        try{
            //1. post http to protocol/logistics/v1/search

            try {

                console.log("------->>>",searchRequest,selectMessageId,logisticsMessageId)
                console.log("------result ->>>",config.get("sellerConfig").BPP_URI )
                let headers = {};
                let httpRequest = new HttpRequest(
                    config.get("sellerConfig").BPP_URI,
                    `/protocol/logistics/v1/cancel`,
                    'POST',
                    searchRequest,
                    headers
                );


                let result = await httpRequest.send();
                console.log("------result ->>>",result )

            } catch (e) {
                logger.error('error', `[Logistics Service] post http select response : `, e);
                return e
            }

            //2. wait async to fetch logistics responses

            //async post request
            setTimeout(() => {
                logger.log('info', `[Logistics Service] search logistics payload - timeout : param :`,searchRequest);
                this.buildCancelRequest(logisticsMessageId, selectMessageId)
            }, 10000); //TODO move to config
        }catch (e){
            logger.error('error', `[Logistics Service] post http select response : `, e);
            return e
        }
    }
    async buildStatusRequest(logisticsMessageId, initMessageId) {

        try {
            console.log("buildStatusRequest---------->");
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'status')
            //2. if data present then build select response

            console.log("logisticsResponse---------->", logisticsResponse);

            let statusResponse = await productService.productStatus(logisticsResponse)

            //3. post to protocol layer
            await this.postStatusResponse(statusResponse);

        } catch (e) {
            console.log(e)
            return e
        }
    }


    async buildCancelRequest(logisticsMessageId, initMessageId) {

        try {
            console.log("buildCancelRequest---------->");
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'cancel')
            //2. if data present then build select response

            console.log("logisticsResponse---------->", logisticsResponse);

            let statusResponse = await productService.productCancel(logisticsResponse)

            //3. post to protocol layer
            await this.postCancelResponse(statusResponse);

        } catch (e) {
            console.log(e)
            return e
        }
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

    //return track response to protocol layer
    async postCancelResponse(statusResponse) {
        try {

            let headers = {};
            let httpRequest = new HttpRequest(
                config.get("sellerConfig").BPP_URI,
                `/protocol/v1/on_cancel`,
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
                    transactionId: payload.message.ref_id
                }
            })

            console.log("selected logistics--------selectRequest------->", selectRequest);

            const logistics = selectRequest.selectedLogistics;

            console.log("selected logistics--------selectRequest-----logistics-->", logistics);
            console.log("selected logistics--------selectRequest----context--->", logistics.context);

            const selectMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            const trackRequest = {
                "context": {
                    "domain": "nic2004:60232",
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


            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            setTimeout(() => {
                this.buildSupportRequest(logisticsMessageId, selectMessageId)
            }, 5000); //TODO move to config

            return trackRequest
        } catch (err) {
            throw err;
        }
    }
    async productSupport(payload = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            console.log("payload.context----->", payload.context);
            console.log("payload.context----->", payload.message);

            const selectRequest = await ConfirmRequest.findOne({
                where: {
                    transactionId: payload.message.order_id
                }
            })

            console.log("selected logistics--------selectRequest------->", selectRequest);

            const logistics = selectRequest.selectedLogistics;

            console.log("selected logistics--------selectRequest-----logistics-->", logistics);
            console.log("selected logistics--------selectRequest----context--->", logistics.context);

            const selectMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            const trackRequest = {
                "context": {
                    "domain": "nic2004:60232",
                    "action": "support",
                    "core_version": "1.1.0",
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


            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            //setTimeout(() => {
                this.postSupportRequest(trackRequest,logisticsMessageId, selectMessageId)
            //}, 5000); //TODO move to config

            return trackRequest
        } catch (err) {
            throw err;
        }
    }



    async postSupportRequest(searchRequest,logisticsMessageId,selectMessageId){

        try{
            //1. post http to protocol/logistics/v1/search

            try {

                console.log("------->>>",searchRequest,selectMessageId,logisticsMessageId)
                console.log("------result ->>>",config.get("sellerConfig").BPP_URI )
                let headers = {};
                let httpRequest = new HttpRequest(
                    config.get("sellerConfig").BPP_URI,
                    `/protocol/logistics/v1/support`,
                    'POST',
                    searchRequest,
                    headers
                );


                let result = await httpRequest.send();
                console.log("------result ->>>",result )

            } catch (e) {
                logger.error('error', `[Logistics Service] post http select response : `, e);
                return e
            }

            //2. wait async to fetch logistics responses

            //async post request
            setTimeout(() => {
                logger.log('info', `[Logistics Service] search logistics payload - timeout : param :`,searchRequest);
                this.buildSupportRequest(logisticsMessageId, selectMessageId)
            }, 10000); //TODO move to config
        }catch (e){
            logger.error('error', `[Logistics Service] post http select response : `, e);
            return e
        }
    }
    async buildSupportRequest(logisticsMessageId, initMessageId) {

        try {
            console.log("buildTrackRequest---------->");
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'support')
            //2. if data present then build select response

            console.log("logisticsResponse---------->", logisticsResponse);

            let selectResponse = await productService.productSupport(logisticsResponse)

            //3. post to protocol layer
            await this.postSupportResponse(selectResponse);

        } catch (e) {
            console.log(e)
            return e
        }
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
