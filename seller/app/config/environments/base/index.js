import baseConfig from './env.base';
import corsConfig from './env.cors';
import dbConfig from './env.db';
const mailConfig = require('./env.email');
const s3Config = require('./env.aws.s3');


const mergedEnvironmentConfig = {
    ...baseConfig,
    ...corsConfig,
    ...dbConfig,
    ...mailConfig,
    ...s3Config
};

Object.freeze(mergedEnvironmentConfig);
module.exports = mergedEnvironmentConfig;
