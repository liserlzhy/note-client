export const isMail = (mail) => {
  let reg = /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
  return reg.test(mail)
}

export const formatTime = (timeStamp) => {
  let d = new Date(timeStamp)
  let year = d.getFullYear()
  let month = d.getMonth() + 1
  let date = d.getDate()
  let h = d.getHours()
  let m = d.getMinutes()

  if (h < 10) {
    h = '0' + h
  }
  if (m < 10) {
    m = '0' + m
  }  
  return year + '年' + month + '月' + date  + '日 ' + h + ':' + m
}
