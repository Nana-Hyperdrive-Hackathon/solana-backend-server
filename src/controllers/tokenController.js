const TokenModel = require('../models/tokenModel')

const addToken = async (req, res) => {
  const { token, tokensAmount, wallet } = req.body

  if (!token || !tokensAmount || !wallet) {
    return res.status(400).json({ error: 'Datos inválidos' })
  }

  try {
    const response = await TokenModel.payTokens(token, tokensAmount, wallet)

    if (!response || !response.encodedTransaction) {
      return res.status(500).json({ msg: 'No se recuperó transacción' })
    }

    return res.status(200).json({
      msg: 'Transacción autorizada',
      response
    })
  } catch (error) {
    console.error('Error al guardar el token:', error)
    return res.status(401).json({ msg: 'Token inválido', err: error })
  }
}

const transferTokens = async (req, res) => {
  const { tokensAmount, to_wallet, from_wallet } = req.body

  if (!tokensAmount || !to_wallet || !from_wallet) {
    return res.status(400).json({ error: 'Datos inválidos' })
  }

  try {
    const response = await TokenModel.transferTokens(
      to_wallet,
      from_wallet,
      tokensAmount
    )

    if (!response) {
      return res.status(500).json({ msg: 'No se recuperó transacción' })
    }

    return res.status(200).json({
      msg: 'Transacción solicitada',
      encodedTransaction: response.result
    })
  } catch (error) {
    console.error('Error al hacer transfer del token:', error)
    return res.status(401).json({ msg: 'Token inválido', err: error })
  }
}

const burnTokens = async (req, res) => {
  const { wallet, tokensAmount } = req.body

  if (!tokensAmount || !wallet) {
    return res.status(400).json({ error: 'Datos inválidos' })
  }

  try {
    const response = await TokenModel.burnTokens(wallet, tokensAmount)

    if (!response) {
      return res.status(500).json({ msg: 'No se recuperó transacción' })
    }

    return res.status(200).json({
      msg: 'Transacción solicitada',
      encodedTransaction: response.result
    })
  } catch (error) {
    console.error('Error al hacer burn el token:', error)
    return res.status(401).json({ msg: 'Token inválido', err: error })
  }
}

module.exports = {
  addToken,
  transferTokens,
  burnTokens
}
