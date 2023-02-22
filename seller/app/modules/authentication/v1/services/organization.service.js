import { v1 as uuidv1 } from 'uuid';
import MESSAGES from '../../../../lib/utils/messages';
import Organization from '../../models/organization.model';
import {
    NoRecordFoundError,
    DuplicateRecordFoundError,
    BadRequestParameterError,
} from '../../../../lib/errors';

//import axios from 'axios';
//import ServiceApi from '../../../../lib/utils/serviceApi';

class OrganizationService {
    async create(data) {
        try {
            let query = {};
            query.shortCode = data.shortCode;
            const organizationExist = await Organization.findOne(query);

            if (organizationExist) {
                throw new DuplicateRecordFoundError(MESSAGES.ORGANIZATION_ALREADY_EXISTS);
            }

            let  organization = new Organization;
            organization.name = data.name;
            organization.modules = data.modules;
            organization.shortCode = data.shortCode;
            organization.welcomeScreenContent = data.welcomeScreenContent;
            organization.isActive = data.isActive;
            organization.profilePic = data.profilePic;
            organization.colors = data.colors;
            let savedOrg = await organization.save();

            return organization;
        } catch (err) {
            console.log(`[OrganizationService] [create] Error in creating organization ${data.organizationId}`,err);
            throw err;
        }
    }

    async list(params) {
        try {
            let query={};
            if(params.name){
                query.name = { $regex: params.name, $options: 'i' };
            }
            const organizations = await Organization.find(query).sort({createdAt:1}).skip(params.offset).limit(params.limit);  
            const count = await Organization.find(query).countDocuments();
            let organizationData={
                count,
                organizations
            };
            return organizationData;
        } catch (err) {
            console.log('[OrganizationService] [getAll] Error in getting all organization ',err);
            throw err;
        }
    }

    async get(organizationId) {
        try {
            let organization = await Organization.findById(organizationId);

            if (organization) {
                return organization;
            } else {
                throw new NoRecordFoundError(MESSAGES.ORGANIZATION_NOT_EXISTS);
            }
        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id - ${organizationId}`,err);
            throw err;
        }
    }
}
export default OrganizationService;
