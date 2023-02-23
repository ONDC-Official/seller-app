import baseConfig from './env.base';
import corsConfig from './env.cors';
import dbConfig from './env.db';
const mailConfig = require('./env.email');


const mergedEnvironmentConfig = {
    ...baseConfig,
    ...corsConfig,
    ...dbConfig,
    ...mailConfig
};

Object.freeze(mergedEnvironmentConfig);
module.exports = mergedEnvironmentConfig;
