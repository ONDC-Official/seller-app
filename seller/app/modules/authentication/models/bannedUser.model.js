import mongoose from'mongoose';
import { uuid } from 'uuidv4';

const bannedUserSchema = new mongoose.Schema({ //Users who has login ability should go under User schema
    _id:{
        type: String,
        required:true,
        default: () => uuid(),
    },
    expires: {
        type: Date,
        required: true,
    },
    user:{
        type: String, ref: 'User'
    }
},{
    strict: true,
    timestamps:true
});

const BannedUser = mongoose.model('BannedUser',bannedUserSchema);
module.exports = BannedUser;

