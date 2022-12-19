const { messageRespone } = require("../ultis/messageRespone");
var express = require("express");
const { Users } = require("../service/collections/users");
const { Bills } = require("../service/collections/bills");
const { default: axios } = require("axios");
const { default: postSlack } = require("../ultis/postSlack");
const { messageBill } = require("../enum/messageBill");
const { response } = require("express");
const { AcceptIncomingReq } = require("../service/function_config");
const { BillSender } = require("../service/nodemailer_config");
const e = require("express");
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
router.get("/bills", AcceptIncomingReq, async (req, res) => {
  if (!req.headers.iduser) {
    res.send(messageRespone("401"));
    return;
  }
  Bills.find({ idUser: req.headers.iduser, confirmStripe: true }, async (err, result) => {
    if (err) {
      console.log(err);
      res.send(messageRespone("401"));
      return;
    }
    console.log(result);
    if (result) {
      res.send(messageRespone("200", result))
    }
    else
      res.send(messageRespone("201"));
  })
})
router.get("/bill", AcceptIncomingReq, async (req, res) => {
  if (!req.headers.iduser && !req.headers.billid) {
    res.send(messageRespone("401"));
    return;
  }
  const { iduser, billid } = req.headers
  Bills.find({ idUser: iduser, _id: billid }, (err, result) => {
    if (err) {
      console.log(err);
      res.send(messageRespone("401"));
      return;
    }
    console.log(result);
    if (result) {
      res.send(messageRespone("200", result))
    }
    else
      res.send(messageRespone("201"));
  })
})
router.post("/confirm", async function (req, res, next) {
  await Bills.updateMany({ client_secret: req.body.confirmCode }, { $set: { confirmStripe: true } }, (err,result) => {
    if (err) {
      console.log(err)
      res.send(messageRespone("500"))
      return;
    }
    res.send(messageRespone(200));
    console.log(result);
    return;
  }).clone();
 await Bills.find({client_secret: req.body.confirmCode},async (err,result)=>{
  if (err) {
    console.log(err)
    res.send(messageRespone("500"))
    return;
  }
  console.log(result)
  const datePaid=result[0].createdAt.getDate()+"-"+result[0].createdAt.getMonth()+"-"+result[0].createdAt.getFullYear();
  axios({
    method:"get",
    url:"http://localhost:1402/payments/sent_bill",
    headers:{
      token:process.env.FRONT_END_TOKEN,
      confirmcode:req.body.confirmCode,
      datepaid:datePaid
    }
  })
  return;
 }).clone();
});
router.get("/sent_bill", AcceptIncomingReq, async (req, res) => {
  if (req.headers.products) {
    const { products, username, billid, paymentdate, userid } = req.headers;
    await Users.findOne({
      _id: userid
    }, (err, result) => {
      if (err) {
        console.log(err);
        res.send(messageRespone("401"));
        return;
      }
      if (result) {
        req.email = result.email;
      }
    }).clone();
    await Bills.findOne({
      _id: billid
    }, (err, result) => {
      if (err) {
        console.log(err);
        res.send(messageRespone("401"));
        return;
      }
      if (result) {
        BillSender(username, req.email, paymentdate, result.products, billid, result.totalPrice);
      }
      else
        return;
    }).clone();
    res.end();
  }
  else{
    console.log(req.headers)
    const {confirmcode,datepaid}=req.headers;
    console.log(datepaid);
    await Bills.findOne({client_secret:confirmcode},async(err,result)=>{
      if(err){
        console.log(err);
        res.send(messageRespone("401"));
        return;
      }
      if(result){
        req.idUser=result.idUser;
        req.products=result.products;
        req.billId=result._id;
        req.totalPrice=result.totalPrice;
        // req.dateCreate=result.createdAt;
      }
    }).clone();
    // req.dateCreate=await docs.createdAt;
    // console.log("datecreate",dateCreate);
    await Users.findOne({
      _id: req.idUser
    }, (err, result) => {
      if (err) {
        console.log(err);
        res.send(messageRespone("401"));
        return;
      }
      if (result) {
        BillSender(result.userName, result.email, datepaid, req.products, req.billId, req.totalPrice);
      }
    }).clone();
    res.end();
  }
})
router.post("/delete_user", async function (req, res) {
  await Bills.deleteMany({ userId: req.body.userId }, (err) => {
    res.send("done");
  }).clone();
})
module.exports = router;
