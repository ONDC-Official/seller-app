import { v1 as uuidv1 } from "uuid";
import MESSAGES from "../../../../lib/utils/messages";
import Organization from "../../models/organization.model";
import User from "../../models/user.model";
import UserService from "./user.service";
import {
    NoRecordFoundError,
    DuplicateRecordFoundError,
    BadRequestParameterError,
} from "../../../../lib/errors";
import s3 from "../../../../lib/utils/s3Utils";
import HttpRequest from "../../../../lib/utils/HttpRequest";
import { mergedEnvironmentConfig } from "../../../../config/env.config";
import Product from "../../../product/models/product.model";
import ProductAttribute from "../../../product/models/productAttribute.model";
import CustomizationGroupMapping from "../../../customization/models/customizationGroupMappingModel";
import CustomMenu from "../../../product/models/customMenu.model";
import CustomMenuProduct from "../../../product/models/customMenuProduct.model";
import CustomMenuTiming from "../../../product/models/customMenuTiming.model";
import CustomizationService from "../../../customization/v1/services/customizationService";
import CustomizationGroup from "../../../customization/models/customizationGroupModel";
import ProductService from "../../../product/v1/services/product.service";
//import axios from 'axios';
//import ServiceApi from '../../../../lib/utils/serviceApi';

const userService = new UserService();
class OrganizationService {
    async getOrgsDetailsForOndc(orgId) {
        // return the entire store details in the format of ProviderSchema
        try {
            const customizationService = new CustomizationService();
            const productService = new ProductService();

            let query = {};

            let orgs;
            if (orgId) {
                orgs = await Organization.find({ _id: orgId }).lean();
            } else {
                orgs = await Organization.find().lean();
            }
            let providers = [];

            for (const org of orgs) {
                let provider = {};
                const store = org.storeDetails;
                const storeLogo = await s3.getSignedUrlForRead({
                    path: store.logo,
                });
                provider.provider_id = org._id;
                provider.ttl = "1"; // @TODO - what is this?
                provider.on_network_logistics = true; // @TODO - what is this?
                provider.tags = []; // @TODO - handle
                provider.offers = {}; // @TODO - handle
                provider.time = {
                    label: "enabled",
                };
                provider.details = {
                    descriptor: {
                        name: org.name,
                        short_desc: org.name,
                        long_desc: org.name,
                        images: [storeLogo.url],
                        tags: [],
                    },
                    "@ondc/org/fssai_license_no": org.FSSAI,
                };
                provider.locations = {
                    [store.location._id]: {
                        id: store.location._id.toString(),
                        gps: store.location.lat + "," + store.location.long,
                        address: {
                            locality: store.address.locality,
                            street: store.address.building, // @TODO - street is not there
                            city: store.address.city,
                            area_code: store.address.area_code,
                            state: store.address.state,
                        },
                        circle: {
                            gps: store.location.lat + "," + store.location.long,
                            radius: store.radius,
                        },
                        contact: {
                            phone: store.supportDetails.mobile,
                        },
                    },
                };

                provider.fulfillments = {};
                for (const fulfillment of store.fulfillments) {
                    provider.fulfillments[fulfillment.id] = {
                        id: fulfillment.id.toString(),
                        type: fulfillment.type,
                        contact: {
                            phone: fulfillment.contact.phone,
                            mail: fulfillment.contact.email,
                        },
                    };
                }

                let categories = {};
                let items = {};

                let customMenu = [];
                query.organization = org._id;
                query.published = true;

                const timingTags = {
                    code: "timing",
                    list: [
                        {
                            code: "day_from",
                            value: store.storeTiming.enabled[0].daysRange.from,
                        },
                        {
                            code: "day_to",
                            value: store.storeTiming.enabled[0].daysRange.to,
                        },
                        {
                            code: "time_from",
                            value: store.storeTiming.enabled[0].timings[0].from,
                        },
                        {
                            code: "time_to",
                            value: store.storeTiming.enabled[0].timings[0].to,
                        },
                    ],
                };

                // query.productName = {$regex: params.message.intent.item.descriptor.name,$options: 'i'}
                //let product = await Product.findOne({_id:productId,organization:currentUser.organization}).populate('variantGroup').lean();

                const data = await Product.find(query)
                    .populate("variantGroup")
                    .sort({ createdAt: 1 })
                    .lean();
                if (data.length > 0) {
                    for (let product of data) {
                        let productDetails = product;
                        let images = [];
                        for (const image of productDetails.images) {
                            let imageData = await s3.getSignedUrlForRead({
                                path: image,
                            });
                            images.push(imageData.url);
                        }
                        product.images = images;
                        let attributeData = [];
                        const attributes = await ProductAttribute.find({
                            product: product._id,
                        });
                        for (const attribute of attributes) {
                            let value = attribute.value;
                            if (attribute.code === "size_chart") {
                                let sizeChart = await s3.getSignedUrlForRead({
                                    path: attribute.value,
                                });
                                value = sizeChart?.url ?? "";
                            }
                            const attributeObj = {
                                code: attribute.code,
                                value: value,
                            };
                            attributeData.push(attributeObj);
                        }
                        product.attributes = attributeData;
                        const customizationDetails =
                            (await customizationService.mappdedData(
                                product.customizationGroupId,
                                { organization: product.organization }
                            )) ?? {};
                        product.customizationDetails = customizationDetails;

                        let customGroupsTags = [];
                        if (Object.keys(customizationDetails).length > 0) {
                            const accumulatedMaxMRP =
                                await productService.getMaxMRP(
                                    product.customizationGroupId,
                                    {
                                        maxMRP: product.MRP,
                                        maxDefaultMRP: product.MRP,
                                    },
                                    { organization: product.organization }
                                );
                            product.maxMRP =
                                accumulatedMaxMRP?.maxMRP ?? product.MRP;
                            product.maxDefaultMRP =
                                accumulatedMaxMRP?.maxDefaultMRP ?? product.MRP;

                            let customizationGroups =
                                customizationDetails.customizationGroups;

                            for (const customizationGroup of customizationGroups) {
                                let cgId = customizationGroup._id.toString();
                                // if cgId is present as key in categories then skip
                                if (categories[cgId]) {
                                    continue;
                                }

                                categories[cgId] = {
                                    id: cgId,
                                    descriptor: {
                                        name: customizationGroup.name,
                                    },
                                    tags: [
                                        {
                                            code: "type",
                                            list: [
                                                {
                                                    code: "type",
                                                    value: "custom_group",
                                                },
                                            ],
                                        },
                                        {
                                            code: "config",
                                            list: [
                                                {
                                                    code: "min",
                                                    value: customizationGroup.minQuantity,
                                                },
                                                {
                                                    code: "max",
                                                    value: customizationGroup.maxQuantity,
                                                },
                                                {
                                                    code: "input",
                                                    value: customizationGroup.inputType,
                                                },
                                                {
                                                    code: "seq",
                                                    value: customizationGroup.seq,
                                                },
                                            ],
                                        },
                                    ],
                                };

                                customGroupsTags.push({
                                    code: "id",
                                    value: cgId,
                                });
                            }
                            for (const customizationGroup of customizationGroups) {
                                let cgId = customizationGroup._id.toString();

                                // if cgId is already present in customGroupsTags then skip
                                if (
                                    customGroupsTags.find(
                                        (cgt) => cgt.value === cgId
                                    )
                                ) {
                                    continue;
                                }

                                customGroupsTags.push({
                                    code: "id",
                                    value: cgId,
                                });
                            }
                        }

                        // console.log("product", product);
                        let parentCGId = "";
                        let childCGId = "";
                        let isDefault;
                        if (product.type === "customization") {
                            // get the customization
                            const customizationMap =
                                await CustomizationGroupMapping.findOne({
                                    customization: product._id,
                                });

                            parentCGId = customizationMap.parent;
                            isDefault = customizationMap.default;
                            childCGId = customizationMap.child;
                        }

                        const product_id = product._id.toString();

                        if (!items[product_id]) {
                            items[product_id] = {
                                id: product_id,
                                descriptor: {
                                    name: product.productName,
                                    short_desc: product.description,
                                    long_desc: product.longDescription,
                                    images: product.images,
                                    symbol: product.images[0],
                                },
                                quantity: {
                                    unitized: {
                                        measure: {
                                            unit: product.UOM,
                                            value: product.UMOValue,
                                        },
                                    },
                                    available: {
                                        count: product.quantity,
                                    },
                                    maximum: {
                                        count: product.maxAllowedQty,
                                    },
                                },
                                price: {
                                    currency: "INR",
                                    value: product.purchasePrice,
                                    maximum_value: product.MRP,
                                },
                                category_id: product.productCategory,
                                category_ids: [], // @TODO
                                fulfillment_id: store.fulfillments.find(
                                    (f) => f.type === product.fulfillmentOption
                                )?.id,
                                location_id: store.location._id.toString(),
                                related: false, // @TODO what is it?
                                recommended: false, // @TODO what is it?
                                "@ondc/org/returnable": product.isReturnable,
                                "@ondc/org/cancellable": product.isCancellable,
                                "@ondc/org/return_window": product.returnWindow,
                                "@ondc/org/seller_pickup_return": false, // @TODO what is it?
                                "@ondc/org/time_to_ship": "PT45M", // @TODO what is it?
                                "@ondc/org/available_on_cod":
                                    product.availableOnCod,
                                "@ondc/org/contact_details_consumer_care":
                                    store.supportDetails.email +
                                    ", " +
                                    store.supportDetails.mobile,
                                tags: [
                                    {
                                        code: "type",
                                        list: [
                                            {
                                                code: "type",
                                                value: product.type,
                                            },
                                        ],
                                    },
                                    ...(product.type === "item"
                                        ? [
                                              {
                                                  code: "custom_group",
                                                  list: customGroupsTags,
                                              },
                                              timingTags,
                                          ]
                                        : [
                                              {
                                                  code: "parent",
                                                  list: [
                                                      {
                                                          code: "id",
                                                          value: parentCGId,
                                                      },
                                                      {
                                                          code: "default",
                                                          value: isDefault
                                                              ? "yes"
                                                              : "no",
                                                      },
                                                  ],
                                              },

                                              ...(childCGId && [
                                                  {
                                                      code: "child",
                                                      list: [
                                                          {
                                                              code: "id",
                                                              value: childCGId,
                                                          },
                                                      ],
                                                  },
                                              ]),
                                          ]),

                                    {
                                        code: "veg_nonveg",
                                        list: [
                                            {
                                                code: "veg",
                                                value:
                                                    // make verNonVeg lowercase and only checkg the first 3 letters
                                                    product.vegNonVeg
                                                        ?.toLowerCase()
                                                        .substring(0, 3) ===
                                                    "veg"
                                                        ? "yes"
                                                        : "no",
                                            },
                                        ],
                                    },
                                ],
                            };
                        }
                    }
                    // getting Menu for org ->
                    let menus = await CustomMenu.find({
                        // category: category,
                        organization: org._id,
                    }).lean();
                    for (const menu of menus) {
                        let customMenuTiming = await CustomMenuTiming.findOne({
                            customMenu: menu._id,
                            organization: org._id,
                        });
                        let images = [];
                        let menuObj = {
                            id: menu._id,
                            name: menu.name,
                            seq: menu.seq,
                        };
                        for (const image of menu.images) {
                            let imageData = await s3.getSignedUrlForRead({
                                path: image,
                            });
                            images.push(imageData.url);
                        }
                        let menuQuery = {
                            organization: org._id,
                            customMenu: menu._id,
                        };
                        let menuProducts = await CustomMenuProduct.find(
                            menuQuery
                        )
                            .sort({ seq: "ASC" })
                            .populate([
                                {
                                    path: "product",
                                    select: ["_id", "productName"],
                                },
                            ]);
                        let productData = [];
                        for (const menuProduct of menuProducts) {
                            let productObj = {
                                id: menuProduct.product._id,
                                name: menuProduct.product.productName,
                                seq: menuProduct.seq,
                            };
                            productData.push(productObj);
                        }
                        menuObj.products = productData;
                        menuObj.images = images;
                        menuObj.timings = customMenuTiming?.timings ?? [];
                        customMenu.push(menuObj);
                    }
                }

                provider.categories = categories;
                provider.items = items;

                providers.push(provider);
            }

            console.log("--------> provider: ");
            // console.log(
            //     util.inspect(provider, false, null, true /* enable colors */)
            // );

            //collect all store details by
            // return products;

            return providers;
        } catch (err) {
            console.log(
                "[OrderService] [getAll] Error in getting all from organization ",
                err
            );
            throw err;
        }
    }

    async create(data) {
        try {
            let query = {};

            let orgDetails = data.providerDetails;
            const organizationExist = await Organization.findOne({
                name: orgDetails.name,
            });

            if (organizationExist) {
                throw new DuplicateRecordFoundError(
                    MESSAGES.ORGANIZATION_ALREADY_EXISTS
                );
            }

            let userExist = await User.findOne({ email: data.user.email });

            if (userExist) {
                throw new DuplicateRecordFoundError(
                    MESSAGES.USER_ALREADY_EXISTS
                );
            }

            let organization = new Organization(orgDetails);
            let savedOrg = await organization.save();

            //create a user
            let user = await userService.create({
                ...data.user,
                organization: organization._id,
                role: "Organization Admin",
            });

            return { user: user, providerDetail: organization };
        } catch (err) {
            console.log(
                `[OrganizationService] [create] Error in creating organization ${data.organizationId}`,
                err
            );
            throw err;
        }
    }
    async signup(data) {
        try {
            let query = {};

            let orgDetails = data.providerDetails;
            const organizationExist = await Organization.findOne({
                name: orgDetails.name,
            });

            if (organizationExist) {
                throw new DuplicateRecordFoundError(
                    MESSAGES.ORGANIZATION_ALREADY_EXISTS
                );
            }

            let userExist = await User.findOne({ email: data.user.email });

            if (userExist) {
                throw new DuplicateRecordFoundError(
                    MESSAGES.USER_ALREADY_EXISTS
                );
            }

            let organization = new Organization(orgDetails);
            let savedOrg = await organization.save();

            //create a user
            let user = await userService.signup({
                ...data.user,
                organization: organization._id,
                role: "Organization Admin",
            });

            return { user: user, providerDetail: organization };
        } catch (err) {
            console.log(
                `[OrganizationService] [create] Error in creating organization ${data.organizationId}`,
                err
            );
            throw err;
        }
    }

    async list(params) {
        try {
            let query = {};
            if (params.name) {
                query.name = { $regex: params.name, $options: "i" };
            }
            if (params.mobile) {
                query.contactMobile = params.mobile;
            }
            if (params.email) {
                query.contactEmail = params.email;
            }
            if (params.storeName) {
                query["storeDetails.name"] = {
                    $regex: params.storeName,
                    $options: "i",
                };
            }
            const organizations = await Organization.find(query)
                .sort({ createdAt: 1 })
                .skip(params.offset)
                .limit(params.limit);
            const count = await Organization.count(query);
            let organizationData = {
                count,
                organizations,
            };
            return organizationData;
        } catch (err) {
            console.log(
                "[OrderService] [getAll] Error in getting all organization ",
                err
            );
            throw err;
        }
    }

    async get(organizationId) {
        try {
            let doc = await Organization.findOne({
                _id: organizationId,
            }).lean();

            console.log("organization----->", doc);
            let user = await User.findOne(
                { organization: organizationId },
                { password: 0 }
            );
            if (doc) {
                {
                    let idProof = await s3.getSignedUrlForRead({
                        path: doc.idProof,
                    });
                    doc.idProof = idProof;

                    let addressProof = await s3.getSignedUrlForRead({
                        path: doc.addressProof,
                    });
                    doc.addressProof = addressProof;

                    let cancelledCheque = await s3.getSignedUrlForRead({
                        path: doc.bankDetails.cancelledCheque,
                    });
                    doc.bankDetails.cancelledCheque = cancelledCheque;

                    let PAN = await s3.getSignedUrlForRead({
                        path: doc.PAN.proof,
                    });
                    doc.PAN.proof = PAN;

                    let GSTN = await s3.getSignedUrlForRead({
                        path: doc.GSTN.proof,
                    });
                    doc.GSTN.proof = GSTN;

                    if (doc.storeDetails) {
                        let logo = await s3.getSignedUrlForRead({
                            path: doc.storeDetails?.logo,
                        });
                        doc.storeDetails.logo = logo;
                    }
                }

                return { user: user, providerDetail: doc };
            } else {
                throw new NoRecordFoundError(MESSAGES.ORGANIZATION_NOT_EXISTS);
            }
        } catch (err) {
            console.log(
                `[OrganizationService] [get] Error in getting organization by id - ${organizationId}`,
                err
            );
            throw err;
        }
    }

    async ondcGet(organizationId) {
        try {
            let doc = await Organization.findOne({
                _id: organizationId,
            }).lean();

            let user = await User.findOne(
                { organization: organizationId },
                { password: 0 }
            );
            if (doc) {
                {
                    let idProof = await s3.getSignedUrlForRead({
                        path: doc.idProof,
                    });
                    doc.idProof = idProof.url;

                    let addressProof = await s3.getSignedUrlForRead({
                        path: doc.addressProof,
                    });
                    doc.addressProof = addressProof.url;

                    let cancelledCheque = await s3.getSignedUrlForRead({
                        path: doc.bankDetails.cancelledCheque,
                    });
                    doc.bankDetails.cancelledCheque = cancelledCheque.url;

                    let PAN = await s3.getSignedUrlForRead({
                        path: doc.PAN.proof,
                    });
                    doc.PAN.proof = PAN.url;

                    let GSTN = await s3.getSignedUrlForRead({
                        path: doc.GSTN.proof,
                    });
                    doc.GSTN.proof = GSTN.url;

                    if (doc.storeDetails) {
                        let logo = await s3.getSignedUrlForRead({
                            path: doc.storeDetails?.logo,
                        });
                        doc.storeDetails.logo = logo.url;
                    }
                }

                return { user: user, providerDetail: doc };
            } else {
                return "";
            }
        } catch (err) {
            console.log(
                `[OrganizationService] [get] Error in getting organization by id - ${organizationId}`,
                err
            );
            throw err;
        }
    }

    async setStoreDetails(organizationId, data) {
        try {
            let organization = await Organization.findOne({
                _id: organizationId,
            }); //.lean();
            if (organization) {
                organization.storeDetails = data;
                organization.save();
                this.notifyStoreUpdate(data, organizationId);
            } else {
                throw new NoRecordFoundError(MESSAGES.ORGANIZATION_NOT_EXISTS);
            }
            return data;
        } catch (err) {
            console.log(
                `[OrganizationService] [get] Error in getting organization by id - ${organizationId}`,
                err
            );
            throw err;
        }
    }

    async update(organizationId, data) {
        try {
            let organization = await Organization.findOne({
                _id: organizationId,
            }); //.lean();
            if (organization) {
                let userExist = await User.findOne({
                    mobile: data.user.mobile,
                    organization: organizationId,
                });

                if (userExist && userExist.organization !== organizationId) {
                    throw new DuplicateRecordFoundError(
                        MESSAGES.USER_ALREADY_EXISTS
                    );
                } else {
                    const updateUser = await User.findOneAndUpdate(
                        { organization: organizationId },
                        data.user
                    );
                }

                let updateOrg = await Organization.findOneAndUpdate(
                    { _id: organizationId },
                    data.providerDetails
                );
                this.notifyOrgUpdate(data.providerDetails, organizationId);
            } else {
                throw new NoRecordFoundError(MESSAGES.ORGANIZATION_NOT_EXISTS);
            }
            return data;
        } catch (err) {
            console.log(
                `[OrganizationService] [get] Error in getting organization by id - ${organizationId}`,
                err
            );
            throw err;
        }
    }

    async getStoreDetails(organizationId, data) {
        try {
            let organization = await Organization.findOne(
                { _id: organizationId },
                { storeDetails: 1 }
            ).lean();
            if (organization) {
                if (organization?.storeDetails) {
                    let logo = await s3.getSignedUrlForRead({
                        path: organization?.storeDetails?.logo,
                    });
                    organization.storeDetails.logo = logo;
                } else {
                    organization.storeDetails = {};
                }
                delete organization.storeDetails.categories;
                return organization;
            } else {
                throw new NoRecordFoundError(MESSAGES.ORGANIZATION_NOT_EXISTS);
            }
        } catch (err) {
            console.log(
                `[OrganizationService] [get] Error in getting organization by id - ${organizationId}`,
                err
            );
            throw err;
        }
    }
    async notifyOrgUpdate(provider, orgId) {
        let requestData = {
            organization: orgId,
            category: provider?.storeDetails?.category,
        };
        if (provider?.disable) {
            let httpRequest = new HttpRequest(
                mergedEnvironmentConfig.intraServiceApiEndpoints.client,
                "/api/v2/client/status/orgUpdate",
                "POST",
                requestData,
                {}
            );
            await httpRequest.send();
        }
        return { success: true };
    }
    async notifyStoreUpdate(store, orgId) {
        let requestData = {
            organization: orgId,
            locationId: store?.location?._id,
            category: store.category,
        };
        if (store.storeTiming?.status === "disabled") {
            requestData.updateType = "disable";
            let httpRequest = new HttpRequest(
                mergedEnvironmentConfig.intraServiceApiEndpoints.client,
                "/api/v2/client/status/storeUpdate",
                "POST",
                requestData,
                {}
            );
            await httpRequest.send();
        } else if (store.storeTiming?.status === "closed") {
            requestData.updateType = "closed";
            requestData.storeTiming = store.storeTiming;
            let httpRequest = new HttpRequest(
                mergedEnvironmentConfig.intraServiceApiEndpoints.client,
                "/api/v2/client/status/storeUpdate",
                "POST",
                requestData,
                {}
            );
            await httpRequest.send();
        }
        return { success: true };
    }
}
export default OrganizationService;
