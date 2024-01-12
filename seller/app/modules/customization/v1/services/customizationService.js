import CustomizationGroup from '../../models/customizationGroupModel';
import CustomizationGroupMapping from '../../models/customizationGroupMappingModel';
import { DuplicateRecordFoundError, NoRecordFoundError } from '../../../../lib/errors';
import MESSAGES from '../../../../lib/utils/messages';
import Product from '../../../product/models/product.model';


class CustomizationService {
    /**
 * internal func to store cutomizations
 * @param {*} customizationDetails 
 * @param {*} currentUser 
 * @returns true
 */
    async createCustomizationGroups(customizationDetails, currentUser) {
        try {
            if (customizationDetails) {
                const existingGroup = await CustomizationGroup.findOne({
                    name: customizationDetails.name,
                    organization: currentUser.organization
                });

                if (!existingGroup) {
                    let customizationGroupObj = {
                        name: customizationDetails.name,   //TODO:Tirth why dumping all obj, add only specific fields(Done)
                        inputType: customizationDetails.inputType,
                        minQuantity: customizationDetails.minQuantity,
                        maxQuantity: customizationDetails.maxQuantity,
                        seq: customizationDetails.seq,
                        organization: currentUser.organization,
                        updatedBy: currentUser.id,
                        createdBy: currentUser.id,
                    };
                    let newCustomizationGroup = new CustomizationGroup(customizationGroupObj);
                    await newCustomizationGroup.save();
                    
                    //TODO:Tirth why creating obj for paren class, use "this" for that(Done)

                    for(const customizations of customizationDetails.customizations ){
                        await this.mappingCustomizations(newCustomizationGroup._id, customizations);
                    }
                    return newCustomizationGroup;
                } else {
                    throw new DuplicateRecordFoundError(MESSAGES.CUSTOMIZATION_GROUP_ALREADY_EXISTS);
                }
            }
        } catch (err) {
            console.log(`[CustomizationService] [create] Error - ${currentUser.organization}`, err);
            throw err;
        }
    }

    //TODO:Tirth add filter on name(Done)
    async getCustomizationGroups(currentUser, params) {
        try {
            let query = {};
            
            if (params.name) {
                query.name = { $regex: params.name, $options: 'i' }; // Case-insensitive name search
            }
    
            const existingGroups = await CustomizationGroup.find(query).sort({ createdAt: 1 })
                .skip(params.offset)
                .limit(params.limit);
            const count = await CustomizationGroup.count(query);
            return {count,data:existingGroups};
        } catch (err) {
            console.log(`[CustomizationService] [getCustomizationGroups] Error - ${currentUser.organization}`, err);
            throw err;
        }
    }    

    async updateCustomizationGroups(id,customizationDetails, currentUser) {
        //TODO:Tirth check if given name has already been use in other group and throw error(Done)
        try {
            if (customizationDetails) {
                const existingGroupWithSameName = await CustomizationGroup.findOne({
                    _id:{$ne:id},
                    name: customizationDetails.name,
                    organization: currentUser.organization,
                });
    
                if (existingGroupWithSameName) {
                    throw new DuplicateRecordFoundError(MESSAGES.CUSTOMIZATION_ALREADY_EXISTS);
                }
                let existingGroup = await CustomizationGroup.findOne({
                    _id: id,
                    organization: currentUser.organization,
                });
                if (existingGroup) {
                    // Delete all mapping data associated with the existing group
                    
                    await CustomizationGroup.findOneAndUpdate(
                        { _id: existingGroup._id },
                        {
                            ...existingGroup.toObject(),
                            ...customizationDetails,
                            updatedBy: currentUser.id,
                        },
                        { new: true }
                    );
                    await CustomizationGroupMapping.deleteMany({ parent: existingGroup._id });
                    for(const customizations of customizationDetails.customizations){
                        await this.mappingCustomizations(id, customizations);
                    }
                    return { success: true };
                } else {
                    throw new NoRecordFoundError(MESSAGES.CUSTOMIZATION_GROUP_NOT_EXISTS);
                }
            }
        } catch (err) {
            console.log(`[CustomizationService] [update] Error - ${currentUser.organization}`, err);
            throw err;
        }
    }

    async deleteCustomizationGroup(currentUser, groupId) {
        try {
            await CustomizationGroupMapping.deleteMany({ groupId });
            const deletedCustomizationGroup = await CustomizationGroup.deleteOne({ _id: groupId, organization: currentUser.organization });
            return { success: true, deletedCustomizationGroup };
        } catch (err) {
            console.log(`[CustomizationService] [deleteCustomizations] Error - ${currentUser.organization}`, err);
            throw err;
        }
    }

    async mappingCustomizations(newCustomizationGroupId, customizationDetails) {
        try {
            const { customizationId, nextGroupId, default: isDefault } = customizationDetails;

            if (nextGroupId && nextGroupId.length > 0) {
                for (const group of nextGroupId) {
                    const groupId = group.groupId;
                    const customizationMapping = new CustomizationGroupMapping({
                        customization: customizationId,
                        parent: newCustomizationGroupId,
                        child: groupId,
                        default: isDefault,
                    });

                    await customizationMapping.save();
                }
            } else {
                const customizationMapping = new CustomizationGroupMapping({
                    customization: customizationId,
                    parent: newCustomizationGroupId,
                    child: '',
                    default: isDefault,
                });

                await customizationMapping.save();
            }
            return { success: true };
        } catch (error) {
            console.log(`Error populating customizations: ${error}`);
            throw error;
        }
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
    //TODO:Tirth add getOneGroup function also(Done)
    async getCustomizationGroupById(groupId, currentUser) {
        try {
            let customizationData = [];
            const customizationGroup = await CustomizationGroup.findOne({
                _id: groupId,
                organization: currentUser.organization
            });
    
            if (!customizationGroup) {
                throw new NoRecordFoundError(MESSAGES.CUSTOMIZATION_GROUP_NOT_EXISTS);
            }
            // Fetch customizationGroupMapping datas using the provided groupId
            const mappingData = await CustomizationGroupMapping.find({
                parent: groupId,
                organization: currentUser.organization
            });

            let mappings = this.groupBy(mappingData, 'customization');
    
            for (const mapping of mappings) {
                let customizationObj = {};
                // Access the customizationId property for each mapping
                const customizationId = mapping.id;
    
                // Fetch customization details using the customizationId from mapping
                const customization = await Product.findById(customizationId);
    
                if (!customization) {
                    console.error(`[CustomizationService] [getCustomizationGroupById] Error - Customization not found: ${customizationId}`);
                    continue;
                }

                let groupData = [];
                let defaultValue;

                for(const group of mapping.groups){
                    const nextGroup = await CustomizationGroup.findOne({_id: group.child});
                    let groupObj = {
                        groupId: group.child,
                        name: nextGroup.name
                    };
                    groupData.push(groupObj);
                    defaultValue = group.default;
                }

                customizationObj = {
                    customizationId: {
                        id: customizationId,
                        name: customization.productName
                    },
                    nextGroupId: groupData,
                    default: defaultValue 
                };
                customizationData.push(customizationObj);
            }

            const response = {
                name: customizationGroup.name,
                inputType: customizationGroup.inputType,
                minQuantity: customizationGroup.minQuantity,
                maxQuantity: customizationGroup.maxQuantity,
                seq: customizationGroup.seq,
                customizations: customizationData
            };
    
            return response;
        } catch (err) {
            console.log(`[CustomizationService] [getCustomizationGroupById] Error - ${currentUser.organization}`, err);
            throw err;
        }
    }
    
}

export default CustomizationService;
