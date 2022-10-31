require("dotenv").config();
const path=require('path');
var nodemailer = require("nodemailer");
var hbs=require("nodemailer-express-handlebars");
let mailler = nodemailer.createTransport({
    service: process.env.SERVICE_MAILER,
    host: process.env.HOST_MAILER,
    secure: process.env.SECURE_OPTIONS,
    auth: {
        user: process.env.EMAIL_MAILER,
        pass: process.env.PASSWORD_MAILER
    }
})
mailler.verify((err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Server is establised connect with nodemailer")
    }
})
const handlebarOptions = {
    viewEngine: {
      extName: ".handlebars",
      partialsDir: path.resolve('./views'),
      defaultLayout: false,
    },
    viewPath: path.resolve('./views'),
    extName: ".handlebars",
  }
mailler.use('compile',hbs(handlebarOptions));
async function BillSender(userName, totalPaid, email, paidDate) {
    var billSender = await mailler.sendMail({
        from: process.env.EMAIL_MAILER,
        to: email,
        subject: "Hoá đơn điện tử của người dùng " + userName,
        text: "Hoá đơn cho ngày " + paidDate,
        html: ""
    })
    return billSender;
}
function FirstRegisterSender(userName, createdDay, email, recoverCode) {
    var mailOptions = {
        from: process.env.EMAIL_MAILER,
        to: email,
        subject: "chào mừng người dùng " + userName,
        template: 'register',
        context: {
          userName: userName,
          recoverCode: recoverCode
        }
      };
    var sendCode=mailler.sendMail(mailOptions,(err)=>{
        if(err){
            console.log(err);
        }
    })
    return sendCode;
}
function OtpSender(userName,email,OtpCode){

}
module.exports = {
    BillSender, FirstRegisterSender,OtpSender
}