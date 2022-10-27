require("dotenv").config();
console.log(process.env.MOGODBCONNECT)
const mongoose = require('mongoose');
mongoose.connect(process.env.MOGODBCONNECT, (err) => {
    console.log("message: " + err);
});

console.log("connect state: " + mongoose.connection.readyState);
module.exports = { mongoose }