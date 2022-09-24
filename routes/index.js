var express = require("express");
var router = express.Router();

var MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(
  "mongodb+srv://ECommerceApp:slowly123@education-project.5aw2yco.mongodb.net/test"
);
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});
router.post("/category", function (req, res, next) {
  const { name } = req.body;
  console.log(req.body);
  // client.db("test").collection("devices").insertOne({ temp: name });
});
module.exports = router;
