import mongoose from'mongoose';
import { uuid } from 'uuidv4';

const roleSchema = new mongoose.Schema({ //Users who has login ability should go under User schema
    _id:{
        type: String,
        required:true,
        default: () => uuid(),
    },
    name: {
        type: String,
        required: true,
    }
},{
    strict: true,
    timestamps:true
});
roleSchema.index({name:1}, {unique: true});

const Role = mongoose.model('Role',roleSchema);
module.exports = Role;

