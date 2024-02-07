import config from "../../../lib/config";
import {FIELD_ALLOWED_BASED_ON_PROTOCOL_KEY} from './../../constants'
const BPP_ID = config.get("sellerConfig").BPP_ID
const BPP_URI = config.get("sellerConfig").BPP_URI

export async function mapGroceryData(data) {

    let orgCatalogs = []
    data.context.timestamp = new Date();

    for (const org of data?.data?.products) {
        let index = 1;
        let menuData=[];
        const customMenuData = org?.menu;
        if(customMenuData && customMenuData.length >0){
            for (const menu of customMenuData) {
                let menuTags =[];
                menuTags.push({
                    "code":"type",
                    "list":
                    [
                    {
                        "code":"type",
                        "value":"custom_menu"
                    }
                    ]
                });
                if(menu.timings && menu.timings.length>0){
                    const timing = menu.timings[0]
                    menuTags.push(
                        {
                            "code":"timing",
                            "list":[
                                {
                                    "code":"day_from",
                                    "value":`${timing.daysRange.from}`
                                },
                                {
                                    "code":"day_to",
                                    "value":`${timing.daysRange.to}`
                                },
                                {
                                    "code":"time_from",
                                    "value":`${timing.timings[0].from.replace(":","")}`
                                },
                                {
                                    "code":"time_to",
                                    "value":`${timing.timings[0].to.replace(":","")}`
                                }
                            ]
                        },
                    )
                };
                menuTags.push(
                    {
                        "code":"display",
                        "list":
                        [
                        {
                            "code":"rank",
                            "value":`${menu.seq}`
                        }
                        ]
                    }
                );
                let menuDataObj = {
                    "id":menu.id,
                    "parent_category_id":"",
                    "descriptor":
                    {
                    "name" : menu.name,
                    "short_desc":menu.shortDescription,
                    "long_desc":menu.longDescription,
                    "images":menu.images
                    },
                    "tags":menuTags
                };
                menuData.push(menuDataObj)
            }
        }
        let bppDetails = {}
        let bppProviders = []
        let tags = []
        let categories = [];
        let categoryLists = [];
        let tagCatList =[];
        let variantGroupSequence = 1
        let productAvailable = []
        org.storeDetails.address.street = org.storeDetails.address.locality
        delete org.storeDetails.address.locality
        delete org.storeDetails.address.building
        delete org.storeDetails.address.country

        for (let items of org.items) {
            if (items.variantGroup) {
                if(categoryLists.indexOf(items.variantGroup._id)===-1){
                    categoryLists.push(items.variantGroup._id)
                    if (items.variantGroup.variationOn === 'UOM') {
                        let category = {
                            "id": items.variantGroup._id,
                            "descriptor": {
                                "name": 'Variant Group ' + variantGroupSequence//Fixme: name should be human readable
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
                        category.tags.push({
                            "code": "attr",
                            "list": [
                                {
                                    "code": "name",
                                    "value": 'item.quantity.unitized.measure'
                                },
                                {
                                    "code": "seq",
                                    "value": '1'
                                }
                            ]
                        });
                        categories.push(category);
                        variantGroupSequence += 1;
                    } else if (items.variantGroup.variationOn === 'ATTRIBUTES') {
                        let category = {
                            "id": items.variantGroup._id,
                            "descriptor": {
                                "name": 'Variant Group ' + variantGroupSequence//Fixme: name should be human readable
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
                        for (let i = 0; i < items.variantGroup.name.length; i++) {
                            category.tags.push({
                                "code": "attr",
                                "list": [
                                    {
                                        "code": "name",
                                        "value": `item.tags.attribute.${items.variantGroup.name[i]}`
                                    },
                                    {
                                        "code": "seq",
                                        "value": `${i + 1}`
                                    }
                                ]
                            });
                        }
                        categories.push(category);
                        variantGroupSequence += 1;
                    }
                }
            }
            let tagCatExist = tagCatList.find((data)=>{
                return items.productSubcategory1 === data.category
            });
            if(!tagCatExist){
                tagCatList.push({category:items.productSubcategory1});
            }
            if(menuData && menuData.length >0 && index ===1){
                for(const menu of menuData){
                    categories.push(menu)
                } 
                index += 1;
            }
            const customizationDetails = items.customizationDetails;
            if(Object.keys(customizationDetails).length === 0){
                let item = itemSchema({...items, org: org},customMenuData)
                productAvailable.push(item)
            }else{
                const customizationGroups = customizationDetails.customizationGroups;
                const customizations = customizationDetails.customizations;
                let customGroup = [];
                for(const customizationGroup of customizationGroups){
                    let groupObj = {
                        code: "id",
                        value: customizationGroup._id
                    };
                    customGroup.push(groupObj);
                    let categoryGroupObj = {
                        "id":customizationGroup._id,
                        "descriptor":
                        {
                          "name": customizationGroup.name
                        },
                        "tags":
                        [
                          {
                            "code":"type",
                            "list":
                            [
                              {
                                "code":"type",
                                "value":"custom_group"
                              }
                            ]
                          },
                          {
                            "code":"config",
                            "list":
                            [
                              {
                                "code":"min",
                                "value":`${customizationGroup.minQuantity}`
                              },
                              {
                                "code":"max",
                                "value":`${customizationGroup.maxQuantity}`
                              },
                              {
                                "code":"input",
                                "value":`${(customizationGroup.inputType==='input')?'text':'select'}`
                              },
                              {
                                "code":"seq",
                                "value":`${customizationGroup.seq}`
                              }
                            ]
                          }
                        ]
                    };
                    categories.push(categoryGroupObj)
                }
                let item = itemSchemaWithCustomGroup({...items, org: org},customGroup,customMenuData)

                productAvailable.push(item)
                
                for(const customization of customizations){
                    let customizationData = customizationSchema(customization,items)
                    productAvailable.push(customizationData)
                }
            }
        }
        bppDetails = {
            "name": org.name,
            "symbol": org.storeDetails.logo,
            "short_desc": org.name, //TODO: mark this for development
            "long_desc": org.name,
            "images": [
                org.storeDetails.logo
            ],
            "tags":[
                {
                    "code":"bpp_terms",
                    "list":
                    [
                    {
                        "code":"np_type",
                        "value":"MSN"
                    }
                    ]
                }
            ]
        }
        let orgFulfillments = org.storeDetails?.fulfillments ?? []
        orgFulfillments = orgFulfillments.map((fulfillment)=>{
            if(fulfillment.type === 'delivery'){
                fulfillment.type = 'Delivery'
                fulfillment.id = '1'
            }else if(fulfillment.type === 'pickup'){
                fulfillment.type = 'Self-Pickup'
                fulfillment.id = '2'
            }else{
                fulfillment.type = 'Delivery and Self-Pickup'
                fulfillment.id = '3'
            }
            return fulfillment;
        })
        orgFulfillments = orgFulfillments.filter((data)=> data.id !== '3')
        bppProviders.push({
                "id": org._id,
                "descriptor": {
                    "name": org.name,
                    "symbol": org.storeDetails.logo,
                    "short_desc": org.name,//TODO: mark this for development
                    "long_desc": org.name,
                    "images": [
                        org.storeDetails.logo
                    ]
                },
                "time":
                    {
                        "label": "enable",
                        "timestamp": data.context.timestamp
                    },
                "locations": [
                    {
                        "id": org.storeDetails?.location._id ?? "0", //org.storeDetails.location._id
                        "gps": `${org.storeDetails?.location?.lat ?? "0"},${org.storeDetails?.location?.long ?? "0"}`,
                        "address": {
                            "city": org.storeDetails?.address?.city??"NA",
                            "state": org.storeDetails?.address?.state??"NA",
                            "area_code": org.storeDetails?.address?.area_code??"NA",
                            "street": org.storeDetails?.address?.street??"NA",
                            "locality":org.storeDetails?.address?.locality??"NA"
                        },
                        "time":
                            {
                                "label":"enable",
                                "timestamp":data.context.timestamp,
                                "days": org.storeDetails?.storeTiming?.days?.join(",") ??
                                    "1,2,3,4,5,6,7",
                                "schedule": {
                                    "holidays": org.storeDetails?.storeTiming?.schedule?.holidays ?? [],
                                },
                                "range": {
                                    "start": org.storeDetails?.storeTiming?.range?.start?.replace(':', '') ?? "0000",
                                    "end": org.storeDetails?.storeTiming?.range?.end?.replace(':', '') ?? "2300"
                                }
                            },
                        "circle"://TODO: @akshay this will be deprecated in v1.2.0 phase 2,//Note: current values are hard coded for now
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
                "categories": categories,
                "items": productAvailable,
                "fulfillments":orgFulfillments,
                "tags": tags,
                //"@ondc/org/fssai_license_no": org.FSSAI
            })
            for(const tagCat of tagCatList){
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
                                "value": tagCat.category
                            },
                            {
                                "code": "type",
                                "value": "12" //Enums are "10" - hyperlocal, "11" - intercity, "12" - pan-India
                            },
                            {
                                "code": "unit",
                                "value": "country"
                            },
                            {
                                "code": "value",
                                "value": "IND"
                            }
                        ]
                })
            }
        let context = data.context
        context.bpp_id = BPP_ID
        context.bpp_uri = BPP_URI
        context.action = 'on_search'
        const schema = {
            "context": {...context},
            "message": {
                "catalog": {
                    "bpp/fulfillments"://TODO: mark this for development- set provider level
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

export async function mapGroceryDataUpdate(data) {
    let itemObjData = {}; 
    for (const org of data?.data?.products) {
        let productAvailable = []
        for (let items of org.items) {
            const customizationDetails = items.customizationDetails;
            
            if(Object.keys(customizationDetails).length === 0){
                let item = itemSchema({...items, org: org},[])
                productAvailable.push(item)
            }else{
                const customizationGroups = customizationDetails.customizationGroups;
                let customGroup = [];
                for(const customizationGroup of customizationGroups){
                    let groupObj = {
                        code: "id",
                        value: customizationGroup._id
                    };
                    customGroup.push(groupObj);
                }
                let item = itemSchemaWithCustomGroup({...items, org: org},customGroup,[])

                productAvailable.push(item)
            }
            itemObjData = {
                "@ondc/org/statutory_reqs_packaged_commodities":{
                "manufacturer_or_packer_name":items.manufacturerOrPackerName ?? '',
                "manufacturer_or_packer_address":items.manufacturerOrPackerAddress ?? '',
                "common_or_generic_name_of_commodity":items.commonOrGenericNameOfCommodity ?? '',
                "net_quantity_or_measure_of_commodity_in_pkg":items.quantity ?? '',
                "month_year_of_manufacture_packing_import":items.monthYearOfManufacturePackingImport ?? ''
                }
            };
        }
    }
    productAvailable = productAvailable.map((row)=>{
        return {...row,...itemObjData}
    });
    const mappedData = {
        "context": data.context,
        "message":
        {
          "catalog":
          {
            "bpp/providers":
            [
              {
                "id":org._id,
                "items":productAvailable
              }
            ]
          }
        }
      };
      
    return mappedData
}


function itemSchema(items,customMenuData) {

    const allowedStatutoryReq = FIELD_ALLOWED_BASED_ON_PROTOCOL_KEY[items.productSubcategory1];
    const categoryIds = getcategoryIds(items,customMenuData);
    const org = items.org;
    let priceData ={
        currency: "INR",
        value: `${items.MRP}`,
        maximum_value: `${items?.maxMRP ?? items.MRP}`
    };
    if(items.maxMRP && items.maxDefaultMRP){
        let itemtags = [
          {
            code:'range',
            list:
            [
              {
                code:'lower',
                value:`${items.MRP}`
              },
              {
                code:'upper',
                value:`${items.maxMRP}`
              }
            ]
          },
          {
            code:'default_selection',
            list:
            [
              {
                code:'value',
                value:`${items.MRP}`
              },
              {
                code:'maximum_value',
                value:`${items.maxDefaultMRP}`
              }
            ]
          }
        ];
        priceData.tags = itemtags;
    }
    let item = {
        "id": items._id,
        "time": {
            "label": "enable",
            "timestamp": items.updatedAt //timestamp for item event;
        },
        "parent_item_id": items.variantGroup?._id??'', //need to map variant / customizations
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
                    "unit": items.UOM,
                    "value": `${items.UOMValue}`
                }
            },
            "available":
            {
                "count": `${(items?.quantity) ? 99 : 0}`
            },
            "maximum":
            {
                "count": `${(items?.quantity) ? ((items.quantity<=items.maxAllowedQty)?`${items.quantity}`:`${items.maxAllowedQty}`) : 0}`
            }
        },
        "price": priceData,
        "category_ids":categoryIds ?? [],
        "category_id": items.productSubcategory1 ?? "NA",
        "location_id": org.storeDetails?.location._id ?? "0",
        "fulfillment_id": items.fulfilmentId ?? "1",
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
        "@ondc/org/statutory_reqs_prepackaged_food":
        {
          "nutritional_info":items.nutritionalInfo ?? "NA",
          "additives_info":items.additiveInfo ?? "NA",
          "brand_owner_FSSAI_license_no":items.brandOwnerFSSAILicenseNo ?? "NA",
          "other_FSSAI_license_no":items.brandOwnerFSSAILicenseNo ?? "NA",
          "importer_FSSAI_license_no":items.importerFSSAILicenseNo ?? "NA"
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
            },{
                "code":"type",
                "list":[
                    {
                        "code":"type",
                        "value":"item"
                    } 
                ]
            },
            {
                "code": "veg_nonveg",
                "list": [
                    {
                        "code": items.isVegetarian ? 'veg' : 'nonveg',
                        "value": items.isVegetarian ? 'yes' : 'yes'
                    }
                ]
            }
        ]
    }

    // if(allowedStatutoryReq==='@ondc/org/statutory_reqs_prepackaged_food'){
    //     item['@ondc/org/statutory_reqs_prepackaged_food'] ={
    //         "nutritional_info": items.nutritionalInfo,
    //         "additives_info": items.additiveInfo,
    //         "brand_owner_FSSAI_license_no": items.brandOwnerFSSAILicenseNo ?? "NA",
    //         "other_FSSAI_license_no": items.importerFSSAILicenseNo ?? "NA",
    //         "importer_FSSAI_license_no": items.importerFSSAILicenseNo ?? "NA",
    //         "imported_product_country_of_origin": "IND" //TODO: Implementation pending
    //     }
    // }
    if(allowedStatutoryReq==='ondc/org/statutory_reqs_packaged_commodities'){
        item['ondc/org/statutory_reqs_packaged_commodities'] ={
            "manufacturer_or_packer_name": items.manufacturerName,
            "manufacturer_or_packer_address": items.manufacturerOrPackerAddress,
            "common_or_generic_name_of_commodity": items.productName,
            "net_quantity_or_measure_of_commodity_in_pkg": `${items.packQty}`,
            "month_year_of_manufacture_packing_import": items.manufacturedDate,
            "imported_product_country_of_origin": "IND" //TODO: Implementation pending
        }
    }
    // if(allowedStatutoryReq==='@ondc/org/mandatory_reqs_veggies_fruits'){
    //     item['@ondc/org/mandatory_reqs_veggies_fruits'] =
    //     {
    //         "net_quantity": `${items.packQty}`
    //     }
    // }

    return item;

}

function itemSchemaWithCustomGroup(items,customGroup,customMenuData) {
    let attributes = items.attributes.map((attribute) => {
        return {code: attribute.code, value: attribute.value};
    });
    const allowedStatutoryReq = FIELD_ALLOWED_BASED_ON_PROTOCOL_KEY[items.productSubcategory1];
    const categoryIds = getcategoryIds(items,customMenuData);
    const org = items.org;
    let priceData ={
        currency: "INR",
        value: `${items.MRP}`,
        maximum_value: `${items?.maxMRP ?? items.MRP}`
    };
    if(items.maxMRP && items.maxDefaultMRP){
        let itemtags = [
          {
            code:'range',
            list:
            [
              {
                code:'lower',
                value:`${items.MRP}`
              },
              {
                code:'upper',
                value:`${items.maxMRP}`
              }
            ]
          },
          {
            code:'default_selection',
            list:
            [
              {
                code:'value',
                value:`${items.MRP}`
              },
              {
                code:'maximum_value',
                value:`${items.maxDefaultMRP}`
              }
            ]
          }
        ];
        priceData.tags = itemtags;
    }
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
                    "unit": items.UOM,
                    "value": `${items.UOMValue}`
                }
            },
            "available":
            {
                "count": `${(items?.quantity) ? 99 : 0}`
            },
            "maximum":
            {
                "count": `${(items?.quantity) ? ((items.quantity<=items.maxAllowedQty)?`${items.quantity}`:`${items.maxAllowedQty}`) : 0}`
            }
        },
        "price": priceData,
        "category_ids":categoryIds ?? [],
        "category_id": items.productSubcategory1 ?? "NA",
        "location_id": org.storeDetails?.location._id ?? "0",
        "fulfillment_id": items.fulfilmentId ?? "1",
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
                "code": "attribute",
                "list": attributes
            }
        ]
    }
    return item;

}

function customizationSchema(customizations,item) {
    let customizationTag = [];
    customizationTag.push(
        {
        "code":"type",
        "list":
        [
            {
            "code":"type",
            "value":"customization"
            }
        ]
        }
    );
    if(customizations.parentId){
        customizationTag.push(
            {
            "code":"parent",
            "list":
            [
                {
                    "code":"id",
                    "value":`${customizations.parentId}`
                },
                {
                    "code":"default",
                    "value":(customizations.default === 'Yes' ?'yes' : 'no')
                }
            ]
            }
        )
    }
    if(customizations.childId){
        customizationTag.push(
            {
            "code":"child",
            "list":
            [
            {
                "code":"id",
                "value":`${customizations.childId}`
            }
            ]
        });
    }
    customizationTag.push(
      {
        "code":"veg_nonveg",
        "list":
        [
          {
            "code": (customizations.vegNonVeg === 'VEG' ?'veg' :(customizations.vegNonVeg === 'NONVEG' ? 'non_veg' : 'egg')) ?? 'NA',
            "value":"yes"
          }
        ]
      }
    );
    let data =  {
        "id":customizations._id,
        "descriptor":
        {
          "name":customizations.productName
        },
        "quantity":
        {
          "unitized":
          {
            "measure":
            {
              "unit":customizations.UOM ?? 'NA',
              "value":`${customizations.UOMValue}` ?? 'NA'
            }
          },
          "available":
          {
              "count": `${(customizations?.quantity) ? 99 : 0}`
          },
          "maximum":
          {
              "count": `${(customizations?.quantity) ? customizations?.maxAllowedQty : 0}`
          }
        },
        "price":
        {
          "currency":"INR",
          "value":`${customizations.MRP}`,
          "maximum_value":`${customizations.MRP}`
        },
        "category_id":item.productCategory ?? "NA",
        "related":true,
        "tags":customizationTag
      };
      return data;
}

function getcategoryIds(items,customMenuData){
    let categoryIds =[];
    if(customMenuData && customMenuData.length >0){
        for(const menu of customMenuData){
            if(menu.products && menu.products.length  >0){
                let menuProduct = menu.products.find((product)=>{
                    return product.id === items._id
                });
                if(menuProduct?.seq){
                    const categoryIdData = `${menu.id}:${menuProduct?.seq}`
                    categoryIds.push(categoryIdData)
                }
            }
        }
    }
    return categoryIds;
}