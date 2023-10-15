const decryptToken = require('../middleware/decryptToken')
const generateToken = require('../middleware/generateToken')

const AuthModel = require('../models/authModel')
const BlackModel = require('../models/blackModel')

const create = async (req, res) => {
  const { wallet } = req.body

  if (!wallet) {
    return res.status(400).json({ error: 'Datos inválidos' })
  }

  try {
    const device = await AuthModel.getDeviceIDbyWallet(wallet)

    if (device.length > 0)
      return res
        .status(401)
        .json({ msg: 'La wallet ya tiene dispositivo guardado' })

    const result = await AuthModel.createAuthData(wallet)

    if (result) {
      const token = generateToken(wallet, '5m')

      let isVerified = false

      // Inicia la verificación de la wallet cada 30s
      const checkInterval = setInterval(async () => {
        const verification = await AuthModel.checkDevice(wallet)

        if (verification.verified) {
          console.log('dispositivo verificado')
          isVerified = true
          clearInterval(checkInterval)
          clearTimeout(checkTimeout)
        }
      }, 25000)

      const checkTimeout = setTimeout(async () => {
        clearInterval(checkInterval)
        if (!isVerified) {
          console.log('se borra dispositivo dispositivo')
          await AuthModel.deleteDevice(wallet)
        }
      }, 300000)

      return res.status(200).json({ token })
    } else {
      return res.status(500).json({ msg: 'No se guardó la wallet' })
    }
  } catch (error) {
    console.error('Error al guardar la wallet:', error)
    return res
      .status(401)
      .json({ msg: 'Error al guardar la wallet:', err: error })
  }
}

const save = async (req, res) => {
  const { token, device_id } = req.body

  if (!token || !device_id) {
    return res.status(400).json({ error: 'Datos inválidos' })
  }

  try {
    const wallet = decryptToken(token)

    if (!wallet) {
      return res.status(400).json({ error: 'Token inválido' })
    }

    const result = await AuthModel.saveAuthData(wallet, device_id)

    if (result) {
      await BlackModel.addBlacklist(token)

      return res
        .status(200)
        .json({ message: 'Device ID guardado correctamente', wallet: wallet })
    } else {
      return res.status(500).json({ msg: 'Error al guardar la información' })
    }
  } catch (error) {
    console.error('Error al guardar el device id:', error)
    return res.status(401).json({ msg: 'Token inválido', err: error })
  }
}

const verify = async (req, res) => {
  const { wallet, device_id } = req.body

  if (!wallet || !device_id)
    return res.status(400).json({ error: 'Datos inválidos' })

  try {
    const result = await AuthModel.verify(wallet, device_id)

    if (!result) return res.status(500).json({ msg: 'Error al hacer verify' })

    return res
      .status(200)
      .json({ message: 'Resultado de verificación', result })
  } catch (error) {}
}

const checkDevice = async (req, res) => {
  const { wallet } = req.body

  if (!wallet) return res.status(400).json({ error: 'Datos inválidos' })

  try {
    const result = await AuthModel.checkDevice(wallet)

    if (!result) return res.status(500).json({ msg: 'Error al checar device' })

    return res
      .status(200)
      .json({ message: 'Resultado de verificación', result })
  } catch (error) {}
}

module.exports = {
  create,
  save,
  verify,
  checkDevice
}
