import path from 'path';
import nconf from 'nconf';

const env = process.env.NODE_ENV || 'development' // By default development environment is picked

//  1. `process.argv`
//  2. `process.env`
nconf.argv().env()

// 3. Pick up the base configuration
nconf.file(path.join(__dirname, './base_config.json'))

// 4. Override arguments based on environment
nconf.file(path.join(__dirname, `./${env}_env_config.json`))

// 5. Update API Url

const apiUrl = nconf.get('express').protocol + (nconf.get('express').useFqdnForApis ? nconf.get('express').fqdn : nconf.get('express').ipAddress) + ':' + nconf.get('express').port + '/'
nconf.set('express:apiUrl', apiUrl)

//
if (env !== 'development') {

//    console.log("in check");
//
//     nconf.set('express:protocol', process.env.PROTOCOL);
//     nconf.set('express:useFqdnForApis', process.env.USE_FQDN_FOR_APIS);
//     nconf.set('express:fqdn', process.env.FQDN);
//     nconf.set('express:ipAddress', process.env.HOST);
//     nconf.set('express:port', process.env.PORT);

    nconf.set('firebase:account', process.env.FIREBASE_SERVICE_ACCOUNT_JSON_PATH);
    nconf.set('sellerConfig:BPP_URI', process.env.BPP_URI);
    nconf.set('seller:serverUrl', process.env.SELLER_SERVER_URL);
    nconf.set('sellerConfig:BPP_ID', process.env.BPP_ID);
    nconf.set('sellerConfig:BAP_ID', process.env.BAP_ID);
    nconf.set('sellerConfig:BAP_URI', process.env.BAP_URI);
    nconf.set('sellerConfig:LOGISTICS_DELIVERY_TYPE', process.env.LOGISTICS_DELIVERY_TYPE);
    nconf.set('sellerConfig:LOGISTICS_BAP_ID', process.env.LOGISTICS_BAP_ID);

    nconf.set('database:host', process.env.DATABASE_HOST);
    nconf.set('database:username', process.env.DATABASE_USERNAME);
    nconf.set('database:password', process.env.DATABASE_PASSWORD);
    nconf.set('database:name', process.env.DATABASE_NAME_SELLER_CLIENT);
    nconf.set('database:port', process.env.DATABASE_PORT);

   // const apiUrl = process.env.PROTOCOL + process.env.HOST + ':' + process.env.PORT + '/';
   // nconf.set('express:apiUrl', apiUrl);
   //
   //  const apiUrl = nconf.get('express').protocol + (nconf.get('express').useFqdnForApis ? nconf.get('express').fqdn : nconf.get('express').ipAddress) + ':' + nconf.get('express').port + '/'
   //  nconf.set('express:apiUrl', apiUrl)


}


module.exports = nconf
