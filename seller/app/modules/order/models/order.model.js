import mongoose from'mongoose';
import { uuid } from 'uuidv4';
const orderSchema = new mongoose.Schema({
    _id:{
        type: String, 
        required:true,
        default: () => uuid(),
    },
    billing:{
        type:Object
    },
    items:{
        type:Object
    },
    transactionId:{
        type:String
    },
    quote:{
        type:Object
    },
    fulfillments:{
        type:Object
    },
    payment:{
        type:Object
    },
    state:{
        type:Object
    },
    orderId:{
        type:String
    },
    cancellation_reason_id:{
        type:String
    },
    createdOn:{
        type:String
    },
    organization: { type: String, ref: 'Organization' },
    createdBy:{type:String},
},{  
    strict: true,
    timestamps:true
});


// productSchema.index({name:1}, {unique: false});
const Order = mongoose.model('Order',orderSchema);
module.exports = Order;
