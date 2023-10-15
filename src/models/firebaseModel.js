const axios = require('axios')

const getAccessToken = require('../config/firebase')

let firbaseKey
;(async () => {
  try {
    firbaseKey = await getAccessToken()
  } catch (error) {
    console.error('Error obteniendo el token:', error)
  }
})()
const Firebase = {}

Firebase.sendNotification = async device_id => {
  console.log(` token Bearer ${firbaseKey}`)
  try {
    const response = await axios.post(
      `https://fcm.googleapis.com/v1/projects/nanaweb3-db/messages:send`,
      {
        message: {
          token: device_id[0].device_id,
          notification: {
            title: 'Notificación',
            body: 'Envío de notificación'
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${firbaseKey}`
        }
      }
    )

    if (!response || response.status !== 200) return false

    if (response.data && response.data.error) return false

    return true
  } catch (error) {
    console.error('[Firebase - sendNotification] Error al enviar notificación')
    throw error
  }
}

module.exports = Firebase
