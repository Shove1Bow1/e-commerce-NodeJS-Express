const {mongoose} = require('../mongoose_config');
var userSchema = new mongoose.Schema({
    // idUser:String, 
    userName:String,
    password:String,
    email:String,
    phoneNumber:String,
    address:{
    street:String,
   cityId: { value: String, label: String },
    districtId: { value: String, label: String },
    wardId: { value: String, label: String },
    },
    roles:String,
    products:[{
        productId:[String],
        quanityProduct:[{type:Number,min:1,max:200}],
        status:Boolean
    }],
    secretKey:String,
    verify:Boolean,
    isDelete:Boolean
},{timestamps:true});
const Users=mongoose.model("users",userSchema);
module.exports={Users}