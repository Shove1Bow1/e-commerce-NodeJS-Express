const { Users } = require("../service/schemas/user_schema")

function checkExist(userName,password){
   const pwEncode= Buffer.from(password, 'base64').toString('base64')
   const user= Users.findOne({userName,password:pwEncode})
   if(user){
    return false
   }
   else{
    return true    
   }
}
module.exports={checkExist}