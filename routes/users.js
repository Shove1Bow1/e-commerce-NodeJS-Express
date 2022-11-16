var express = require("express");
var router = express.Router();
var uuidConverter = require('uuid');
const crypto = require("crypto");
var { Users } = require("../service/collections/users");
var { AcceptIncomingReq, GenerateRecoverCode } = require("../service/function_config");
const { CheckExist } = require("../ultis/checkExistUser");
const { messageRespone } = require("../ultis/messageRespone");
const { FirstRegisterSender, MailRecoverSender } = require('../service/nodemailer_config');
router.get("/", function (req, res, next) {
 Users.find({isDelete:false,verify:false},(err,data)=>{
  if(err)
  res.send(messageRespone(400))
  else
  res.send(messageRespone(200,data))

 })
});
router.delete("/", function (req, res, next) {
 const {iduser}=req.headers
  Users.updateOne({_id:iduser},{$set:{isDelete:true}},(err,data)=>{
  if(err)
  res.send(messageRespone(400))
  else
  res.send(messageRespone(200,{...data}))
  
  })
});
router.post("/register", AcceptIncomingReq, CheckExist, async (req, res) => {
  if (!req.body.userName || !req.body.password || !req.body.phoneNumber || !req.body.address || !req.body.email) {
    res.send({ status: "missing some info", message: false, messageResponse: messageRespone("400") });
    return;
  }
  const { userName, password, phoneNumber, address, email,addressId,cityId,districtId,wardId } = req.body;
  const emailConvert = email.toLowerCase();
  const pwHex = crypto.createHash("sha256").update(password).digest("hex");
  // const idUser = uuidConverter.v1(userName);
  // const codeRecover = GenerateRecoverCode(5);
  let doc = await Users.create({ email: emailConvert, userName: userName, password: pwHex, address: address, roles: "user", phoneNumber: phoneNumber,addressId:addressId,cityId:cityId,districtId:districtId,wardId:wardId });
  doc.save();
  await Users.findOne({ email: emailConvert }, async (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    if (result) {
      // req.id = await result._id.toString(); 
      try {
      let dateCreated = doc.createdAt[8] + doc.createdAt[9] + '/' + doc.createdAt[5] + doc.createdAt[6] + '/' + doc.createdAt[0] + doc.createdAt[1] + doc.createdAt[2] + doc.createdAt[3];
      FirstRegisterSender(userName, dateCreated, email);
      res.send({
        isAuth: true,
        status: "welcome new user",
        userId: result._id.toString(),
        userName: userName,
        messageRespone: messageRespone("200"),
      })
      return
    }
    catch (err) {
      console.log(err);
    }
    }
  }).clone();
  // if (doc.createdAt) {
   
  // }
  // else {
  //   res.send({ status: "failed", messageRespone: messageRespone["400"] });
  // }
})
router.post("/login", AcceptIncomingReq, async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.send({ status: "missing some info", message: false, messageResponse: messageRespone("400") });
    return;
  }
  const { email, password } = req.body;
  const pwHex = crypto.createHash("sha256").update(password).digest("hex");
  const emailConvert=email.toLowerCase();
  await Users.findOne({ email: emailConvert, password: pwHex, roles: "user" }, (err, result) => {
    if (err) {
      console.log(err)
    }
    if (!result) {
      req.checked = true;
      res.send({ status: "failed to login",message:false, messageRespone: messageRespone("400") });
    }
    else {
      res.send(
        {
          status: "welcome user",
          userId: result._id.toString(),
          userName: result.userName,
          addressId:result.addressId,
          isAuth:true,
          messageRespone: messageRespone("200"),
        });
      return;
    }
  }).clone();

})
router.post("/recover_email", AcceptIncomingReq, async (req, res) => {
  // if (!req.body.email || !req.body.secretCode) {
  //   res.send({ status: "missing some info", message: false, messageResponse: messageRespone("400") });
  //   return;
  // }
  if(!req.body.email){
    res.send({ status: "missing some info", message: false, messageResponse: messageRespone("400") });
    return;
  }
  const { email } = req.body;
  const emailConvert = email.toLowerCase();
  await Users.findOne({ email: emailConvert}, async (err, result) => {
    if (err) {
      console.log(err);
      res.send(messageRespone("400"));
      return;
    }
    if (!result) {
      req.checked = true
    }
    else {
      res.send(
        {
          status: "user exists",
          // idUser: result._id.toString(),
          isAuth:true,
          messageRespone: messageRespone("200"),
        }
      );
      try{
        const codeGenerate=GenerateRecoverCode(10);
        Users.updateOne({email:emailConvert},{secretKey:codeGenerate},(err)=>{
          if(err){
            console.log(err)
          }
        })
        MailRecoverSender(result.email,codeGenerate,result._id.toString());
        return;
      }
      catch(err){
        console.log(err);
      }
    }

  }).clone();
  if (req.checked)
    res.send(
      {
        status: "user not exists",
        message: false,
        messageRespone: messageRespone("400")
      }
    )
})
router.post("/forgot_password", AcceptIncomingReq, async (req, res) => {
  if (!req.body.recoverCode|| !req.body.newPassword || !req.body.userId) {
    res.send({ status: "missing some info", message: false, messageResponse: messageRespone("400") });
    return;
  }
  const { recoverCode, newPassword,userId } = req.body;
  const pwHex = crypto.createHash("sha256").update(newPassword).digest("hex");
  var result = await Users.updateMany({_id:userId, secretKey: recoverCode }, {$set:{secretKey:"",password:pwHex},$inc:{modifyPasswordTime:1} },async (err) => {
    if (err) {
      console.log(err);
      res.send(messageRespone[400]);
    }
  }).clone();
  if (result.modifiedCount > 0) {
    res.send({ status: "update success", isUpdate: true, response: messageRespone("200") })
  }
  else {
    res.send({ status: "update failed", isUpdate: false, response: messageRespone("400") })
  }
})
router.post("/update_password", AcceptIncomingReq, async (req, res) => {
  if (!req.body.idUser || !req.body.newPassword || !req.body.oldPassword) {
    res.send({ status: "missing some info", message: false, messageResponse: messageRespone("400") });
    return;
  }
  const { idUser, newPassword, oldPassword } = req.body;
  const oldPwHex = crypto.createHash("sha256").update(oldPassword).digest("hex");
  const newPwHex = crypto.createHash("sha256").update(newPassword).digest("hex");
  var result = await Users.updateOne({ _id: idUser, password: oldPwHex }, { $set: { password: newPwHex } }, (err) => {
    if (err) {
      console.log(err);
    }
  }).clone();
  if (result.modifiedCount > 0) {
    res.send({ status: "cập nhật thành công", isUpdate: true, response: messageRespone("200") })
  }
  else {
    res.send({ status: "cập nhật thất bại", isUpdate: false, response: messageRespone("400") })
  }
})
router.get("/retrieve_info", AcceptIncomingReq, async (req, res) => {
  if (!req.headers.iduser||req.headers.iduser.length<6) {
    res.send({
      status: "dont have info",
      message: false,
      messageResponse: messageRespone("400")
    })
    return;
  }
  const idUser = req.headers.iduser;
  await Users.findById(idUser, { isDelete: false }, (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    if (result) {
      const { userName, address, phoneNumber, email,addressId } = result;
      res.send({
        status: "success retrieve info",
        result: {
          username: userName,
          address: address,
          addressId:  addressId,
          phoneNumber: phoneNumber,
          email: email,
        },
        messageRespone:messageRespone("200")
      })
      return;
    }
  }).clone();
})
router.post("/update_info",AcceptIncomingReq,async(req,res)=>{
  if(!req.body.addressId||!req.body.phoneNumber||!req.body.address||!req.body.userName||!req.headers.iduser||req.headers.iduser.length<6){
    res.send({
      status: "dont have info",
      message: false,
      messageResponse: messageRespone("400")
    })
    return;
  }
  const {addressId,phoneNumber,address,userName}=req.body;
  const idUser=req.headers.iduser;
  var doc=await Users.updateOne({_id:idUser},{addressId:addressId,userName:userName,address:address,phoneNumber:phoneNumber},(err)=>{
    if(err){
      console.log(err);
      return;
    }
  }).clone();
  if(doc.modifiedCount>0){
    res.send({
      status: "cập nhật thành công", isUpdate: true, response: messageRespone("200") 
    })
  }
  else(
    res.send({
      status: "cập nhật thất bại", isUpdate: true, response: messageRespone("400") 
    })
  )
})
router.post("/verify",AcceptIncomingReq,async(req,res)=>{
  console.log(req.body)
  if(!req.body.userId){
    res.send({status: "missing some info", message: false, messageResponse: messageRespone("400") });
    return
  }
  const {userId}=req.body;
  let doc= await Users.updateOne({_id:userId},{$set:{verify:true}},(err)=>{
    if(err){
      console.log(err);
      res.send(messageRespone("400"))
    }
  }).clone();
  if(doc.modifiedCount>0){
    res.send({
      isUpdate:true,
      status:"verified user account",
      messageRespone:messageRespone("200")
    })
  }
})
// router.get("/check_code",AcceptIncomingReq,async(req,res)=>{
//   if(!req.headers.recover_code||req.headers.recover_code.length<0){
//     res.send({
//       status: "missing some info", message: false, messageResponse: messageRespone("400")   
//     });
//     return;
//   }
//   const {recover_code}=req.headers;
//   await Users.find({secretKey: recover_code},(err,result)=>{
//     if(err){
//       res.send(messageRespone("400"));
//       return;
//     }
//     if(result.length===0){
//       res.send({
//         isAuth:false,
//         messageRespone:messageRespone("400"),
//       })
//       return;
//     }
//     else{
//       res.send({
//         isAuth:true,
//         userId:result._id.toString(),
//         messageRespone:messageRespone("400")
//       })
//     }
//   }).clone();
// })
module.exports = router;
