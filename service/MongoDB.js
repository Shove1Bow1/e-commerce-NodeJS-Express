require("dotenv").config();
var MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(process.env.MOGODBCONNECT);
const Client = (collection) => {
  return client.db("Main").collection(collection);
};

export default Client;
