const {mongoose} = require('../mongoose_config');
var userSchema = new mongoose.Schema({
    idUser:String, 
    userName:String,
    password:String,
    email:String,
    address:String,
    Roles:String,
    products:[{
        productId:[String],
        quanityProduct:[{type:Number,min:1,max:200}],
        status:Boolean
    }],
    isDelete:Boolean
},{timestamps:true});
const UserSchema=mongoose.model("user_schema",userSchema);
module.exports={UserSchema}