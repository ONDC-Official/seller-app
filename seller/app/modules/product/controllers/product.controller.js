import ProductService from '../v1/services/product.service';
import ProductCustomizationService from '../v1/services/productCustomization.service';
import {mergedEnvironmentConfig} from '../../../config/env.config';

var XLSX = require('xlsx');
const productService = new ProductService();
const productCustomizationService = new ProductCustomizationService();
import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import {uuid} from 'uuidv4';
import { commonKeys, templateKeys } from '../../../lib/utils/constants';
import { mergedValidation } from '../../../lib/utils/bulkUploadValidaton';
import { mergerdAttributeValidation } from '../../../lib/utils/bulkUploadAttributeValidation';
import { templateAttributeKeys } from '../../../lib/utils/commonAttribute';

class ProductController {

    async create(req, res, next) {
        try {
            const data = req.body;
            data.organization = req.user.organization;
            const product = await productService.create(data,req.user);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [create] Error -', error);
            next(error);
        }
    }
    async createWithVariants(req, res, next) {
        try {
            const data = req.body;
            const product = await productService.createWithVariants(data,req.user);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [create] Error -', error);
            next(error);
        }
    }

    async list(req, res, next) {
        try {
            const query = req.query;
            query.offset = parseInt(query.offset ?? 0);
            query.limit = parseInt(query.limit ?? 100);
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
            let query = req.query;
            query.offset = 0;
            query.limit = 50;//default only 50 products will be sent
            const products = await productService.search(query);
            return res.send(products);

        } catch (error) {
            console.log('[OrderController] [list] Error -', error);
            next(error);
        }
    }

    async searchIncrementalPull(req, res, next) {
        try {
            let query = req.query;
            query.offset = 0;
            query.limit = 50;//default only 50 products will be sent
            const products = await productService.searchIncrementalPull(query,req.params.category);
            return res.send(products);

        } catch (error) {
            console.log('[OrderController] [list] Error -', error);
            next(error);
        }
    }

    async get(req, res, next) {
        try {
            const params = req.params;
            const product = await productService.get(params.productId,req.user);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }

    async ondcGet(req, res, next) {
        try {
            const params = req.params;
            const product = await productService.ondcGet(params.productId);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }

    async ondcGetForUpdate(req, res, next) {
        try {
            const params = req.params;
            const product = await productService.ondcGetForUpdate(params.productId);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }

    async getWithVariants(req, res, next) {
        try {
            const params = req.params;
            const product = await productService.getWithVariants(params.productId,req.user);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const params = req.params;
            const product = await productService.update(params.productId, req.body,req.user);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }

    async updateWithVariants(req, res, next) {
        try {
            // const params = req.params;
            const product = await productService.updateWithVariants(req.body,req.user);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }

    async publish(req, res, next) {
        try {
            const params = req.params;
            const product = await productService.publish(params.productId, req.body);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }

    async uploadTemplate(req, res, next) {
        try {

            const { category } = req.query;
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'Category parameter is missing',
                    error: 'Category parameter is missing'
                });
            }

            const filePath = `app/modules/product/template/${category.toLowerCase().replace(/\s+/g, '_')}.xlsx`;
            // Check if the file exists for the specified category
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    return res.status(404).json({
                        success: false,
                        message: 'Template not found for the specified category',
                        error: 'Template not found for the specified category'
                    });
                }
                // If the file exists, initiate the download
                const fileName = path.basename(filePath);
                res.download(filePath, fileName);
            });
        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }

    async categorySubcategoryAttributeList(req, res, next) {
        try {
            const params = req.query;
            const categoryVariant = await productService.categorySubcategoryAttributeList(params);
            return res.send(categoryVariant);

        } catch (error) {
            next(error);
        }
    }
    async categorySubcategoryList(req, res, next) {
        try {
            const params = req.query;
            const categoryVariant = await productService.categorySubcategoryList(params);
            return res.send(categoryVariant);

        } catch (error) {
            next(error);
        }
    }
    async categoryList(req, res, next) {
        try {
            const params = req.query;
            const categoryVariant = await productService.categoryList(params);
            return res.send(categoryVariant);

        } catch (error) {
            next(error);
        }
    }

    async getCustomizations(req, res, next) {
        try {
            const params = req.params;
            const categoryVariant = await productCustomizationService.get(params.productId,req.user);
            return res.send(categoryVariant);

        } catch (error) {
            next(error);
        }
    }

    async storeCustomizations(req, res, next) {
        try {
            const params = req.params;
            const data = req.body;
            const categoryVariant = await productCustomizationService.create(params.productId,data.customizationDetails,req.user);
            return res.send(categoryVariant);

        } catch (error) {
            next(error);
        }
    }

    async uploadCatalog(req, res, next) {
        try {
            const { category } = req.query;
            if (!category) {
                return res.status(400).send('Category parameter is missing');
            }

            console.log('req.user', req.user);
            let path = req.file.path;
            let currentUser = req.user;

            var workbook = XLSX.readFile(path, {
                type: 'binary',
                cellDates: true,
                cellNF: false,
                cellText: false
            });
            var sheet_name_list = workbook.SheetNames;
            let jsonData = XLSX.utils.sheet_to_json(
                workbook.Sheets[sheet_name_list[0]]
            );

            console.log('jsonData--->', jsonData);
            if (jsonData.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'xml sheet has no data',
                    error: 'xml sheet has no data'
                });
            } else {
                const allTemplateKeys = Object.values(templateKeys).flat();

                const validKeys = [...commonKeys, ...allTemplateKeys];

                let inputKeys = Object.keys(jsonData[0]);

                //check if excel sheet is valid or not
                if (validKeys.length !== inputKeys.length && inputKeys.every(e => !validKeys.includes(e))) {
                    return res.status(400).json({
                        success: false,
                        message: 'Template is invalid',
                        error: 'Template is invalid'
                    });
                }

                // Validate based on the category schema
                const mergedSchema = mergedValidation(category.toLowerCase().replace(/\s+/g, ''));
                const commonSchema = mergerdAttributeValidation(category.toLowerCase().replace(/\s+/g, ''));
                for (const row of jsonData) {


                    if (row.isReturnable?.toLowerCase() === 'yes') {
                        row.isReturnable = true;
                    } else {
                        row.isReturnable = false;
                    }
                    if (row.isVegetarian?.toLowerCase() === 'yes') {
                        row.isVegetarian = true;
                    } else {
                        row.isVegetarian = false;
                    }
                    if (row.availableOnCod?.toLowerCase() === 'yes') {
                        row.availableOnCod = true;
                    } else {
                        row.availableOnCod = false;
                    }
                    if (row.isCancellable?.toLowerCase() === 'yes') {
                        row.isCancellable = true;
                    } else {
                        row.isCancellable = false;
                    }

                    // Determine the category and set the protocolKey accordingly
                    let protocolKey = null; // Set the default protocolKey
                    if (category === 'Food and Beverages') {
                        protocolKey = '@ondc/org/mandatory_reqs_veggies_fruits';
                    } else if (category === 'Fashion') {
                        protocolKey = '@ondc/org/statutory_reqs_packaged_commodities';
                    } else if (category === 'Electronics') {
                        protocolKey = '';
                    } else if (category === 'Grocery') {
                        protocolKey = '@ondc/org/statutory_reqs_packaged_commodities';
                    } else if (category === 'Home and Kitchen') {
                        protocolKey = '@ondc/org/statutory_reqs_packaged_commodities';
                    } else if (category === 'Health and Wellness') {
                        protocolKey = '@ondc/org/statutory_reqs_packaged_commodities';
                    } else if (category === 'Beauty and Personal Care') {
                        protocolKey = '@ondc/org/statutory_reqs_packaged_commodities';
                    } else if (category === 'Appliances') {
                        protocolKey = '@ondc/org/statutory_reqs_packaged_commodities';
                    }
                    // Modify the row object to include the protocolKey
                    row.productSubcategory1 = JSON.stringify({
                        value: (row.productSubcategory1).toLowerCase().replace(/\s+/g, '_'),
                        key: row.productSubcategory1,
                        protocolKey: protocolKey
                    });
                    row.productCategory = category;

                    // Validate common attributes separately
                    const commonKeys = Object.keys(row).filter(key => templateAttributeKeys[category.toLowerCase().replace(/\s+/g, '')].includes(key));
                    const commonRow = {};
                    commonKeys.forEach(key => {
                        commonRow[key] = row[key];
                        delete row[key]; // Remove common keys from original row
                    });

                    const { error: commonValidationError, value: validatedCommonRow } = commonSchema.validate(commonRow, {
                        allowUnknown: true // Validate common attributes separately
                    });

                    // Validate merged schema for the row
                    const { error: validationError, value: validatedRow } = mergedSchema.validate(row, {
                        allowUnknown: true // Allows unknown keys in the input
                    });

                    if (!commonValidationError && !validationError) {
                        Object.assign(row, validatedCommonRow);
                        validatedRow.organization = req.user.organization;

                        let images = row?.images?.split(',') ?? [];

                        let imageUrls = [];

                        for (const img of images) {
                            var keyName = req.user.organization + '/' + 'productImages' + '/' + uuid();
                            const region = mergedEnvironmentConfig.s3.region;
                            const bucket = mergedEnvironmentConfig.s3.bucket;

                            const imageURL = img;
                            let res;
                            try {
                                res = await fetch(imageURL);
                            } catch (e) {
                                console.log(e);
                            }

                            if (res) {
                                console.log('mime--->', res);

                                let extention = imageURL.split('.').slice(-1)[0];
                                keyName = keyName + '.' + extention;
                                const blob = await res.buffer();
                                const s3 = new AWS.S3({
                                    useAccelerateEndpoint: true,
                                    region: region
                                });

                                await s3.upload({
                                    Bucket: bucket,
                                    Key: keyName,
                                    Body: blob
                                }).promise();

                                //console.log("uploaded image --->",uploadedImage);

                                imageUrls.push(keyName);
                            }

                        }

                        console.log('manufactured date----->', row.manufacturedDate);

                        row.images = imageUrls;
                        try {
                            let data = {
                                commonDetails: validatedRow,
                                commonAttributesValues: validatedCommonRow
                            };
                            await productService.create(data, currentUser);
                        } catch (e) {
                            console.log('e', e);
                        }
                    } else {
                        // Handle validation errors
                        let errors = [];
        
                        if (commonValidationError) {
                            errors = errors.concat(commonValidationError.details.map(err => err.message));
                        }
        
                        if (validationError) {
                            errors = errors.concat(validationError.details.map(err => err.message));
                        }
        
                        return res.status(400).json({
                            message: 'Row validation failed',
                            error: errors
                        });
                    }


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

    //customization funcs

    async createCustomization(req, res, next){
        try {
            const data = req.body;
            data.organization = req.user.organization;
            
            const result = await productService.createCustomization(data, req.user);
            return res.send(result);
        } catch (error) {
            console.log('[CustomizationController] [create] Error -', error);
            next(error);
        }
    }
    async getCustomization(req, res, next) {
        try {
            const { name, organization } = req.query;
            const offset = parseInt(req.query.offset) || 0;
            const limit = parseInt(req.query.limit) || 10;

            const params = {
                name,
                organization,
                offset,
                limit
            };

            const customizations = await productService.getCustomization(params,req.user);
            return res.json(customizations);
        } catch (error) {
            console.log('[CustomizationController] [getCustomization] Error:', error);
            next(error);
        }
    }

    async updateCustomization(req, res, next) {
        try {
            const { customizationId } = req.params;
            const updatedDetails = req.body;
            //console.log("UPDATED", updatedDetails);
    
            const updateResult = await productService.updateCustomization(updatedDetails, req.user, customizationId);
            //console.log("RESULT", updateResult);
    
            if (updateResult) {
                return res.status(200).json({ success: true, message: 'Customizations updated successfully.' });
            } else {
                return res.status(400).json({ success: false, message: 'Failed to update customizations.' });
            }
        } catch (error) {
            console.log('[CustomizationController] [updateCustomization] Error -', error);
            next(error);
        }
    }
    
    async deleteCustomization(req, res, next) {
        try {
            const { customizationId } = req.params;
            const deleteResult = await productService.deleteCustomization(customizationId, req.user);
    
            if (deleteResult && deleteResult.success) {
                return res.status(200).json({ success: true, message: 'Customization deleted successfully.', deletedCustomization: deleteResult.deletedCustomization });
            } else {
                return res.status(404).json({ success: false, message: 'Failed to delete customization or customization not found.' });
            }
        } catch (error) {
            console.log('[CustomizationController] [deleteCustomization] Error -', error);
            next(error);
        }
    }
    
    async getCustomizationById(req, res, next) {
        try {
            const currentUser = req.user;
            const { customizationId } = req.params;
    
            const customization = await productService.getCustomizationById(customizationId, currentUser);
    
            return res.send(customization);
        } catch (err) {
            console.error('[CustomizationController] [getCustomizationById] Error:', err);
            next(err);
        }
    }

}

export default ProductController;

