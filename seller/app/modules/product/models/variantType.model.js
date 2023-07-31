import mongoose from 'mongoose';
import { uuid } from 'uuidv4';
const variantTypeSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: () => uuid(),
    },
    organizationId: {type:String},
    name: { type: String },
    category: { type: String },
    subCategory: { type: String },
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


variantTypeSchema.index({ name: 1 }, { unique: false });
const VariantType = mongoose.model('VariantType', variantTypeSchema);
module.exports = VariantType;
