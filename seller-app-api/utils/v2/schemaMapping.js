import {v4 as uuidv4} from "uuid";

const config = require("../../lib/config");
const logger = require("../../lib/logger");
const {domainNameSpace} = require("../constants");
import {mapGroceryData,mapGroceryDataUpdate} from './category/grocery';
import {mapFashionData,mapFashionDataUpdate} from './category/fashion'
import {mapFnBData,mapFnBDataUpdate} from './category/fnb';
import {mapElectronicsData,mapElectronicsDataUpdate} from './category/electronics';
import {mapHealthnWellnessData,mapHealthnWellnessDataUpdate} from './category/health&wellness';
import {mapHomenDecorData,mapHomenDecorDataUpdate} from './category/home&decor';
import {mapAppliancesData,mapAppliancesDataUpdate} from './category/appliances';
import {mapBPCData,mapBPCDataUpdate} from './category/bpc';
import {mapAgricultureData,mapAgricultureDataUpdate} from './category/agriculture';
import {mapToysnGamesData,mapToysnGamesDataUpdate} from './category/toys&games';
const BPP_ID = config.get("sellerConfig").BPP_ID
const BPP_URI = config.get("sellerConfig").BPP_URI

exports.getProducts = async (data) => {

    //check category and forward request to specific category mapper

    let mappedCatalog = []
    let category = domainNameSpace.find((cat)=>{
        return cat.domain === data.context.domain
    })

    switch (category.name){
        case 'Grocery': {
            mappedCatalog = await mapGroceryData(data);
            break;
        }
        case 'Fashion': {
            mappedCatalog = await mapFashionData(data);
            break;
        }
        case 'F&B': {
            mappedCatalog = await mapFnBData(data);
            break;
        }
        case 'Electronics': {
            mappedCatalog = await mapElectronicsData(data);
            break;
        }
        case 'Health & Wellness': {
            mappedCatalog = await mapHealthnWellnessData(data);
            break;
        }
        case 'Home & Decor': {
            mappedCatalog = await mapHomenDecorData(data);
            break;
        }
        case 'Appliances': {
            mappedCatalog = await mapAppliancesData(data);
            break;
        }
        case 'BPC': {
            mappedCatalog = await mapBPCData(data);
            break;
        }
        case 'Agriculture': {
            mappedCatalog = await mapAgricultureData(data);
            break;
        }
        case 'Toys & Games': {
            mappedCatalog = await mapToysnGamesData(data);
            break;
        }
    }
    return mappedCatalog;

}

exports.getProductUpdate = async (data) => {

    //check category and forward request to specific category mapper

    let mappedCatalog = []
    let category = domainNameSpace.find((cat)=>{
        return cat.domain === data.context.domain
    })

    switch (category.name){
        case 'Grocery': {
            mappedCatalog = await mapGroceryDataUpdate(data);
            break;
        }
        case 'Fashion': {
            mappedCatalog = await mapFashionDataUpdate(data);
            break;
        }
        case 'F&B': {
            mappedCatalog = await mapFnBDataUpdate(data);
            break;
        }
        case 'Electronics': {
            mappedCatalog = await mapElectronicsDataUpdate(data);
            break;
        }
        case 'Health & Wellness': {
            mappedCatalog = await mapHealthnWellnessDataUpdate(data);
            break;
        }
        case 'Home & Decor': {
            mappedCatalog = await mapHomenDecorDataUpdate(data);
            break;
        }
        case 'Appliances': {
            mappedCatalog = await mapAppliancesDataUpdate(data);
            break;
        }
        case 'BPC': {
            mappedCatalog = await mapBPCDataUpdate(data);
            break;
        }
        case 'Agriculture': {
            mappedCatalog = await mapAgricultureDataUpdate(data);
            break;
        }
        case 'Toys & Games': {
            mappedCatalog = await mapToysnGamesDataUpdate(data);
            break;
        }
    }
    return mappedCatalog;

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
                        code:"40002",
                        message:JSON.stringify(data.notInStockError)
                    }}

        }
        if(!data.isServiceable){
            error = {
                error:
                    {
                        type:"DOMAIN-ERROR",
                        code:"30009",
                        message:"Location Serviceability error"
                    }}

        }
        if(!data.isValidOrg){
            error = {
                error:
                    {
                        type:"DOMAIN-ERROR",
                        code:"30001",
                        message:"Provider not found"
                    }}

        }
        if(!data.isValidItem){
            error = {
                error:
                    {
                        type:"DOMAIN-ERROR",
                        code:"30004",
                        message:"Item not found"
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
                "provider":{id:data.message.order.provider.id},
                // "provider_location": {id:data.message.order.provider.locations[0].id},
                "items": data.qouteItems,
                "billing": data.message.order.billing,
                "fulfillments": data.message.order.fulfillments,
                "quote":{
                    "price":data.totalPrice,
                    "breakup": data.detailedQoute,
                    "ttl": "P1D"
                },
                "payment": data.payment,
                "tags":data.tags
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
                 "created_at":data.updateOrder.createdAt, //TODO: should not change
                 "updated_at":data.updateOrder.updatedAt,
                 "documents":data.updateOrder.documents
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
                 "id" :  data.updateOrder.id,
                "created_at":data.updateOrder.createdAt, //TODO: should not change
                "updated_at":context.timestamp,
            }
        }
    }



    return schema

}
exports.getUpdateItem = async (data) => {

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
    context.message_id = uuidv4()
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
                 "id" :  data.updateOrder.orderId,
                "created_at":data.updateOrder.createdAt, //TODO: should not change
                "updated_at":context.timestamp,
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
                "provider":{"id":data.updateOrder.organization},
                "state":data.updateOrder.state,
                "items": data.updateOrder.items,
                "billing": data.updateOrder.billing,
                "fulfillments": data.updateOrder.fulfillments,
                "quote":  data.updateOrder.quote,
                "payment": data.updateOrder.payment,
                "id" :  data.updateOrder.orderId,
                "created_at":data.updateOrder.createdAt, //TODO: should not change
                "updated_at":context.timestamp,
                "cancellation":data.updateOrder.cancellation
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
                "state":"Accepted",
                "provider": data.message.order.provider,
                "items": data.qouteItems,
                "billing": data.message.order.billing,
                "fulfillments": data.fulfillments,
                "quote":data.message.order.quote,
                "payment": data.message.order.payment,
                "tags":data.tags,
                "created_at":data.message.order.created_at,
                "updated_at":new Date() //TODO: send updated DB timestamp
            }
        }
    }

    return schema

}
