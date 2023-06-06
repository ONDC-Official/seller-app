import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { mergedEnvironmentConfig } from '../../config/env.config.js';
const version = mergedEnvironmentConfig.s3.version;
const region = mergedEnvironmentConfig.s3.region;
const bucket = mergedEnvironmentConfig.s3.bucket;


//TODO:move to ext config
const s3 = new AWS.S3({
    useAccelerateEndpoint: true,
    region: region
});

const signedUrlExpireSeconds = 60 * 60*60;

let myBucket = bucket;

const getSignedUrlForUpload = (s3,myBucket) => async(data) => {

    //TODO: Use Axios to send http request
    try {

        let orgId = '';
        if(data.organizationId){
            orgId = data.organizationId;
        }else{
            orgId = data?.currentUser?.organization??uuidv4();
        }


        const myKey = orgId+'/'+data.path+'/' + data?.fileName + data?.fileType?.replace(/^\.?/, '.');
        const params = {
            Bucket: myBucket,
            Key: myKey,
            Expires: signedUrlExpireSeconds
        };


        return await new Promise(
            (resolve, reject) =>

                s3.getSignedUrl('putObject', params, function (err, url) {
                    console.log('[getSignedUrlForUpload] Error getting presigned url from AWS S3',err);
                    if (err) {
                        console.log('[getSignedUrlForUpload] Error getting presigned url from AWS S3');
                        reject( {success: false, message: 'Pre-Signed URL error', urls: url});
                    } else {
                        console.log('Presigned URL: ', url);
                        resolve( {
                            success: true,
                            message: 'AWS SDK S3 Pre-signed urls generated successfully.',
                            path: myKey,
                            urls: url
                        });
                    }
                }));

    } catch (err) {
        console.log("err",err)
        return err;
    }
};

exports.getSignedUrlForUpload = getSignedUrlForUpload(s3,myBucket);

exports.getSignedUrlForRead = async(data) => {
    //TODO: Use Axios to send http request
    try {
        let myKey = data.path;

        const params = {
            Bucket: myBucket,
            Key: myKey,
            Expires: signedUrlExpireSeconds
        };

        //const {config :{params,region}} = s3Bucket;
        const regionString = '-' + region;
        myBucket = myBucket.replace('/public-assets','');

        let url = `https://${myBucket}.s3${regionString}.amazonaws.com/public-assets/${myKey}`;

        return ({ url: url, path: myKey });

        // return await new Promise(
        //     (resolve, reject) => s3.getSignedUrl('getObject', params, function (err, url) {
        //         if (err) {
        //             // console.log('Error getting presigned url from AWS S3');
        //             reject({success: false, message: 'Pre-Signed URL erro', urls: url});
        //         } else {
        //             // console.log('Presigned URL: ', url);
        //
        //         }
        //     }));
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

