module.exports = {
    s3: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
        region: process.env.S3_REGION,
        version: process.env.S3_VERSION,
        bucket: process.env.S3_BUCKET
    }
};
