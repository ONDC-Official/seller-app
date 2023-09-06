import { v1 as uuidv1 } from 'uuid';
import MESSAGES from '../../../../lib/utils/messages';
import Organization from '../../models/organization.model';
import User from '../../models/user.model';
import UserService from './user.service';
import {
    NoRecordFoundError,
    DuplicateRecordFoundError,
    BadRequestParameterError,
} from '../../../../lib/errors';
import s3 from '../../../../lib/utils/s3Utils';
import HttpRequest from '../../../../lib/utils/HttpRequest';
import {mergedEnvironmentConfig} from '../../../../config/env.config';

//import axios from 'axios';
//import ServiceApi from '../../../../lib/utils/serviceApi';

const userService = new UserService();
class OrganizationService {
    async create(data) {
        try {
            let query = {};

            let orgDetails = data.providerDetails;
            const organizationExist = await Organization.findOne({name:orgDetails.name});

            if (organizationExist) {
                throw new DuplicateRecordFoundError(MESSAGES.ORGANIZATION_ALREADY_EXISTS);
            }

            let userExist = await User.findOne({email:data.user.email});

            if (userExist) {
                throw new DuplicateRecordFoundError(MESSAGES.USER_ALREADY_EXISTS);
            }

            let  organization = new Organization(orgDetails);
            let savedOrg = await organization.save();

            //create a user
            let user = await userService.create({...data.user,organization:organization._id,role:'Organization Admin'});

            return {user:user,providerDetail:organization};

        } catch (err) {
            console.log(`[OrganizationService] [create] Error in creating organization ${data.organizationId}`,err);
            throw err;
        }
    }
    async signup(data) {
        try {
            let query = {};

            let orgDetails = data.providerDetails;
            const organizationExist = await Organization.findOne({name:orgDetails.name});

            if (organizationExist) {
                throw new DuplicateRecordFoundError(MESSAGES.ORGANIZATION_ALREADY_EXISTS);
            }

            let userExist = await User.findOne({email:data.user.email});

            if (userExist) {
                throw new DuplicateRecordFoundError(MESSAGES.USER_ALREADY_EXISTS);
            }

            let  organization = new Organization(orgDetails);
            let savedOrg = await organization.save();

            //create a user
            let user = await userService.signup({...data.user,organization:organization._id,role:'Organization Admin'});

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
            if(params.mobile){
                query.contactMobile = params.mobile;
            }
            if(params.email){
                query.contactEmail = params.email;
            }
            if(params.storeName){
                query['storeDetails.name'] = { $regex: params.storeName, $options: 'i' };
            }
            const organizations = await Organization.find(query).sort({createdAt:1}).skip(params.offset).limit(params.limit);
            const count = await Organization.count(query);
            let organizationData={
                count,
                organizations
            };
            return organizationData;
        } catch (err) {
            console.log('[OrderService] [getAll] Error in getting all organization ',err);
            throw err;
        }
    }

    async get(organizationId) {
        try {
            let doc = await Organization.findOne({_id:organizationId}).lean();

            console.log('organization----->',doc);
            let user = await User.findOne({organization:organizationId},{password:0});
            if (doc) {
                {
                    let idProof = await s3.getSignedUrlForRead({path:doc.idProof});
                    doc.idProof =idProof;

                    let addressProof = await s3.getSignedUrlForRead({path:doc.addressProof});
                    doc.addressProof =addressProof;

                    let cancelledCheque = await s3.getSignedUrlForRead({path:doc.bankDetails.cancelledCheque});
                    doc.bankDetails.cancelledCheque =cancelledCheque;

                    let PAN = await s3.getSignedUrlForRead({path:doc.PAN.proof});
                    doc.PAN.proof =PAN;

                    let GSTN = await s3.getSignedUrlForRead({path:doc.GSTN.proof});
                    doc.GSTN.proof =GSTN;

                    if(doc.storeDetails){
                        let logo = await s3.getSignedUrlForRead({path:doc.storeDetails?.logo});
                        doc.storeDetails.logo =logo;
                    }
                }

                return {user:user,providerDetail:doc};
            } else {
                throw new NoRecordFoundError(MESSAGES.ORGANIZATION_NOT_EXISTS);
            }
        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id - ${organizationId}`,err);
            throw err;
        }
    }

    async ondcGet(organizationId) {
        try {
            let doc = await Organization.findOne({_id:organizationId}).lean();

            let user = await User.findOne({organization:organizationId},{password:0});
            if (doc) {
                {
                    let idProof = await s3.getSignedUrlForRead({path:doc.idProof});
                    doc.idProof =idProof.url;

                    let addressProof = await s3.getSignedUrlForRead({path:doc.addressProof});
                    doc.addressProof =addressProof.url;

                    let cancelledCheque = await s3.getSignedUrlForRead({path:doc.bankDetails.cancelledCheque});
                    doc.bankDetails.cancelledCheque =cancelledCheque.url;

                    let PAN = await s3.getSignedUrlForRead({path:doc.PAN.proof});
                    doc.PAN.proof =PAN.url;

                    let GSTN = await s3.getSignedUrlForRead({path:doc.GSTN.proof});
                    doc.GSTN.proof =GSTN.url;

                    if(doc.storeDetails){
                        let logo = await s3.getSignedUrlForRead({path:doc.storeDetails?.logo});
                        doc.storeDetails.logo =logo.url;
                    }
                }

                return {user:user,providerDetail:doc};
            } else {
                return '';
            }
        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id - ${organizationId}`,err);
            throw err;
        }
    }

    async setStoreDetails(organizationId,data) {
        try {
            let organization = await Organization.findOne({_id:organizationId});//.lean();
            if (organization) {
                organization.storeDetails =data;
                organization.save();
                this.notifyStoreUpdate(data,organizationId);
            } else {
                throw new NoRecordFoundError(MESSAGES.ORGANIZATION_NOT_EXISTS);
            }
            return data;
        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id - ${organizationId}`,err);
            throw err;
        }
    }

    async update(organizationId,data) {
        try {
            let organization = await Organization.findOne({_id:organizationId});//.lean();
            if (organization) {

                let userExist = await User.findOne({mobile:data.user.mobile,organization:organizationId});

                if (userExist && userExist.organization !==organizationId ) {
                    throw new DuplicateRecordFoundError(MESSAGES.USER_ALREADY_EXISTS);
                }
                else{
                    const updateUser  = await User.findOneAndUpdate({organization:organizationId},data.user);
                }

                let updateOrg = await Organization.findOneAndUpdate({_id:organizationId},data.providerDetails);
                this.notifyOrgUpdate(data.providerDetails,organizationId);

            } else {
                throw new NoRecordFoundError(MESSAGES.ORGANIZATION_NOT_EXISTS);
            }
            return data;
        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id - ${organizationId}`,err);
            throw err;
        }
    }

    async getStoreDetails(organizationId,data) {
        try {
            let organization = await Organization.findOne({_id:organizationId},{storeDetails:1}).lean();
            if (organization) {

                if(organization?.storeDetails){
                    let logo = await s3.getSignedUrlForRead({path:organization?.storeDetails?.logo});
                    organization.storeDetails.logo =logo;
                }else{
                    organization.storeDetails = {};
                }
                delete organization.storeDetails.categories;
                return organization;
            } else {
                throw new NoRecordFoundError(MESSAGES.ORGANIZATION_NOT_EXISTS);
            }

        } catch (err) {
            console.log(`[OrganizationService] [get] Error in getting organization by id - ${organizationId}`,err);
            throw err;
        }
    }
    async notifyOrgUpdate(provider,orgId){
        let requestData = {
            organization :orgId,
            category : provider?.storeDetails?.category
        };
        if(provider?.disable){
            let httpRequest = new HttpRequest(
                mergedEnvironmentConfig.intraServiceApiEndpoints.client,
                '/api/v2/client/status/orgUpdate',
                'POST',
                requestData,
                {}
            );
            await httpRequest.send();
        }
        return {success : true};
    }
    async notifyStoreUpdate(store,orgId){
        let requestData = {
            organization :orgId,
            locationId : store?.location?._id,
            category : store.category
        };
        if(store.storeTiming?.status === 'disabled'){
            requestData.updateType = 'disable';
            let httpRequest = new HttpRequest(
                mergedEnvironmentConfig.intraServiceApiEndpoints.client,
                '/api/v2/client/status/storeUpdate',
                'POST',
                requestData,
                {}
            );
            await httpRequest.send();
        }else if(store.storeTiming?.status === 'closed'){
            requestData.updateType = 'closed';
            requestData.storeTiming = store.storeTiming;
            let httpRequest = new HttpRequest(
                mergedEnvironmentConfig.intraServiceApiEndpoints.client,
                '/api/v2/client/status/storeUpdate',
                'POST',
                requestData,
                {}
            );
            await httpRequest.send();
        }
        return {success : true};
    }
}
export default OrganizationService;
