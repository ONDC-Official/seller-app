import mongoose from'mongoose';
import { uuid } from 'uuidv4';

const organizationSchema = new mongoose.Schema({ //Users who has login ability should go under User schema
    _id:{
        type: String, 
        required:true,
        default: () => uuid(),
    },
    name: {
        type: String,
    },
    modules:[{ type: Object, ref: 'Model' }],
    welcomeScreenContent:{
        type:String,
    },
    shortCode: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
    },
    profilePic:{
        type:String,
    },
    colors:{
        pageBackGroundColor:{
            type: String,
        },
        iconButtonBackgroundColor: {
            type: String,
        },
        iconColor:{
            type: String,
        },
        linkColor:{
            type: String,
        },
        formFieldBackgroundColor:{
            type: String,
        },
    },
    createdAt:{
        type:Number,
        default:Date.now()
    },
    updatedAt:{
        type:Number,
        default:Date.now()
    }
},{  
    strict: true,
    timestamps:true
});

organizationSchema.index({name:1,shortCode:1}, {unique: false});
const Organization = mongoose.model('Organization',organizationSchema);
module.exports = Organization;
