import mongoose from'mongoose';
import { uuid } from 'uuidv4';
import s3 from '../../../lib/utils/s3Utils';
import Joi from 'joi';
const organizationSchema = new mongoose.Schema({ //Users who has login ability should go under User schema
    _id:{
        type: String, 
        required:true,
        default: () => uuid(),
    },
    name: {type:String,required:true},
    address: {type:String},
    contactEmail:{type:String},
    contactMobile:{type:String},
    addressProof:{type:String},
    idProof:{type:String},
    bankDetails:{
        accHolderName:{type:String},
        accNumber:{type:String},
        IFSC:{type:String},
        cancelledCheque:{type:String},
        bankName:{type:String},
        branchName:{type:String}
    },
    fulfillments : {type : Array},
    PAN:{PAN:{type:String},proof:{type:String}},
    GSTN:{GSTN:{type:String},proof:{type:String}},
    FSSAI:{type:String},
    createdAt:{
        type:Number,
        default:Date.now()
    },
    storeDetails:{
        name: {type:String},
        categories: {type:Object},
        category: {type:String},
        logo: {type:String},
        location: new mongoose.Schema({lat:{type:Number},long:{type:Number}},{ _id: true }),
        locationAvailabilityPANIndia:{type:Boolean},
        location_availability:{type:String},
        city:{type:Object},
        defaultCancellable:{type:Boolean},
        defaultReturnable:{type:Boolean},
        fulfillments : {type : Array},
        custom_area : {type : Array},
        address: {
            building: {type:String},
            city: {type:String},
            state: {type:String},
            country: {type:String},
            area_code: {type:String},
            locality: {type:String}
        },
        supportDetails:{
            email:{type:String},
            mobile:{type:String}
        },
        storeTiming:{type:Object},
        radius:{type:Object},
        logisticsBppId:{type:String},
        logisticsDeliveryType:{type:String}
    },
    createdBy:{type:String}
},{  
    strict: true,
    timestamps:true
});

// organizationSchema.post('findOne',async function(doc, next) {
//         if(doc){
//             let idProof = await s3.getSignedUrlForRead({path:doc.idProof});
//             doc.idProof =idProof
//
//             let addressProof = await s3.getSignedUrlForRead({path:doc.addressProof});
//             doc.addressProof =addressProof
//
//             let cancelledCheque = await s3.getSignedUrlForRead({path:doc.bankDetails.cancelledCheque});
//             doc.bankDetails.cancelledCheque =cancelledCheque
//
//             let PAN = await s3.getSignedUrlForRead({path:doc.PAN.proof});
//             doc.PAN.proof =PAN
//
//             let GSTN = await s3.getSignedUrlForRead({path:doc.GSTN.proof});
//             doc.GSTN.proof =GSTN
//         }
//     next();
// });

organizationSchema.index({name:1,shortCode:1}, {unique: false});
const Organization = mongoose.model('Organization',organizationSchema);
module.exports = Organization;
