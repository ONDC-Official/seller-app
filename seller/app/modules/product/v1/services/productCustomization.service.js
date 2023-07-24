import { NoRecordFoundError } from '../../../../lib/errors';
import MESSAGES from '../../../../lib/utils/messages';
import Product from '../../models/product.model';
import ProductCustomization from '../../models/productCustomization.model';
import ProductCustomizationGroup from '../../models/productCustomizationGroup.model';

class ProductCustomizationService {
    async create(productId,customizationDetails,currentUser) {
        try {
            // let query = {};

            const customizationExist = await ProductCustomizationGroup.find({product:productId,organization:currentUser.organization});
            if (customizationExist) {
                await ProductCustomizationGroup.deleteMany({product:productId,organization:currentUser.organization});
                await ProductCustomization.deleteMany({product:productId,organization:currentUser.organization});
            }
            if(customizationDetails){
                const customizationGroups = customizationDetails.customizationGroups;
                const customizations = customizationDetails.customizations;
                for(const customizationGroup of customizationGroups){
                    let customizationGroupObj = {
                        ...customizationGroup,
                        product:productId,
                        organization : currentUser.organization,
                        updatedBy : currentUser.id,
                        createdBy : currentUser.id,
                    };
                    let productCustomizationGroup = new ProductCustomizationGroup(customizationGroupObj);
                    await productCustomizationGroup.save();
                }
                for(const customization of customizations){
                    let customizationObj = {
                        ...customization,
                        product:productId,
                        organization : currentUser.organization,
                        updatedBy : currentUser.id,
                        createdBy : currentUser.id,
                    };
                    let productCustomizationGroup = new ProductCustomization(customizationObj);
                    await productCustomizationGroup.save();
                }
         
                return {success:true};
            }
        } catch (err) {
            console.log(`[ProductCustomizationService] [create] Error - ${currentUser.organization}`,err);
            throw err;
        }
    }

    async get(productId,currentUser){
        try {
            const product = await Product.findOne({_id: productId,organization:currentUser.organization});
            if(product){
                let customizations = [];
                let customizationGroups = await ProductCustomizationGroup.find({product: productId,organization:currentUser.organization}).lean();
                for(const customizationGroup of customizationGroups){
                    let customizationData = await ProductCustomization.find({parent: customizationGroup.id,organization:currentUser.organization});
                    let customizationGroupObj ={...customizationGroup,customizations:customizationData};
                    customizations.push(customizationGroupObj);
                }
                return {data:customizations};
            }
            throw new NoRecordFoundError(MESSAGES.PRODUCT_NOT_EXISTS);
        } catch (err) {
            console.log(`[ProductCustomizationService] [get] Error - ${currentUser.organization}`,err);
            throw err;
        }
    }

}
export default ProductCustomizationService;
