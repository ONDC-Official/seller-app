import mongoose from 'mongoose';
import { uuid } from 'uuidv4';

const fulfillmentHistorySchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: () => uuid(),
    },
    orderId: { type: String },
    type: { type: String },
    state: { type: Object },
    id: { type: String },
}, {
    strict: true,
    timestamps: true
});


// productSchema.index({name:1}, {unique: false});
const FulfillmentHistory = mongoose.model('FulfillmentHistory', fulfillmentHistorySchema);
module.exports = FulfillmentHistory;

