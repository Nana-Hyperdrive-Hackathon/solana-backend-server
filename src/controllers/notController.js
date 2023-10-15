const generateToken = require('../middleware/generateToken')
const decryptToken = require('../middleware/decryptToken')
const NotModel = require('../models/notModel')
const AuthModel = require('../models/authModel')
const FirebaseModel = require('../models/firebaseModel')
const BlackModel = require('../models/blackModel')

const addNotification = async (req, res) => {
  const { wallet, title, subtitle, body, type } = req.body

  const notificacion = {
    type,
    result: 'pendiente'
  }

  if (!wallet || !title || !subtitle || !body) {
    return res.status(400).json({ error: 'Datos inválidos' })
  }

  const timestamp = new Date().toISOString()

  try {
    const result = await NotModel.addNotification(
      wallet,
      timestamp,
      title,
      subtitle,
      body,
      notificacion,
      false
    )

    const device = await AuthModel.getDeviceIDbyWallet(wallet)

    if (device.length == 0)
      return res
        .status(401)
        .json({ msg: 'La wallet no tiene dispositivo guardado' })

    if (result) {
      const payload = {
        timestamp,
        walletUser: wallet,
        deviceID: device
      }

      const notJWT = await generateToken(payload, '2m')

      const not = await FirebaseModel.sendNotification(device)

      if (!not)
        return res.status(401).json({ msg: 'Error al mandar la notifiación' })

      const msg = { JWT: notJWT, guardada: true, enviada: true }

      let isVerified = false

      console.log(notificacion.type)

      const checkInterval = setInterval(async () => {
        const verification = await NotModel.getNotificationStatus(
          wallet,
          timestamp
        )

        if (verification === 'aceptada') {
          isVerified = true
          clearInterval(checkInterval)
          clearTimeout(checkTimeout)
        }

        if (verification === 'cancelada') {
          clearInterval(checkInterval)
          clearTimeout(checkTimeout)
        }
      }, 25000)

      const checkTimeout = setTimeout(async () => {
        clearInterval(checkInterval)
        if (!isVerified) {
          await NotModel.expireNotification(
            wallet,
            timestamp,
            notificacion.type
          )
        }
      }, 120000)

      return res.status(200).json(msg)
    } else {
      return res.status(500).json({ msg: 'Error al agregar notificacion' })
    }
  } catch (error) {
    console.error('Error al guardar la wallet:', error)
    return res.status(401).json({ msg: 'Notificacion inválida', err: error })
  }
}

const authNotification = async (req, res) => {
  const { token, device_id, wallet, accion, result } = req.body

  if (!token || !device_id || !wallet || !accion) {
    return res.status(400).json({ error: 'Datos inválidos' })
  }

  try {
    const { walletUser, deviceID, timestamp } = decryptToken(token)
    if (!walletUser || !deviceID[0].device_id)
      return res.status(400).json({ error: 'Token inválido' })

    const data = await NotModel.authNotification(
      wallet,
      timestamp,
      device_id,
      accion,
      result
    )

    if (data) {
      await BlackModel.addBlacklist(token)

      return res.status(200).json({
        message: 'Solicitud autorizada correctamente',
        wallet: wallet
      })
    } else {
      return res.status(500).json({ msg: 'No se autorizó la solicitud' })
    }
  } catch (error) {
    console.error('Error al autorizar la información trycatch', error)
    return res
      .status(500)
      .json({ msg: 'Error al autorizar la información', err: error })
  }
}

const getNotificationsByWallet = async (req, res) => {
  const { wallet } = req.body

  if (!wallet) {
    return res.status(400).json({ error: 'Datos inválidos' })
  }

  try {
    const result = await NotModel.getNotificationsByWallet(wallet)

    if (result) {
      return res.status(200).json(result)
    } else {
      return res.status(500).json({ msg: 'Error al recuperar notificaciones' })
    }
  } catch (error) {
    console.error('Error al recuperar notificaciones por wallet:', error)
    return res.status(401).json({ msg: 'wallet inválida', err: error })
  }
}

const getNotificationStatus = async (req, res) => {
  const { token } = req.body

  try {
    const { walletUser, timestamp } = decryptToken(token)

    const result = await NotModel.getNotificationStatus(walletUser, timestamp)

    if (!result)
      return res
        .status(500)
        .json({ msg: 'Error al recuperar status de notificación' })

    console.log(result)

    if (result == 'aceptada') return res.status(200).json({ result: true })

    if (result == 'cancelada')
      return res.status(200).json({ result: false, cancel: true })

    return res.status(200).json({ result: false, cancel: false })
  } catch (error) {
    console.error(
      'Error al recuperar status de notificación por wallet:',
      error
    )
    return res
      .status(401)
      .json({ msg: 'notificación por wallet inválida', err: error })
  }
}

module.exports = {
  addNotification,
  getNotificationsByWallet,
  authNotification,
  getNotificationStatus
}
