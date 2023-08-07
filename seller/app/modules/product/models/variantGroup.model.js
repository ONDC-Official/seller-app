import mongoose from 'mongoose';
// import { uuid } from 'uuidv4';
import ShortUniqueId from 'short-unique-id';
const uid = new ShortUniqueId({ length: 6 });
const variantGroupSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: () => uid(),
    },
    organization: {type:String},
    name: { type: Array },
    variationOn : {type :String},
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


variantGroupSchema.index({ name: 1 }, { unique: false });
const VariantGroup = mongoose.model('VariantGroup', variantGroupSchema);
module.exports = VariantGroup;
