import Product from '../../models/product.model';
import ProductAttribute from '../../models/productAttribute.model';
import CustomizationService from '../../../customization/v1/services/customizationService';
import CustomizationGroup from '../../../customization/models/customizationGroupModel';
import CustomizationGroupMapping from '../../../customization/models/customizationGroupMappingModel';
import VariantGroup from '../../models/variantGroup.model';
import CustomMenu from '../../models/customMenu.model';
import CustomMenuProduct from '../../models/customMenuProduct.model';
import CustomMenuTiming from '../../models/customMenuTiming.model';
import { Categories, SubCategories, Attributes } from '../../../../lib/utils/categoryVariant';
import Organization from '../../../authentication/models/organization.model';
import s3 from '../../../../lib/utils/s3Utils';
import MESSAGES from '../../../../lib/utils/messages';
import MappedCity from '../../../../lib/utils/mappedCityCode';
import { BadRequestParameterError, DuplicateRecordFoundError, NoRecordFoundError } from '../../../../lib/errors';
import HttpRequest from '../../../../lib/utils/HttpRequest';
import {mergedEnvironmentConfig} from '../../../../config/env.config';
const customizationService = new CustomizationService();
 
class ProductService {
    async create(data,currentUser) {
        try {
            const productExist = await Product.findOne({productName:data.productName,organization:currentUser.organization});
            if (productExist) {
                throw new DuplicateRecordFoundError(MESSAGES.PRODUCT_ALREADY_EXISTS);
            }
            let product = new Product(data.commonDetails);
            product.createdBy = currentUser.id;
            product.updatedBy = currentUser.id;
            product.organization = currentUser.organization;
            await product.save();
            if(data.commonAttributesValues){
                await this.createAttribute({product:product._id,attributes:data.commonAttributesValues},currentUser);
            }
            return {data:product};
        } catch (err) {
            console.log(`[ProductService] [create] Error in creating product ${currentUser.organization}`,err);
            throw err;
        }
    }

    //
    async createWithVariants(data,currentUser) {
        try {
            const commonDetails = data.commonDetails;
            const commonAttributesValues = data.commonAttributesValues;
            const customizationDetails = data.customizationDetails;
            const variantSpecificDetails = data.variantSpecificDetails;
            let variantGroup = {};
            let variantType = [];
            let i = 0;
            for(const variant of variantSpecificDetails){
                const varientAttributes = variant.varientAttributes;
                delete variant.varientAttributes;
                if(i===0){
                    for (const attribute in varientAttributes) {
                        variantType.push(attribute);
                    }
                    variantGroup = new VariantGroup();
                    variantGroup.organization = currentUser.organization;
                    variantGroup.name = variantType;
                    variantGroup.variationOn = data.variationOn;
                    await variantGroup.save();
                }
                i++;
                let productObj = {};
                productObj = {...commonDetails,...variant };
                productObj.variantGroup = variantGroup._id;
                productObj.organization = currentUser.organization;
                let product = new Product(productObj);
                await product.save();
                let attributeObj = {
                    ...commonAttributesValues,...varientAttributes
                };
                await this.createAttribute({product:product._id,attributes:attributeObj},currentUser);
            }

            return {success:true};
        } catch (err) {
            console.log(`[ProductService] [create] Error in creating product ${currentUser.organization}`,err);
            throw err;
        }
    }

    async updateWithVariants(data,currentUser) {
        try {
            const commonDetails = data.commonDetails;
            const commonAttributesValues = data.commonAttributesValues;
            const variantSpecificDetails = data.variantSpecificDetails;            
            for(const productVariant of variantSpecificDetails){
                let variantProduct = await Product.findOne({_id:productVariant._id,organization:currentUser.organization}).lean();
                if(variantProduct){
                    let productObj = {...variantProduct,...commonDetails };           
                    productObj.quantity = productVariant.quantity;
                    productObj.organization = currentUser.organization;
                    productObj.MRP = productVariant.MRP;
                    productObj.purchasePrice = productVariant.purchasePrice;
                    productObj.HSNCode = productVariant.HSNCode;
                    productObj.images = productVariant.images;
                    await Product.updateOne({_id:productVariant._id,organization:currentUser.organization},productObj);
                    let varientAttributes = productVariant.varientAttributes;
                    let attributeObj = {
                        ...commonAttributesValues,...varientAttributes
                    };
                    if(attributeObj){
                        await this.createAttribute({product:variantProduct._id,attributes:attributeObj},currentUser);
                    } 
                }
            }
            return {success:true};

        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id - ${currentUser.organization}`,err);
            throw err;
        }
    }
    async createAttribute(data,currentUser){
        try {
            const attributes = data.attributes;
            for (const attribute in attributes) { 
                // eslint-disable-next-line no-prototype-builtins
                if (attributes.hasOwnProperty(attribute)) {
                    let attributeExist = await ProductAttribute.findOne({product:data.product,code:attribute,organization:currentUser.organization});
                    if(attributeExist){
                        await ProductAttribute.updateOne({product:data.product,code:attribute,organization:currentUser.organization},{value:attributes[attribute]});
                    }else{

                        let productAttribute = new ProductAttribute();
                        productAttribute.product = data.product;
                        productAttribute.code = attribute;
                        productAttribute.value = attributes[attribute];
                        productAttribute.organization = currentUser.organization;
                        await productAttribute.save();
                    }
                }
            }        
            return {success:true};
        } catch (err) {
            console.log(`[ProductService] [createAttribute] Error in - ${data.currentUser.organization}`,err);
            throw err;
        }
    }


    async list(params) {
        try {
            let query={
                organization:params.organization
            };
            if(params.name){
                query.productName = { $regex: params.name, $options: 'i' };
            }
            if(params.category){
                query.productCategory = params.category;
            }
            if(params.stock && params.stock === 'inStock'){
                query.quantity = {$gt:0};
            }else if(params.stock && params.stock === 'outOfStock'){
                query.quantity = {$lte:0};
            }
            if (params.type && (params.type === 'item' || params.type === 'customization')) {
                query.type = params.type;
            }
            const data = await Product.find(query).sort({createdAt:-1}).skip(params.offset*params.limit).limit(params.limit);
            const count = await Product.count(query);
            let products={
                count,
                data
            };
            return products;
        } catch (err) {
            console.log('[OrderService] [getAll] Error in getting all organization ',err);
            throw err;
        }
    }

    async search(params) {
        try {
            let query={};

            console.log('params------->',params);
            const orgs = await Organization.find({},).lean();
            let products = [];
            for(const org of orgs){
                query.organization = org._id;
                query.published = true;
                if(params.name){
                    query.productName={ $regex: '.*' + params.name + '.*' };
                }
                if(params.category){
                    query.productCategory ={ $regex: '.*' + params.category + '.*' };
                }
                // query.productName = {$regex: params.message.intent.item.descriptor.name,$options: 'i'}
                const data = await Product.find(query).sort({createdAt:1}).skip(params.offset).limit(params.limit);
                if(data.length>0){
                    for(const product of data){
                        let productDetails = product;
                        let images = [];
                        for(const image of productDetails.images){
                            let imageData = await s3.getSignedUrlForRead({path:image});
                            images.push(imageData.url);
                        }
                        product.images = images;
                    }
                    org.items = data;
                    products.push(org);
                }
            }
            //collect all store details by
            return products;
        } catch (err) {
            console.log('[OrderService] [getAll] Error in getting all from organization ',err);
            throw err;
        }
    }

    async searchIncrementalPull(params,category) {
        try {
            let query={};
            let orgs;
            if(params.city){
                const cityCode = params.city.split(':')[1];
                let cityData = MappedCity(cityCode);
                cityData = cityData.map((data)=> data.Pincode );
                orgs = await Organization.find({ 'storeDetails.address.area_code': {$in:cityData }}).lean();
            }else{
                orgs = await Organization.find({},).lean();
            }
            let products = [];
            for(const org of orgs){
                let productData = [];
                let customMenu = [];
                query.organization = org._id;
                let storeImage = await s3.getSignedUrlForRead({path:org.storeDetails.logo});
                org.storeDetails.logo = storeImage.url;
                query.published = true;
                // query.type = 'item'; // filter to fetch only items
                if(category){
                    query.productCategory ={ $regex: '.*' + category + '.*' };
                }
                // query.productName = {$regex: params.message.intent.item.descriptor.name,$options: 'i'}
                //let product = await Product.findOne({_id:productId,organization:currentUser.organization}).populate('variantGroup').lean();

                const data = await Product.find(query).populate('variantGroup').sort({createdAt:1}).skip(params.offset).limit(params.limit).lean();
                if(data.length>0){
                    for(let product of data){
                        let productDetails = product;
                        let images = [];
                        for(const image of productDetails.images){
                            let imageData = await s3.getSignedUrlForRead({path:image});
                            images.push(imageData.url);
                        }
                        product.images = images;
                        let attributeData =[];
                        const attributes = await ProductAttribute.find({product:product._id});
                        for(const attribute of attributes){
                            let value = attribute.value; 
                            if(attribute.code === 'size_chart'){
                                let sizeChart = await s3.getSignedUrlForRead({path:attribute.value});
                                value = sizeChart?.url ?? '';
                            }
                            const attributeObj = {
                                'code' : attribute.code,
                                'value':value
                            };
                            attributeData.push(attributeObj);
                        }
                        product.attributes = attributeData;
                        const customizationDetails = await customizationService.mappdedData(product.customizationGroupId,{organization:product.organization}) ?? {};
                        product.customizationDetails = customizationDetails;
                        if(Object.keys(customizationDetails).length > 0){
                            const accumulatedMaxMRP =  await this.getMaxMRP(product.customizationGroupId, {maxMRP:product.MRP,maxDefaultMRP:product.MRP}, {organization:product.organization});
                            product.maxMRP = accumulatedMaxMRP?.maxMRP ?? product.MRP; 
                            product.maxDefaultMRP = accumulatedMaxMRP?.maxDefaultMRP ?? product.MRP; 
                        }
                        productData.push(product);
                    }
                    // getting Menu for org -> 
                    let menus = await CustomMenu.find({category:category,organization:org._id}).lean();
                    for(const menu of menus){
                        let customMenuTiming = await CustomMenuTiming.findOne({customMenu:menu._id,organization:org._id});
                        let images = [];
                        let menuObj ={
                            id:menu._id,
                            name:menu.name,
                            seq:menu.seq
                        };
                        for(const image of menu.images){
                            let imageData = await s3.getSignedUrlForRead({path:image});
                            images.push(imageData.url);
                        }
                        let menuQuery = {
                            organization:org._id,
                            customMenu : menu._id
                        };
                        let menuProducts = await CustomMenuProduct.find(menuQuery).sort({seq:'ASC'}).populate([{path:'product',select:['_id','productName']}]);
                        let productData = [];
                        for(const menuProduct of menuProducts){
                            let productObj = {
                                id:menuProduct.product._id,
                                name:menuProduct.product.productName,
                                seq:menuProduct.seq,
        
                            };
                            productData.push(productObj);
                        }
                        menuObj.products = productData;
                        menuObj.images = images;
                        menuObj.timings = customMenuTiming?.timings ?? [];
                        customMenu.push(menuObj);
                    }
                    org.items = productData;
                    org.menu = customMenu;
                    products.push(org);
                }
            }
            //collect all store details by
            return {products};
        } catch (err) {
            console.log('[OrderService] [getAll] Error in getting all from organization ',err);
            throw err;
        }
    }

    async get(productId,currentUser) {
        try {
            let product = await Product.findOne({_id:productId,organization:currentUser.organization}).lean();
            if(!product){
                throw new NoRecordFoundError(MESSAGES.PRODUCT_NOT_EXISTS);
            }
            let images = [];
            if(product.images && product.images.length > 0){
                for(const image of product.images){
                    let data = await s3.getSignedUrlForRead({path:image});
                    images.push(data);
                }
                product.images = images;
            }
            const attributes = await ProductAttribute.find({product:productId,organization:currentUser.organization}); 
            let attributeObj = {};
            for(const attribute of attributes){
                let value = attribute.value;
                if(attribute.code === 'size_chart'){
                    value = await s3.getSignedUrlForRead({path:attribute.value});
                }
                attributeObj[attribute.code] = value;
            }
            let productData = {
                commonDetails:product,
                commonAttributesValues:attributeObj,
                customizationDetails: {},
                // customizationDetails: await customizationService.mappdedData(product.customizationGroupId,currentUser),
            };
            const variantGroup = await VariantGroup.findOne({_id:product.variantGroup});
            if(variantGroup){
                productData.variationOn = variantGroup.variationOn ?? 'NA';
                productData.variantType = variantGroup.name ?? [];
            } 

            return productData;

        } catch (err) {
            console.log('[OrganizationService] [get] Error in getting organization by id -',err);
            throw err;
        }
    }

    async ondcGet(productId) {
        try {
            let product = await Product.findOne({_id:productId}).lean();
            if(!product){
                return {};
            }
            let images = [];
            if(product.images && product.images.length > 0){
                for(const image of product.images){
                    let data = await s3.getSignedUrlForRead({path:image});
                    images.push(data);
                }
                product.images = images;
            }
            const attributes = await ProductAttribute.find({product:productId}); 
            let attributeObj = {};
            for(const attribute of attributes){
                let value = attribute.value;
                if(attribute.code === 'size_chart'){
                    value = await s3.getSignedUrlForRead({path:attribute.value});
                }
                attributeObj[attribute.code] = value;
            }
            let productData = {
                commonDetails:product,
                commonAttributesValues:attributeObj,
            };
            const variantGroup = await VariantGroup.findOne({_id:product.variantGroup});
            if(variantGroup){
                productData.variationOn = variantGroup.variationOn ?? 'NA';
                productData.variantType = variantGroup.name ?? [];
            } 

            return productData;

        } catch (err) {
            console.log('[OrganizationService] [ondcGet] Error in getting organization by id -',err);
            throw err;
        }
    }

    async ondcGetForUpdate(productId) {
        try {
            let product = await Product.findOne({_id:productId}).lean();
            if(!product){
                return {};
            }
            let images = [];
            if(product.images && product.images.length > 0){
                for(const image of product.images){
                    let data = await s3.getSignedUrlForRead({path:image});
                    images.push(data);
                }
                product.images = images;
            }
            const attributes = await ProductAttribute.find({product:productId}); 
            let attributeData = [];
            for(const attribute of attributes){
                let value = attribute.value; 
                if(attribute.code === 'size_chart'){
                    let sizeChart = await s3.getSignedUrlForRead({path:attribute.value});
                    value = sizeChart?.url ?? '';
                }
                const attributeObj = {
                    'code' : attribute.code,
                    'value':value
                };
                attributeData.push(attributeObj);
            }
            product.attributes = attributeData;
            product.customizationDetails = await customizationService.mappdedData(product.customizationGroupId,{organization:product.organization});
            return product;

        } catch (err) {
            console.log('[OrganizationService] [ondcGet] Error in getting organization by id -',err);
            throw err;
        }
    }
    async getWithVariants(productId,currentUser) {
        try {
            let product = await Product.findOne({_id:productId,organization:currentUser.organization}).lean();
            let variants = [];  
            variants = await Product.find({_id:{$ne:product._id},variantGroup:product.variantGroup,organization:currentUser.organization});

            let images = [];
            for(const image of product.images){
                let data = await s3.getSignedUrlForRead({path:image});
                images.push(data);
            }
            product.images = images;
            const attributes = await ProductAttribute.find({product:productId}); 
            product.attributes = attributes;
            product.variants = variants;

            return product;

        } catch (err) {
            console.log('[OrganizationService] [get] Error in getting organization by id -',err);
            throw err;
        }
    }

    async update(productId,data,currentUser) {
        try {
            const commonDetails = data.commonDetails;
            const commonAttributesValues = data.commonAttributesValues;
            const product = await Product.findOne({_id:productId,organization:currentUser.organization}).lean();
            let productObj = {...product,...commonDetails };
            await Product.updateOne({_id:productId,organization:currentUser.organization},productObj);
            if(commonAttributesValues){
                await this.createAttribute({product:productId,attributes:commonAttributesValues},currentUser);
            } 
            this.notifyItemUpdate(productId);

            return {data:productObj};

        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id - ${currentUser.organization}`,err);
            throw err;
        }
    }

    async notifyItemUpdate(itemId) {
        try {

            //notify client to update order status ready to ship to logistics
            let httpRequest = new HttpRequest(
                mergedEnvironmentConfig.intraServiceApiEndpoints.client,
                '/api/v2/client/status/itemUpdate',
                'POST',
                {itemId:itemId},
                {}
            );

            return;

        } catch (err) {
            console.log('[OrganizationService] [get] Error in notify item update -}',err);
            throw err;
        }
    }

    async publish(productId,data,currentUser) {
        try {
            console.log('req.body---->',data);
            //TODO: add org level check and record not found validation
            let doc = await Product.findOneAndUpdate({_id:productId},data);//.lean();
            return data;

        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id - ${currentUser.organization}`,err);
            throw err;
        }
    }

    async categorySubcategoryAttributeList(params,currentUser) {
        try {
            let data = Attributes;
            if(params.category){
                data = data.filter((obj)=>obj.category === params.category);
            }
            if(params.subCategory){
                data = data.find((obj)=>obj.subCategory === params.subCategory);
            }
            return {data};

        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id - ${currentUser.organization}`,err);
            throw err;
        }
    }
    async categorySubcategoryList(params,currentUser) {
        try {
            let data = SubCategories;
            if(params.category){
                data = data.find((obj)=>obj.category === params.category);
            }
            return {data};

        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id - ${currentUser.organization}`,err);
            throw err;
        }
    }

    async categoryList(params,currentUser) {
        try {
            let data = Categories;
            return {data};

        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id - ${currentUser.organization}`,err);
            throw err;
        }   
    }
    async createCustomization(customizationDetails, currentUser) {
        try {
            if (customizationDetails) {
                const existingCustomization = await Product.findOne({ 
                    productName: customizationDetails.productName, 
                    organization: currentUser.organization 
                });
    
                if (!existingCustomization) {
                    let newCustomizationObj = {
                        ...customizationDetails,
                        organization: currentUser.organization,
                        type:'customization',
                        updatedBy: currentUser.id,
                        createdBy: currentUser.id,
                    };
                    let newCustomization = new Product(newCustomizationObj);
                    await newCustomization.save();
                    return newCustomization;
                } else {
                    throw new DuplicateRecordFoundError(MESSAGES.CUSTOMIZATION_ALREADY_EXISTS);
                }
            }
        } catch (err) {
            console.log(`[CustomizationService] [create] Error - ${currentUser.organization}`, err);
            throw err;
        }
    }    

    //TODO:Tirth - add filter on name and proper contion to find customization ,handle pagination(Done)

    async getCustomization(params,currentUser) {
        try {
            let query = {
                type : 'customization',
                organization : currentUser.organization
            };
            if (params.name) {
                query.productName = { $regex: params.name, $options: 'i' };
            }
    
            const data = await Product.find(query)
                .sort({ createdAt: 1 })
                .skip(params.offset)
                .limit(params.limit);
    
            const count = await Product.count(query);
    
            let customizations = {
                count,
                data
            };
            return customizations;
        } catch (err) {
            console.log('[CustomizationService] [getCustomization] Error:', err);
            throw err;
        }
    }
    
    async updateCustomization(customizationDetails, currentUser, customizationId) {
        try {
            //TODO:Tirth check if given name has already been use in other group and throw error(Done)
            if (customizationDetails) {
                const existingCustomization = await Product.findOne({
                    _id: customizationId,
                    organization: currentUser.organization
                });
    
                if (!existingCustomization) {
                    throw new NoRecordFoundError(MESSAGES.CUSTOMIZATION_RECORD_NOT_FOUND);
                }
    
                // Update existing customization
                await Product.findOneAndUpdate(
                    { _id: customizationId, organization: currentUser.organization },
                    {
                        ...customizationDetails,
                        updatedBy: currentUser.id,
                    }
                );
    
                return { success: true };
            }
        } catch (err) {
            console.log(`[CustomizationService] [update] Error - ${currentUser.organization}`, err);
            throw err;
        }
    }
    
    async deleteCustomization(customizationId) {
        try {
            const deletedCustomization = await Product.findByIdAndDelete(customizationId);
            if (deletedCustomization) {
                return { success: true, deletedCustomization };
            } else {
                throw new NoRecordFoundError(MESSAGES.CUSTOMIZATION_RECORD_NOT_FOUND);
            }
        } catch (err) {
            console.log('[CustomizationService] [delete] Error:', err);
            throw err;
        }
    }

    async getCustomizationById(customizationId, currentUser) {
        try {
            const customization = await Product.findOne({ 
                _id: customizationId,
                organization: currentUser.organization,
                type: 'customization'
            });
    
            if (!customization) {
                throw new NoRecordFoundError(MESSAGES.CUSTOMIZATION_RECORD_NOT_FOUND);
            }
    
            return customization;
        } catch (err) {
            console.log(`[CustomizationService] [getCustomizationById] Error - ${currentUser.organization}`, err);
            throw err;
        }
    }   
    async getMaxMRP(groupId, accumulatedMRP, currentUser) {
        try {
            let {maxMRP,maxDefaultMRP} = accumulatedMRP;
            // Fetch customization details for the product's customizationGroup
            let customizationGroup = {};
            if(groupId){

                customizationGroup = await CustomizationGroup.findOne({
                    _id: groupId,
                    organization:currentUser.organization
                });
                if(!customizationGroup){
                    return {maxMRP,maxDefaultMRP};
                }
                
            }else{
                return {maxMRP,maxDefaultMRP};
            }
    
            const mappingData = await CustomizationGroupMapping.find({
                parent: groupId,
                organization:currentUser.organization
            });

            let customizationIds = mappingData.map((data)=> data.customization);
            let groupData = this.groupBy(mappingData, 'customization');
            if(customizationIds && customizationIds.length  > 0){
                let customizationDataMAX = await Product.findOne({type: 'customization', organization: currentUser.organization, _id: {$in : customizationIds}}).sort({MRP:-1});
                if(customizationDataMAX){
                    maxMRP += customizationDataMAX?.MRP ?? 0;
                    for(const data of groupData){
                        if(data.id === customizationDataMAX._id){
                            if(data.groups && data.groups.length > 0){
                                for(const group of data.groups){
                                    if(group.child){
                                        maxMRP = await this.maxMRP(maxMRP,group.child,currentUser);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            let defaultCustomization = mappingData.find((data)=>{
                if(data.default){
                    return data.customization;
                }
            });
            if(defaultCustomization){
                let customizationDataDefaultMAX = await Product.findOne({type: 'customization', organization: currentUser.organization, _id: defaultCustomization.customization}).sort({MRP:-1});
                if(customizationDataDefaultMAX){
                    maxDefaultMRP += customizationDataDefaultMAX?.MRP ?? 0;
                    for(const data of groupData){
                        if(data.id === customizationDataDefaultMAX._id){
                            if(data.groups && data.groups.length > 0){
                                for(const group of data.groups){
                                    if(group.child){
                                        maxDefaultMRP = await this.maxDefaultMRP(maxDefaultMRP,group.child,currentUser);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return {maxMRP,maxDefaultMRP};
        } catch (err) {
            console.error(`[ProductService] [getMaxMRP] Error - ${currentUser.organization}`, err);
            throw err;
        }
    }

    async maxMRP(MRP=0,groupId, currentUser){
        const customizationGroup = await CustomizationGroup.findOne({
            _id: groupId,
            organization:currentUser.organization
        });

        if (!customizationGroup) {
            return MRP;
        }

        const mappingData = await CustomizationGroupMapping.find({
            parent: groupId,
            organization:currentUser.organization
        });
        let customizationIds = mappingData.map((data)=> data.customization);
        const groupData = this.groupBy(mappingData, 'customization');
        if(customizationIds && customizationIds.length  > 0){
            let customizationDataMAX = await Product.findOne({type: 'customization', organization: currentUser.organization, _id: {$in : customizationIds}}).sort({MRP:-1});
            if(customizationDataMAX){
                MRP += customizationDataMAX?.MRP ?? 0;
                for(const data of groupData){
                    if(data.id === customizationDataMAX._id){
                        if(data.groups && data.groups.length > 0){
                            for(const group of data.groups){
                                if(group.child){
                                    MRP = await this.maxMRP(MRP,group.child,currentUser);
                                }
                            }
                        }
                    }
                }
            }
        }
        return MRP;
    }

    async maxDefaultMRP(MRP=0,groupId, currentUser){
        const customizationGroup = await CustomizationGroup.findOne({
            _id: groupId,
            organization:currentUser.organization
        });

        if (!customizationGroup) {
            return MRP;
        }

        const mappingData = await CustomizationGroupMapping.find({
            parent: groupId,
            organization:currentUser.organization
        });
        const groupData = this.groupBy(mappingData, 'customization');
        let defaultCustomization = mappingData.find((data)=>{
            if(data.default){
                return data.customization;
            }
        });
        if(defaultCustomization){
            let customizationDataDefaultMAX = await Product.findOne({type: 'customization', organization: currentUser.organization, _id: defaultCustomization.customization}).sort({MRP:-1});
            if(customizationDataDefaultMAX){
                MRP += customizationDataDefaultMAX?.MRP ?? 0;
                for(const data of groupData){
                    if(data.id === customizationDataDefaultMAX._id){
                        if(data.groups && data.groups.length > 0){
                            for(const group of data.groups){
                                if(group.child){
                                    MRP = await this.maxDefaultMRP(MRP,group.child,currentUser);
                                }
                            }
                        }
                    }
                }
            }
        }
        return MRP;
    }


    groupBy(array, key) {
        return Object.values(array.reduce((result, item) => {
            const groupKey = item[key];
      
            // Create a new group if it doesn't exist
            if (!result[groupKey]) {
                result[groupKey] = { id: groupKey, groups: [] };
            }
      
            // Add the current item to the group
            result[groupKey].groups.push(item);
      
            return result;
        }, {}));
    }
}
export default ProductService;
