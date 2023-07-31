import mongoose from 'mongoose';
import { uuid } from 'uuidv4';
const variantValueSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: () => uuid(),
    },
    organizationId: {type:String},
    variantType: { type: String },
    value: { type: String },
    product:{ type: Boolean },
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


variantValueSchema.index({ name: 1 }, { unique: false });
const VariantValue = mongoose.model('VariantValue', variantValueSchema);
module.exports = VariantValue;
