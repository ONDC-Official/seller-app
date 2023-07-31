import mongoose from 'mongoose';
import { uuid } from 'uuidv4';
const productAttributeSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: () => uuid(),
    },
    organization: {type:String},
    product: {type:String},
    code: { type: String },
    value: { type: String },
    createdBy: { type: String },
    updatedBy: { type: String },
    createdAt: {
        type: Number,
        default: Date.now()
    },
    updatedAt: {
        type: Number,
        default: Date.now()
    },
}, {
    strict: true,
    timestamps: true
});


productAttributeSchema.index({ name: 1 }, { unique: false });
const ProductAttribute = mongoose.model('ProductAttribute', productAttributeSchema);
module.exports = ProductAttribute;
