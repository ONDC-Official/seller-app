import mongoose from 'mongoose';
import { uuid } from 'uuidv4';
const productCustomizationSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: () => uuid(),
    },
    id: {
        type: String,
        required: true,
    },
    organization: {type:String},
    name: {type:String},
    price: { type: Number },
    inStock: { type: Boolean },
    parent :{ type: String },
    product :{ type: String },
    child :{ type: String },
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


productCustomizationSchema.index({ id: 1 ,product:1,organization:1,parent:1}, { unique: true });
const ProductCustomization = mongoose.model('ProductCustomization', productCustomizationSchema);
module.exports = ProductCustomization;
