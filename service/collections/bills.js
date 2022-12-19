const {mongoose} = require('../mongoose_config');
var billSchema = new mongoose.Schema({
    idUser:String,
    datePaid:{type:String,default:new Date()},
    idStripe:String,
    client_secret:String,
    totalPrice:Number,
    products:[{
        id:String,
        productName:String,
        quantity:{type:Number,min:1,max:200}
    }],
    confirmStripe:{type:Boolean,default:false},
    isDelete:{type:Boolean,default:false},
    statusShipment:{type:String,default:"pending"}
},{timestamps:true})
const Bills=mongoose.model("bills",billSchema);
module.exports={
    Bills
}