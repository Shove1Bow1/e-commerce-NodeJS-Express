const {mongoose} = require('../mongoose_config');
var billSchema = new mongoose.Schema({
    idUser:String,
    name:String,
    address:String,
    phoneNumber:String,
    totalPaid:Number,
    payingMethod:String,
    datePaid:Date,
    products:{
        productId:[String],
        quanityProduct:[{type:Number,min:1,max:200}]
    },
    isDelete:Boolean
},{timestamps:true})
const Bills=mongoose.model("bills",billSchema);
module.exports={
    Bills
}