var express = require("express");
var router = express.Router();
var uuidConverter = require('uuid');
const crypto=require("crypto");
var { Users } = require("../service/schemas/user_schema");
var { AcceptIncomingReq, GenerateRecoverCode } = require("../service/function_config");
const { CheckExist } = require("../ultis/checkExistUser");
const { messageRespone } = require("../ultis/messageRespone");
const { FirstRegisterSender } = require('../service/nodemailer_config');
router.get("/", function (req, res, next) {
 Users.find({isDelete:false},(err,data)=>{
  if(err)
  res.send(messageRespone(400))
  else
  res.send(messageRespone(200,data))

 })
});
router.delete("/", function (req, res, next) {
 const {iduser}=req.headers
 console.log(req.headers)
  Users.updateOne({idUser:iduser},{$set:{isDelete:true}},(err,data)=>{
  if(err)
  res.send(messageRespone(400))
  else
  res.send(messageRespone(200,{...data}))
  
  })
});
router.post("/register", AcceptIncomingReq, CheckExist, async (req, res) => {
  if(!req.body.userName || !req.body.password || !req.body.phoneNumber || !req.body.address || !req.body.email){
    res.send({status:"missing some info",message:false,messageResponse:messageRespone("400")})
  }
  const { userName, password, phoneNumber, address, email } = req.body;
  const emailConvert=email.toLowerCase();
  const pwHex = crypto.createHash("sha256").update(password).digest("hex");
  const userId = uuidConverter.v1(userName);
  const codeRecover = GenerateRecoverCode(5);
  let doc = await Users.create({ idUser: userId, email: emailConvert, userName: userName, password: pwHex, address: address, roles: "normal_user", phoneNumber: phoneNumber, secretKey: codeRecover });
  doc.save();
  if (doc.createdAt) {
    try {
      let dateCreated = doc.createdAt[8] + doc.createdAt[9] + '/' + doc.createdAt[5] + doc.createdAt[6] + '/' + doc.createdAt[0] + doc.createdAt[1] + doc.createdAt[2] + doc.createdAt[3];
      FirstRegisterSender(userName, dateCreated, email, codeRecover);
      res.send({
        message:true,
        status:"welcome new user",
        idUser:userId,
        messageRespone:messageRespone("200"),
      })
      return
    }
    catch (err) {
      console.log(err);
    }
  }
  else {
    res.send({status:"failed",messageRespone:messageRespone["400"]});
  }
})
router.post("/login", AcceptIncomingReq, async (req, res) => {
  const { email, password } = req.body;
  const pwHex = crypto.createHash("sha256").update(password).digest("hex");
  await Users.findOne({ email: email, password: pwHex, roles: "normal_user" }, (err, result) => {
    if (err) {
      console.log(err)
    }
    if (!result) {
      req.checked = true; 
      res.send({status:"failed to login",messageRespone:messageRespone("400") });
    }
    else {
      res.send(
        {
          status: "welcome user",
          idUser: result.idUser,
          userName:result.userName,
          messageRespone:messageRespone("200"),
        });
      return;
    }
  }).clone();
   
})
router.post("/recover", AcceptIncomingReq,async (req, res) => {
  const { email, secretCode } = req.body;
  const emailConvert=email.toLowerCase();
  await Users.findOne({ email: emailConvert, secretKey: secretCode }, (err, result) => {
    if (err) {
      console.log(err);
    }
    if (!result){
      req.checked = true
    }
    else{
      res.send(
        {
          status:"user exists",
          message: true,
          idUser: result.idUser,
          messageRespone:messageRespone("200"),
        }
      );
    }
     
  }).clone();
  if (req.checked)
    res.send(
      {
        status: "user not exists",
        message:false,
        messageRespone: messageRespone("400")
      }
    )
})
router.post("/forgot_password", AcceptIncomingReq, async (req, res) => {
  const { uuid, newPassword } = req.body;
  const pwHex = crypto.createHash("sha256").update(newPassword).digest("hex");
  var result =await Users.updateOne({ idUser: uuid }, { $set: { password: pwHex } }, (err) => {
    if (err) {
      console.log(err);
      res.send(messageRespone[400]);
    }
  }).clone();
  if(result.modifiedCount>0){
    res.send({status:"update success",isUpdate:true,response:messageRespone("200")})
  }
  else{
    res.send({status:"update failed",isUpdate:false,response:messageRespone("400")})
  }
})
router.post("/update_password",AcceptIncomingReq,async(req,res)=>{
  const{uuid,newPassword,oldPassword}=req.body;
  const oldPwHex=crypto.createHash("sha256").update(oldPassword).digest("hex");
  const newPwHex=crypto.createHash("sha256").update(newPassword).digest("hex");
  var result=await Users.updateOne({idUser:uuid,password:oldPwHex},{$set:{password:newPwHex}},(err)=>{
    if(err)
    {
      console.log(err);
    }
  }).clone();
  if(result.modifiedCount>0){
    res.send({status:"update success",isUpdate:true,response:messageRespone("200")})
  }
  else{
    res.send({status:"update failed",isUpdate:false,response:messageRespone("400")})
  }
})
module.exports = router;
