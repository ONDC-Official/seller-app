import mongoose from 'mongoose';
// import { uuid } from 'uuidv4';
import ShortUniqueId from 'short-unique-id';
const uid = new ShortUniqueId({ length: 6 });

const productCustomizationGroupSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: () => uid(),
    },
    id: {
        type: String,
        required: true,
    },
    organization: {type:String,ref:'Organozation'},
    product: {type:String, ref:'Product'},
    name: {type:String},
    defaultCustomizationId : {type:String},
    isMandatory : {type:Boolean}, 
    inputType: {type:String},
    minQuantity: {type:Number},
    maxQuantity: {type:Number},
    seq: {type:Number},
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


productCustomizationGroupSchema.index({ id: 1 ,product:1,organization:1}, { unique: true });
const ProductCustomizationGroup = mongoose.model('ProductCustomizationGroup', productCustomizationGroupSchema);
module.exports = ProductCustomizationGroup;
