import mongoose from 'mongoose';
import ShortUniqueId from 'short-unique-id';
const uid = new ShortUniqueId({ length: 6 });

const customizationGroupMappingSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: () => uid(),
    },
    customization: {
        type: String,
        ref: 'Product'
    },
    parent: {
        type: String,
        ref: 'CustomizationGroup',
    },
    child: {
        type: String,
        ref: 'CustomizationGroup'
    },
    default: {
        type: Boolean,
        default: false,
    },
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

//customizationGroupMappingSchema.index({ customization: 1 }, { unique: false });
const CustomizationGroupMapping = mongoose.model('CustomizationGroupMapping', customizationGroupMappingSchema);
export default CustomizationGroupMapping;