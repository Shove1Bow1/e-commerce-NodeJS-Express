const { messageRespone } = require('../ultis/messageRespone');

require('dotenv').config();
function AcceptIncomingReq(req,res,next){
    if(process.env.FRONT_END_TOKEN===req.headers.token){
        next();
    }
    else{
        res.send(messageRespone("400"))
        return;
    }
}
function MadeCode(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports={
    AcceptIncomingReq,MadeCode
}