const HTTPMESSAGE=require("../enum/httpCode")

 function messageRespone(code,data){
    return {
        code,
        message:HTTPMESSAGE.HTTPMESSAGE[code],
        data
     }
}

module.exports ={ messageRespone}