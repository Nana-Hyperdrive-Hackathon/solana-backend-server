const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const decryptToken = token => {
  const secretKey = process.env.secret_key

  const decodedToken = jwt.decode(token)

  const encryptedPayload = decodedToken.encryptedPayload

  const decipher = crypto.createDecipher(process.env.secret_enc, secretKey)
  const decryptedPayload =
    decipher.update(encryptedPayload, 'base64', 'utf8') + decipher.final('utf8')

  const payload = JSON.parse(decryptedPayload)

  return payload
}

module.exports = decryptToken
