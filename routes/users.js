var express = require("express");
var router = express.Router();
var uuidConverter = require('uuid');
const crypto = require("crypto");
var { Users } = require("../service/collections/users");
var { AcceptIncomingReq, GenerateRecoverCode } = require("../service/function_config");
const { CheckExist } = require("../ultis/checkExistUser");
const { messageRespone } = require("../ultis/messageRespone");
const { FirstRegisterSender } = require('../service/nodemailer_config');
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
  const { userName, password, phoneNumber, address, email } = req.body;
  const emailConvert = email.toLowerCase();
  const pwHex = crypto.createHash("sha256").update(password).digest("hex");
  // const idUser = uuidConverter.v1(userName);
  const codeRecover = GenerateRecoverCode(5);
  let doc = await Users.create({ email: emailConvert, userName: userName, password: pwHex, address: address, roles: "user", phoneNumber: phoneNumber, secretKey: codeRecover });
  doc.save();
  await Users.findOne({ email: emailConvert }, async (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      req.id = await result._id.toString();
    }

  }).clone();
  if (doc.createdAt) {
    try {
      let dateCreated = doc.createdAt[8] + doc.createdAt[9] + '/' + doc.createdAt[5] + doc.createdAt[6] + '/' + doc.createdAt[0] + doc.createdAt[1] + doc.createdAt[2] + doc.createdAt[3];
      FirstRegisterSender(userName, dateCreated, email, codeRecover);
      res.send({
        message: true,
        status: "welcome new user",
        idUser: req.id,
        userName: userName,
        messageRespone: messageRespone("200"),
      })
      return
    }
    catch (err) {
      console.log(err);
    }
  }
  else {
    res.send({ status: "failed", messageRespone: messageRespone["400"] });
  }
})
router.post("/login", AcceptIncomingReq, async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.send({ status: "missing some info", message: false, messageResponse: messageRespone("400") });
    return;
  }
  const { email, password } = req.body;
  const pwHex = crypto.createHash("sha256").update(password).digest("hex");

  await Users.findOne({ email: email, password: pwHex, roles: "user" }, (err, result) => {
     if (err) {
      console.log(err)
    }
    if (!result) {
      req.checked = true;
      res.send({ status: "failed to login", messageRespone: messageRespone("400") });
    }
    else {
      res.send(
        {
          status: "welcome user",
          idUser: result._id.toString(),
          userName: result.userName,
          messageRespone: messageRespone("200"),
        });
      return;
    }
  }).clone();

})
router.post("/recover", AcceptIncomingReq, async (req, res) => {
  if (!req.body.email || !req.body.secretCode) {
    res.send({ status: "missing some info", message: false, messageResponse: messageRespone("400") });
    return;
  }
  const { email, secretCode } = req.body;
  const emailConvert = email.toLowerCase();
  await Users.findOne({ email: emailConvert, secretKey: secretCode }, async (err, result) => {
    if (err) {
      console.log(err);
    }
    if (!result) {
      req.checked = true
    }
    else {
      res.send(
        {
          status: "user exists",
          message: true,
          idUser: result._id.toString(),
          messageRespone: messageRespone("200"),
        }
      );
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
  if (!req.body.uuid || !req.body.newPassword) {
    res.send({ status: "missing some info", message: false, messageResponse: messageRespone("400") });
    return;
  }
  const { uuid, newPassword } = req.body;
  const pwHex = crypto.createHash("sha256").update(newPassword).digest("hex");
  var result = await Users.updateOne({ _id: uuid }, { $set: { password: pwHex } }, (err) => {
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
  const { uuid, newPassword, oldPassword } = req.body;
  const oldPwHex = crypto.createHash("sha256").update(oldPassword).digest("hex");
  const newPwHex = crypto.createHash("sha256").update(newPassword).digest("hex");
  var result = await Users.updateOne({ _id: uuid, password: oldPwHex }, { $set: { password: newPwHex } }, (err) => {
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
  if (!req.headers.iduser) {
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
      const { userName, address, phoneNumber, email } = result;
      res.send({
        status: "success retrieve info",
        result: {
          username: userName,
          address: address,
          phoneNumber: phoneNumber,
          email: email,
        },
      })
      return;
    }
  }).clone();
})
router.get("/update_info",AcceptIncomingReq,async(req,res)=>{

})
module.exports = router;
