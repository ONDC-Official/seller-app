import ProductService from '../v1/services/product.service';
import {mergedEnvironmentConfig} from "../../../config/env.config";
var XLSX = require('xlsx')
const productService = new ProductService();
import AWS from 'aws-sdk';
import fetch from 'node-fetch';
import { uuid } from 'uuidv4';
class ProductController {

    async create(req, res, next) {
        try {
            const data = req.body;
            data.organization = req.user.organization
            const product = await productService.create(data);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [create] Error -', error);
            next(error);
        }     
    }


    async list(req, res, next) {
        try {
            const query = req.query;
            query.offset = parseInt(query.offset);
            query.limit = parseInt(query.limit);
            query.organization = req.user.organization;
            const products = await productService.list(query);
            return res.send(products);

        } catch (error) {
            console.log('[OrderController] [list] Error -', error);
            next(error);
        }
    }

    async search(req, res, next) {
        try {
            const query = req.query;
            query.offset = 0;
            query.limit = 50;//default only 50 products will be sent
            const products = await productService.search(query);
            return res.send(products);

        } catch (error) {
            console.log('[OrderController] [list] Error -', error);
            next(error);
        }
    }

    async get(req, res, next) {
        try {
            const params = req.params;
            const product = await productService.get(params.productId);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const params = req.params;
            const product = await productService.update(params.productId,req.body);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }

    async publish(req, res, next) {
        try {
            const params = req.params;
            const product = await productService.publish(params.productId,req.body);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }

    async uploadTemplate(req, res, next) {
        try {

            const file = `app/modules/product/template/template.xlsx`;
            return res.download(file);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }

    async uploadCatalog(req, res, next) {
        try {

            let path = req.file.path;

            var workbook = XLSX.readFile(path);
            var sheet_name_list = workbook.SheetNames;
            let jsonData = XLSX.utils.sheet_to_json(
                workbook.Sheets[sheet_name_list[0]]
            );
            if (jsonData.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "xml sheet has no data",
                });
            }else{
                for(const row of jsonData){
                    row.organization = req.user.organization

                    let images = row.images.split(',')

                    let imageUrls = []

                    for(const img of images){
                        var keyName = req.user.organization+'/'+'productImages'+'/' + uuid();
                        const region = mergedEnvironmentConfig.s3.region;
                        const bucket = mergedEnvironmentConfig.s3.bucket;

                        const imageURL = img
                        const res = await fetch(imageURL)
                        console.log("mime--->",res)

                        let extention = imageURL.split('.').slice(-1)[0]
                        keyName=keyName+'.'+extention
                        const blob = await res.buffer()
                        const s3 = new AWS.S3({
                            useAccelerateEndpoint: true,
                            region: region
                        });

                        const uploadedImage = await s3.upload({
                            Bucket: bucket,
                            Key: keyName,
                            Body: blob
                        }).promise()

                        //console.log("uploaded image --->",uploadedImage);

                        imageUrls.push(keyName);
                    }

                    row.images=imageUrls
                    await productService.create(row);

                }
            }

            // const params = req.params;
            // const product = await productService.get(params.organizationId);
           return res.send({});

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }


    }


}

export default ProductController;
