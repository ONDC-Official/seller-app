import {v4 as uuidv4} from 'uuid';
import config from "../../lib/config";
import HttpRequest from "../../utils/HttpRequest";
import {InitRequest, ConfirmRequest, SelectRequest} from '../../models'
import {getProductUpdate} from "../../utils/v2/schemaMapping";
import {domainNameSpace} from "../../utils/constants";
import ProductService from './product.service'

const productService = new ProductService();
import logger from '../../lib/logger'

const BPP_ID = config.get("sellerConfig").BPP_ID
const BPP_URI = config.get("sellerConfig").BPP_URI

class OndcService {

    async productSearch(payload = {}, req = {}) {
        try {
            // const {criteria = {}, payment = {}} = req || {};

            logger.log('info', `[Ondc Service] search logistics payload : param >>:`, payload);

            const order = payload;
            const selectMessageId = payload.context.message_id;
            this.postSearchRequest(order, selectMessageId)

            return {"message": {"ack": {"status": "ACK"}}}
        } catch (err) {
            logger.error('error', `[Ondc Service] search logistics payload - search logistics payload : param :`, err);
            throw err;
        }
    }

    async orderSelect(payload = {}, req = {}) {
        try {
            // const {criteria = {}, payment = {}} = req || {};

            logger.log('info', `[Ondc Service] search logistics payload : param :`, payload);

            // const order = payload.message.order;
            const selectMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4();

            let storeLocationEnd = {}
            let totalProductValue = 0
            // for (let items of payload.message.order.items) {
            //     const product = await productService.getForOndc(items.id)
            //     console.log("product---->", product);
            //     totalProductValue += product.commonDetails.MRP
            // }

            let itemType = ''
            let resultData;
            let totalPrice = 0
            let itemData = {};
            for (let item of payload.message.order.items) {
                resultData = await productService.getForOndc(item.id)
                if (Object.keys(resultData).length > 0) {
                    if (resultData?.commonDetails) {
                        let price = resultData?.commonDetails?.MRP * item.quantity.count
                        totalProductValue += price
                    }else{
                        let price = resultData?.MRP * item.quantity.count
                        totalProductValue += price
                    }
                }
            }

            let org = await productService.getOrgForOndc(payload.message.order.provider.id);

            if (org.providerDetail.storeDetails) {
                storeLocationEnd = {
                    gps: `${org.providerDetail.storeDetails.location.lat},${org.providerDetail.storeDetails.location.long}`,
                    address: {
                        area_code: org.providerDetail.storeDetails.address.area_code
                    }
                }
            }

            let category = domainNameSpace.find((cat) => {
                return cat.domain === payload.context.domain
            })

            const searchRequest = {
                "context": {
                    "domain": "nic2004:60232",
                    "country": "IND",
                    "city": payload.context.city,
                    "action": "search",
                    "core_version": "1.2.0",
                    "bap_id": config.get("sellerConfig").BPP_ID,
                    "bap_uri": config.get("sellerConfig").BAP_URI,
                    "transaction_id": uuidv4(),
                    "message_id": logisticsMessageId,
                    "timestamp": new Date(),
                    "ttl": "PT30S"
                },
                "message": {
                    "intent": {
                        "category": {
                            "id": org.providerDetail.storeDetails.logisticsDeliveryType ?? 'Immediate Delivery'
                        },
                        "provider": {
                            "time": { //TODO: fix this from store timing
                                "days": "1,2,3,4,5,6,7",
                                "schedule": {
                                    "holidays": []
                                },
                                "duration": "PT30M",
                                "range": {
                                    "start": "1100",
                                    "end": "2200"
                                }
                            }
                        },
                        "fulfillment": {
                            "type": "Delivery",
                            "start": {
                                "location": storeLocationEnd
                            },
                            "end": payload.message.order.fulfillments[0].end
                        },
                        "payment": {
                            "type": "POST-FULFILLMENT",
                            "@ondc/org/collection_amount": `${totalProductValue}`
                        },
                        "@ondc/org/payload_details": { //TODO: This is hard coded
                            "weight": {
                                "unit": "kilogram",
                                "value": 5
                            },
                            "dimensions": {
                                "length": {
                                    "unit": "centimeter",
                                    "value": 15
                                },
                                "breadth": {
                                    "unit": "centimeter",
                                    "value": 10
                                },
                                "height": {
                                    "unit": "centimeter",
                                    "value": 10
                                }
                            },
                            "category": category.name,
                            "value": {
                                "currency": "INR",
                                "value": `${totalPrice}`
                            },
                            "dangerous_goods": false
                        }
                    }
                }
            }

            // const searchRequest = {
            //         "context": {
            //             "domain": "nic2004:60232",
            //             "country": "IND",
            //             "city": payload.context.city,
            //             "action": "search",
            //             "core_version": "1.2.0",
            //             "bap_id": config.get("sellerConfig").BPP_ID,
            //             "bap_uri": config.get("sellerConfig").BAP_URI,
            //             "transaction_id": uuidv4(),
            //             "message_id": logisticsMessageId,
            //             "timestamp": new Date(),
            //             "ttl": "PT30S"
            //         },
            //     "message": {
            //         "intent": {
            //             "category": {
            //                 "id": "Immediate Delivery"
            //             },
            //             "provider": {
            //                 "time": {
            //                     "days": "1,2,3,4,5,6,7",
            //                     "schedule": {
            //                         "holidays": []
            //                     },
            //                     "duration": "PT30M",
            //                     "range": {
            //                         "start": "1100",
            //                         "end": "2200"
            //                     }
            //                 }
            //             },
            //             "fulfillment": {
            //                 "type": "Delivery",
            //                 "start": {
            //                     "location": {
            //                         "gps": "30.7467833, 76.642853",
            //                         "address": {
            //                             "area_code": "140301"
            //                         }
            //                     }
            //                 },
            //                 "end": {
            //                     "location": {
            //                         "gps": "30.744600, 76.652496",
            //                         "address": {
            //                             "area_code": "140301"
            //                         }
            //                     }
            //                 }
            //             },
            //             "payment": {
            //                 "type": "ON-FULFILLMENT",
            //                 "@ondc/org/collection_amount": "300.00"
            //             },
            //             "@ondc/org/payload_details": {
            //                 "weight": {
            //                     "unit": "kilogram",
            //                     "value": 5
            //                 },
            //                 "dimensions": {
            //                     "length": {
            //                         "unit": "centimeter",
            //                         "value": 15
            //                     },
            //                     "breadth": {
            //                         "unit": "centimeter",
            //                         "value": 10
            //                     },
            //                     "height": {
            //                         "unit": "centimeter",
            //                         "value": 10
            //                     }
            //                 },
            //                 "category": "Grocery",
            //                 "value": {
            //                     "currency": "INR",
            //                     "value": "300.00"
            //                 },
            //                 "dangerous_goods": false
            //             }
            //         }
            //     }
            // }
            //process select request and send it to protocol layer
            this.postSelectRequest(searchRequest, logisticsMessageId, selectMessageId)

            return {"message": {"ack": {"status": "ACK"}}}
        } catch (err) {
            logger.error('error', `[Ondc Service] search logistics payload - search logistics payload : param :`, err);
            throw err;
        }
    }

    async orderSelectWithoutlogistic(payload = {}, req = {}) {
        try {
            const items = payload.message.order.items
            console.log({items})
            logger.log('info', `[Ondc Service] search logistics payload : param :`, payload);
            const selectMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4();
            const searchRequest = await productService.selectV2(payload);
            //process select request and send it to protocol layer
            this.postSelectRequestV2(searchRequest, logisticsMessageId, selectMessageId)

            return searchRequest
        } catch (err) {
            logger.error('error', `[Ondc Service] search logistics payload - search logistics payload : param :`, err);
            throw err;
        }
    }

    async postSelectRequestV2(searchRequest, logisticsMessageId, selectMessageId) {

        try {
            //1. post http to protocol/logistics/v1/search

            try {
                let headers = {};
                let httpRequest = new HttpRequest(
                    config.get("sellerConfig").BPP_URI,
                    `/protocol/v1/on_select`,
                    'POST',
                    searchRequest,
                    headers
                );
                console.error("Here  -- 3")


                await httpRequest.send();

                console.error("Here  -- 4")


            } catch (e) {
                logger.error('error', `[Ondc Service] post http select response : `, e);
                return e
            }
            console.error("Here  -- 5")

            //2. wait async to fetch logistics responses

            //async post request
            // setTimeout(() => {
            //     logger.log('info', `[Ondc Service] search logistics payload - timeout : param :`,searchRequest);
            //     this.buildSelectRequest(logisticsMessageId, selectMessageId)
            // }, 10000); //TODO move to config
            // console.error("Here  -- 6")

        } catch (e) {
            logger.error('error', `[Ondc Service] post http select response : `, e);
            return e
        }
    }

    async postSelectRequest(searchRequest, logisticsMessageId, selectMessageId) {

        try {
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


                await httpRequest.send();

            } catch (e) {
                logger.error('error', `[Ondc Service] post http select response : `, e);
                return e
            }

            //2. wait async to fetch logistics responses

            //async post request
            setTimeout(() => {
                logger.log('info', `[Ondc Service] search logistics payload - timeout : param :`, searchRequest);
                this.buildSelectRequest(logisticsMessageId, selectMessageId)
            }, 12000); //TODO move to config
        } catch (e) {
            logger.error('error', `[Ondc Service] post http select response : `, e);
            return e
        }
    }

    async buildSelectRequest(logisticsMessageId, selectMessageId) {

        try {
            logger.log('info', `[Ondc Service] search logistics payload - build select request : param :`, {
                logisticsMessageId,
                selectMessageId
            });
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, selectMessageId, 'select')
            //2. if data present then build select response
            let selectResponse = await productService.productSelect(logisticsResponse)
            //3. post to protocol layer
            await this.postSelectResponse(selectResponse);

        } catch (e) {
            logger.error('error', `[Ondc Service] search logistics payload - build select request : param :`, e);
            return e
        }
    }

    async postSearchRequest(searchRequest, selectMessageId) {
        try {
            this.buildSearchRequest(searchRequest, selectMessageId)
        } catch (e) {
            logger.error('error', `[Ondc Service] post http select response : `, e);
            return e;
        }
    }

    async buildSearchRequest(searchRequest, searchMessageId) {

        try {
            // let org = await productService.getOrgForOndc(payload.message.order.provider.id);
            let searchResponse = await productService.search(searchRequest, searchMessageId)
            if (searchResponse.length > 0) {
                for (let onsearch of searchResponse) {
                    await this.postSearchResponse(onsearch);
                }
            }

        } catch (e) {
            logger.error('error', `[Ondc Service] search logistics payload - build select request : param :`, e);
            return e
        }
    }

    //get all logistics response from protocol layer
    async getLogistics(logisticsMessageId, retailMessageId, type) {
        try {

            logger.log('info', `[Ondc Service] get logistics : param :`, {logisticsMessageId, retailMessageId, type});

            let headers = {};
            let query = ''
            if (type === 'select') {
                query = `logisticsOnSearch=${logisticsMessageId}&select=${retailMessageId}`
            } else if (type === 'init') {
                query = `logisticsOnInit=${logisticsMessageId}&init=${retailMessageId}`
            } else if (type === 'confirm') {
                query = `logisticsOnConfirm=${logisticsMessageId}&confirm=${retailMessageId}`
            } else if (type === 'track') {
                query = `logisticsOnTrack=${logisticsMessageId}&track=${retailMessageId}`
            } else if (type === 'status') {
                query = `logisticsOnStatus=${logisticsMessageId}&status=${retailMessageId}`
            } else if (type === 'update') {
                query = `logisticsOnUpdate=${logisticsMessageId}&update=${retailMessageId}`
            } else if (type === 'cancel') {
                query = `logisticsOnCancel=${logisticsMessageId}&cancel=${retailMessageId}`
            } else if (type === 'support') {
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

            logger.log('info', `[Ondc Service] get logistics : response :`, result.data);

            return result.data

        } catch (e) {
            logger.error('error', `[Ondc Service] get logistics : response :`, e);
            return e
        }

    }

    //return select response to protocol layer
    async postSelectResponse(selectResponse) {
        try {

            logger.info('info', `[Ondc Service] post http select response : `, selectResponse);

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
            logger.error('error', `[Ondc Service] post http select response : `, e);
            return e
        }

    }

    //return select response to protocol layer
    async postSearchResponse(searchResponse) {
        try {

            logger.info('info', `[Ondc Service] post http select response : `, searchResponse);

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
            logger.error('error', `[Ondc Service] post http search response : `, e);
            return e
        }

    }

    async orderInit(payload = {}, req = {}) {
        try {
            // const {criteria = {}, payment = {}} = req || {};
            logger.log('info', `[Ondc Service] init logistics payload : param :`, payload.message.order);

            const selectRequest = await SelectRequest.findOne({
                where: {
                    transactionId: payload.context.transaction_id
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            })

            //          logger.log('info', `[Ondc Service] old select request :`,selectRequest);

            let org = await productService.getOrgForOndc(payload.message.order.provider.id);

            const logistics = selectRequest?.selectedLogistics ?? ''; //TODO empty for now

            console.log("selectRequest---->", selectRequest);
            console.log("selectRequest---->", logistics.message.catalog);
            let storeLocationEnd = {}
            if (org.providerDetail.storeDetails) {
                storeLocationEnd = {
                    location: {
                        gps: `${org.providerDetail.storeDetails.location.lat},${org.providerDetail.storeDetails.location.long}`,
                        address: {
                            area_code: org.providerDetail.storeDetails.address.area_code,
                            name: org.providerDetail.name,
                            building: org.providerDetail.storeDetails.address.building,
                            locality: org.providerDetail.storeDetails.address.locality,
                            city: org.providerDetail.storeDetails.address.city,
                            state: org.providerDetail.storeDetails.address.state,
                            country: org.providerDetail.storeDetails.address.country
                        }
                    },
                    contact:
                        {
                            phone: org.providerDetail.storeDetails.supportDetails.mobile,
                            email: org.providerDetail.storeDetails.supportDetails.email
                        }
                }
            }

            logger.log('info', `[Ondc Service] old selected logistics :`, logistics);

            const order = payload.message.order;
            const initMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one
            const contextTimeStamp = new Date()


            let deliveryType = logistics.message.catalog["bpp/providers"][0].items.find((element) => {
                return element.category_id === config.get("sellerConfig").LOGISTICS_DELIVERY_TYPE
            });// TODO commented for now for logistic


            let fulfillment = logistics.message.catalog["bpp/providers"][0].fulfillments.find((element) => {
                return element.type === 'Delivery'
            });
            deliveryType = logistics.message.catalog["bpp/providers"][0].items.find((element) => {
                return element.category_id === org.providerDetail.storeDetails.logisticsDeliveryType && element.fulfillment_id === fulfillment.id
            });
            // deliveryType = logisticProvider.message.catalog["bpp/providers"][0].fulfillments.find((element)=>{return element.type === org.providerDetail.storeDetails.logisticsDeliveryType});

            // item.fulfillment_id = fulfillment.id //TODO: revisit for item level status


            //let deliveryType = payload.message.order.items

            const initRequest = {
                "context": {
                    "domain": "nic2004:60232",
                    "country": "IND",
                    "city": payload.context.city, //TODO: take city from retail context
                    "action": "init",
                    "core_version": "1.2.0",
                    "bap_id": BPP_ID,
                    "bap_uri": config.get("sellerConfig").BAP_URI,
                    "bpp_id": logistics?.context?.bpp_id, //STORED OBJECT TODO static for now
                    "bpp_uri": logistics?.context?.bpp_uri, //STORED OBJECT TODO static for now
                    "transaction_id": logistics?.context?.transaction_id, //TODO static for now
                    "message_id": logisticsMessageId,
                    "timestamp": contextTimeStamp,
                    "ttl": "PT30S"
                },
                "message": {
                    "order": {
                        "provider": {
                            "id": logistics.message.catalog["bpp/providers"][0].id
                        },
                        "items": [deliveryType],
                        "fulfillments": [{
                            "id": fulfillment.id,
                            "type": 'Delivery',
                            "start": storeLocationEnd,
                            "end": order.fulfillments[0].end
                        }],
                        "billing": { //TODO: discuss whos details should go here buyer or seller
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
                            "tax_number": org.providerDetail.GSTN.GSTN ?? "27ACTPC1936E2ZN", //FIXME: take GSTN no
                            "phone": org.providerDetail.storeDetails.supportDetails.mobile, //FIXME: take provider details
                            "email": org.providerDetail.storeDetails.supportDetails.email, //FIXME: take provider details
                            "created_at": contextTimeStamp,
                            "updated_at": contextTimeStamp
                        },
                        "payment": {
                            "@ondc/org/settlement_details": []//order.payment['@ondc/org/settlement_details'] //TODO: need details of prepaid transactions to be settle for seller
                        }
                    }

                }
            }
            //  {
            //     "order": {
            //     "provider": {
            //         "id": "6240d89c-1755-4de1-b425-64910f4585b0"
            //     },
            //     "items": [
            //         {
            //             "id": "express",
            //             "fulfillment_id": "4dc2982b-2594-47e2-9a68-2b860efa236a",
            //             "category_id": "Immediate Delivery",
            //             "descriptor": {
            //                 "code": "P2P"
            //             }
            //         }
            //     ],
            //         "fulfillments": [
            //         {
            //             "id": "4dc2982b-2594-47e2-9a68-2b860efa236a",
            //             "type": "Delivery",
            //             "start": {
            //                 "location": {
            //                     "gps": "30.7467833, 76.642853",
            //                     "address": {
            //                         "name": "Kumar chauhan",
            //                         "building": "f-164",
            //                         "locality": "chandigarh",
            //                         "city": "kharar",
            //                         "state": "punjab",
            //                         "country": "India",
            //                         "area_code": "140301"
            //                     }
            //                 },
            //                 "contact": {
            //                     "phone": "9886098860",
            //                     "email": "abcd.efgh@gmail.com"
            //                 }
            //             },
            //             "end": {
            //                 "location": {
            //                     "gps": "30.744600, 76.652496",
            //                     "address": {
            //                         "name": "Rohan Kumar",
            //                         "building": "f-163",
            //                         "locality": "chandigarh",
            //                         "city": "kharar",
            //                         "state": "punjab",
            //                         "country": "India",
            //                         "area_code": "140301"
            //                     }
            //                 },
            //                 "contact": {
            //                     "phone": "9886098860",
            //                     "email": "abcd.efgh@gmail.com"
            //                 }
            //             }
            //         }
            //     ],
            //         "billing": {
            //         "name": "ONDC Logistics Buyer NP",
            //             "address": {
            //             "name": "Rohan Kumar",
            //                 "building": "f-163",
            //                 "locality": "chandigarh",
            //                 "city": "kharar",
            //                 "state": "punjab",
            //                 "country": "India",
            //                 "area_code": "140301"
            //         },
            //         "tax_number": "04AABCU9603R1ZV",
            //             "phone": "9886098860",
            //             "email": "abcd.efgh@gmail.com",
            //             "created_at": "2023-09-13T14:10:29.841Z",
            //             "updated_at": "2023-09-13T14:10:29.841Z"
            //     },
            //     "payment": {
            //         "type": "ON-FULFILLMENT",
            //             "@ondc/org/collection_amount": "300.00"
            //     }
            // }
            // }

            // const initRequestDummy = {
            //     "context": {
            //         "domain": "nic2004:60232",
            //         "country": "IND",
            //         "city": payload.context.city, //TODO: take city from retail context
            //         "action": "init",
            //         "core_version": "1.2.0",
            //         "bap_id": BPP_ID,
            //         "bap_uri": config.get("sellerConfig").BAP_URI,
            //         "bpp_id": logistics?.context?.bpp_id, //STORED OBJECT TODO static for now
            //         "bpp_uri": logistics?.context?.bpp_uri, //STORED OBJECT TODO static for now
            //         "transaction_id": logistics?.context?.transaction_id, //TODO static for now
            //         "message_id": logisticsMessageId,
            //         "timestamp": contextTimeStamp,
            //         "ttl": "PT30S"
            //     },
            //     "message": {
            //         "order": {
            //             "provider": {
            //                 "id": "6415e7fd-6620-4151-bfe6-d48388085956"
            //             },
            //             "items": [
            //                 {
            //                     "id": "Standard",
            //                     "fulfillment_id": "31921a00-fb34-4813-b5b8-612d3eb7444c",
            //                     "category_id": "Immediate Delivery",
            //                     "descriptor": {
            //                         "code": "P2P"
            //                     }
            //                 }
            //             ],
            //             "fulfillments": [
            //                 {
            //                     "id": "31921a00-fb34-4813-b5b8-612d3eb7444c",
            //                     "type": "Delivery",
            //                     "start": {
            //                         "location": {
            //                             "gps": "30.7467833, 76.642853",
            //                             "address": {
            //                                 "name": "Kumar chauhan",
            //                                 "building": "f-164",
            //                                 "locality": "chandigarh",
            //                                 "city": "kharar",
            //                                 "state": "punjab",
            //                                 "country": "India",
            //                                 "area_code": "140301"
            //                             }
            //                         },
            //                         "contact": {
            //                             "phone": "9886098860",
            //                             "email": "abcd.efgh@gmail.com"
            //                         }
            //                     },
            //                     "end": {
            //                         "location": {
            //                             "gps": "30.744600, 76.652496",
            //                             "address": {
            //                                 "name": "Rohan Kumar",
            //                                 "building": "f-163",
            //                                 "locality": "chandigarh",
            //                                 "city": "kharar",
            //                                 "state": "punjab",
            //                                 "country": "India",
            //                                 "area_code": "140301"
            //                             }
            //                         },
            //                         "contact": {
            //                             "phone": "9886098860",
            //                             "email": "abcd.efgh@gmail.com"
            //                         }
            //                     }
            //                 }
            //             ],
            //             "billing": {
            //                 "name": "ONDC Logistics Buyer NP",
            //                 "address": {
            //                     "name": "Rohan Kumar",
            //                     "building": "f-163",
            //                     "locality": "chandigarh",
            //                     "city": "kharar",
            //                     "state": "punjab",
            //                     "country": "India",
            //                     "area_code": "140301"
            //                 },
            //                 "tax_number": "04AABCU9603R1ZV",
            //                 "phone": "9886098860",
            //                 "email": "abcd.efgh@gmail.com",
            //                 "created_at": contextTimeStamp,
            //                 "updated_at": contextTimeStamp
            //             },
            //             "payment": {
            //                 "type": "ON-FULFILLMENT",
            //                 "@ondc/org/collection_amount": "300.00"
            //             }
            //         }
            //     }
            // }
            //logger.log('info', `[Ondc Service] build init request :`, {logisticsMessageId,initMessageId: initMessageId});

            this.postInitRequest(initRequest, logisticsMessageId, initMessageId)

            return {"message": {"ack": {"status": "ACK"}}}
        } catch (err) {
            logger.error('error', `[Ondc Service] build init request :`, {error: err.stack, message: err.message});
            console.log(err)
            return err
        }
    }

    async orderInitWithoutlogistic(payload = {}, req = {}) {
        try {
            const initMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            //logger.log('info', `[Ondc Service] build init request :`, {logisticsMessageId,initMessageId: initMessageId});
            const initRequest = await productService.initV2(payload);
            this.postInitRequest(initRequest, logisticsMessageId, initMessageId)

            return {'status': 'ACK'}
        } catch (err) {
            logger.error('error', `[Ondc Service] build init request :`, {error: err.stack, message: err.message});
            console.log(err)
            return err
        }
    }


    async postInitRequest(searchRequest, logisticsMessageId, selectMessageId) {

        try {
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


                await httpRequest.send();
            } catch (e) {
                logger.error('error', `[Ondc Service] post http select response : `, e);
                return e
            }

            //2. wait async to fetch logistics responses

            //async post request
            setTimeout(() => {
                logger.log('info', `[Ondc Service] search logistics payload - timeout : param :`, searchRequest);
                this.buildInitRequest(logisticsMessageId, selectMessageId)
            }, 5000); //TODO move to config
        } catch (e) {
            logger.error('error', `[Ondc Service] post http select response : `, e);
            return e
        }
    }

    async buildInitRequest(logisticsMessageId, initMessageId) {

        try {
            logger.log('info', `[Ondc Service] build init request :`, {logisticsMessageId, initMessageId});

            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'init')

            //2. if data present then build select response
            logger.log('info', `[Ondc Service] build init request - get logistics response :`, logisticsResponse);
            let selectResponse = await productService.productInit(logisticsResponse)

            //3. post to protocol layer
            await this.postInitResponse(selectResponse);

        } catch (err) {
            logger.error('error', `[Ondc Service] build init request :`, {error: err.stack, message: err.message});
            return err
        }
    }


    //return init response to protocol layer
    async postInitResponse(initResponse) {
        try {

            logger.info('info', `[Ondc Service] post init request :`, initResponse);

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
            logger.error('error', `[Ondc Service] post init request :`, {error: err.stack, message: err.message});
            return err
        }

    }

    async orderConfirm(payload = {}, req = {}) {
        try {
            //const {criteria = {}, payment = {}} = req || {};

            const selectRequest = await SelectRequest.findOne({
                where: {
                    transactionId: payload.context.transaction_id
                },
                order: [
                    ['createdAt', 'DESC'],
                ]
            })

            const initRequest = await InitRequest.findOne({
                where: {
                    transactionId: payload.context.transaction_id
                },
                order: [
                    ['createdAt', 'DESC'],
                ]
            })

            const logistics = selectRequest?.selectedLogistics;
            const order = payload.message.order;
            const selectMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            let org = await productService.getOrgForOndc(payload.message.order.provider.id);

            console.log("org details ---", org)
            let storeLocationEnd = {}
            if (org.providerDetail.storeDetails) {
                storeLocationEnd = {
                    location: {
                        gps: `${org.providerDetail.storeDetails.location.lat},${org.providerDetail.storeDetails.location.long}`,
                        address: {
                            area_code: org.providerDetail.storeDetails.address.area_code,
                            name: org.providerDetail.name,
                            building: org.providerDetail.storeDetails.address.building,
                            locality: org.providerDetail.storeDetails.address.locality,
                            city: org.providerDetail.storeDetails.address.city,
                            state: org.providerDetail.storeDetails.address.state,
                            country: org.providerDetail.storeDetails.address.country
                        }
                    },
                    contact:
                        {
                            phone: org.providerDetail.storeDetails.supportDetails.mobile,
                            email: org.providerDetail.storeDetails.supportDetails.email
                        },
                    person: {
                        name: org.providerDetail.name //TODO: missing from curent impl
                    }
                }
            }


            // const logisticsOrderId = uuidv4();

            let end = {...order.fulfillments[0].end}

            end.location.address.locality = end.location.address.locality ?? end.location.address.street
            end.person = {name: end.location.address.name}

            //const isInvalidItem =false
            // let itemDetails = []
            // for (const items of payload.message.order.items) {
            //     let item = await productService.getForOndc(items.id)
            //
            //     let details = {
            //         "descriptor": {
            //             "name": item.productName
            //         },
            //         "price": {
            //             "currency": "INR",
            //             "value": "" + item.MRP
            //         },
            //         "category_id": item.productCategory,
            //         "quantity": {
            //             "count": items.quantity.count,
            //             "measure": { //TODO: hard coded
            //                 "unit": "Kilogram",
            //                 "value": 1
            //             }
            //         }
            //     }
            //     itemDetails.push(details)
            // }

            let category = domainNameSpace.find((cat) => {
                return cat.domain === payload.context.domain
            })
            let itemDetails = []
            for (const items of payload.message.order.items) {
                let item = await productService.getForOndc(items.id)

                let details = {
                    "descriptor": {
                        "name": item.commonDetails.productName
                    },
                    "price": {
                        "currency": "INR",
                        "value": "" + item.commonDetails.MRP
                    },
                    "category_id": category.name,
                    "quantity": {
                        "count": 1,
                        "measure": {
                            "unit": "kilogram",
                            "value": 5
                        }
                    },
                }
                // "provider": { //TODO: need clarification
                //
                //     "quantity": {
                //     "count": items.quantity.count,
                //     "measure": { //TODO: hard coded
                //         "unit": "Kilogram",
                //         "value": 1
                //     }
                // }
                itemDetails.push(details)
            }

            let fulfillment = selectRequest.selectedLogistics.message.catalog["bpp/providers"][0].fulfillments.find((element) => {
                return element.type === 'Delivery'
            });
            let deliveryType = selectRequest.selectedLogistics.message.catalog["bpp/providers"][0].items.find((element) => {
                return element.category_id === org.providerDetail.storeDetails.logisticsDeliveryType && element.fulfillment_id === fulfillment.id
            });


            // let deliveryType = selectRequest.selectedLogistics.message.catalog['bpp/providers'][0].items.find((element)=>{return element.category_id === config.get("sellerConfig").LOGISTICS_DELIVERY_TYPE});// let deliveryType = logistics.message.catalog["bpp/providers"][0].items.find((element)=>{return element.category_id === config.get("sellerConfig").LOGISTICS_DELIVERY_TYPE}); TODO commented for now for logistic
            // let deliveryType = payload.message.order.items //TODO commented above for now
            const contextTimestamp = new Date()
            const confirmRequest = {
                "context": {
                    "domain": "nic2004:60232",
                    "action": "confirm",
                    "core_version": "1.2.0",
                    "bap_id": config.get("sellerConfig").BPP_ID,
                    "bap_uri": config.get("sellerConfig").BAP_URI,
                    "bpp_id": logistics.context.bpp_id,//STORED OBJECT
                    "bpp_uri": logistics.context.bpp_uri, //STORED OBJECT
                    "transaction_id": initRequest.logisticsTransactionId,
                    "message_id": logisticsMessageId,
                    "city": logistics.context.city,
                    "country": "IND",
                    "timestamp": contextTimestamp,
                    "ttl": "PT30S"
                },
                "message": {
                    "order": {
                        "id": payload.message.order.id,
                        "state": "Created",
                        "provider": initRequest.selectedLogistics.message.order.provider,
                        "items": [
                            deliveryType
                        ],
                        "quote": initRequest.selectedLogistics.message.order.quote,
                        "fulfillments": [
                            {
                                "id": order.fulfillments[0].id,
                                "type": "Delivery",
                                "start": storeLocationEnd,
                                "end": end,
                                "tags": [
                                    {
                                        "code": "state",
                                        "list": [
                                            {
                                                "code": "ready_to_ship",
                                                "value": "yes"
                                            }
                                        ]
                                    },
                                    {
                                        "code": "rto_action",
                                        "list": [
                                            {
                                                "code": "return_to_origin",
                                                "value": "yes"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ],
                        "billing": {
                            ...payload.message.order.billing,
                            "tax_number": org.providerDetail.GSTN.GSTN ?? "27ACTPC1936E2ZN", //FIXME: take GSTN no
                            "phone": org.providerDetail.storeDetails.supportDetails.mobile, //FIXME: take provider details
                            "email": org.providerDetail.storeDetails.supportDetails.email, //FIXME: take provider details
                            "created_at": contextTimestamp,
                            "updated_at": contextTimestamp
                        },
                        "payment": {
                            "type": "POST-FULFILLMENT",
                            "@ondc/org/collection_amount": "0",
                            "collected_by": "BPP"
                        },
                        "@ondc/org/linked_order": {
                            "items": itemDetails,
                            "provider": {
                                "descriptor": {
                                    "name": org.providerDetail.name
                                },
                                address: {
                                    area_code: org.providerDetail.storeDetails.address.area_code,
                                    name: org.providerDetail.name,
                                    building: org.providerDetail.storeDetails.address.building,
                                    locality: org.providerDetail.storeDetails.address.locality,
                                    city: org.providerDetail.storeDetails.address.city,
                                    state: org.providerDetail.storeDetails.address.state,
                                    country: org.providerDetail.storeDetails.address.country
                                }
                            },
                            "order": {
                                "id": order.id,
                                "weight": {
                                    "unit": "kilogram",
                                    "value": 5
                                },
                                "dimensions": {
                                    "length": {
                                        "unit": "centimeter",
                                        "value": 15
                                    },
                                    "breadth": {
                                        "unit": "centimeter",
                                        "value": 10
                                    },
                                    "height": {
                                        "unit": "centimeter",
                                        "value": 10
                                    }
                                }
                            }
                        },
                        "tags": [
                            {
                                "code": "bpp_terms",
                                "list": [
                                    {
                                        "code": "max_liability",
                                        "value": "2"
                                    },
                                    {
                                        "code": "max_liability_cap",
                                        "value": "10000"
                                    },
                                    {
                                        "code": "mandatory_arbitration",
                                        "value": "false"
                                    },
                                    {
                                        "code": "court_jurisdiction",
                                        "value": "Chanigarh"
                                    },
                                    {
                                        "code": "delay_interest",
                                        "value": "1000"
                                    },
                                    {
                                        "code": "static_terms",
                                        "value": "https://github.com/ONDC-Official/protocol-network-extension/discussions/79"
                                    }
                                ]
                            },
                            {
                                "code": "bap_terms",
                                "list": [
                                    {
                                        "code": "accept_bpp_terms",
                                        "value": "Y"
                                    }
                                ]
                            }
                        ],
                        "created_at": contextTimestamp,
                        "updated_at": contextTimestamp
                    }
                }

            }
            logger.info('info', `[Ondc Service] post init request :confirmRequestconfirmRequestconfirmRequestconfirmRequestconfirmRequestconfirmRequest`, confirmRequest);
            this.postConfirmRequest(confirmRequest, logisticsMessageId, selectMessageId)
            //}, 10000); //TODO move to config

            return {"message": {"ack": {"status": "ACK"}}}
        } catch (err) {
            throw err;
        }
    }

    async orderConfirmWithOutLogistic(payload = {}, req = {}) {
        try {
            const selectMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one
            const searchRequest = await productService.confirmV2(payload);
            this.postConfirmRequestV2(searchRequest, logisticsMessageId, selectMessageId)
            //}, 10000); //TODO move to config

            return {status: "ACK"}
        } catch (err) {
            throw err;
        }
    }

    async postConfirmRequestV2(searchRequest, logisticsMessageId, selectMessageId) {

        try {
            //1. post http to protocol/logistics/v1/search

            try {

                let headers = {};
                let httpRequest = new HttpRequest(
                    config.get("sellerConfig").BPP_URI,
                    `/protocol/v1/on_confirm`,
                    'POST',
                    searchRequest,
                    headers
                );

                await httpRequest.send();

            } catch (e) {
                logger.error('error', `[Ondc Service] post http select response : `, e);
                return e
            }

            //2. wait async to fetch logistics responses

            // //async post request
            // setTimeout(() => {
            //     logger.log('info', `[Ondc Service] search logistics payload - timeout : param :`, searchRequest);
            //     this.buildConfirmRequest(logisticsMessageId, selectMessageId)
            // }, 10000); //TODO move to config
        } catch (e) {
            logger.error('error', `[Ondc Service] post http select response : `, e);
            return e
        }
    }

    async postConfirmRequest(searchRequest, logisticsMessageId, selectMessageId) {

        try {
            //1. post http to protocol/logistics/v1/search

            try {

                let headers = {};
                let httpRequest = new HttpRequest(
                    config.get("sellerConfig").BPP_URI,
                    `/protocol/logistics/v1/confirm`,
                    'POST',
                    searchRequest,
                    headers
                );

                await httpRequest.send();

            } catch (e) {
                logger.error('error', `[Ondc Service] post http select response : `, e);
                return e
            }

            //2. wait async to fetch logistics responses

            //async post request
            setTimeout(() => {
                logger.log('info', `[Ondc Service] search logistics payload - timeout : param :`, searchRequest);
                this.buildConfirmRequest(logisticsMessageId, selectMessageId)
            }, 10000); //TODO move to config
        } catch (e) {
            logger.error('error', `[Ondc Service] post http select response : `, e);
            return e
        }
    }


    async buildConfirmRequest(logisticsMessageId, initMessageId) {

        try {
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'confirm')
            //2. if data present then build select response

            let selectResponse = await productService.productConfirm(logisticsResponse)

            //3. post to protocol layer
            await this.postConfirmResponse(selectResponse);

            // //4. trigger on_status call to BAP
            // const confirmRequest = logisticsResponse.retail_confirm[0]//select first select request
            // const context = { ...selectResponse.context, action: 'on_status', timestamp: new Date(), message_id: uuidv4() }
            // const orderId = confirmRequest.message.order.order_id
            //
            // console.log("context--->", context)
            // await this.triggerOnStatus(context, orderId);

        } catch (e) {
            console.log(e)
            return e
        }
    }

    async triggerOnStatus(context, orderId) {

        console.log("context", context)
        console.log("orderId", orderId)
        let status = {
            "context": context,
            "message": {
                "order_id": orderId
            }
        }

        await this.orderStatus(status, {}, true)
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
            return e
        }

    }

    async orderTrack(payload = {}, req = {}) {
        try {
            //const {criteria = {}, payment = {}} = req || {};

            const confirmRequest = await ConfirmRequest.findOne({
                where: {
                    transactionId: payload.context.transaction_id,
                    retailOrderId: payload.message.order_id
                }
            })

            const logistics = confirmRequest.selectedLogistics;

            //const order = payload.message.order;
            const selectMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            const trackRequest = {
                "context": {
                    "domain": "nic2004:60232",
                    "action": "track",
                    "core_version": "1.2.0",
                    "bap_id": config.get("sellerConfig").BPP_ID,
                    "bap_uri": config.get("sellerConfig").BAP_URI,
                    "bpp_id": logistics.context.bpp_id,//STORED OBJECT
                    "bpp_uri": logistics.context.bpp_uri, //STORED OBJECT
                    "transaction_id": confirmRequest.logisticsTransactionId,
                    "message_id": logisticsMessageId,
                    "city": "std:080",
                    "country": "IND",
                    "timestamp": new Date(),
                    "ttl": "PT30S"
                },
                "message":
                    {
                        "order_id": confirmRequest.orderId,//payload.message.order_id,
                    }

            }


            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            //setTimeout(() => {
            this.postTrackRequest(trackRequest, logisticsMessageId, selectMessageId)
            // }, 5000); //TODO move to config

            return {"message": {"ack": {"status": "ACK"}}}
        } catch (err) {
            throw err;
        }
    }


    async postTrackRequest(searchRequest, logisticsMessageId, selectMessageId) {

        try {
            //1. post http to protocol/logistics/v1/search

            try {

                let headers = {};
                let httpRequest = new HttpRequest(
                    config.get("sellerConfig").BPP_URI,
                    `/protocol/logistics/v1/track`,
                    'POST',
                    searchRequest,
                    headers
                );


                await httpRequest.send();

            } catch (e) {
                logger.error('error', `[Ondc Service] post http select response : `, e);
                return e
            }

            //2. wait async to fetch logistics responses

            //async post request
            setTimeout(() => {
                logger.log('info', `[Ondc Service] search logistics payload - timeout : param :`, searchRequest);
                this.buildTrackRequest(logisticsMessageId, selectMessageId)
            }, 10000); //TODO move to config
        } catch (e) {
            logger.error('error', `[Ondc Service] post http select response : `, e);
            return e
        }
    }

    async buildTrackRequest(logisticsMessageId, initMessageId) {

        try {
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'track')
            //2. if data present then build select response

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
            return e
        }

    }

    async orderStatus(payload = {}, req = {}, unsoliciated = false) {
        try {
            //const {criteria = {}, payment = {}} = req || {};

            const confirmRequest = await ConfirmRequest.findOne({
                where: {
                    transactionId: payload.context.transaction_id,
                    retailOrderId: payload.message.order_id
                }
            })

            const logistics = confirmRequest.selectedLogistics;

            //const order = payload.message.order;
            const selectMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            const statusRequest = {
                "context": {
                    "domain": "nic2004:60232",
                    "action": "status",
                    "core_version": "1.2.0",
                    "bap_id": config.get("sellerConfig").BPP_ID,
                    "bap_uri": config.get("sellerConfig").BAP_URI,
                    "bpp_id": logistics.context.bpp_id,//STORED OBJECT
                    "bpp_uri": logistics.context.bpp_uri, //STORED OBJECT
                    "transaction_id": confirmRequest.logisticsTransactionId,
                    "message_id": logisticsMessageId,
                    "city": "std:080",
                    "country": "IND",
                    "timestamp": new Date(),
                    "ttl": "PT30S"
                },
                "message":
                    {
                        "order_id": confirmRequest.orderId,
                    }

            }


            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            //setTimeout(() => {
            this.postStatusRequest(statusRequest, logisticsMessageId, selectMessageId, unsoliciated, payload)
            //}, 5000); //TODO move to config

            return {"message": {"ack": {"status": "ACK"}}}
        } catch (err) {
            throw err;
        }
    }


    async orderStatusWithoutLogistics(payload = {}, req = {}, unsoliciated = false) {
        try {
            //const {criteria = {}, payment = {}} = req || {};


            //const order = payload.message.order;
            const selectMessageId = payload.context.message_id;

            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            //setTimeout(() => {
            let statusResponse = await productService.productStatusWithoutLogistics(payload)

            //3. post to protocol layer
            this.postStatusResponse(statusResponse);


            return {status: 'ACK'}
        } catch (err) {
            throw err;
        }
    }

    async orderStatusUpdate(payload = {}, req = {}) {
        try {
            // const {criteria = {}, payment = {}} = req || {};

            const confirmRequest = await ConfirmRequest.findOne({
                where: {
                    retailOrderId: payload.data.orderId
                }
            })

            const logistics = confirmRequest.selectedLogistics;

            const order = payload.data;
            const selectMessageId = uuidv4();
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            const trackRequest = {
                "context": {
                    "domain": "nic2004:60232",
                    "action": "update",
                    "core_version": "1.2.0",
                    "bap_id": config.get("sellerConfig").BPP_ID,
                    "bap_uri": config.get("sellerConfig").BPP_URI,
                    "bpp_id": logistics.context.bpp_id,//STORED OBJECT
                    "bpp_uri": logistics.context.bpp_uri, //STORED OBJECT
                    "transaction_id": confirmRequest.logisticsTransactionId,
                    "message_id": logisticsMessageId,
                    "city": "std:080", //TODO: take it from request
                    "country": "IND",
                    "timestamp": new Date(),
                    "ttl": "PT30S"
                },
                "message": {
                    "order": {
                        "id": order.orderId,
                        "state": "Accepted",
                        "items": logistics.items,
                        "@ondc/org/linked_order": {
                            "items": [{
                                "descriptor": {
                                    "name": "KIT KAT"
                                },
                                "quantity": {
                                    "count": 2,
                                    "measure": {
                                        "value": 200,
                                        "unit": "Gram"
                                    }
                                },
                                "price": {
                                    "currency": "INR",
                                    "value": "200.00"
                                },
                                "category_id": "Grocery"
                            }]
                        },
                        "fulfillments": [{
                            "id": logistics.message.order.fulfillments[0].id,
                            "type": logistics.message.order.fulfillments[0].type,
                            "tracking": logistics.message.order.fulfillments[0].tracking,
                            "tags": [
                                {
                                    "code": "state",
                                    "list": [
                                        {
                                            "code": "ready_to_ship",
                                            "value": "yes"
                                        }
                                    ]
                                },
                                {
                                    "code": "rto_action",
                                    "list": [
                                        {
                                            "code": "return_to_origin",
                                            "value": "yes"
                                        }
                                    ]
                                }
                            ]
                        }],
                        "updated_at": new Date()
                    },
                    "update_target": "fulfillment"
                }

            }


            payload = {message: {order: order}, context: confirmRequest.confirmRequest.context}
            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            //setTimeout(() => {
            this.postUpdateOrderStatusRequest(payload, trackRequest, logisticsMessageId, selectMessageId)
            //}, 5000); //TODO move to config

            return {status: 'ACK'}
        } catch (err) {
            throw err;
        }
    }

    async orderCancelFromSeller(payload = {}, req = {}) {
        try {
            //const {criteria = {}, payment = {}} = req || {};

            const confirmRequest = await ConfirmRequest.findOne({
                where: {
                    retailOrderId: payload.data.orderId
                }
            })

            const logistics = confirmRequest.selectedLogistics;

            const order = payload.data;

            order.context = confirmRequest.confirmRequest.context

            const selectMessageId = uuidv4();
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            const trackRequest = {
                "context": {
                    "domain": "nic2004:60232",
                    "action": "cancel",
                    "core_version": "1.2.0",
                    "bap_id": config.get("sellerConfig").BPP_ID,
                    "bap_uri": config.get("sellerConfig").BAP_URI,
                    "bpp_id": logistics.context.bpp_id,//STORED OBJECT
                    "bpp_uri": logistics.context.bpp_uri, //STORED OBJECT
                    "transaction_id": confirmRequest.logisticsTransactionId,
                    "message_id": logisticsMessageId,
                    "city": "std:080", //TODO: take it from request
                    "country": "IND",
                    "timestamp": new Date(),
                    "ttl": "PT30S"
                },
                "message": {
                    "order_id": order.orderId,
                    "cancellation_reason_id": order.cancellation_reason_id
                }
            }

            payload = {message: {order: order}, context: confirmRequest.confirmRequest.context}

            console.log("payload-------------->", payload);
            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            //setTimeout(() => {
            this.postSellerCancelRequest(payload, trackRequest, logisticsMessageId, selectMessageId)
            //}, 5000); //TODO move to config

            return {status: 'ACK'}
        } catch (err) {

            console.log("err--->", err);
            throw err;
        }
    }

    async orderUpdate(payload = {}, req = {}) {
        try {
            //const {criteria = {}, payment = {}} = req || {};

            const confirmRequest = await ConfirmRequest.findOne({
                where: {
                    retailOrderId: payload.message.order.id
                }
            })

            const logistics = confirmRequest.selectedLogistics;

            const order = payload.message.order
            const selectMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            const trackRequest = {
                "context": {
                    "domain": "nic2004:60232",
                    "action": "update",
                    "core_version": "1.1.0",
                    "bap_id": config.get("sellerConfig").BPP_ID,
                    "bap_uri": config.get("sellerConfig").BPP_URI,
                    "bpp_id": logistics.context.bpp_id,//STORED OBJECT
                    "bpp_uri": logistics.context.bpp_uri, //STORED OBJECT
                    "transaction_id": confirmRequest.logisticsTransactionId,
                    "message_id": logisticsMessageId,
                    "city": "std:080", //TODO: take it from request
                    "country": "IND",
                    "timestamp": new Date(),
                    "ttl": "PT30S"
                },
                "message": {
                    "order": {
                        "id": order.orderId,
                        "state": "Accepted",
                        "items": logistics.items,
                        "@ondc/org/linked_order": {
                            "items": [{ //TODO: get valid item from list and update the fields
                                "descriptor": {
                                    "name": "KIT KAT"
                                },
                                "quantity": {
                                    "count": 2,
                                    "measure": {
                                        "value": 200,
                                        "unit": "Gram"
                                    }
                                },
                                "price": {
                                    "currency": "INR",
                                    "value": "200.00"
                                },
                                "category_id": "Grocery"
                            }]
                        },
                        "fulfillments": [{
                            "id": logistics.message.order.fulfillments[0].id,
                            "type": logistics.message.order.fulfillments[0].type,
                            "tracking": logistics.message.order.fulfillments[0].tracking,
                            "tags": {
                                "@ondc/org/order_ready_to_ship": "yes" //TBD: passing this value for update triggers logistics workflow
                            }
                        }],
                        "updated_at": new Date()
                    },
                    "update_target": "fulfillment"
                }

            }


            payload = {message: {order: order}, context: confirmRequest.confirmRequest.context}
            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            //setTimeout(() => {
            this.postUpdateRequest(payload, trackRequest, logisticsMessageId, selectMessageId)
            //}, 5000); //TODO move to config

            return {status: 'ACK'}
        } catch (err) {
            throw err;
        }
    }

    async orderUpdateV2(payload = {}, req = {}) {
        try {
            //const {criteria = {}, payment = {}} = req || {};

            const updateMessageId = uuidv4();

            const searchRequest = await productService.updateV2(payload);
            //process select request and send it to protocol layer
            this.postUpdateRequestV2(searchRequest, null, updateMessageId)

            return {"message": {"ack": {"status": "ACK"}}}
        } catch (err) {
            throw err;
        }
    }

    async postUpdateRequestV2(searchRequest, logisticsMessageId, selectMessageId) {

        try {
            //1. post http to protocol/logistics/v1/search

            try {
                let headers = {};
                let httpRequest = new HttpRequest(
                    config.get("sellerConfig").BPP_URI,
                    `/protocol/v1/on_update`,
                    'POST',
                    searchRequest,
                    headers
                );
                console.error("Here  -- 3")


                await httpRequest.send();

                console.error("Here  -- 4")


            } catch (e) {
                logger.error('error', `[Ondc Service] post http select response : `, e);
                return e
            }
            console.error("Here  -- 5")

            //2. wait async to fetch logistics responses

            //async post request
            // setTimeout(() => {
            //     logger.log('info', `[Ondc Service] search logistics payload - timeout : param :`,searchRequest);
            //     this.buildSelectRequest(logisticsMessageId, selectMessageId)
            // }, 10000); //TODO move to config
            // console.error("Here  -- 6")

        } catch (e) {
            logger.error('error', `[Ondc Service] post http select response : `, e);
            return e
        }
    }


    async orderStatusUpdateItems(payload = {}, req = {}) {
        try {
            //const {criteria = {}, payment = {}} = req || {};

            const confirmRequest = await ConfirmRequest.findOne({
                where: {
                    retailOrderId: payload.data.orderId
                }
            })
            //
            // console.log("")
            //
            // const logistics = confirmRequest.selectedLogistics;

            const order = payload.data;
            const selectMessageId = uuidv4();//payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            // const trackRequest = {
            //     "context": {
            //         "domain": "nic2004:60232",
            //         "action": "update",
            //         "core_version": "1.1.0",
            //         "bap_id": config.get("sellerConfig").BPP_ID,
            //         "bap_uri": config.get("sellerConfig").BPP_URI,
            //         "bpp_id": logistics.context.bpp_id,//STORED OBJECT
            //         "bpp_uri": logistics.context.bpp_uri, //STORED OBJECT
            //         "transaction_id": confirmRequest.logisticsTransactionId,
            //         "message_id": logisticsMessageId,
            //         "city": "std:080", //TODO: take it from request
            //         "country": "IND",
            //         "timestamp": new Date()
            //     },
            //     "message": {
            //         "order": {
            //             "id": order.orderId,
            //             "state": "Accepted",
            //             "items": logistics.items,
            //             "@ondc/org/linked_order": {
            //                 "items": [{ //TODO: get valid item from list and update the fields
            //                     "descriptor": {
            //                         "name": "KIT KAT"
            //                     },
            //                     "quantity": {
            //                         "count": 2,
            //                         "measure": {
            //                             "value": 200,
            //                             "unit": "Gram"
            //                         }
            //                     },
            //                     "price": {
            //                         "currency": "INR",
            //                         "value": "200.00"
            //                     },
            //                     "category_id": "Grocery"
            //                 }]
            //             },
            //             "fulfillments": [{
            //                 "id": logistics.message.order.fulfillments[0].id,
            //                 "type": logistics.message.order.fulfillments[0].type,
            //                 "tracking": logistics.message.order.fulfillments[0].tracking,
            //                 "tags": {
            //                     "@ondc/org/order_ready_to_ship": "yes" //TBD: passing this value for update triggers logistics workflow
            //                 }
            //             }],
            //             "updated_at": new Date()
            //         },
            //         "update_target": "fulfillment"
            //     }
            //
            // }


// <<<<<<< v1.2.0-LSP
//             payload = {
//                 message: {order: order},
//                 context: {...confirmRequest.confirmRequest.context, message_id: uuidv4()}
//             };
// =======
            payload = {
                message: {order: order},
                context: {...confirmRequest?.confirmRequest?.context, message_id: uuidv4()}
            };

            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            //setTimeout(() => {
            this.postUpdateItemRequest(payload, {}, logisticsMessageId, selectMessageId);
            //}, 5000); //TODO move to config

            return {status: 'ACK'}
        } catch (err) {
            throw err;
        }
    }

    async notifyItemUpdate(data = {}, req = {}) {
        try {

            const result = await productService.ondcGetForUpdate(data.itemId)
            if (Object.keys(result).length > 0) {
                this.postItemUpdate(result);
            }
            return {status: 'ACK'}
        } catch (err) {
            throw err;
        }
    }


    async postStatusRequest(statusRequest, logisticsMessageId, selectMessageId, unsoliciated, payload) {

        try {
            //1. post http to protocol/logistics/v1/search

            try {

                let headers = {};
                let httpRequest = new HttpRequest(
                    config.get("sellerConfig").BPP_URI,
                    `/protocol/logistics/v1/status`,
                    'POST',
                    statusRequest,
                    headers
                );


                await httpRequest.send();

            } catch (e) {
                logger.error('error', `[Ondc Service] post http select response : `, e);
                return e
            }

            //2. wait async to fetch logistics responses

            //async post request
            setTimeout(() => {
                logger.log('info', `[Ondc Service] search logistics payload - timeout : param :`, statusRequest);
                this.buildStatusRequest(statusRequest, logisticsMessageId, selectMessageId, unsoliciated, payload)
            }, 10000); //TODO move to config
        } catch (e) {
            logger.error('error', `[Ondc Service] post http select response : `, e);
            return e
        }
    }

    async postUpdateRequest(orderData, searchRequest, logisticsMessageId, selectMessageId) {

        try {
            //1. post http to protocol/logistics/v1/search

            // try { //TODO: post this request for update items
            //
            //     console.log("------->>>",searchRequest,selectMessageId,logisticsMessageId)
            //     console.log("------result ->>>",config.get("sellerConfig").BPP_URI )
            //     let headers = {};
            //     let httpRequest = new HttpRequest(
            //         config.get("sellerConfig").BPP_URI,
            //         `/protocol/logistics/v1/update`,
            //         'POST',
            //         searchRequest,
            //         headers
            //     );
            //
            //
            //     let result = await httpRequest.send();
            //     console.log("------result ->>>",result )
            //
            // } catch (e) {
            //     logger.error('error', `[Ondc Service] post http select response : `, e);
            //     return e
            // }

            //2. wait async to fetch logistics responses

            //async post request
            setTimeout(() => {
                logger.log('info', `[Ondc Service] search logistics payload - timeout : param :`, searchRequest);
                this.buildUpdateRequest(orderData, logisticsMessageId, selectMessageId)
            }, 5000); //TODO move to config
        } catch (e) {
            logger.error('error', `[Ondc Service] post http select response : `, e);
            return e
        }
    }

    // async postUpdateItemRequest(orderData,searchRequest,logisticsMessageId,selectMessageId){
    //
    //     try{
    //         //1. post http to protocol/logistics/v1/search
    //
    //         // try { //TODO: post this request for update items
    //         //
    //         //     console.log("------->>>",searchRequest,selectMessageId,logisticsMessageId)
    //         //     console.log("------result ->>>",config.get("sellerConfig").BPP_URI )
    //         //     let headers = {};
    //         //     let httpRequest = new HttpRequest(
    //         //         config.get("sellerConfig").BPP_URI,
    //         //         `/protocol/logistics/v1/update`,
    //         //         'POST',
    //         //         searchRequest,
    //         //         headers
    //         //     );
    //         //
    //         //
    //         //     let result = await httpRequest.send();
    //         //     console.log("------result ->>>",result )
    //         //
    //         // } catch (e) {
    //         //     logger.error('error', `[Ondc Service] post http select response : `, e);
    //         //     return e
    //         // }
    //
    //         //2. wait async to fetch logistics responses
    //
    //         //async post request
    //         setTimeout(() => {
    //             logger.log('info', `[Ondc Service] search logistics payload - timeout : param :`,searchRequest);
    //            this.buildUpdateRequest(orderData,logisticsMessageId, selectMessageId)
    //         }, 5000); //TODO move to config
    //     }catch (e){
    //         logger.error('error', `[Ondc Service] post http select response : `, e);
    //         return e
    //     }
    // }
    async postUpdateItemRequest(orderData, searchRequest, logisticsMessageId, selectMessageId) {

        try {
            //1. post http to protocol/logistics/v1/search

            // try { //TODO: post this request for update items
            //
            //     console.log("------->>>",searchRequest,selectMessageId,logisticsMessageId)
            //     console.log("------result ->>>",config.get("sellerConfig").BPP_URI )
            //     let headers = {};
            //     let httpRequest = new HttpRequest(
            //         config.get("sellerConfig").BPP_URI,
            //         `/protocol/logistics/v1/update`,
            //         'POST',
            //         searchRequest,
            //         headers
            //     );
            //
            //
            //     let result = await httpRequest.send();
            //     console.log("------result ->>>",result )
            //
            // } catch (e) {
            //     logger.error('error', `[Ondc Service] post http select response : `, e);
            //     return e
            // }

            //2. wait async to fetch logistics responses

            //async post request
            setTimeout(() => {
                logger.log('info', `[Ondc Service] search logistics payload - timeout : param :`, searchRequest);
                this.buildUpdateItemRequest(orderData, logisticsMessageId, selectMessageId)
            }, 5000); //TODO move to config
        } catch (e) {
            logger.error('error', `[Ondc Service] post http select response : `, e);
            return e
        }
    }

    async postItemUpdate(itemData) {

        try {
            //async post request
            setTimeout(() => {
                logger.log('info', `[Ondc Service] search logistics payload - timeout : param :`, itemData);
                this.buildItemUpdate(itemData)
            }, 1000); //TODO move to config
        } catch (e) {
            logger.error('error', `[Ondc Service] post http select response : `, e);
            return e
        }
    }

    async postUpdateOrderStatusRequest(orderData, searchRequest, logisticsMessageId, selectMessageId) {

        try {
            //1. post http to protocol/logistics/v1/search

            try { //TODO: post this request for update items

                let headers = {};
                let httpRequest = new HttpRequest(
                    config.get("sellerConfig").BPP_URI,
                    `/protocol/logistics/v1/update`,
                    'POST',
                    searchRequest,
                    headers
                );


                await httpRequest.send();

            } catch (e) {
                logger.error('error', `[Ondc Service] post http select response : `, e);
                return e
            }

            //2. wait async to fetch logistics responses

            //async post request
            setTimeout(() => {
                logger.log('info', `[Ondc Service] search logistics payload - timeout : param :`, searchRequest);
                this.buildOrderStatusRequest(orderData, logisticsMessageId, selectMessageId)
            }, 5000); //TODO move to config
        } catch (e) {
            logger.error('error', `[Ondc Service] post http select response : `, e);
            return e
        }
    }

    async orderCancel(payload = {}, req = {}) {
        try {
            //const {criteria = {}, payment = {}} = req || {};

            const confirmRequest = await ConfirmRequest.findOne({
                where: {
                    transactionId: payload.context.transaction_id,
                    retailOrderId: payload.message.order_id
                }
            })

            const logistics = confirmRequest.selectedLogistics;

            //const order = payload.message.order;
            const selectMessageId = payload.context.message_id;
            const logisticsMessageId = uuidv4(); //TODO: in future this is going to be array as packaging for single select request can be more than one

            const trackRequest = {
                "context": {
                    "domain": "nic2004:60232",
                    "action": "cancel",
                    "core_version": "1.2.0",
                    "bap_id": config.get("sellerConfig").BPP_ID,
                    "bap_uri": config.get("sellerConfig").BAP_URI,
                    "bpp_id": logistics.context.bpp_id,//STORED OBJECT
                    "bpp_uri": logistics.context.bpp_uri, //STORED OBJECT
                    "transaction_id": confirmRequest.logisticsTransactionId,
                    "message_id": logisticsMessageId,
                    "city": "std:080",
                    "country": "IND",
                    "timestamp": new Date(),
                    "ttl": "PT30S"
                },
                "message":
                    {
                        "order_id": confirmRequest.orderId,
                        "cancellation_reason_id": payload.message.cancellation_reason_id
                    }

            }


            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            //setTimeout(() => {
            this.postCancelRequest(trackRequest, logisticsMessageId, selectMessageId)
            //}, 5000); //TODO move to config

            return {"message": {"ack": {"status": "ACK"}}}
        } catch (err) {
            throw err;
        }
    }

    async postCancelRequest(searchRequest, logisticsMessageId, selectMessageId) {

        try {
            //1. post http to protocol/logistics/v1/search

            try {

                let headers = {};
                let httpRequest = new HttpRequest(
                    config.get("sellerConfig").BPP_URI,
                    `/protocol/logistics/v1/cancel`,
                    'POST',
                    searchRequest,
                    headers
                );


                await httpRequest.send();

            } catch (e) {
                logger.error('error', `[Ondc Service] post http select response : `, e);
                return e
            }

            //2. wait async to fetch logistics responses

            //async post request
            setTimeout(() => {
                logger.log('info', `[Ondc Service] search logistics payload - timeout : param :`, searchRequest);
                this.buildCancelRequest(logisticsMessageId, selectMessageId)
            }, 10000); //TODO move to config
        } catch (e) {
            logger.error('error', `[Ondc Service] post http select response : `, e);
            return e
        }
    }

    async postSellerCancelRequest(cancelData, cancelRequest, logisticsMessageId, selectMessageId) {

        try {
            //1. post http to protocol/logistics/v1/search

            try {

                let headers = {};
                let httpRequest = new HttpRequest(
                    config.get("sellerConfig").BPP_URI,
                    `/protocol/logistics/v1/cancel`,
                    'POST',
                    cancelRequest,
                    headers
                );


                await httpRequest.send();

            } catch (e) {
                logger.error('error', `[Ondc Service] post http select response : `, e);
                return e
            }

            //2. wait async to fetch logistics responses

            //async post request
            setTimeout(() => {
                logger.log('info', `[Ondc Service] search logistics payload - timeout : param :`, cancelRequest);
                this.buildSellerCancelRequest(cancelData, logisticsMessageId, selectMessageId)
            }, 10000); //TODO move to config
        } catch (e) {
            logger.error('error', `[Ondc Service] post http select response : `, e);
            return e
        }
    }

    async buildStatusRequest(statusRequest, logisticsMessageId, initMessageId, unsoliciated, payload) {

        try {
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'status')
            //2. if data present then build select response

            console.log("statusRequest-----build>", statusRequest);
            let statusResponse = await productService.productStatus(logisticsResponse, statusRequest, unsoliciated, payload)

            //3. post to protocol layer
            await this.postStatusResponse(statusResponse);

        } catch (e) {
            console.log(e)
            return e
        }
    }

    async buildUpdateRequest(statusRequest, logisticsMessageId, initMessageId) {

        try {
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'update')
            //2. if data present then build select response

            let statusResponse = await productService.productUpdate(logisticsResponse)

            //3. post to protocol layer
            await this.postUpdateResponse(statusResponse);

        } catch (e) {
            console.log(e)
            return e
        }
    }

    async buildUpdateItemRequest(statusRequest, logisticsMessageId, initMessageId) {

        try {
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'update')
            //2. if data present then build select response

            let statusResponse = await productService.productUpdateItem(statusRequest, logisticsResponse)

            //3. post to protocol layer
            await this.postUpdateResponse(statusResponse);

        } catch (e) {
            console.log(e)
            return e
        }
    }

    async buildItemUpdate(statusRequest) {

        try {
            const org = await productService.getOrgForOndc(statusRequest.organization)

            let category = domainNameSpace.find((cat) => {
                return cat.name === statusRequest.productCategory
            })
            let context = {
                "domain": category.domain,
                "country": "IND",
                "city": "std:080",
                "action": "on_search",
                "core_version": "1.2.0",
                "bap_id": "ref-app-buyer-dev-internal.ondc.org",
                "bap_uri": "https://ref-app-buyer-dev-internal.ondc.org/protocol/v1",
                "bpp_uri": "https://ref-app-seller-dev-internal.ondc.org",
                "transaction_id": "323e2894-82b9-4577-bf7a-19bd85a5dcdf",
                "message_id": "bf1104c9-0ad3-4bcf-b45d-d74c38ea4764",
                "timestamp": new Date(),
                "bpp_id": "ref-app-seller-dev-internal.ondc.org",
                "ttl": "PT30S"
            }
            let data = {
                products: [{...org.providerDetail, items: [statusRequest]}],
                customMenu: [],
            }
            let productSchema = await getProductUpdate({data, context});
            await this.postItemUpdateRequest(productSchema);

        } catch (e) {
            console.log(e)
            return e
        }
    }

    async buildOrderStatusRequest(statusRequest, logisticsMessageId, initMessageId) {

        try {
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'update')
            //2. if data present then build select response

            let statusResponse = await productService.productOrderStatus(logisticsResponse, statusRequest)

            //3. post to protocol layer
            await this.postStatusResponse(statusResponse);

        } catch (e) {
            console.log(e)
            return e
        }
    }


    async buildCancelRequest(logisticsMessageId, initMessageId) {

        try {
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'cancel')
            //2. if data present then build select response

            let statusResponse = await productService.productCancel(logisticsResponse)

            //3. post to protocol layer
            await this.postCancelResponse(statusResponse);

        } catch (e) {
            console.log(e)
            return e
        }
    }

    async buildSellerCancelRequest(cancelData, logisticsMessageId, initMessageId) {

        try {
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'cancel')
            //2. if data present then build select response

            let statusResponse = await productService.productSellerCancel(cancelData, logisticsResponse)

            //3. post to protocol layer
            await this.postSellerCancelResponse(statusResponse);

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
            return e
        }

    }

    //return track response to protocol layer
    async postUpdateResponse(statusResponse) {
        try {

            let headers = {};
            let httpRequest = new HttpRequest(
                config.get("sellerConfig").BPP_URI,
                `/protocol/v1/on_update`,
                'POST',
                statusResponse,
                headers
            );

            console.log(httpRequest)

            let result = await httpRequest.send();

            return result.data

        } catch (e) {
            return e
        }

    }

    //return track response to protocol layer
    async postItemUpdateRequest(statusResponse) {
        try {
            console.log('itemdata------------------------------------------>')
            console.log({itemdata: statusResponse})
            let headers = {};
            let httpRequest = new HttpRequest(
                config.get("sellerConfig").BPP_URI,
                `/protocol/v1/on_search`,
                'POST',
                statusResponse,
                headers
            );

            console.log(httpRequest)

            let result = await httpRequest.send();

            return result.data

        } catch (e) {
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
            return e
        }

    }


    //return track response to protocol layer
    async postSellerCancelResponse(statusResponse) {
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
            return e
        }

    }

    async orderSupport(payload = {}, req = {}) {
        try {
            //const {criteria = {}, payment = {}} = req || {};

            const selectRequest = await ConfirmRequest.findOne({
                where: {
                    transactionId: payload.message.ref_id
                }
            })

            const logistics = selectRequest.selectedLogistics;

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
                    "transaction_id": selectRequest.logisticsTransactionId,
                    "message_id": logisticsMessageId,
                    "city": "std:080",
                    "country": "IND",
                    "timestamp": new Date(),
                    "ttl": "PT30S"
                },
                "message":
                    {
                        "ref_id": selectRequest.transactionId,
                    }

            }


            // setTimeout(this.getLogistics(logisticsMessageId,selectMessageId),3000)
            //setTimeout(() => {
            this.postSupportRequest(trackRequest, logisticsMessageId, selectMessageId)
            //}, 5000); //TODO move to config

            return trackRequest
        } catch (err) {
            throw err;
        }
    }


    async postSupportRequest(searchRequest, logisticsMessageId, selectMessageId) {

        try {
            //1. post http to protocol/logistics/v1/search

            try {

                let headers = {};
                let httpRequest = new HttpRequest(
                    config.get("sellerConfig").BPP_URI,
                    `/protocol/logistics/v1/support`,
                    'POST',
                    searchRequest,
                    headers
                );


                await httpRequest.send();

            } catch (e) {
                logger.error('error', `[Ondc Service] post http select response : `, e);
                return e
            }

            //2. wait async to fetch logistics responses

            //async post request
            setTimeout(() => {
                logger.log('info', `[Ondc Service] search logistics payload - timeout : param :`, searchRequest);
                this.buildSupportRequest(logisticsMessageId, selectMessageId)
            }, 10000); //TODO move to config
        } catch (e) {
            logger.error('error', `[Ondc Service] post http select response : `, e);
            return e
        }
    }

    async buildSupportRequest(logisticsMessageId, initMessageId) {

        try {
            //1. look up for logistics
            let logisticsResponse = await this.getLogistics(logisticsMessageId, initMessageId, 'support')
            //2. if data present then build select response

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
            return e
        }

    }


    async notifyStoreUpdate(data) {
        if (data?.storeTiming?.status === 'closed' || data?.storeTiming?.status === 'disabled') {
            let category = domainNameSpace.find((cat) => {
                return cat.name === data.category
            })
            let time = {}
            if (data.updateType === 'closed') {
                time = {
                    "label": "close",
                    "timestamp": new Date(),
                    "range":
                        {
                            "start": data?.storeTiming?.colsed?.from,
                            "end": data?.storeTiming?.colsed?.to
                        }
                }
            } else if (data.updateType === 'disabled') {
                time = {
                    "label": "disable",
                    "timestamp": new Date()
                }
            }
            let payload = {
                "context":
                    {
                        "domain": category.domain,
                        "action": "on_search",
                        "country": "IND",
                        "city": "std:080",
                        "core_version": "1.2.0",
                        "bap_id": "ref-app-buyer-dev-internal.ondc.org",
                        "bap_uri": "https://ref-app-buyer-dev-internal.ondc.org/protocol/v1",
                        "bpp_uri": "https://ref-app-seller-dev-internal.ondc.org",
                        "transaction_id": "323e2894-82b9-4577-bf7a-19bd85a5dcdf",
                        "message_id": "bf1104c9-0ad3-4bcf-b45d-d74c38ea4764",
                        "timestamp": new Date(),
                        "ttl": "PT30S"
                    },
                "message":
                    {
                        "catalog":
                            {
                                "bpp/providers":
                                    [
                                        {
                                            "id": data.organization,
                                            "locations":
                                                [
                                                    {
                                                        "id": data.locationId,
                                                        "time": time
                                                    }
                                                ]
                                        }
                                    ]
                            }
                    }
            }
            this.postItemUpdateRequest(payload);
        }
        return {success: true};
    }

    async notifyOrgUpdate(data) {
        let category = domainNameSpace.find((cat) => {
            return cat.name === data.category
        })
        let payload = {
            "context":
                {
                    "domain": category.domain,
                    "action": "on_search",
                    "country": "IND",
                    "city": "std:080",
                    "core_version": "1.2.0",
                    "bap_id": "ref-app-buyer-dev-internal.ondc.org",
                    "bap_uri": "https://ref-app-buyer-dev-internal.ondc.org/protocol/v1",
                    "bpp_uri": "https://ref-app-seller-dev-internal.ondc.org",
                    "transaction_id": "323e2894-82b9-4577-bf7a-19bd85a5dcdf",
                    "message_id": "bf1104c9-0ad3-4bcf-b45d-d74c38ea4764",
                    "timestamp": new Date(),
                    "ttl": "PT30S"
                },
            "message":
                {
                    "catalog":
                        {
                            "bpp/providers":
                                [
                                    {
                                        "id": data.organization,
                                        "time":
                                            {
                                                "label": "disable",
                                                "timestamp": new Date()
                                            }
                                    }
                                ]
                        }
                }
        }
        this.postItemUpdateRequest(payload);
        return {success: true};
    }

}

export default OndcService;
