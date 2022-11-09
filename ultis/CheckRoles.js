const { Users } = require("../service/collections/user_schema");
const { messageRespone } = require("./messageRespone");

 async function checkRoles(res,req,next){
 await Users.find({idUser:res.headers.id,Roles:'admin'},(err,data)=>{
   if(err){
         res.send(messageRespone("400"));
      }
      if(data){
         next();
      }
      else{
         res.send(messageRespone(403));
      }
 }).clone();
    
}

module.exports ={checkRoles}