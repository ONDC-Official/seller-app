import {UnauthorisedError} from '../errors';

class Authorisation {
    /**
     * @param {*} user  Current logged in user object
     * @param {*} roles  Role list
     */
    constructor(user, roles) {
        console.log('this.user---->',JSON.stringify(user, null, 2));
        console.log('this.roles---->',JSON.stringify(roles, null, 2));
        this.user = user;
        this.roles = roles;
    }

    /**
     * Method to check if user has access to given protected resource
     */
    isAllowed() {
        return new Promise(async (resolve, reject) => {
            try {

                let templatePermission = [];

                // if user has a provided role
                this.roles.forEach(obj => {
                    if (this.user.role.name===obj) {
                        resolve();
                    }
                });

                reject(new UnauthorisedError());
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }
}

export default Authorisation;
