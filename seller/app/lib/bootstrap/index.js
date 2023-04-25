import Roles from './roles';
import Users from './users';
import Role from '../../modules/authentication/models/role.model';
import AuthenticationService  from '../../modules/authentication/v1/services/authentication.service';
import UserService  from '../../modules/authentication/v1/services/user.service';

const authenticationService = new AuthenticationService();
const userService = new UserService();

async function BootstrapData() {

    // 1: Create Roles
    try {
        let promiseArray = Roles.map(async (roleObj) => {

            return await authenticationService.createRole(roleObj, {}, {});
        });
        await Promise.all(promiseArray);
    } catch (err) {
        console.log(err);
    }

    // 3: Create Users
    try {
        let promiseArray = Users.map(async (userObj) => {
            let roles = await Role.find({});
            const role = roles.find(role => role.name === 'Super Admin');
            userObj.role = role.name;
            const user = await userService.create(userObj);
            return user;
        });
        await Promise.all(promiseArray);
    } catch (err) {
        console.log(err);
    }


}

export default BootstrapData;
