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
    customMenu: { type: String },
    seq: { type: Number },
    product : {type :String, ref:'Product'},
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
const CustomMenuProduct = mongoose.model('CustomMenuProduct', customMenuSchema);
module.exports = CustomMenuProduct;
