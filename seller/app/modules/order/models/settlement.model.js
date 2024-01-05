import mongoose from'mongoose';
import { uuid } from 'uuidv4';
const SettlementSchema = new mongoose.Schema({
    _id:{
        type: String,
        required:true,
        default: () => uuid(),
    },
    fulfillmentId: { type: String },
    orderId:{ type: String },
    settlement:{ type: Object },
},{
    strict: true,
    timestamps:true
});
// productSchema.index({name:1}, {unique: false});
const Settlement = mongoose.model('Settlement',SettlementSchema);
module.exports = Settlement;
