import mongoose from 'mongoose';
// import { uuid } from 'uuidv4';
import ShortUniqueId from 'short-unique-id';
const uid = new ShortUniqueId({ length: 6 });
const customMenuSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: () => uid(),
    },
    organization: {type:String},
    name: { type: String },
    category: { type: String },
    seq: { type: Number },
    longDescription: { type: String }, 
    shortDescription: { type: String },
    images: { type: Array },
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


customMenuSchema.index({ name: 1 }, { unique: false });
const CustomMenu = mongoose.model('CustomMenu', customMenuSchema);
module.exports = CustomMenu;
