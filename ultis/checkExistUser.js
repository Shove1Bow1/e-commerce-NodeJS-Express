const { Users } = require("../service/collections/users")
const { messageRespone } = require('../ultis/messageRespone');
async function CheckExist(req,res,next) {
   const {email}=req.body;
   await Users.findOne({$or:[{ email: email}]},(err,result)=>{
      if(err){
         console.log(err);
         res.send(messageRespone("400"));
      }
      if(!result){
         next();
      }
      else{
         res.send({status:"email already been used",message:false,messageResponse:messageRespone("409")});
      }
   }).clone();
}
module.exports = { CheckExist }