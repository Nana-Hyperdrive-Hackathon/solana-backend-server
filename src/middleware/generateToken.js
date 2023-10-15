const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const generateToken = (payload, time) => {
  const secretKey = process.env.secret_key

  const payloadString = JSON.stringify(payload)

  const cipher = crypto.createCipher(process.env.secret_enc, secretKey)
  const encryptedPayload =
    cipher.update(payloadString, 'utf8', 'base64') + cipher.final('base64')

  const uniqueToken = jwt.sign({ encryptedPayload }, secretKey, {
    expiresIn: `${time}`
  })

  console.log('Token único generado:', uniqueToken)

  return uniqueToken
}

module.exports = generateToken
