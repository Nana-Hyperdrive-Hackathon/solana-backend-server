const jwt = require('jsonwebtoken')
const BlackModel = require('../models/blackModel')

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization

  if (!token) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const isTokenBlackListed = await BlackModel.getToken(token)
    if (isTokenBlackListed.length > 0)
      return res.status(401).json({ error: 'Solicitud no autorizada' })
  } catch (error) {
    return res.status(500).json({ error: 'Error al validar token en BL' })
  }

  try {
    const decoded = jwt.verify(token, process.env.secret_key)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(500).json({ error: 'Token inválido o expirado' })
  }
}

module.exports = verifyToken
