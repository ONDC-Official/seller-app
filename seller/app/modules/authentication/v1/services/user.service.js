import MESSAGES from '../../../../lib/utils/messages';
import {encryptPIN} from '../../../../lib/utils/utilityFunctions';
import {getSignedUrlForUpload,getSignedUrlForRead3} from '../../../../lib/utils/s3Utils';
import {
    NoRecordFoundError,
    DuplicateRecordFoundError,
} from '../../../../lib/errors/index';
import { v1 as uuidv1 } from 'uuid';
import User from '../../models/user.model';
import Role from '../../models/role.model';
import Organization from '../../models/organization.model';
import ServiceApi from '../../../../lib/utils/serviceApi';
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
            //const password = data.password;
            const password = "ONDC2023"; //data.password; //FIXME: reset to default random password once SES is activated

            console.log(`password-${password}`);

            let role = await Role.findOne({name:data.role});

            data.password = await encryptPIN('' + data.password);
            data.enabled = true;
            data.lastLoginAt = null;
            data.id = uuidv1();
            data.createdAt = Date.now();
            data.updatedAt = Date.now();
            let user = new User();
            user.organization = data.organization
            user.name = data.name;
            user.mobile = data.mobile;
            user.email = data.email;

            user.password = data.password;
            user.role=role._id
            let savedUser =  await user.save();
            //const organization = await Organization.findOne({_id:data.organizationId},{name:1});
            let mailData = { temporaryPassword: password, user: data};

            console.log("mailData------>",mailData)
            // let notificationData = {
            //     receivers: [data.email],
            //     data: mailData,
            //     template:name
            // };


            ServiceApi.sendEmail(
                {
                    receivers: [data.email],
                    template: 'SIGN_UP',
                    data: mailData,
                },
                user, null
            );


            return savedUser;
        } catch (err) {
            if (err.statusCode === 404)
                throw new NoRecordFoundError(MESSAGES.ORGANIZATION_NOT_EXISTS);
            throw err;
        }
    }

    async invite(data) {
        try {

            console.log("data to bootstrap--->",data);
            // Find user by email or mobile
            let query = { email:data.email};
            let userExist = await User.findOne(query);
            if (userExist) {
                throw new DuplicateRecordFoundError(MESSAGES.USER_ALREADY_EXISTS);
            }
            if (!data.password)
                data.password = Math.floor(100000 + Math.random() * 900000);


            let role = await Role.findOne({name:"Super Admin"});
            data.email = data.email.toLowerCase()
            const password = "ONDC2023"; //data.password; //FIXME: reset to default random password once SES is activated
            console.log(`password-${password}`);
            data.password = await encryptPIN('' + data.password);
            data.enabled = true;
            data.lastLoginAt = null;
            data.id = uuidv1();
            data.createdAt = Date.now();
            data.updatedAt = Date.now();
            let user = new User();
            user.organizations = data.organizationId
            user.name = data.name;
            user.mobile = data.mobile;
            user.email = data.email;
            user.password = data.password;
            user.role=role._id
            let savedUser =  await user.save();
            //const organization = await Organization.findOne({_id:data.organizationId},{name:1});
            let mailData = { temporaryPassword: password, user: data};

            console.log("mailData------>",mailData)


            ServiceApi.sendEmail(
                {
                    receivers: [data.email],
                    template: 'SIGN_UP',
                    data: mailData,
                },
                user, null
            );


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
            // query.organizationId = organizationId;
            // if(queryData.role){
            //     query.role = 'Super Admin';
            // }
            //{path: 'path',select : ['fields'],match:query}
            //const users = await User.find(query,{password:0}).populate({path: 'role',match: {name:queryData.role}}).sort({createdAt:1}).skip(queryData.offset).limit(queryData.limit);

            let userQuery ={role:{$ne:[]}};
            let roleQuery ={ name:queryData.role};
            const users = await User.aggregate([
                {
                    '$lookup':{
                        'from':'roles',
                        'localField':'role',
                        'foreignField':'_id',
                        'as': 'role',
                        'pipeline':[{'$match':roleQuery}]
                    }
                },{
                    '$match':userQuery,
                },
            ]).sort({createdAt:1}).limit(queryData.limit).skip(queryData.offset);


            const usersCount = await User.aggregate([
                {
                    '$lookup':{
                        'from':'roles',
                        'localField':'role',
                        'foreignField':'_id',
                        'as': 'role',
                        'pipeline':[{'$match':roleQuery}]
                    }
                },{
                    '$match':userQuery,
                },
            ]).count('count');

            let count;
            if(usersCount && usersCount.length > 0){
                count = usersCount[0].count;
            }else{
                count = 0;
            }

            //const count = await User.count(query);

            return {count:count,data:users};

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

    async upload(currentUser, path, body) {
            return await s3.getSignedUrlForUpload({ path, ...body,currentUser });
    }

}

export default UserService;
