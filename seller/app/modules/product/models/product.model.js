import mongoose from'mongoose';
import { uuid } from 'uuidv4';
const productSchema = new mongoose.Schema({
    _id:{
        type: String, 
        required:true,
        default: () => uuid(),
    },
    productCode: {type:String},
    productName: {type:String,required:true},
    MRP: {type:Number},
    retailPrice: {type:Number},
    purchasePrice: {type:Number},
    HSNCode: {type:String},
    GST_Percentage: {type:Number},
    productCategory: {type:String},
    productSubcategory1: {type:String},
    productSubcategory2: {type:String},
    productSubcategory3: {type: String},
    quantity: {type:Number},
    barcode: {type:Number},
    maxAllowedQty: {type:Number},
    packQty:{type:Number},
    UOM: {type:String},//units of measure
    length: {type:Number},
    breadth: {type:Number},
    height: {type:Number},
    weight: {type:Number},
    isReturnable: {type:Boolean},
    returnWindow: {type:String},
    isVegetarian: {type:Boolean},
    manufacturerName: {type:String},
    manufacturedDate: {type:String},
    nutritionalInfo: {type:String},
    additiveInfo: {type:String},
    instructions: {type:String},
    isCancellable: {type:Boolean},
    availableOnCod: {type:Boolean},
    longDescription: {type:String},
    description: {type:String},
    organization: { type: String, ref: 'Organization' },
    images: {type:Array},
    createdBy:{type:String},
    published:{type:Boolean,default:true}
},{  
    strict: true,
    timestamps:true
});


productSchema.index({name:1}, {unique: false});
const Product = mongoose.model('Product',productSchema);
module.exports = Product;
