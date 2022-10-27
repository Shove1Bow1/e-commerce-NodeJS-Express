require("dotenv").config();
const {mongoose} = require('../mongoose_config');
var shipmentSchema = new mongoose.Schema({
    billId: String,
    shipCode: String,
    isDelete: Boolean
}, { timestamps: true })
const ShipementSchema = mongoose.model('Shipment_Schema', shipmentSchema);
async function Test(){
    let doc=ShipementSchema.create({billId:"77878"});
    await doc.save;
    console.log(doc.createdAt);
}

module.exports = { ShipementSchema }