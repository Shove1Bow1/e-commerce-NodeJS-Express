require("dotenv").config();
const {mongoose} = require('../mongoose_config');
var shipmentSchema = new mongoose.Schema({
    // billId: String,
    shipmentUnit:String,
    shipCode: String,
    userId:String,
    isDelete: Boolean
}, { timestamps: true })
const Shipements = mongoose.model('shipment', shipmentSchema);
module.exports = { Shipements }