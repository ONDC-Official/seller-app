import Product from '../../models/product.model';
import ProductAttribute from '../../models/productAttribute.model';
import VariantGroup from '../../models/variantGroup.model';
import { Categories, SubCategories, Attributes } from '../../../../lib/utils/categoryVariant';
import Organization from '../../../authentication/models/organization.model';
import s3 from '../../../../lib/utils/s3Utils';
import MESSAGES from '../../../../lib/utils/messages';
import { DuplicateRecordFoundError, NoRecordFoundError } from '../../../../lib/errors';


class ProductService {
    async create(data,currentUser) {
        try {
            // let query = {};

            const productExist = await Product.findOne({productName:data.productName,organization:currentUser.organization});
            if (productExist) {
                throw new DuplicateRecordFoundError(MESSAGES.PRODUCT_ALREADY_EXISTS);
            }
            let product = new Product(data.commonDetails);
            product.createdBy = currentUser.id;
            product.updatedBy = currentUser.id;
            product.organization = currentUser.organization;
            await product.save();
            await this.createAttribute({product:product._id,attributes:data.commonAttributesValues},currentUser);
            return product;
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
            const variantSpecificDetails = data.variantSpecificDetails;
            let variantGroup = new VariantGroup();
            variantGroup.organization = currentUser.organization;
            variantGroup.name = data.variantType;
            await variantGroup.save();
            for(const variant of variantSpecificDetails){
                const varientAttributes = variant.varientAttributes;
                let productObj = {};
                productObj = {...commonDetails };
                productObj.variantGroup = variantGroup._id;
                let product = new Product(productObj);
                product.quantity = variant.quantity;
                product.organization = currentUser.organization;
                product.MRP = variant.MRP;
                product.retailPrice = variant.retailPrice;
                product.purchasePrice = variant.purchasePrice;
                product.HSNCode = variant.HSNCode;
                product.images = variant.images;
                await product.save();
                let attributeObj = {
                    ...commonAttributesValues,...varientAttributes
                };
                await this.createAttribute({product:product._id,attributes:attributeObj},currentUser);
            }

            return {success:true};
        } catch (err) {
            console.log(`[ProductService] [create] Error in creating product ${data.currentUser.organization}`,err);
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
                    productObj.retailPrice = productVariant.retailPrice;
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
            let attributes = data.attributes;
            for (var attribute in attributes) {
                // eslint-disable-next-line no-prototype-builtins
                if (attributes.hasOwnProperty(attribute)) {
                    let attributeExist = await ProductAttribute.findOne({product:data.product,code:attribute,organization:currentUser.organization},{value:attributes[attribute]});
                    if(attributeExist){
                        await ProductAttribute.updateOne({product:data.product,code:attribute,organization:currentUser.organization});
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
            let query={};
            if(params.name){
                query.name = { $regex: params.name, $options: 'i' };
            }
            if(params.organization){
                query.organization =params.organization;
            }
            const data = await Product.find(query).sort({createdAt:1}).skip(params.offset*params.limit).limit(params.limit);
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

    async get(productId,currentUser) {
        try {
            let product = await Product.findOne({_id:productId,organization:currentUser.organization}).populate('variantGroup').lean();
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
                attributeObj[attribute.code] = attribute.value;
            }
            let productData = {
                commonDetails:product,
                commonAttributesValues:attributeObj
            };

            return productData;

        } catch (err) {
            console.log('[OrganizationService] [get] Error in getting organization by id -',err);
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
            console.log({productObj})
            await Product.updateOne({_id:productId,organization:currentUser.organization},productObj);
            if(commonAttributesValues){
                await this.createAttribute({product:product._id,attributes:commonAttributesValues},currentUser);
            }
            return {success:true};

        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id - ${currentUser.organization}`,err);
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


}
export default ProductService;