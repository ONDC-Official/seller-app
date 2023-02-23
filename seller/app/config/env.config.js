
const nodeEnvironment = process.env.NODE_ENV || 'development';
const projectBaseDirectory = global.__basedir;
const appEnvironment = process.env.APP_ENV ?? 'local';

if(appEnvironment === 'local') {
    require('dotenv').config({
        path: `${__dirname}/local.env`,
    });
}

const environmentConfig = require('./environments/base');
const mergedEnvironmentConfig = {
    ...environmentConfig,
    nodeEnvironment,
    appEnvironment,
    projectBaseDirectory,
};
Object.freeze(mergedEnvironmentConfig);
exports.mergedEnvironmentConfig =  mergedEnvironmentConfig;
