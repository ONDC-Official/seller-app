import baseConfig from './env.base';
import corsConfig from './env.cors';
const mailConfig = require('./env.email');

const mergedEnvironmentConfig = {
    ...baseConfig,
    ...corsConfig,
    ...mailConfig
};

Object.freeze(mergedEnvironmentConfig);
module.exports = mergedEnvironmentConfig;
