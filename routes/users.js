var express = require("express");
var router = express.Router();
var uuidConverter = require('uuid');
const crypto=require("crypto");
var { Users } = require("../service/schemas/user_schema");
var { AcceptIncomingReq, MadeCode } = require("../service/function_config");
const { CheckExist } = require("../ultis/checkExistUser");
const { messageRespone } = require("../ultis/messageRespone");
const { FirstRegisterSender } = require('../service/nodemailer_config');
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
router.post("/register", AcceptIncomingReq, CheckExist, async (req, res) => {
  const { userName, passWord, phoneNumber, address, email } = req.body;
  const pwHex = crypto.createHash("sha256").update(passWord).digest("hex");
  const userId = uuidConverter.v1(userName);
  const codeRecover = MadeCode(5);
  let doc = await Users.create({ idUser: userId, email: email, userName: userName, password: pwHex, address: address, roles: "normal_user", phoneNumber: phoneNumber, secretKey: codeRecover });
  doc.save();
  if (doc.createdAt) {
    res.send("success")
    try {
      let dateCreated = doc.createdAt[8] + doc.createdAt[9] + '/' + doc.createdAt[5] + doc.createdAt[6] + '/' + doc.createdAt[0] + doc.createdAt[1] + doc.createdAt[2] + doc.createdAt[3];
      FirstRegisterSender(userName, dateCreated, email, codeRecover);
      res.send({
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
  const { userName, passWord } = req.body;
  const pwHex = crypto.createHash("sha256").update(passWord).digest("hex");
  await Users.findOne({ userName: userName, password: pwHex, roles: "normal_user" }, (err, result) => {
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
          messageRespone:messageRespone("200"),
        });
      return;
    }
  }).clone();
   
})
router.post("/recover", AcceptIncomingReq, CheckExist, async (req, res) => {
  const { email, secrectCode } = req.body;
  await Users.findOne({ email: email, secrectCode: secrectCode }, (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result)
      res.send(
        {
          message: "true",
          idUser: result.idUser,
          messageRespone:messageRespone("200"),
        }
      );
    else
      req.checked = false
  }).clone();
  if (!req.checked)
    res.send(
      {
        description: "user not exists", messageRespone: messageRespone("400")
      }
    )
})
router.post("/forgot_password", AcceptIncomingReq, async (req, res) => {
  const { uuid, newPassword } = req.body;
  const pwHex = crypto.createHash("sha256").update(newPassword).digest("hex");
  await Users.updateOne({ idUser: uuid }, { $set: { password: pwHex } }, (err) => {
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
