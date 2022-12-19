const {generateThousand } = require("../ultis/generateThousand")

function messageBill(message){
  const temp= '\n Bao Gồm:'+message.products.map(item=>{
        return `\n Tên sản phẩm: ${item.productName} - ${item.quantity} Đơn vị`
       })
    console.log(temp)
  const messages =
      'Thông báo có 1 đơn hàng được đặt\n--------------------------------- \n Họ tên: ' +
      message.fisrtName+' '+message.lastName +
      '\n Số điện thoại: ' +
      message.phoneNumber +
      '\n Email: ' +
      message.email +
      '\n Tổng giá trị đơn hàng: ' +
       generateThousand( message.totalPrice) +"VND"
      +temp
      '\n--------------------------------- '

      return messages
}
module.exports={messageBill}