module.exports = {
    appNamespace: process.env.BASE_APP_NAMESPACE ?? 'NES',
    servicePort: process.env.BASE_APP_PORT ?? '3008',
    mobileApplicationAllowedVersions: {
        ios: {
            minimumVersion: process.env.MOBILE_APP_IOS_MIN_ALLOWED_VERSION ?? '2.7.0',  // App needs to be forcefully upgraded to this version
            optionalVersion: process.env.MOBILE_APP_IOS_MAX_ALLOWED_VERSION ?? '2.7.0', // App can be optionally upgraded to this version
        },
        android: {
            minimumVersion: process.env.MOBILE_APP_ANDROID_MIN_ALLOWED_VERSION ?? '2.7.0',  // App needs to be forcefully upgraded to this version
            optionalVersion: process.env.MOBILE_APP_ANDROID_MAX_ALLOWED_VERSION ?? '2.7.0', // App can be optionally upgraded to this version
        }
    },
    intraServiceApiEndpoints: {
        authService: process.env.INTRA_SERVICE_AUTH_SERVICE_URL,
        pmService: process.env.INTRA_SERVICE_PROJECT_MANAGEMENT_URL,
    },
    jwtSecret:process.env.AUTH_ACCESS_JWT_SECRET,
    appUrl:process.env.APP_URL
};
