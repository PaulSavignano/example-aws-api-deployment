export const getTime = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours()
  const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
  const amPm = date.getHours() > 12 ? 'pm' : 'am'
  const milliSeconds = date.getMilliseconds()
  return `${year}-${month}-${day}_${hours}-${minutes}${amPm}-${milliSeconds}`
}
