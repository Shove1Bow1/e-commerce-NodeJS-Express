const { messageRespone } = require("../ultis/messageRespone");
var express = require("express");
const { Users } = require("../service/collections/users");
const { Bills } = require("../service/collections/bills");
const { default: axios } = require("axios");
const { default: postSlack } = require("../ultis/postSlack");
const { messageBill } = require("../enum/messageBill");
var router = express.Router();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.get('/',async (req,res,next)=>{
  const {filter}=req.headers;
  
 await Bills.find({isDelete:false}).then((billData)=>{

 res.send( messageRespone(200,billData))
  })
})

router.post("/create",async function (req, res, next) {
const {
    fisrtName,
    lastName,
    cityId,
    districtId,
    wardId,
    street,
    product,
    totalPrice}=req.body
    const userName=fisrtName+' '+lastName 
    const address={
      street,
        cityId,
    districtId,
    wardId,
    }
    Users.create({...req.body,userName,address,passWord:'12345678',roles:'user',verify:false,isDelete:false}).then(async data=>{
    const paymentIntent = await stripe.paymentIntents.create({
    amount:req.body.totalPrice,
    currency: "vnd",
    automatic_payment_methods: {
      enabled: true,
    },
  });
  Bills.create({...req.body,idUser:data._id,idStripe:paymentIntent.id,client_secret:paymentIntent.client_secret,}).then(bill=>{
    axios.request({
    method: 'post',
    baseURL: process.env.SLACK_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      attachments: [{ text: messageBill(req.body) }],
    },
  })
res.send(messageRespone(200,{ 
    clientSecret:paymentIntent.client_secret,
  }));
  })
    })
});

router.put("/confirm",async function (req, res, next) {
  res.send(messageRespone(200));
});

module.exports = router;
