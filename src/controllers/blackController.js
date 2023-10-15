const BlackModel = require('../models/blackModel')

const addBlacklist = async (req, res) => {
  const { token, timestamp } = req.body

  if (!token || !timestamp) {
    return res.status(400).json({ error: 'Datos inválidos' })
  }

  try {
    const result = await BlackModel.addBlacklist(token, timestamp)

    if (result) {
      return res.status(200).json({ msg: 'Blacklist agregada' })
    } else {
      return res.status(500).json({ msg: 'Error al agregar Blacklist' })
    }
  } catch (error) {
    console.error('Error al guardar el token:', error)
    return res.status(401).json({ msg: 'Blacklist inválida', err: error })
  }
}

const getToken = async (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).json({ error: 'Datos inválidos' })
  }

  try {
    const result = await BlackModel.getToken(token)

    if (result) {
      return res.status(200).json(result)
    } else {
      return res.status(500).json({ msg: 'Error al recuperar Blacklist' })
    }
  } catch (error) {
    console.error('Error al recuperar Blacklist por token:', error)
    return res.status(401).json({ msg: 'wallet inválida', err: error })
  }
}

module.exports = {
  addBlacklist,
  getToken
}
