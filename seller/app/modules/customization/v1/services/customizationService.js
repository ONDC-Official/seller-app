import CustomizationGroup from '../../models/customizationGroupModel';
import CustomizationGroupMapping from '../../models/customizationGroupMappingModel';
import { DuplicateRecordFoundError, NoRecordFoundError } from '../../../../lib/errors';
import MESSAGES from '../../../../lib/utils/messages';

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

                    await this.mappingCustomizations(newCustomizationGroup._id, customizationDetails.customizations);
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
                    await this.mappingCustomizations(id, customizationDetails);
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
                    const customizationMapping = new CustomizationGroupMapping({
                        customizationId,
                        parent: newCustomizationGroupId,
                        child: group.groupId,
                        default: isDefault,
                    });

                    await customizationMapping.save();
                }
            } else {
                const customizationMapping = new CustomizationGroupMapping({
                    customizationId,
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
    //TODO:Tirth add getOneGroup function also(Done)
    async getCustomizationGroupById(groupId, currentUser) {
        try {
            const customizationGroup = await CustomizationGroup.findOne({
                _id: groupId,
                organization: currentUser.organization
            });
            
            if (!customizationGroup) {
                throw new NoRecordFoundError(MESSAGES.CUSTOMIZATION_GROUP_NOT_EXISTS);
            }
    
            return customizationGroup;
        } catch (err) {
            console.log(`[CustomizationService] [getCustomizationGroupById] Error - ${currentUser.organization}`, err);
            throw err;
        }
    }
    
}

export default CustomizationService;
