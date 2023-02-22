import MESSAGES from '../../../../lib/utils/messages';
import {encryptPIN} from '../../../../lib/utils/utilityFunctions';
import {getSignedUrlForUpload,getSignedUrlForRead3} from '../../../../lib/utils/s3Utils';
import {
    NoRecordFoundError,
    DuplicateRecordFoundError,
} from '../../../../lib/errors/index';
import { v1 as uuidv1 } from 'uuid';
import User from '../../models/user.model';
import Organization from '../../models/organization.model';
//import ServiceApi from '../../../../lib/utils/serviceApi';
import s3 from '../../../../lib/utils/s3Utils'
class UserService {
    /**
   * Create a new user
   * @param {Object} data
   */
    async create(data) {
        try {

            console.log("data to bootstrap--->",data);
            // Find user by email or mobile
            let query = { email:data.email};
            let userExist = await User.findOne(query);
            if (userExist) {
                return userExist;
            }
            if (!data.password)
                data.password = Math.floor(100000 + Math.random() * 900000);

            data.email = data.email.toLowerCase()
            const password = data.password;
            console.log(`password-${password}`);
            data.password = await encryptPIN('' + data.password);
            data.enabled = true;
            data.lastLoginAt = null;
            data.id = uuidv1();
            data.createdAt = Date.now();
            data.updatedAt = Date.now();
            let user = new User();
            user.organizations = data.organizationId
            user.firstName = data.firstName; 
            user.lastName = data.lastName;
            user.middleName = data.middleName;
            user.mobile = data.mobile;
            user.email = data.email; 
            user.password = data.password;
            user.role=data.roleId
            let savedUser =  await user.save();
            //const organization = await Organization.findOne({_id:data.organizationId},{name:1});
            let mailData = { temporaryPassword: password, user: data};

            console.log("mailData------>",mailData)
            // let notificationData = {
            //     receivers: [data.email],
            //     data: mailData,
            //     template:name
            // };


            // ServiceApi.sendEmail(
            //     {
            //         receivers: [data.email],
            //         template: 'SIGN_UP',
            //         data: mailData,
            //     },
            //     user, null
            // );


            return savedUser;
        } catch (err) {
            if (err.statusCode === 404)
                throw new NoRecordFoundError(MESSAGES.ORGANIZATION_NOT_EXISTS);
            throw err;
        }
    }

    /**
   * Update user
   * @param data
   * @param currentUser
   * @returns {updatedUser}
   */
    async update(id, data, currentUser) {
        try {
            const query = {
                selector: { _id: { $eq: id } },
            };
            let user = await User(currentUser.organizationId).findOne(query);
            if (!user) {
                throw new NoRecordFoundError(MESSAGES.USER_NOT_EXISTS);
            }
            const updatedUser = { ...user, ...data };
            const result = await User(currentUser.organizationId).update(
                updatedUser
            );
            return result;
        } catch (err) {
            if (err.statusCode === 404)
                throw new NoRecordFoundError(MESSAGES.ORGANIZATION_NOT_EXISTS);
            throw err;
        }
    }

    /**
   * Fetch single user details by id
   * - this method is called from login action and get user details action
   * @param {String} id Id of the User
   * @param {Object|undefined} permission Users permissions (It can be undefined for login action)
   */
    async get(userId,currentUser) {
        try {

            let user = await User.findOne({_id:userId,organizationId:currentUser.organizationId});
            console.log('user');
            console.log(user);
            return user;
        } catch (err) {
            if (err.statusCode === 404)
                throw new NoRecordFoundError(MESSAGES.USER_NOT_EXISTS);
            throw err;
        }
    }

    /**
   * Fetch single user details by id
   * - this method is called from login action and get user details action
   * @param {String} id Id of the User
   * @param {Object|undefined} permission Users permissions (It can be undefined for login action)
   */
    async getUserApps(userId,currentUser) {
        try {

            let user = await User.findOne({_id:currentUser.id,organizationId:currentUser.organizationId},{ password: 0,enabled:0,isSystemGeneratedPassword:0 });

            let userOrgs  = await Promise.all(  user.organizations.map(async (org) =>{
                let orgDetails = await Organization.findOne({_id:org.id});
                org.name = orgDetails.name;
                org.organizationId = orgDetails._id;
                return org;
            }));
            user.organizations=userOrgs;

            return user;
        } catch (err) {
            if (err.statusCode === 404)
                throw new NoRecordFoundError(MESSAGES.USER_NOT_EXISTS);
            throw err;
        }
    }

    async usersById(userId){
        try {

            const users = await User.find({_id:userId},{password:0}).populate('role');
            console.log(users);
            if(!users){
                throw  new NoRecordFoundError(MESSAGES.USER_NOT_EXISTS);
            }else{
                return users;
            }
        } catch (err) {
            throw err;
        }
    }

    /**
   * Fetch list of all users in the system
   * - Users list depends on role of ther user(API caller)
   * @param {Object} params query params
   * @param {Object} currentUser Current user is fetched from JWT token which is used to make a request
   * @param {Object} permission Current users permission
   */
    async list(organizationId,queryData) {
        try {
            //building query            
            let query = {};
            query.organizationId = organizationId;
            if(queryData.firstName){
                query.firstName = { $regex: queryData.firstName, $options: 'i' };
            }
            if(queryData.email){
                query.email = { $regex: queryData.email, $options: 'i' };
            }
            if(queryData.mobile){
                query.mobile = { $regex: queryData.mobile, $options: 'i' };
            }
            const users = await User.find(query,{password:0}).populate('role').sort({createdAt:1}).skip(queryData.offset).limit(queryData.limit);
            return users;

        } catch (err) {
            throw err;
        }
    }

    async uploads(identity){
        if(identity){
            try {
                if (identity.aadhaarVerification)
                    identity.aadhaarVerification = (await getSignedUrlForRead({ path: identity.aadhaarVerification }));
            } catch {
                delete identity.aadhaarVerification;
            }
            try {
                if (identity.addressProof)
                    identity.addressProof = (await getSignedUrlForRead({ path: identity.addressProof }));
            } catch {
                delete identity.addressProof;
            }
            try {
                if (identity.identityProof)
                    identity.identityProof = (await getSignedUrlForRead({ path: identity.identityProof }));
            } catch {
                delete identity.identityProof;
            }
            return identity;
        }
    }

    async upload(path, fileType) {
            return await s3.getSignedUrlForUpload({ path, fileType });
    }

}

export default UserService;
