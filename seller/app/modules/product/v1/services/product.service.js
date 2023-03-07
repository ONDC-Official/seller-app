import { v1 as uuidv1 } from 'uuid';
import MESSAGES from '../../../../lib/utils/messages';
import Product from '../../models/product.model';
import Organization from '../../../authentication/models/organization.model';
import {
    NoRecordFoundError,
    DuplicateRecordFoundError,
    BadRequestParameterError,
} from '../../../../lib/errors';
import s3 from "../../../../lib/utils/s3Utils";
import {Organizations} from "aws-sdk";

class ProductService {
    async create(data) {
        try {
            let query = {};

            // const organizationExist = await Product.findOne({productName:data.productName});
            // if (organizationExist) {
            //     throw new DuplicateRecordFoundError(MESSAGES.PRODUCT_ALREADY_EXISTS);
            // }
            let product = new Product(data);
            let savedProduct= await product.save();

            return savedProduct;
        } catch (err) {
            console.log(`[ProductService] [create] Error in creating product ${data.organizationId}`,err);
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
            const data = await Product.find(query).sort({createdAt:1}).skip(params.offset).limit(params.limit);
            const count = await Product.count(query)
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

            const orgs = await Organization.find({},{storeDetails:1,_id:1,name:1}).lean();
            let products = [];
            for(const org of orgs){
                query.organization = org._id
                const data = await Product.find(query).sort({createdAt:1}).skip(params.offset).limit(params.limit);
                if(data.length>0){
                    for(const product of data){
                        let productDetails = product
                        let images = []
                        for(const image of productDetails.images){
                            let imageData = await s3.getSignedUrlForRead({path:image});
                            images.push(imageData.url);
                        }
                        product.images = images
                    }
                    org.items = data
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

    async get(productId) {
        try {
            let doc = await Product.findOne({_id:productId}).lean();

            let images = []
            for(const image of doc.images){
                let data = await s3.getSignedUrlForRead({path:image});
                images.push(data)
            }

            doc.images = images

            return doc;

        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id - ${organizationId}`,err);
            throw err;
        }
    }

    async update(productId,data) {
        try {
            let doc = await Product.findOneAndUpdate({_id:productId},data)//.lean();
            return doc;

        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id - ${organizationId}`,err);
            throw err;
        }
    }

    async publish(productId,data) {
        try {
            console.log("req.body---->",data)
            //TODO: add org level check and record not found validation
            let doc = await Product.findOneAndUpdate({_id:productId},data)//.lean();
            return data;

        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id - ${organizationId}`,err);
            throw err;
        }
    }

}
export default ProductService;
