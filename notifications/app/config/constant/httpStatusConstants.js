module.exports = Object.freeze({
    // Status Code
    STATUS_CODE_GENERALIZED_SUCCESS: '200',
    STATUS_CODE_GENERALIZED_ALREADY_EXISTS: '202',
    STATUS_CODE_GENERALIZED_INVALID_REQUEST: '400',
    STATUS_CODE_GENERALIZED_UNAUTHORIZED: '401',
    STATUS_CODE_GENERALIZED_NOT_FOUND: '404',
    STATUS_CODE_GENERALIZED_FAILED: '412',
    STATUS_CODE_GENERALIZED_CONFIG_MISMATCH: '422',
    STATUS_CODE_GENERALIZED_UPGRADE_REQUIRED: '426',
    STATUS_CODE_GENERALIZED_SEQUELIZE_ERROR: '500'
}); // freeze prevents changes by users
