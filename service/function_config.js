const { messageRespone } = require('../ultis/messageRespone');

require('dotenv').config();
function AcceptIncomingReq(req,res,next){
    console.log(req.headers)
    if(process.env.FRONT_END_TOKEN===req.headers.token){
        next()
    }
    res.send(messageRespone("400"))
    return;
}
module.exports={
    AcceptIncomingReq
}