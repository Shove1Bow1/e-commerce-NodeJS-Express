var express = require("express");
var router = express.Router();
require("dotenv").config();
var MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(process.env.MOGODBCONNECT);
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});
router.post("/category", function (req, res, next) {
  const { name } = req.body;
  console.log(process.env.MOGODBCONNECT);
  res.send("ok");
  // client.db("test").collection("devices").insertOne({ temp: name });
});
module.exports = router;
