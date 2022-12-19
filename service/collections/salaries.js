var {mongoose}=require("../mongoose_config")
var salarySchema=new mongoose.Schema({
    // salaryId:String,
    createdDate:String,
    revenue:Number,
    quanitySale:Number,
    receivedTotal:Number,
    BillId:[String],
    isDelete:Boolean,
})
const Salary=mongoose.model('salary',salarySchema);
module.exports={Salary}