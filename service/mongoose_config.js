require("dotenv").config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MOGODBCONNECT, (err) => {
    if(err) console.log("message: " + err);
});

console.log("connect state: " , mongoose.connection.readyState);
module.exports = { mongoose }