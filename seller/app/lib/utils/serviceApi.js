import AuthenticationJwtToken from './AuthenticationJwtToken';
import {HEADERS} from './constants';
import HttpRequest from './HttpRequest';
import {mergedEnvironmentConfig} from '../../config/env.config.js';

/**
 * Used to communicate with server
 */
class ServiceApi {


    /**
     * send email
     */
    static sendEmail(data, currentUser, currentUserAccessToken) {
        return new Promise(async (resolve, reject) => {

            // const organization = await Organization().findOne(q);
            try {

                console.log('send email');

                let accessToken;
                if( currentUserAccessToken && currentUserAccessToken!==null && typeof currentUserAccessToken !== 'undefined') {
                    accessToken = currentUserAccessToken;
                } else {
                    // Note: This is required for the webhook service. In such scenarios there is no logged in 
                    // user and therefore we use the "createdBy" userId to generate a temporary JWT
                    accessToken = await AuthenticationJwtToken.getToken({userId: currentUser.id, user: currentUser });
                }

                console.log('send email-----accessToken----',accessToken);
                console.log('send email-----mergedEnvironmentConfig.intraServiceApiEndpoints.nes,----',mergedEnvironmentConfig.intraServiceApiEndpoints.nes);

                let headers = {};
                headers[HEADERS.ACCESS_TOKEN] = `Bearer ${accessToken}`;

                let httpRequest = new HttpRequest(
                    mergedEnvironmentConfig.intraServiceApiEndpoints.nes,
                    '/api/v1/nes/email',
                    'POST',
                    {...data},
                    headers
                );

                let result = await httpRequest.send();

                let user = result.data.data;

                resolve(user);

            } catch (err) {
                console.log(err);
            }
        });
    }

}

export default ServiceApi;
