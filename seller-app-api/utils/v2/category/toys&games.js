import config from "../../../lib/config";
import {FIELD_ALLOWED_BASED_ON_PROTOCOL_KEY} from '../../constants'

const BPP_ID = config.get("sellerConfig").BPP_ID
const BPP_URI = config.get("sellerConfig").BPP_URI

export async function mapToysnGamesData(data) {

    let orgCatalogs = []
    data.context.timestamp = new Date();

    for (const org of data?.data) {
        let bppDetails = {}
        let bppProviders = []
        let tags = []
        let productAvailable = []
        org.storeDetails.address.street = org.storeDetails.address.locality
        delete org.storeDetails.address.locality
        delete org.storeDetails.address.building
        delete org.storeDetails.address.country
        let categories = [];
        let variantGroupSequence = 1
        for (let items of org.items) {
            if (items.variantGroup) {

                let category = {
                    "id": items.variantGroup._id,
                    "descriptor": {
                        "name": 'Variant Group '+ variantGroupSequence//Fixme: name should be human readable
                    },
                    "tags": [
                        {
                            "code": "type",
                            "list": [
                                {
                                    "code": "type",
                                    "value": "variant_group"
                                }
                            ]
                        }
                    ]
                }
                if(items.variantGroup.name && items.variantGroup.name.length > 0){
                    for (let i=0; i < items.variantGroup.name.length; i++) {
                        category.tags.push({
                            "code": "attr",
                            "list": [
                                {
                                    "code": "name",
                                    "value": `item.tags.attribute.${items.variantGroup.name[i]}`
                                },
                                {
                                    "code": "seq",
                                    "value": `${i+1}`
                                }
                            ]
                        });
                    }
                    categories.push(category);
                }
            }
            variantGroupSequence=variantGroupSequence+1;
            const customizationDetails = items.customizationDetails;
            if(customizationDetails && customizationDetails.customizationGroups.length === 0){
                let item = itemSchema({...items, org: org})
                productAvailable.push(item)
            }else{
                const customizationGroups = customizationDetails.customizationGroups;
                const customizations = customizationDetails.customizations;
                console.log('start----------------------------------------------->')
                let customGroup = [];
                for(const customizationGroup of customizationGroups){
                    let groupObj = {
                        code: "id",
                        value: customizationGroup.id
                    };
                    customGroup.push(groupObj);
                }
                let item = itemSchemaWithCustomGroup({...items, org: org},customGroup)

                productAvailable.push(item)
                
                for(const customization of customizations){
                    let customizationData = customizationSchema(customization)
                    productAvailable.push(customizationData)
                }
            }
        }
        bppDetails = {
            "name": org.name,
            "symbol": org.storeDetails.logo,
            "short_desc": "", //TODO: mark this for development
            "long_desc": "",
            "images": [
                org.storeDetails.logo
            ]
        }
        bppProviders.push({
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
                    "label": "enable",
                    "timestamp": data.context.timestamp
                },
            "categories": categories,
            "locations": [
                {
                    "id": org.storeDetails?.location._id ?? "0", //org.storeDetails.location._id
                    "gps": `${org.storeDetails?.location?.lat ?? "0"},${org.storeDetails?.location?.long ?? "0"}`,
                    "address": org.storeDetails.address,
                    "time":
                        {
                            "days": org.storeDetails?.storeTiming?.days?.join(",") ??
                                "1,2,3,4,5,6,7",
                            "schedule": {
                                "holidays": org.storeDetails?.storeTiming?.schedule?.holidays ?? [],
                                "frequency": org.storeDetails?.storeTiming?.schedule?.frequency ?? "",
                                "times": org.storeDetails?.storeTiming?.schedule?.times?.map((str) => {
                                    return str.replace(':', '')
                                }) ?? []
                            },
                            "range": {
                                "start": org.storeDetails?.storeTiming?.range?.start?.replace(':', '') ?? "0000",
                                "end": org.storeDetails?.storeTiming?.range?.end?.replace(':', '') ?? "2300"
                            }
                        },
          
                    "circle":
                        {
                            "gps": `${org.storeDetails?.location?.lat ?? "0"},${org.storeDetails?.location?.long ?? "0"}`,
                            "radius": org.storeDetails?.radius ??
                                {
                                    "unit": "km",
                                    "value": "3"
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
                                "phone": org.storeDetails.supportDetails.mobile,
                                "email": org.storeDetails.supportDetails.email
                            }
                    }
                ],
            "tags": tags,
            //"@ondc/org/fssai_license_no": org.FSSAI
        })
        tags.push(
            {
                "code": "serviceability",
                "list": [
                    {
                        "code": "location",
                        "value": org.storeDetails?.location._id ?? "0"
                    },
                    {
                        "code": "category",
                        "value": 'Toys & Games'
                    },
                    {
                        "code": "type",
                        "value": "12" //Enums are "10" - hyperlocal, "11" - intercity, "12" - pan-India
                    },
                    {
                        "code": "type",
                        "value": "10"
                    },
                    {
                        "code": "unit",
                        "value": "km"
                    }
                ]
            })

        let context = data.context
        context.bpp_id = BPP_ID
        context.bpp_uri = BPP_URI
        context.action = 'on_search'
        const schema = {
            "context": {...context},
            "message": {
                "catalog": {
                    "bpp/fulfillments"://TODO: @akshay this will be deprecated in v1.2.0 phase 2,//Note: current values are hard coded for now
                        [
                            {
                                "id": "1",
                                "type": "Delivery"
                            },
                            {
                                "id": "2",
                                "type": "Self-Pickup"
                            },
                            {
                                "id": "3",
                                "type": "Delivery and Self-Pickup"
                            }
                        ],
                    "bpp/descriptor": bppDetails,
                    "bpp/providers": bppProviders
                }
            }
        }
        orgCatalogs.push(schema)

    }

    return orgCatalogs

}


function itemSchema(items) {

    console.log("variant group---->", items)
    let attributes = items.attributes.map((attribute) => {
        return {code: attribute.code, value: attribute.value};
    });
    const allowedStatutoryReq = FIELD_ALLOWED_BASED_ON_PROTOCOL_KEY[items.productSubcategory1];
    const org = items.org;
    let item = {
        "id": items._id,
        "time": {
            "label": "enable",
            "timestamp": items.updatedAt //timestamp for item event;
        },
        "parent_item_id": items.variantGroup ?items.variantGroup._id: '', //need to map variant / customizations
        "descriptor": {
            "name": items.productName,
            "symbol": items.images[0],
            "short_desc": items.description,
            "long_desc": items.longDescription,
            "images": items.images,
            // "code": "", //Optional optional; unique code for item which will be in this format - "type:code" where type is 1 - EAN, 2 - ISBN, 3 - GTIN, 4 - HSN, 5 - UPC, 6 - others;
        },
        "quantity": {
            "unitized": {
                "measure": { //TODO: PENDING to implement at API level
                    "unit": "kilogram",
                    "value": "1"
                }
            },
            "available": {
                "count": `${items.quantity}`
            },
            "maximum": {
                "count": `${items.maxAllowedQty}`
            }
        },
        "price": {
            "currency": "INR",
            "value": items.MRP + "",
            "maximum_value": items.MRP + ""
        },
        "category_id": items.productSubcategory1 ?? "NA",
        "location_id": org.storeDetails?.location._id ?? "0",
        "fulfillment_id":items.fulfilmentId ?? "NA",
        "@ondc/org/returnable": items.isReturnable ?? false,
        "@ondc/org/cancellable": items.isCancellable ?? false,
        "@ondc/org/available_on_cod": items.availableOnCod,
        "@ondc/org/time_to_ship": "PT1H", //TODO: hard coded, Implementation pending
        "@ondc/org/seller_pickup_return": true, //TODO: hard coded, Implementation pending
        "@ondc/org/return_window": items.returnWindow,
        "@ondc/org/contact_details_consumer_care": `${org.name},${org.storeDetails.supportDetails.email},${org.storeDetails.supportDetails.mobile}`,
        "@ondc/org/statutory_reqs_packaged_commodities":
        {
          "manufacturer_or_packer_name":items.manufacturerOrPackerName ?? "NA",
          "manufacturer_or_packer_address":items.manufacturerOrPackerAddress ?? "NA",
          "common_or_generic_name_of_commodity":items.commonOrGenericNameOfCommodity ?? "NA",
          "month_year_of_manufacture_packing_import":items.monthYearOfManufacturePackingImport ?? "NA",
        },

        "tags": [
            {
                "code": "origin", //TODO: Implementation pending
                "list": [
                    {
                        "code": "country",
                        "value": items.countryOfOrigin ?? 'NA'
                    }
                ]
            },
            {
                "code": "attributes",
                "list": attributes
            }
        ]
    }
    return item;

}


function itemSchemaWithCustomGroup(items,customGroup) {
    let attributes = items.attributes.map((attribute) => {
        return {code: attribute.code, value: attribute.value};
    });
    const allowedStatutoryReq = FIELD_ALLOWED_BASED_ON_PROTOCOL_KEY[items.productSubcategory1];
    const org = items.org;
    let item = {
        "id": items._id,
        "time": {
            "label": "enable",
            "timestamp": items.updatedAt //timestamp for item event;
        },
        "parent_item_id": items.variantGroup ?items.variantGroup._id: '', //need to map variant / customizations
        "descriptor": {
            "name": items.productName,
            "symbol": items.images[0],
            "short_desc": items.description,
            "long_desc": items.longDescription,
            "images": items.images,
            // "code": "", //Optional optional; unique code for item which will be in this format - "type:code" where type is 1 - EAN, 2 - ISBN, 3 - GTIN, 4 - HSN, 5 - UPC, 6 - others;
        },
        "quantity": {
            "unitized": {
                "measure": { //TODO: PENDING to implement at API level
                    "unit": "kilogram",
                    "value": "1"
                }
            },
            "available": {
                "count": `${items.quantity}`
            },
            "maximum": {
                "count": `${items.maxAllowedQty}`
            }
        },
        "price": {
            "currency": "INR",
            "value": items.MRP + "",
            "maximum_value": items.MRP + ""
        },
        "category_id": items.productSubcategory1 ?? "NA",
        "location_id": org.storeDetails?.location._id ?? "0",
        "fulfillment_id": items.fulfilmentId ?? "NA",
        "@ondc/org/returnable": items.isReturnable ?? false,
        "@ondc/org/cancellable": items.isCancellable ?? false,
        "@ondc/org/available_on_cod": items.availableOnCod,
        "@ondc/org/time_to_ship": "PT1H", //TODO: hard coded, Implementation pending
        "@ondc/org/seller_pickup_return": true, //TODO: hard coded, Implementation pending
        "@ondc/org/return_window": items.returnWindow,
        "@ondc/org/contact_details_consumer_care": `${org.name},${org.storeDetails.supportDetails.email},${org.storeDetails.supportDetails.mobile}`,
        "@ondc/org/statutory_reqs_packaged_commodities":
        {
          "manufacturer_or_packer_name":items.manufacturerOrPackerName ?? "NA",
          "manufacturer_or_packer_address":items.manufacturerOrPackerAddress ?? "NA",
          "common_or_generic_name_of_commodity":items.commonOrGenericNameOfCommodity ?? "NA",
          "month_year_of_manufacture_packing_import":items.monthYearOfManufacturePackingImport ?? "NA",
        },
        "tags": [
            {
                "code":"type",
                "list":[
                    {
                        "code":"type",
                        "value":"item"
                    }
                ]
            },
            {
                "code":"custom_group",
                "list":customGroup
                
            },
            {
                "code": "origin", //TODO: Implementation pending
                "list": [
                    {
                        "code": "country",
                        "value": items.countryOfOrigin ?? 'NA'
                    }
                ]
            },
            {
                "code": "attributes",
                "list": attributes
            }
        ]
    }
    return item;

}

function customizationSchema(customizations) {
    let data =  {
        "id":customizations.id,
        "descriptor":
        {
          "name":customizations.name
        },
        "quantity":
        {
          "unitized":
          {
            "measure":
            {
              "unit":customizations.UOM ?? 'NA',
              "value":customizations.UOMValue ?? 'NA'
            }
          },
          "available":
          {
            "count":`${customizations.available}` ?? 'NA'
          },
          "maximum":
          {
            "count":`${customizations.maximum}` ?? 'NA'
          }
        },
        "price":
        {
          "currency":"INR",
          "value":customizations.price,
          "maximum_value":"0.0"
        },
        "category_id":"F&B",
        "related":true,
        "tags":
        [
          {
            "code":"type",
            "list":
            [
              {
                "code":"type",
                "value":"customization"
              }
            ]
          },
          {
            "code":"parent",
            "list":
            [
              {
                "code":"id",
                "value":customizations.parent
              },
              {
                "code":"default",
                "value":"yes"
              }
            ]
          },
          {
            "code":"child",
            "list":
            [
              {
                "code":"id",
                "value":customizations.child
              }
            ]
          }
        ]
      };
      return data;
}
