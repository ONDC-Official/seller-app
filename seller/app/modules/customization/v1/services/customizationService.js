import CustomizationGroup from '../../models/customizationGroupModel';
import CustomizationGroupMapping from '../../models/customizationGroupMappingModel';
import Product from '../../../product/models/product.model';
import { ConflictError, DuplicateRecordFoundError, NoRecordFoundError } from '../../../../lib/errors';
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
                        name: customizationDetails.name,
                        description: customizationDetails.description,
                        inputType: customizationDetails.inputType,
                        minQuantity: customizationDetails.minQuantity,
                        maxQuantity: customizationDetails.maxQuantity,
                        seq: customizationDetails.seq,
                        organization: currentUser.organization,
                        updatedBy: currentUser.id,
                        createdBy: currentUser.id,
                    };
                    let newCustomizationGroup = new CustomizationGroup(customizationGroupObj);
                    // await this.isValidTreeStructure('',customizationDetails);
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
    async getCustomizationGroups(params, currentUser) {
        try {
            let query = {
                organization:currentUser.organization
            };
            
            if (params.name) {
                query.name = { $regex: params.name, $options: 'i' }; // Case-insensitive name search
            }

            if (params.seq) {
                query.seq = { $gt: Number(params.seq) }; // Find sequences greater than the provided value
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
                await this.isValidTreeStructure(id, customizationDetails,currentUser);

                let existingGroup = await CustomizationGroup.findOne({
                    _id: id,
                    organization: currentUser.organization,
                });
                if (existingGroup) {
                    // Check and handle sequence (seq) update
                    if (customizationDetails.seq >= existingGroup.seq) {
                        const nextGroupIds = customizationDetails.customizations.map((c) => c.nextGroupId.map((ng) => ng.groupId)).flat();
                        //console.log("IDDDDSSS", nextGroupIds);
                        const nextGroups = await CustomizationGroup.find({
                            _id: { $in: nextGroupIds },
                            organization: currentUser.organization,
                            seq: { $lte: customizationDetails.seq },
                        });

                        //console.log("NEXTTTTT", nextGroupIds);
    
                        for (const nextGroup of nextGroups) {
                            if (nextGroup) {
                                throw new ConflictError(MESSAGES.SE_NEXTGROUP_ERROR);
                            }
                        }
                    }
                } else {
                    // Check if the existing group is a parent in the group mapping table
                    const isChild = await CustomizationGroupMapping.findOne({
                        child: existingGroup._id,
                    });

                    // Throw a child error only if the existing group is a parent in the group mapping table
                    if (isChild) {
                        throw new ConflictError(MESSAGES.SEQ_CHILD_ERROR);
                    }
                }
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
    
                for (const customizations of customizationDetails.customizations) {
                    await this.mappingCustomizations(id, customizations);
                }
    
                return { success: true };
            } else {
                throw new NoRecordFoundError(MESSAGES.CUSTOMIZATION_GROUP_NOT_EXISTS);
            }
        } catch (err) {
            console.log(`[CustomizationService] [update] Error - ${currentUser.organization}`, err);
            throw err;
        }
    }

    async deleteCustomizationGroup(currentUser, groupId) {
        try {
            //TODO:Tirth write proper query(Done)
            // Check if the group is used in any products
            const isUsedInProducts = await Product.findOne({ customizationGroupId: groupId, organization: currentUser.organization });
            if (isUsedInProducts) {
                throw new ConflictError(MESSAGES.CUSTOMIZATION_GROUP_EXISTS_FOR_ONE_OR_MORE_PRODUCTS);
            }

            // Check if the group is a child in the mapping table
            const isChildInMapping = await CustomizationGroupMapping.findOne({ child: groupId, organization: currentUser.organization });
            if (isChildInMapping) {
                throw new ConflictError(MESSAGES.CUSTOMIZATION_GROUP_CHILD);
            }
            const deletedCustomizationGroup = await CustomizationGroup.deleteOne({ _id: groupId, organization: currentUser.organization });
            //removig associated child mapping
            CustomizationGroup.deleteMany({ parent: groupId, organization: currentUser.organization });
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
                    defaultValue = group.default;
                    if (!nextGroup) {
                        console.error(`[CustomizationService] [getCustomizationGroupById] Warning - Next group not found: ${group.child}`);
                        continue;
                    }
                    let groupObj = {
                        groupId: group.child,
                        name: nextGroup.name,
                        description:nextGroup?.description ?? ''
                    };
                    groupData.push(groupObj);
                }

                customizationObj = {
                    customizationId: {
                        id: customizationId,
                        name: customization.productName,
                        description:customization?.description ?? ''
                    },
                    nextGroupId: groupData,
                    default: defaultValue 
                };
                customizationData.push(customizationObj);
            }

            const response = {
                _id: customizationGroup._id,
                name: customizationGroup.name,
                description:customizationGroup?.description ?? '',
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
    async mappdedData(groupId,currentUser){
        if(groupId){
            const mappedData = await this.getMappedCustomizationAndGroup(groupId,[],[],currentUser);
            return {
                customizationGroups : mappedData.customizationGroups,
                customizations : mappedData.customizations
            };
        }
        return {};
    }

    async getMappedCustomizationAndGroup(groupId,customizationGroups=[],customizations = [],currentUser){
        const group = await CustomizationGroup.findOne({_id:groupId,organization:currentUser.organization});
        if(!group){
            throw new NoRecordFoundError(MESSAGES.CUSTOMIZATION_GROUP_NOT_EXISTS+groupId);
        }
        customizationGroups.push(group);
        const mappedData = await CustomizationGroupMapping.find({parent:groupId,organization:currentUser.organization});
        const mappingData =this.groupBy(mappedData, 'customization');
        if(mappingData && mappingData.length>0){
            for(const data of mappingData){
                let customizationObj ={};
                const customization = await Product.findOne({_id:data.id,organization:currentUser.organization,type:'customization'},{quantity:1,maxAllowedQty:1,productName:1,UOMValue:1,UOM:1,MRP:1,vegNonVeg:1});
                if(customization){
                    if(data.groups && data.groups.length>0){
                        for(const group of data.groups){
                            customizationObj={
                                _id: customization._id,
                                productName: customization.productName,
                                MRP: customization.MRP,
                                parentId: groupId,
                                childId: group.child,
                                quantity: customization.quantity,
                                maxAllowedQty: customization.maxAllowedQty,
                                UOMValue: customization.UOMValue,
                                UOM: customization.UOM,
                                vegNonVeg: customization.vegNonVeg
                            };
                            customizations.push(customizationObj);
                            if(group.child){
                                const mappedGroupdata = await this.getMappedCustomizationAndGroup(group.child,customizationGroups,customizations,currentUser);
                                customizationGroups = mappedGroupdata.customizationGroups ?? [];
                                customizations = mappedGroupdata.customizations ?? [];
                            }
                        }
                    }
                }
            }
        }
        return {customizationGroups,customizations};
    }

    async isValidTreeStructure(id, customizationDetails, currentUser) {   
        const customizations =customizationDetails.customizations;
    
        const response = await this.traverseForward(id, [], customizations, [], currentUser);    
        return response;
    }

    async traverseForward(groupId, childIds=[], customizations =[],mappedData = [], currentUser) {
        childIds.push(groupId);
        let isDuplicatePresent = false;
        if(childIds.length > 0){
            isDuplicatePresent = await this.hasDuplicates(childIds);
            if(isDuplicatePresent){
                console.log({childIds});
                throw new ConflictError(MESSAGES.CIRCULAR_REFERENCE_DETECT);
            }
        }
        if(customizations.length > 0){
            for(const customization of customizations){
                if(customization.nextGroupId && customization.nextGroupId.length>0) {
                    for(const group of customization.nextGroupId){
                        const groupData = await CustomizationGroupMapping.find({parent:group.groupId,organization:currentUser.organization});
                        childIds = await this.traverseForward(group.groupId, childIds, [] ,groupData, currentUser);
                    }
                }
            }
        }
        if(mappedData.length > 0){
            for(const data of mappedData){
                if(data.child){
                    const groupData = await CustomizationGroupMapping.find({parent:data.child,organization:currentUser.organization});
                    childIds = await this.traverseForward(data.child, childIds, [] ,groupData, currentUser);
                }
            }
        }
        return childIds;
    }

    async hasDuplicates(array) {
        return (new Set(array)).size !== array.length;
    }
}

export default CustomizationService;
