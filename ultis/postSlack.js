function postSlack(message) {
  const options = {
    method: 'post',
    baseURL: process.env.SLACK_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      attachments: [{ text: message }],
    },
  }
  console.log(optionss)
  return options
}

module.exports ={postSlack}