import mongoose from'mongoose';
import { uuid } from 'uuidv4';

const userSchema = new mongoose.Schema({ //Users who has login ability should go under User schema
    _id:{
        type: String,
        required:true,
        default: () => uuid(),
    },
    firstName: {
        type: String,
        required: true,
    },
    middleName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    mobile: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    password: {
        type: String,
    },
    organizations: {
        type: String,
    },
    enabled: {
        type: Boolean,
        default:true
    },
    role: { type: String, ref: 'Role' },
    isSystemGeneratedPassword: {
        type: Boolean,
        default:true
    },
    profilePic: {
        type: String,
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
userSchema.index({mobile:1,email:1}, {unique: true});

const User = mongoose.model('User',userSchema);
module.exports = User;

