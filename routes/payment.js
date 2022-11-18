const { messageRespone } = require("../ultis/messageRespone");
var express = require("express");
const { Users } = require("../service/collections/users");
const { Bills } = require("../service/collections/bills");
const { default: axios } = require("axios");
const { default: postSlack } = require("../ultis/postSlack");
const { messageBill } = require("../enum/messageBill");
const { response } = require("express");
var router = express.Router();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.get('/', async (req, res, next) => {
  const { filter } = req.headers;

  await Bills.find({ isDelete: false }).then((billData) => {

    res.send(messageRespone(200, billData))
  })
})

router.post("/create", async function (req, res, next) {
  if (req.body.userId) {
    const { userId } = req.body
    // await Users.find({ _id: userId, isDelete: false }, (err, result) => {
    //   if (err) {
    //     console.log(err)
    //     res.send(messageRespone("400"));
    //     return;
    //   }
    //   if (result) {
    //     req.userInfo = result;
    //   }
    //   else {
    //     res.send(messageRespone("400"));
    //     return;
    //   }
    // }).clone();
    const payment = await stripe.paymentIntents.create({
      amount: req.body.totalPrice,
      currency: "vnd",
      automatic_payment_methods: {
        enabled: true,
      },
    })
    await Bills.create({ ...req.body, idUser: userId, idStripe: payment.id, client_secret: payment.client_secret }, async (err) => {
      if (err) {
        console.log(err);
        return;
      }
      axios(process.env.SLACK_URL, {
        method: "post",
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          attachments: [{ text: messageBill(req.body) }]
        }
      })
      res.send(messageRespone("200", {
        clientSecret: payment.client_secret,
      }))
    })
  }
  else {
    const {
      fisrtName,
      lastName,
      cityId,
      districtId,
      wardId,
      street,
      product,
      totalPrice } = req.body
    const userName = fisrtName + ' ' + lastName
    const address = {
      street,
      cityId,
      districtId,
      wardId,
    }
    Users.create({ ...req.body, userName, address, passWord: '12345678', roles: 'user', verify: false, isDelete: false }).then(async data => {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.totalPrice,
        currency: "vnd",
        automatic_payment_methods: {
          enabled: true,
        },
      });
      Bills.create({ ...req.body, idUser: data._id, idStripe: paymentIntent.id, client_secret: paymentIntent.client_secret, }).then(bill => {
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
        res.send(messageRespone(200, {
          clientSecret: paymentIntent.client_secret,
        }));
      })
    })
  }
});

router.post("/confirm", async function (req, res, next) {
  console.log(req.body);
  await Bills.updateMany({client_secret:req.body.confirmCode},{$set:{confirmStripe:true}},(err)=>{
    if(err){
      console.log(err)
      res.send(messageRespone("500"))
      return;
    }
    res.send(messageRespone(200));
  }).clone();
 
});
router.post("/delete_user",async function(req,res){
  await Bills.deleteMany({userId:req.body.userId},(err)=>{
    res.send("done");
  }).clone();
})
module.exports = router;
