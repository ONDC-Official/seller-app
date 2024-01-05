import mongoose from 'mongoose';
import {uuid} from 'uuidv4';

const fulfillmentSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: () => uuid(),
    },
    request: {type: Object},
    quote_trail: {type: Object},
    id: {type: String},
    organization: { type: String, ref: 'Organization' },
    order: { type: String, ref: 'Order' }
}, {
    strict: true,
    timestamps: true
});


// productSchema.index({name:1}, {unique: false});
const Fulfillment = mongoose.model('Fulfillment', fulfillmentSchema);
module.exports = Fulfillment;
