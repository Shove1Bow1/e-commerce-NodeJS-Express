var {mongoose}=require('../mongoose_config');
var reviewSchema=new mongoose.Schema({
    reviewId:String,
    dateReview:{type:Date, default:Date.now},
    name:String,
    email:String,
    starReview:{type:Number,min:1,max:5},
    description:String,
    title:String,
    isDelete:Boolean
},{timestamps:true});
const ReviewSchema=mongoose.model("reviews_schema",reviewSchema);
module.exports={ReviewSchema}