exports.getProducts = async (data) => {

    let productAvailable = []
    for(items of data.data.data){

        let items =  {
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
        productAvailable.push(items)
    }

    //set product items to schema

    const schema = {
        "context": {...data.context,"bpp_id": "sandboxapi.signcatch.com/ondc",
            "bpp_uri": "https://sandboxapi.signcatch.com/ondc/"},
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
                        "id": "d7a4ce6b-0168-4e42-8b2f-84688e5f25ab",
                        "descriptor": {
                            "name": "Dharmpal Store",
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