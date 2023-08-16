import MESSAGES from '../../../../lib/utils/messages';
import {encryptPIN} from '../../../../lib/utils/utilityFunctions';
import {getSignedUrlForUpload, getSignedUrlForRead3} from '../../../../lib/utils/s3Utils';
import {
    NoRecordFoundError,
    DuplicateRecordFoundError,
} from '../../../../lib/errors/index';
import {v1 as uuidv1} from 'uuid';
import User from '../../models/user.model';
import Role from '../../models/role.model';
import LoginAttempts from '../../models/loginAttempts.model';
import BannedUser from '../../models/bannedUser.model';
import Organization from '../../models/organization.model';
import ServiceApi from '../../../../lib/utils/serviceApi';
import s3 from '../../../../lib/utils/s3Utils';

class UserService {
    /**
     * Create a new user
     * @param {Object} data
     */
    async create(data) {
        try {

            console.log('data to bootstrap--->', data);
            // Find user by email or mobile
            let query = {email: data.email};
            let userExist = await User.findOne(query);
            if (userExist) {
                return userExist;
            }
            if (!data.password)
                data.password = Math.floor(100000 + Math.random() * 900000);

            data.email = data.email.toLowerCase();
            //const password = data.password;
            const password = data.password; //FIXME: reset to default random password once SES is activated

            console.log(`password-${password}`);

            let role = await Role.findOne({name: data.role});

            data.password = await encryptPIN('' + password);
            data.enabled = true;
            data.lastLoginAt = null;
            data.id = uuidv1();
            data.createdAt = Date.now();
            data.updatedAt = Date.now();
            let user = new User();
            user.organization = data.organization;
            user.name = data.name;
            user.mobile = data.mobile;
            user.email = data.email;

            user.password = data.password;
            user.role = role._id;
            let savedUser = await user.save();
            //const organization = await Organization.findOne({_id:data.organizationId},{name:1});
            let mailData = {temporaryPassword: password, user: data};

            console.log('mailData------>', mailData);
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

    async signup(data) {
        try {

            console.log('data to bootstrap--->', data);
            // Find user by email or mobile
            let query = {email: data.email};
            let userExist = await User.findOne(query);
            if (userExist) {
                return userExist;
            }
            if (!data.password)
                data.password = Math.floor(100000 + Math.random() * 900000);

            data.email = data.email.toLowerCase();
            //const password = data.password;
            const password = data.password; //FIXME: reset to default random password once SES is activated

            console.log(`password-${password}`);

            let role = await Role.findOne({name: data.role});

            data.password = await encryptPIN('' + password);
            data.enabled = true;
            data.lastLoginAt = null;
            data.id = uuidv1();
            data.createdAt = Date.now();
            data.updatedAt = Date.now();
            let user = new User();
            user.organization = data.organization;
            user.name = data.name;
            user.mobile = data.mobile;
            user.email = data.email;

            user.password = data.password;
            user.role = role._id;
            let savedUser = await user.save();
            //const organization = await Organization.findOne({_id:data.organizationId},{name:1});
            // let mailData = {temporaryPassword: password, user: data};

            // console.log('mailData------>', mailData);
            // let notificationData = {
            //     receivers: [data.email],
            //     data: mailData,
            //     template:name
            // };

            //
            // ServiceApi.sendEmail(
            //     {
            //         receivers: [data.email],
            //         template: 'SIGN_UP',
            //         data: mailData,
            //     },
            //     user, null
            // );


            return data;
        } catch (err) {
            if (err.statusCode === 404)
                throw new NoRecordFoundError(MESSAGES.ORGANIZATION_NOT_EXISTS);
            throw err;
        }
    }

    async invite(data) {
        try {

            console.log('data to bootstrap--->', data);
            // Find user by email or mobile
            let query = {email: data.email};
            let userExist = await User.findOne(query);
            if (userExist) {
                throw new DuplicateRecordFoundError(MESSAGES.USER_ALREADY_EXISTS);
            }
            if (!data.password)
                data.password = Math.floor(100000 + Math.random() * 900000);


            let role = await Role.findOne({name: 'Super Admin'});
            data.email = data.email.toLowerCase();
            const password = data.password; //FIXME: reset to default random password once SES is activated
            console.log(`password-${password}`);
            data.password = await encryptPIN('' + password);
            data.enabled = true;
            data.lastLoginAt = null;
            data.id = uuidv1();
            data.createdAt = Date.now();
            data.updatedAt = Date.now();
            let user = new User();
            user.organizations = data.organizationId;
            user.name = data.name;
            user.mobile = data.mobile;
            user.email = data.email;
            user.password = data.password;
            user.role = role._id;
            let savedUser = await user.save();
            //const organization = await Organization.findOne({_id:data.organizationId},{name:1});
            let mailData = {temporaryPassword: password, user: data};

            console.log('mailData------>', mailData);


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
                selector: {_id: {$eq: id}},
            };
            let user = await User(currentUser.organizationId).findOne(query);
            if (!user) {
                throw new NoRecordFoundError(MESSAGES.USER_NOT_EXISTS);
            }
            const updatedUser = {...user, ...data};
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
    async get(userId, currentUser) {
        try {

            let user = await User.findOne({_id: userId, organizationId: currentUser.organizationId});
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
    async getUserApps(userId, currentUser) {
        try {

            let user = await User.findOne({
                _id: currentUser.id,
                organizationId: currentUser.organizationId
            }, {password: 0, enabled: 0, isSystemGeneratedPassword: 0});

            let userOrgs = await Promise.all(user.organizations.map(async (org) => {
                let orgDetails = await Organization.findOne({_id: org.id});
                org.name = orgDetails.name;
                org.organizationId = orgDetails._id;
                return org;
            }));
            user.organizations = userOrgs;

            return user;
        } catch (err) {
            if (err.statusCode === 404)
                throw new NoRecordFoundError(MESSAGES.USER_NOT_EXISTS);
            throw err;
        }
    }

    async usersById(userId) {
        try {

            const users = await User.find({_id: userId}, {password: 0}).populate('role');
            console.log(users);
            if (!users) {
                throw  new NoRecordFoundError(MESSAGES.USER_NOT_EXISTS);
            } else {
                return users;
            }
        } catch (err) {
            throw err;
        }
    }

    async enable(userId, data) {
        try {

            const users = await User.findOne({_id: userId});
            console.log(users);
            if (!users) {
                throw  new NoRecordFoundError(MESSAGES.USER_NOT_EXISTS);
            } else {

                users.enabled = data.enabled;
                await users.save();
                return data;
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
    async list(currentUser, queryData) {
        try {
            let query = {};
            if (queryData.storeName || queryData.storeEmail || queryData.storeMobile) {
                let andQuery = [];
                if(queryData.storeName){
                    andQuery.push({name:{ $regex: queryData.storeName, $options: 'i' }});
                }
                if(queryData.storeEmail){
                    andQuery.push({contactEmail:{ $regex: queryData.storeEmail, $options: 'i' }});
                }
                if(queryData.storeMobile){
                    andQuery.push({contactMobile:{ $regex: queryData.storeMobile, $options: 'i' }});
                }
                let orgQuery = {
                    $and:andQuery
                };
                const organizations = await Organization.find(orgQuery,{_id:1});
                const organizationIds = organizations.map((organization)=> {return organization._id})
                query.organization = { $in: organizationIds };
            }   
         
            if (queryData.name) {
                query.name = { $regex: queryData.name, $options: 'i' };
            }
            if (queryData.mobile) {
                query.mobile = { $regex: queryData.mobile, $options: 'i' };
            }
            if (queryData.email) {
                query.email = { $regex: queryData.email, $options: 'i' };
            }
            query.role = { $ne: [] };
            let roleQuery = { name: queryData.role };
            const users = await User.aggregate([
                {
                    '$lookup': {
                        'from': 'roles',
                        'localField': 'role',
                        'foreignField': '_id',
                        'as': 'role',
                        'pipeline': [{ '$match': roleQuery }]
                    },
                }, {
                    '$match': query,
                }, { '$project': { 'password': 0 } }
            ]).sort({ createdAt: 1 }).skip(queryData.offset * queryData.limit).limit(queryData.limit);

            const usersCount = await User.aggregate([
                {
                    '$lookup': {
                        'from': 'roles',
                        'localField': 'role',
                        'foreignField': '_id',
                        'as': 'role',
                        'pipeline': [{ '$match': roleQuery }]
                    }
                }, {
                    '$match': query,
                },
            ]).count('count');

            for (const user of users) { //attach org details

                let organization = await Organization.findOne({ _id: user.organization }, { _id: 1, name: 1 ,contactEmail:1,contactMobile:1});
                user.organization = organization;

                let bannedUser = await BannedUser.findOne({ user: user._id });
                user.bannedUser = bannedUser;

            }
            let count;
            if (usersCount && usersCount.length > 0) {
                count = usersCount[0].count;
            } else {
                count = 0;
            }

            //const count = await User.count(query);

            return { count: count, data: users };

        } catch (err) {
            throw err;
        }
    }

    async uploads(identity) {
        if (identity) {
            try {
                if (identity.aadhaarVerification)
                    identity.aadhaarVerification = (await getSignedUrlForRead({path: identity.aadhaarVerification}));
            } catch {
                delete identity.aadhaarVerification;
            }
            try {
                if (identity.addressProof)
                    identity.addressProof = (await getSignedUrlForRead({path: identity.addressProof}));
            } catch {
                delete identity.addressProof;
            }
            try {
                if (identity.identityProof)
                    identity.identityProof = (await getSignedUrlForRead({path: identity.identityProof}));
            } catch {
                delete identity.identityProof;
            }
            return identity;
        }
    }

    async upload(currentUser, path, body) {
        return await s3.getSignedUrlForUpload({path, ...body, currentUser});
    }

    async grantAccess(userId) {
        try {

            let d1 = new Date(),
                d2 = new Date(d1.getTime());
            d2.setMinutes(d1.getMinutes());

            let bannedUser = await BannedUser.remove({user: userId});
            let loginAttempts = await LoginAttempts.remove({user: userId});

            return {};

        } catch (err) {
            throw err;
        }
    }

    async logUserLoginAttempt(params) {
        try {

            let d1 = new Date(),
                d2 = new Date(d1.getTime());
            d2.setMinutes(d1.getMinutes() + 30);

            if (params.success) { //login attempt is success
                //check if login user is banned and compare with timestamp
                let loginAttempt = await new LoginAttempts({
                    user: params.userId,
                    success: params.success,
                    ip: params.ip,
                    consecutive: true
                }).save();
                let updateInvalidLoginAttempt = await LoginAttempts.updateMany({user: params.userId}, {consecutive: false});

                let bannedUser = await BannedUser.findOne({user: params.userId});

                if(bannedUser && (bannedUser.expires > new Date())){
                    return true;
                }else{
                    return false;
                }


            } else {
                let loginAttempt = await new LoginAttempts({
                    user: params.userId,
                    success: params.success,
                    ip: params.ip,
                    consecutive: true
                }).save();

                let loginAttemptCount = await LoginAttempts.count({
                    user: params.userId,
                    success: params.success,
                    consecutive: true
                });

                if (loginAttemptCount > 4) {

                    let bannedUser = await BannedUser.findOne({user: params.userId});
                    if (bannedUser) {
                        bannedUser.expires = d2;
                        bannedUser.save();
                    } else {
                        await new BannedUser({user: params.userId, expires: d2}).save();
                    }

                    //TODO: send notification to user
                    let user = await User.findOne({_id: params.userId});
                    let mailData = {receivers: [user.email], data: {user}};

                    ServiceApi.sendEmail(
                        {
                            receivers: [user.email],
                            template: 'ACCOUNT_LOCKED',
                            data: mailData,
                        },
                        user, null
                    );

                    //TODO: send notification  to all org admins

                    let userQuery = {role: {$ne: []}};
                    let roleQuery = {name: 'Super Admin'};
                    const users = await User.aggregate([
                        {
                            '$lookup': {
                                'from': 'roles',
                                'localField': 'role',
                                'foreignField': '_id',
                                'as': 'role',
                                'pipeline': [{'$match': roleQuery}]
                            },

                        }, {
                            '$match': userQuery,
                        }, {'$project': {'password': 0}}
                    ]).sort({createdAt: 1});

                    for (let adminUser of users) {
                        let mailData = {receivers: [adminUser.email], data: {user}};

                        ServiceApi.sendEmail(
                            {
                                receivers: [user.email],
                                template: 'ACCOUNT_LOCKED_ORG_ADMIN',
                                data: mailData,
                            },
                            user, null
                        );
                    }
                    //let adminUser = await User.findOne({where: {id: admin.UserId}});
                    //await mailer.OrgAdminNotification({receivers: [adminUser.email], data: {adminUser, user}}).send();

                    return true; //user is banned
                } else {
                    return false; //user is not banned
                }

            }

        } catch (err) {
            console.log(err);
            throw err;
        }
    }
}

export default UserService;
