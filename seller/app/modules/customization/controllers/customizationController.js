import CustomizationService from '../v1/services/customizationService';

const customizationService = new CustomizationService();

class CustomizationController {
    async storeCustomizationsGroup(req, res, next) {
        try {
            const data = req.body;
            const categoryVariant = await customizationService.createCustomizationGroups(data, req.user);
            return res.send(categoryVariant);
        } catch (error) {
            next(error);
        }
    }

    async getCustomizationsGroup(req, res, next) {
        try {
            const currentUser = req.user;
            const customizationGroups = await customizationService.getCustomizationGroups(req.query,currentUser);
            return res.json(customizationGroups);
        } catch (error) {
            next(error);
        }
    }

    async updateCustomizationsGroup(req, res, next) {
        try {
            const currentUser = req.user;
            const data = req.body;
            const {groupId} = req.params;
            const updateResult = await customizationService.updateCustomizationGroups(groupId,data, currentUser);
            return res.send(updateResult);
        } catch (error) {
            next(error);
        }
    }

    async deleteCustomizationGroup(req, res, next) {
        try {
            const currentUser = req.user;
            const {groupId} = req.params;
            const deleteResult = await customizationService.deleteCustomizationGroup(currentUser, groupId);
            return res.send(deleteResult);
        } catch(error) {
            next(error);
        }
    }

    async getCustomizationGroupById(req, res, next) {
        const { groupId } = req.params;
        try{
            const currentUser = req.user;
            const customizationGroup = await customizationService.getCustomizationGroupById(groupId, currentUser);
            return res.send(customizationGroup);
        } catch(error) {
            next(error);
        }
    }
}

export default CustomizationController;
