import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import config from '../lib/config';

const accessKeyId = config.get('s3').accessKeyId;
const secretAccessKey = config.get('s3').secretAccessKey;
const version = config.get('s3').version;
const region = config.get('s3').region;
const bucket = config.get('s3').bucket;

//TODO:move to ext config
const s3 = new AWS.S3({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    useAccelerateEndpoint: true,
    signatureVersion: version,
    region: region
});

const publicConfig = config.get('s3Public');
const s3Public = new AWS.S3({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    useAccelerateEndpoint: false,
    signatureVersion: version,
    region: region
});
const signedUrlExpireSeconds = 60 * 60;

const myBucket = bucket;

const getSignedUrlForUpload = (s3,myBucket) => async(data) => {

    //TODO: Use Axios to send http request
    try {
        const myKey = data.path + '/' + uuidv4() + data.fileType.replace(/^\.?/, '.');
        const params = {
            Bucket: myBucket,
            Key: myKey,
            Expires: signedUrlExpireSeconds
        };
        return await new Promise(
            (resolve, reject) => s3.getSignedUrl('putObject', params, function (err, url) {
                if (err) {
                    console.log('Error getting presigned url from AWS S3', err);
                    reject({success: false, message: 'Pre-Signed URL error', urls: url});
                } else {
                    resolve({
                        success: true,
                        message: 'AWS SDK S3 Pre-signed urls generated successfully.',
                        path: myKey,
                        urls: url
                    });
                }
            }));
    } catch (err) {
        return err;
    }
};

exports.getSignedUrlForUpload = getSignedUrlForUpload(s3,myBucket);
exports.getSignedUrlForUploadPublic = getSignedUrlForUpload(s3Public,publicConfig.bucket);

exports.getSignedUrlForRead = async(data) => {
    //TODO: Use Axios to send http request
    try {
        let myKey = data.path;
        let trimValue = 'https://api-images-prod.s3.amazonaws.com/';
        if (myKey) {
            myKey = myKey.replace(trimValue,'');
        }
        const params = {
            Bucket: myBucket,
            Key: myKey,
            Expires: signedUrlExpireSeconds
        };
        return await new Promise(
            (resolve, reject) => s3.getSignedUrl('getObject', params, function (err, url) {
                if (err) {
                    // console.log('Error getting presigned url from AWS S3');
                    reject({success: false, message: 'Pre-Signed URL erro', urls: url});
                } else {
                    // console.log('Presigned URL: ', url);
                    resolve({ url: url, path: data.path });
                }
            }));
    } catch (err) {
        return err;
    }
};

exports.getFileAsStream = async(data) => {
    //TODO: Use Axios to send http request
    // promisify read stream from s3
    function getBufferFromS3Promise(file) {
        return new Promise((resolve, reject) => {
            getBufferFromS3(file, (error, s3buffer) => {
                if (error) return reject(error);
                return resolve(s3buffer);
            });
        });
    }

    // Get buffered file from s3
    function getBufferFromS3(file, callback) {
        let myKey = file;
        const buffers = [];
        var options = {
            Bucket: myBucket,
            Key: myKey,
        };
        const stream = s3.getObject(options).createReadStream();
        stream.on('data', data => buffers.push(data));
        stream.on('end', () => callback(null, Buffer.concat(buffers)));
        stream.on('error', error => callback(error));
    }
    try {
        const myKey = data.path;
        const buffer = await getBufferFromS3Promise(myKey);
        return buffer;
    } catch (err) {
        return err;
    }
};

