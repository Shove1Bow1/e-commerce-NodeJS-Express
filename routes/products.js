var express = require("express");
const { Products } = require("../service/collections/products");
const { Users } = require("../service/collections/users");
const { AcceptIncomingReq } = require("../service/function_config");
var router = express.Router();
require("dotenv").config();
const { messageRespone } = require("../ultis/messageRespone");

/* GET home page. */
router.get("/all", AcceptIncomingReq, function (req, res) {
  Products.find({ isDelete: false }, (err, data) => {
    if (err)
      res.send(messageRespone(400))
    else {
      res.send(messageRespone(200, data))
    }
  })
});
router.get("/by_id/:id", AcceptIncomingReq, function (req, res) {
  const id = req.params.id;
  Products.findOne({ isDelete: false, _id: id }, (err, data) => {
    if (err)
      res.send(messageRespone(400))
    else {
      res.send(messageRespone(200, data))

    }

  })
});
router.post("/addquanity/:id", function (req, res) {
  const id = req.params.id;
  Products.updateOne({_id:id},{$push:{newStocks:req.body.values},quanity:Number(req.body.values.quanity)},(err,data)=>{
    console.log(err)

    res.send(messageRespone(200, data))
  })
});
router.post("/create", function (req, res) {
  Products.create({ ...req.body,quality:0 })
  res.send(messageRespone(200));
});
router.delete("/delete", AcceptIncomingReq, function (req, res) {
  const { id } = req.headers
  Users.updateOne({ _id: id }, { $set: { isDelete: true } }, (err, data) => {
    if (err)
      res.send(messageRespone(400))
    else
      res.send(messageRespone(200, { ...data }))
  })
});
router.get("/by_category", async (req, res) => {
  if (!req.headers.category || req.headers.category.length < 3) {
    res.send({
      status: "missing some info", message: false, messageResponse: messageRespone("400")
    })
    return;
  }
  const { category } = req.headers;
  await Products.find({ category: category }, async (err, result) => {
    if (err) {
      console.log(err)
      res.send({ status: "error in server", messageResponse: messageRespone("400") });
      return;
    }
    if (result.length === 0) {
      res.send({ status: "no result", messageResponse: messageRespone("200") });
      return;
    }
    else {
      res.send({
        status: "success retrieve category",
        data: result,
        messageRespone: messageRespone("200"),
      })
      return;
    }
  }).clone();
})
router.get("/by_filter", AcceptIncomingReq, async (req, res) => {
  if (req.headers.star.length === 0) {
    var { max_price, min_price } = req.headers;
    Products.find({ price: { $lt: max_price, $gt: min_price } }, (err, result) => {
      if (err) {
        console.log(err)
        res.send(messageRespone("400"));
        return;
      }
      if (!result) {
        res.send({ messageResponse: messageRespone("200"), data: result, status: "Không có kết quả" })
      }
      else {
        res.send({ messageRespone: messageRespone("200"), data: result, status: "có kết quả" });
      }
    }).clone();
  }
  else {
    var { max_price, min_price, star } = req.headers;
    const newStar = JSON.parse(star);
    await newStar.sort();
    const start = newStar[0];
    const end = newStar[newStar.length - 1];
    Products.find({ price: { $lt: max_price, $gt: min_price }, quality: { $gt: start, $lt: end } }, async (err, result) => {
      if (err) {
        console.log(err);
        return;
      }
      if (!result) {
        res.send({ messageResponse: messageRespone("200"), data: result, status: "Không có kết quả" })
      }
      else {
        console.log(result);
        res.send({ messageRespone: messageRespone("200"), data: result, status: "có kết quả" });
      }
    }).clone();
  }
})
router.post("/update_cart_list", AcceptIncomingReq, async (req, res) => {
  if (!req.body.products) {
    res.send(messageRespone("401"));
    return;
  }
    const { products, cartId } = req.body;
    const arrayProducts = [];
    for (var i = 0; i < products.length; i++) {
      const product = {
        productId: products[i].id,
        quanityProduct: products[i].quantity,
      }
      arrayProducts.push(product);
    }
    const doc=Users.updateOne({ _id:req.body.userId,isDelete:false },{ products: arrayProducts }, (err) => {
      if (err) {
        console.log(err);
        // res.send(messageRespone("401"));
        return;
      }
      res.send("success");
    }).clone();
    if((await doc).modifiedCount){
      console.log('update');
    }
    else{
      console.log("failed");
    }
  }
)
router.get("/retrive_cart_list", AcceptIncomingReq, async (req, res) => {
  if(req.headers.userId){
    res.end();
    return;
  }
  const { userId } = req.headers
  Users.findOne({ _id: userId, isDelete: false }, async (err, result) => {
    if (err) {
      console.log(err)
      res.send(messageRespone("400"));
      return;
    }
    if (result) {
      const products = result.prodtucts;
      res.send(messageRespone("200", products));
    }
    else {
      res.send(messageRespone("201"));
      return;
    }
  })
})
module.exports = router;
