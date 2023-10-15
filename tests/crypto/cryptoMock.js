// cryptoMock.js
const crypto = require('crypto')

const originalCrypto = { ...crypto }

crypto.createCipheriv = function () {
  return {
    update: function () {
      return 'mockEncryptedPayloadPart'
    },
    final: function () {
      return 'mockEncryptedPayloadFinalPart'
    }
  }
}

module.exports = crypto
