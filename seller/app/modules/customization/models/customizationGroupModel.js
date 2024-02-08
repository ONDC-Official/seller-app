import mongoose from 'mongoose';
import ShortUniqueId from 'short-unique-id';
const uid = new ShortUniqueId({ length: 6 });

const customizationGroupSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: () => uid(),
    },
    organization: {type:String,ref:'Organization'},
    name: {type:String},
    description: {type:String},
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
    }
}, {
    strict: true,
    timestamps: true
});


//customizationGroupSchema.index({ _id: 1 ,organization:1}, { unique: false });
const CustomizationGroup = mongoose.model('CustomizationGroup', customizationGroupSchema);
module.exports = CustomizationGroup;
