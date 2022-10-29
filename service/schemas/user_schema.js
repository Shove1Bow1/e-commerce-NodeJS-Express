const {mongoose} = require('../mongoose_config');
var userSchema = new mongoose.Schema({
    idUser:String, 
    userName:String,
    password:String,
    email:String,
    phoneNumber:String,
    address:String,
    roles:String,
    products:[{
        productId:[String],
        quanityProduct:[{type:Number,min:1,max:200}],
        status:Boolean
    }],
    secretKey:String,
    isDelete:Boolean
},{timestamps:true});
const Users=mongoose.model("users",userSchema);
module.exports={Users}