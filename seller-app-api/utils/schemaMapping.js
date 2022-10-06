const config = require("../lib/config");

const BPP_ID = config.get("sellerConfig").BPP_ID
const BPP_URI = config.get("sellerConfig").BPP_URI

exports.getProducts = async (data) => {

    let productAvailable = []
    for(let items of data?.data?.data){

        let item =  {
            "id": items.id,
            "descriptor": {
                "name": items.attributes.name,
                "symbol": "https://awstoazures3.blob.core.windows.net/signcatch-master/production/products/images/10997/1629350300589Oshon-Coffee-Star-Jar-jpg",
                "short_desc": items.attributes.description,
                "long_desc": items.attributes.description,
                "images": [
                    "https://awstoazures3.blob.core.windows.net/signcatch-master/production/products/images/10997/1629350300589Oshon-Coffee-Star-Jar-jpg"
                ]
            },
            "price": {
                "currency": "INR",
                "value":  items.attributes.price
            },
            "location_id": "8fdd9880-3d0c-444a-8038-fb98ec65f7b6",
            "matched": true,
            "@ondc/org/returnable":  items.attributes?.isReturnable??false,
            "@ondc/org/cancellable":  items.attributes?.isCancellable??false,
            "@ondc/org/available_on_cod": true,
            "@ondc/org/time_to_ship": "PT48H"
        }
        productAvailable.push(item)
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
                "bpp/descriptor": {
                    "name": "Bech",
                    "symbol": "https://uploads-ssl.webflow.com/5f5b3175374e04e897cf2a3d/5f5b3175374e04ade4cf2b56_bechbrand.svg",
                    "short_desc": "Made in India SuperApp for Brands, Retailers & Wholesalers",
                    "long_desc": "",
                    "images": [
                        "https://uploads-ssl.webflow.com/5f5b3175374e04e897cf2a3d/5f5b3175374e04ade4cf2b56_bechbrand.svg"
                    ]
                },
                "bpp/providers": [
                    {
                        "id": "afe44f35-fb0c-527b-8a80-a1b0b839197e",
                        "descriptor": {
                            "name": "DataOrc",
                            "symbol": "https://awstoazures3.blob.core.windows.net/aws-product-images-prod/images/profile/991/profile_image_477.png1640236184842",
                            "short_desc": "",
                            "long_desc": "",
                            "images": [
                                "https://awstoazures3.blob.core.windows.net/aws-product-images-prod/images/profile/991/profile_image_477.png1640236184842"
                            ]
                        },
                        "locations": [
                            {
                                "id": "8fdd9880-3d0c-444a-8038-fb98ec65f7b6",
                                "gps": "28.483664, 77.000427"
                            }
                        ],
                        "items": productAvailable
                    }
                ]
            }
        }
    }



    return schema



}



exports.getSelect = async (data) => {

    let productAvailable = []
    //set product items to schema

    let context = data.context
    context.bpp_id =BPP_ID
    context.bpp_uri =BPP_URI
    context.action ='on_select'
    const schema = {
        "context": {...context},
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



    return schema

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
        "context": {...context},
        "message":  {
            "order": {
                "provider":data.message.order.provider,
                "provider_location": data.message.order.provider_location,
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