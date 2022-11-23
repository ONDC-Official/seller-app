import {v4 as uuidv4} from 'uuid';
import config from "../lib/config";

class LogisticsService {

    async search(payload = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            const order = payload.message.order;

            const searchRequest = {
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
                        "message_id": uuidv4(),
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


            }

            return searchRequest
        } catch (err) {
            throw err;
        }
    }


    async init(context = {}, req = {}) {
        try {
            const {criteria = {}, payment = {}} = req || {};

            const searchRequest = {
                "context":
                    {
                        "domain": "nic2004:60232",
                        "country": "IND",
                        "city": "std:080",
                        "action": "init",
                        "core_version": "1.0.0",
                        "bap_id": "ondc.gofrugal.com/ondc/18275",
                        "bap_uri": "https://ondc.gofrugal.com/ondc/seller/adaptor",
                        "bpp_id": "shiprocket.com/ondc/18275",
                        "bpp_uri": "https://shiprocket.com/ondc",
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
                                        "id": "18275-Provider-1",
                                        "locations":
                                            [
                                                {
                                                    "id": "18275-Location-1"
                                                }
                                            ]
                                    },
                                "items":
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
                                            "type": "CoD",
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
                                                    "contact":
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
                                        "@ondc/org/settlement_details":
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
