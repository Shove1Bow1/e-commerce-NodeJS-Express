var express = require("express");
const { Products } = require("../service/schemas/product_schema");
var router = express.Router();
require("dotenv").config();
var {ShipementSchema}=require('../service/schemas/shipment_schema');
const { messageRespone } = require("../ultis/messageRespone");

/* GET home page. */

router.get("/", function (req, res, next) {
 Products.find({isDelete:false},(err,data)=>{
  if(err)
  res.send(messageRespone(400))
  else
  res.send(messageRespone(200,data))

 })
});

router.get("/:id", function (req, res, next) {
 const id=req.params.id;
  Products.findOne({isDelete:false,_id:id  },(err,data)=>{
  if(err)
  res.send(messageRespone(400))
  else
  res.send(messageRespone(200,data))

 })
});



router.post("/", function (req, res, next) {
  Products.create({...req.body})
  res.send(messageRespone(200));
});
router.delete("/", function (req, res, next) {
 const {id}=req.headers
 console.log(req.headers)
  Users.updateOne({_id:id},{$set:{isDelete:true}},(err,data)=>{
  if(err)
  res.send(messageRespone(400))
  else
  res.send(messageRespone(200,{...data}))
  
  })
});
router.get("/", function (req, res, next) {
 Products.find((err,data)=>{if(err)
  res.send(messageRespone(400));
  else
  res.send(messageRespone(200,data));

})
 });
module.exports = router;
