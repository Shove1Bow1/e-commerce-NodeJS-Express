const HTTPMESSAGE=require("../enum/httpCode")

 function messageRespone(code,data){
    return {
        code,
        codeRespone:HTTPMESSAGE.HTTPMESSAGE[code],
        data
     }
}

module.exports ={ messageRespone}