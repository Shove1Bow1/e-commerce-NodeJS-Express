const {mongoose} = require("../mongoose_config");
var productSchema=new mongoose.Schema({
    // productID:String,
    productName:String,
    quanity:{type:Number,min:0,max:200000},
    description:String,
    image:String,
    starQuality:{type:Number,min:0,max:5},
    price:{type:Number,min:1000,max:200000000},
    category:String,
    isDelete:{type:Boolean,default:false},
    reviews:[{
        dateReview:{type:Date, default:Date.now},
        name:String,
        email:String,
        starReview:{type:Number,min:1,max:5},
        description:String,
        title:String,
        isDelete:Boolean
    }],
    newStocks:[{

    }],
});
const Products=mongoose.model('products',productSchema);
module.exports={Products}