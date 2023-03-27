import mongoose from 'mongoose';
import {uuid} from 'uuidv4';

const loginAttemptsSchema = new mongoose.Schema({ //Users who has login ability should go under User schema
    _id: {
        type: String,
        required: true,
        default: () => uuid(),
    },
    success:
        {
            type: Boolean,
            allowNull: true,
        },
    ip:
        {
            type: String,
            allowNull: true,
        },
    consecutive:
        {
            type: Boolean,
            allowNull: true,
        },
    user:{
        type: String, ref: 'User'
    }
}, {
    strict: true,
    timestamps: true
});

const LoginAttempts = mongoose.model('LoginAttempts', loginAttemptsSchema);
module.exports = LoginAttempts;

