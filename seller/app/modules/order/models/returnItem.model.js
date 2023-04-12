import mongoose from'mongoose';
import { uuid } from 'uuidv4';
const returnItemSchema = new mongoose.Schema({
    _id:{
        type: String, 
        required:true,
        default: () => uuid(),
    },
    itemId:{
        type:String
    },
    payment:{
        type:Object
    },
    qty:{
        type:Number
    },
    state:{
        type:Object
    },
    orderId:{
        type:String
    },
    reason:{
        type:String
    },
    organization: { type: String, ref: 'Organization' },
    createdBy:{type:String},
},{  
    strict: true,
    timestamps:true
});


// productSchema.index({name:1}, {unique: false});
const ReturnItem = mongoose.model('ReturnItem',returnItemSchema);
module.exports = ReturnItem;
