import {UnauthorisedError} from "../errors";

class Authorisation {
    /**
     * @param {*} user  Current logged in user object
     * @param {*} roles  Role list
     */
    constructor(user, roles) {
        this.user = user;
//        console.log("this.user---->",roles);
        this.roles = roles;
    }

    /**
     * Method to check if user has access to given protected resource
     */
    isAllowed() 
    {
        
        return new Promise(async (resolve, reject) => {
            try {

//                console.log("this.user---->",this.user);

                // if user has a provided role
                this.user.Roles.forEach(obj => {

                    if (this.roles.includes(obj.name)) {
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
