const {mongoose} = require("../mongoose_config");
var providerSchema=new mongoose.Schema({
    providerName:String,
    description:String,
});
const Providers=mongoose.model('providers',providerSchema);
module.exports={Providers}