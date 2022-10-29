require("dotenv").config();
var nodemailer = require("nodemailer");
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
    var sendCode = mailler.sendMail({
        from: process.env.EMAIL_MAILER,
        to: email,
        subject: "chào mừng người dùng " + userName,
        text: "Ngày tạo tài khoản " + createdDay,
        html: `<!DOCTYPE html>
        <html>
        <head>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
                integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
            <style>
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
        
                .btn-custom::active {
                    border: none;
                }
            </style>
        </head>
        
        <body>
            <div
                style="max-width:70%;max-height: 600px; margin:auto;margin-top: 10px; background-color: rgb(200, 228, 228); padding: 10px 10px;">
                <div style="display:flex; justify-content: center;">
                    <h3>Chào mừng bạn đến với NHT, <span class="username">`+userName+`</span></h3>
                </div>
                <p style="font-weight:700;font-size:medium;margin-bottom: 1px; margin-top: 1px;">Mã phục hồi: <span
                        class="secretCode">`+recoverCode+`</span></p>
                <div style="display:flex; justify-content: center;">
                    <button class="btn btn-primary btn-sm btn-custom"><a href="/where"
                            style="color:black;text-decoration:none;font-weight:700;font-size:small">Đến trang NHT
                            --></a></button>
                </div>
                <div style="display:flex; justify-content: center; margin-bottom: 1px; margin-top: 5px;">
                    <p style="font-weight:700;font-size:small;">Đây là thư chào mừng bạn đến với web NHT</p>
                </div>
        
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
                integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
                crossorigin="anonymous"></script>
        </body>
        </html>
        `
    });
    return sendCode;
}
module.exports = {
    BillSender, FirstRegisterSender
}