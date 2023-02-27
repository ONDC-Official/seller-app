import { v1 as uuidv1 } from 'uuid';
import MESSAGES from '../../../../lib/utils/messages';
import Product from '../../models/product.model';
import {
    NoRecordFoundError,
    DuplicateRecordFoundError,
    BadRequestParameterError,
} from '../../../../lib/errors';
import s3 from "../../../../lib/utils/s3Utils";

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
            const data = await Product.find(query).sort({createdAt:1}).skip(params.offset).limit(params.limit);
            const count = await Product.count(query)
            let products={
                count,
                data
            };
            return products;
        } catch (err) {
            console.log('[ProductService] [getAll] Error in getting all organization ',err);
            throw err;
        }
    }

    async search(params) {
        try {
            let query={};

            const data = await Product.find(query).sort({createdAt:1}).skip(params.offset).limit(params.limit);
            const count = await Product.count(query)
            let products={
                count,
                data
            };
            return products;
        } catch (err) {
            console.log('[ProductService] [getAll] Error in getting all from organization ',err);
            throw err;
        }
    }

    async get(productId) {
        try {
            let doc = await Product.findOne({_id:productId}).lean();
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

}
export default ProductService;
