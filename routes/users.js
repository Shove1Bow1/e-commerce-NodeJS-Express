var express = require("express");
var router = express.Router();
var {Users}=require("../service/schemas/user_schema");
var {AcceptIncomingReq}=require("../service/function_config");
const { checkExist } = require("../ultis/checkExistUser");
const { messageRespone } = require("../ultis/messageRespone");
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
router.post("/register",AcceptIncomingReq,(req,res)=>{
  const {userName,passWord,phoneNumber,address,Roles}=req.body
  const pwBase64= Buffer.from(passWord, 'base64').toString('base64');
  Users.create({userName,passWord:pwBase64,phoneNumber,address,Roles})
      //them ma code ko tim thay user
  req.send(messageRespone('400'))
})
router.post("/login",AcceptIncomingReq,(req,res)=>{
    const {userName,passWord}=req.body
    console.log(req.body)
    console.log(userName)
    if(checkExist(userName,passWord)===false){
      //them ma code ko tim thay user
      res.send(messageRespone('400',{data:{ccc:'ccc'}}))
    }
    else{
      //them handle répone tra ve      
      res.send(messageRespone('404',{data:{ccc:'ccc'}}))
    }
})
module.exports = router;
