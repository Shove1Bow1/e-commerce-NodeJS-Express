var express = require("express");
var router = express.Router();
require("dotenv").config();
/* GET home page. */
router.get("/some", function (req, res, next) {
  res.render("index", { title: "Express" });
});
router.post("/category",async function (req, res, next) {
  const { name } = req.body;
  // let doc=await ShipementSchema.create({billId:"77878",isDelete:0});
  // await doc.save();
  // console.log(doc.createdAt);
  // res.send("ok");
  // client.db("test").collection("devices").insertOne({ temp: name });
});
module.exports = router;
