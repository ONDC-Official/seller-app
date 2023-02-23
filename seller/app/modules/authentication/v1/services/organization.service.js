import { v1 as uuidv1 } from 'uuid';
import MESSAGES from '../../../../lib/utils/messages';
import Organization from '../../models/organization.model';
import User from '../../models/user.model';
import UserService from "./user.service";
import {
    NoRecordFoundError,
    DuplicateRecordFoundError,
    BadRequestParameterError,
} from '../../../../lib/errors';

//import axios from 'axios';
//import ServiceApi from '../../../../lib/utils/serviceApi';

const userService = new UserService()
class OrganizationService {
    async create(data) {
        try {
            let query = {};

            let orgDetails = data.providerDetails;
            const organizationExist = await Organization.findOne({name:orgDetails.name});

            if (organizationExist) {
                throw new DuplicateRecordFoundError(MESSAGES.ORGANIZATION_ALREADY_EXISTS);
            }

            let userExist = await User.findOne({email:data.user.email})

            if (userExist) {
                throw new DuplicateRecordFoundError(MESSAGES.USER_ALREADY_EXISTS);
            }

            let  organization = new Organization(orgDetails);
            let savedOrg = await organization.save();

            //create a user
            let user = await userService.create({...data.user,organization:organization._id,role:"Organization Admin"})

            return {user:user,providerDetail:organization};

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
            const count = await Organization.count(query)
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
            let organization = await Organization.findOne({_id:organizationId}).lean();

            console.log("organization----->",organization)
            let user = await User.findOne({organization:organizationId},{password:0})
            if (organization) {
                return {user:user,providerDetail:organization};
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
