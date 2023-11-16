const config = require("../../lib/config");
const logger = require("../../lib/logger");

const BPP_ID = config.get("sellerConfig").BPP_ID
const BPP_URI = config.get("sellerConfig").BPP_URI

exports.getProducts = async (data) => {

    data.context.timestamp = new Date();
    let bppDetails ={}
    let bppProviders =[]
    for(const org of data?.data){
        let tags =[]
        let productAvailable = []
        org.storeDetails.address.street = org.storeDetails.address.locality
        delete org.storeDetails.address.locality
        delete org.storeDetails.address.building
        delete org.storeDetails.address.country
        for(let items of org.items){
            let item =  {
                "id": items._id,
                "descriptor": {
                    "name": items.productName,
                    "symbol": items.images[0],
                    "short_desc": items.description,
                    "long_desc": items.longDescription,
                    "images": items.images
                },
                "price": {
                    "currency": "INR",
                    "value":  items.MRP+"",
                    "maximum_value": items.MRP+""
                },
                "quantity": {
                    "available": {
                        "count": `${items.quantity}`
                    },
                    "maximum": {
                        "count": (items.quantity<=items.maxAllowedQty)?`${items.quantity}`:`${items.maxAllowedQty}`
                    }
                },
                "category_id": items.productSubcategory1??"NA",
                "location_id": org.storeDetails?.location._id??"0",
                "fulfillment_id": '1',//Delivery
                "matched": true,
                "@ondc/org/returnable":  items.isReturnable??false,
                "@ondc/org/cancellable":  items.isCancellable??false,
                "@ondc/org/available_on_cod": items.availableOnCod,
                "@ondc/org/time_to_ship": "PT1H", //TODO: hard coded
                "@ondc/org/seller_pickup_return": true,
                "@ondc/org/return_window": items.returnWindow,
                "@ondc/org/contact_details_consumer_care": `${org.name},${org.storeDetails.supportDetails.email},${org.storeDetails.supportDetails.mobile}`,
                "@ondc/org/mandatory_reqs_veggies_fruits": {
                    "net_quantity": items.packQty
                },
                "@ondc/org/statutory_reqs_packaged_commodities":
                    {
                        "manufacturer_or_packer_name":items.manufacturerName,
                        "manufacturer_or_packer_address":items.manufacturerOrPackerAddress,
                            "common_or_generic_name_of_commodity":items.productName,
                            "net_quantity_or_measure_of_commodity_in_pkg":items.packQty,
                        "month_year_of_manufacture_packing_import":items.manufacturedDate
                    },
                "@ondc/org/statutory_reqs_prepackaged_food":
                    {
                        "nutritional_info":items.nutritionalInfo,
                        "additives_info":items.additiveInfo,
                        "brand_owner_FSSAI_license_no":items.brandOwnerFSSAILicenseNo??"NA",
                        "other_FSSAI_license_no":items.importerFSSAILicenseNo??"NA",
                        "importer_FSSAI_license_no":items.importerFSSAILicenseNo??"NA"
                    },
                "tags":
                    {
                        "veg":items.isVegetarian?'yes':'no',
                        "non_veg":items.isVegetarian?'no':'yes'
                    }

        }

               tags.push(
                {
                    "code": "serviceability",
                    "list": [
                        {
                            "code": "location",
                            "value": org.storeDetails?.location._id??"0"
                        },
                        {
                            "code": "category",
                            "value": items.productSubcategory1??"NA"
                        },
                        {
                            "code": "type",
                            "value": "12" //Enums are "10" - hyperlocal, "11" - intercity, "12" - pan-India

                        },
                        {
                            "code": "val",
                            "value": "IND"
                        },
                        {
                            "code": "unit",
                            "value": "country"
                        }
                    ]
                })
            productAvailable.push(item)
        }

        bppDetails = {
            "name": org.name,
                "symbol": org.storeDetails.logo,
                "short_desc": "", //TODO: mark this for development
                "long_desc": "",
                "images": [
                    org.storeDetails.logo
            ]
        },
        bppProviders.push(            {
            "id": org._id,
            "descriptor": {
                "name": org.name,
                "symbol": org.storeDetails.logo,
                "short_desc": "",
                "long_desc": "",
                "images": [
                    org.storeDetails.logo
                ]
            },
            "time":
                {
                    "label":"enable",
                    "timestamp":data.context.timestamp
                },
            "locations": [
                {
                    "id": org.storeDetails?.location._id??"0", //org.storeDetails.location._id
                    "gps": `${org.storeDetails?.location?.lat??"0"},${org.storeDetails?.location?.long??"0"}`,
                    "address":{
                        "city": org.storeDetails?.address?.city??"NA",
                        "state": org.storeDetails?.address?.state??"NA",
                        "area_code": org.storeDetails?.address?.area_code??"NA",
                        "street": org.storeDetails?.address?.street??"NA",
                        "locality":org.storeDetails?.address?.locality??"NA"
                    },
                    "time":
                        {
                            "days":org.storeDetails?.storeTiming?.days?.join(",")??
                                "1,2,3,4,5,6,7",
                            "schedule": {
                                "holidays": org.storeDetails?.storeTiming?.schedule?.holidays?? [],
                                "frequency": org.storeDetails?.storeTiming?.schedule?.frequency??"",
                                "times": org.storeDetails?.storeTiming?.schedule?.times?.map((str)=>{
                                    return str.replace(':','')
                                })??[]
                            },
                            "range": {
                                "start": org.storeDetails?.storeTiming?.range?.start?.replace(':','')??"0000",
                                "end": org.storeDetails?.storeTiming?.range?.end?.replace(':','')??"2300"
                            }
                    },
                    "circle":
                        {
                            "gps":`${org.storeDetails?.location?.lat??"0"},${org.storeDetails?.location?.long??"0"}`,
                            "radius":org.storeDetails?.radius??
                                {
                                    "unit":"km",
                                    "value":"3"
                                }
                        }
                }
            ],
            "ttl": "PT24H",
            "items": productAvailable,
            "fulfillments":
                [
                    {
                        "contact":
                            {
                                "phone":org.storeDetails.supportDetails.mobile,
                                "email":org.storeDetails.supportDetails.email
                            }
                    }
                ],
            "tags":tags,
            "@ondc/org/fssai_license_no": org.FSSAI
        })

    }

    //set product items to schema

    let context = data.context
    context.bpp_id =BPP_ID
    context.bpp_uri =BPP_URI
    context.action ='on_search'
    const schema = {
        "context": {...context},
        "message": {
            "catalog": {
                "bpp/fulfillments"://TODO: mark this for development- set provider level
                    [
                        {
                            "id":"1",
                            "type":"Delivery"
                        },
                        {
                            "id":"2",
                            "type":"Self-Pickup"
                        },
                        {
                            "id":"3",
                            "type":"Delivery and Self-Pickup"
                        }
                    ],
                "bpp/descriptor": bppDetails,
                "bpp/providers": bppProviders
            }
        }
    }



    return schema



}



exports.getSelect = async (data) => {

    try{
        logger.log('info', `[Schema mapping ] build retail select request from :`, data);

        let productAvailable = []
        //set product items to schema

        let context = data.context
        context.bpp_id =BPP_ID
        context.bpp_uri =BPP_URI
        context.action ='on_select'
        let error
        if(!data.isQtyAvailable){
            error = {
                error:
                    {
                        type:"DOMAIN-ERROR",
                        code:"40002"
                    }}

        }
        if(!data.isServiceable){
            error = {
                error:
                    {
                        type:"DOMAIN-ERROR",
                        code:"30009"
                    }}

        }
        const schema = {
            "context": {...context,timestamp: new Date()},
            "message": {
                "order": {
                    "provider":data.order.provider,
                    "fulfillments":data.order.fulfillments,
                    "quote": {
                        "price":data.totalPrice,
                        "breakup": data.detailedQoute,
                        "ttl": "P1D"
                    },
                    "items": data.qouteItems
                }
            }
        }
        if(error){
            schema.error = error.error
        }

        logger.log('info', `[Schema mapping ] after build retail select request :`, schema);

        return schema
    }catch (e) {
        console.log(e)
    }


}

exports.getInit = async (data) => {

    let productAvailable = []
    //set product items to schema

    console.log("data.message.order.provider",data.message.order)
    console.log("data.message.order.provider_location",data.message.order.provider_location)
    console.log("data.message.order.billing",data.message.order.billing)
    console.log("data.message.order.fulfillments",data.message.order.fulfillments)
    console.log("data.message.order.payment",data.message.order.payment)
    let context = data.context
    context.bpp_id =BPP_ID
    context.bpp_uri =BPP_URI
    context.action ='on_init'
    const schema = {
        "context": {...context,timestamp:new Date()},
        "message":  {
            "order": {
                "provider":data.message.order.provider,
                "provider_location": {id:data.message.order.provider.locations[0].id},
                "items": data.qouteItems,
                "billing": data.message.order.billing,
                "fulfillments": data.message.order.fulfillments,
                "quote":{
                    "price":data.totalPrice,
                    "breakup": data.detailedQoute,
                    "ttl": "P1D"
                },
                "payment": data.message.order.payment
            }
        }
    }



    return schema

}

exports.getStatus = async (data) => {

    let productAvailable = []
    //set product items to schema

    // console.log("data.message.order.provider",data.message.order)
    // console.log("data.message.order.provider_location",data.message.order.provider_location)
    // console.log("data.message.order.billing",data.message.order.billing)
    // console.log("data.message.order.fulfillments",data.message.order.fulfillments)
    // console.log("data.message.order.payment",data.message.order.payment)
    let context = data.context
    context.bpp_id =BPP_ID
    context.bpp_uri =BPP_URI
    context.action ='on_status'

    console.log("status------context>",context)
    const schema = {
        "context": {...context,timestamp:new Date()},
        "message":  {
            "order": {
                "provider":{"id":data.updateOrder.organization,        "locations":
                        [
                            {
                                "id":"641599b84d433a4fbf8f40bb" //TODO: Hard coded
                            }
                        ]
                },
                "state":data.updateOrder.state,
                "items": data.updateOrder.items,
                "billing": data.updateOrder.billing,
                "fulfillments": data.updateOrder.fulfillments,
                "quote":  data.updateOrder.quote,
                "payment": data.updateOrder.payment,
                 "id" :  data.updateOrder.order_id,
                 "created_at":context.timestamp,
                 "updated_at":context.timestamp,
            }
        }
    }



    return schema

}

exports.getUpdate = async (data) => {

    let productAvailable = []
    //set product items to schema

    // console.log("data.message.order.provider",data.message.order)
    // console.log("data.message.order.provider_location",data.message.order.provider_location)
    // console.log("data.message.order.billing",data.message.order.billing)
    // console.log("data.message.order.fulfillments",data.message.order.fulfillments)
    // console.log("data.message.order.payment",data.message.order.payment)
    let context = data.context
    context.bpp_id =BPP_ID
    context.bpp_uri =BPP_URI
    context.action ='on_update'
    const schema = {
        "context": {...context,timestamp:new Date()},
        "message":  {
            "order": {
                "provider":{"id":data.updateOrder.organization},
                "state":data.updateOrder.state,
                "items": data.updateOrder.items,
                "billing": data.updateOrder.billing,
                "fulfillments": data.updateOrder.fulfillments,
                "quote":  data.updateOrder.quote,
                "payment": data.updateOrder.payment,
                 "id" :  data.updateOrder.id
            }
        }
    }



    return schema

}

exports.getCancel = async (data) => {

    let productAvailable = []
    //set product items to schema

    // console.log("data.message.order.provider",data.message.order)
    // console.log("data.message.order.provider_location",data.message.order.provider_location)
    // console.log("data.message.order.billing",data.message.order.billing)
    // console.log("data.message.order.fulfillments",data.message.order.fulfillments)
    // console.log("data.message.order.payment",data.message.order.payment)
    let context = data.context
    context.bpp_id =BPP_ID
    context.bpp_uri =BPP_URI
    context.action ='on_cancel'
    const schema = {
        "context": {...context,timestamp:new Date()},
        "message":  {
            "order": {
                "state":data.updateOrder.state,
                "id" :  data.updateOrder.id,
                "tags":{cancellation_reason_id:data.updateOrder.cancellation_reason_id}
            }
        }
    }



    return schema

}

exports.getTrack = async (data) => {

    let productAvailable = []
    //set product items to schema

    let context = data.context
    context.bpp_id =BPP_ID
    context.bpp_uri =BPP_URI
    context.action ='on_track'
    const schema = {
        "context": {...context,timestamp:new Date()},
        "message":  {
            "tracking":
                    data.logisticData.message.tracking

        }
    }
    return schema

}
exports.getSupport = async (data) => {

    let productAvailable = []
    //set product items to schema

    let context = data.context
    context.bpp_id =BPP_ID
    context.bpp_uri =BPP_URI
    context.action ='on_support'
    const schema = {
        "context": {...context,timestamp:new Date()},
        "message":  data.logisticData.message

    }
    return schema

}
exports.getConfirm = async (data) => {

    let productAvailable = []
    //set product items to schema
    let context = data.context
    context.timestamp=new Date()
    context.bpp_id =BPP_ID
    context.bpp_uri =BPP_URI
    context.action ='on_confirm'
    const schema = {
        "context": {...context},
        "message":  {
            "order": {
                "id":data.message.order.order_id,
                "state":"Created",
                "provider": data.message.order.provider,
                "items": data.qouteItems,
                "billing": data.message.order.billing,
                "fulfillments": data.message.order.fulfillments,
                "quote":data.message.order.quote,
                "payment": data.message.order.payment,
                "created_at":data.message.order.created_at, //TODO: this needs to be persisted
                "updated_at":data.message.order.created_at
            }
        }
    }

    return schema

}
