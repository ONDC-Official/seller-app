import mongoose from 'mongoose';
// import { uuid } from 'uuidv4';
import ShortUniqueId from 'short-unique-id';
const uid = new ShortUniqueId({ length: 6 });
const customMenuTimingSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: () => uid(),
    },
    organization: {type:String},
    customMenu: { type: String },
    timings : {type :Array},
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


customMenuTimingSchema.index({ name: 1 }, { unique: false });
const CustomMenuTiming = mongoose.model('CustomMenuTiming', customMenuTimingSchema);
module.exports = CustomMenuTiming;
