require('dotenv').config()
const axios = require('axios')
const stripe = require('stripe')(process.env.STRIPE_APIKEY)

const {
  Connection,
  Keypair,
  sendAndConfirmTransaction,
  Transaction
} = require('@solana/web3.js')
const { decode } = require('bs58')

const pk = process.env.PRIVATE_KEY
const signer = Keypair.fromSecretKey(decode(pk.toString()))

const TokenModel = {}

TokenModel.executeSignedTransaction = async encodedTransaction => {
  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com')

  const transaction = Transaction.from(
    Buffer.from(encodedTransaction, 'base64')
  )

  transaction.sign(signer)

  try {
    // Send and confirm the transaction
    const txid = await sendAndConfirmTransaction(
      connection,
      transaction,
      [signer],
      {
        commitment: 'singleGossip',
        preflightCommitment: 'singleGossip'
      }
    )

    console.log('Successfully sent transaction:', txid)

    return { txid, msg: 'Successfully sent transaction' }
  } catch (error) {
    console.error('Failed to send transaction:', error)
  }
}

TokenModel.processSignedShyftTokenRequest = async (url, method, body = {}) => {
  console.log(url)
  console.log(method)
  console.log(body)
  try {
    const response = await axios({
      method: method,
      url: url,
      data: body,
      headers: {
        'x-api-key': process.env.SHYFT_APIKEY
      }
    })

    if (
      response.data.success &&
      response.data.result &&
      response.data.result.encoded_transaction
    ) {
      console.log(response.data.result.signers)
      return TokenModel.executeSignedTransaction(
        response.data.result.encoded_transaction
      )
    } else {
      console.log(response)
      return null
    }
  } catch (error) {
    console.error(
      '[TokenModel - processSignedShyftTokenRequest] Error al procesar la solicitud de token Shyft',
      error
    )
    throw error
  }
}

TokenModel.processShyftTokenRequest = async (url, method, body = {}) => {
  console.log(url)
  console.log(method)
  console.log(body)
  try {
    const response = await axios({
      method: method,
      url: url,
      data: body,
      headers: {
        'x-api-key': process.env.SHYFT_APIKEY
      }
    })

    if (
      response.data.success &&
      response.data.result &&
      response.data.result.encoded_transaction
    ) {
      const result = response.data.result.encoded_transaction
      console.log(response.data.result.signers)
      return { result }
    } else {
      console.log(response)
      return null
    }
  } catch (error) {
    console.error(
      '[TokenModel - processShyftTokenRequest] Error al procesar la solicitud de token Shyft',
      error
    )
    throw error
  }
}

TokenModel.burnTokens = async (from_wallet, tokenAmount) => {
  const mintTransactionUrl = 'https://api.shyft.to/sol/v1/token/burn_detach'
  const mintTransactionMethod = 'DELETE'
  const mintTransactionBody = {
    network: 'devnet',
    wallet: from_wallet,
    token_address: process.env.TOKEN_ADDRESS,
    amount: parseFloat(tokenAmount)
  }

  const data = TokenModel.processShyftTokenRequest(
    mintTransactionUrl,
    mintTransactionMethod,
    mintTransactionBody
  )

  if (!data) return null

  return data
}

TokenModel.transferTokens = async (to_wallet, from_wallet, amount) => {
  const mintTransactionUrl = 'https://api.shyft.to/sol/v1/token/transfer_detach'
  const mintTransactionMethod = 'POST'
  const mintTransactionBody = {
    network: 'devnet',
    from_address: from_wallet,
    token_address: process.env.TOKEN_ADDRESS,
    to_address: to_wallet,
    amount: parseFloat(amount)
  }

  const data = TokenModel.processShyftTokenRequest(
    mintTransactionUrl,
    mintTransactionMethod,
    mintTransactionBody
  )

  if (!data) return null

  return data
}

TokenModel.payTokens = async (token, tokensAmount, wallet) => {
  try {
    const charge = await stripe.charges.create({
      amount: Math.round(tokensAmount * 100),
      currency: 'mxn',
      source: token.id,
      description: `${
        wallet.toString().slice(0, 3) + '...' + wallet.toString().slice(-4)
      } ${tokensAmount} nana tokens`
    })

    if (charge) {
      const mintTransactionUrl = 'https://api.shyft.to/sol/v1/token/mint_detach'
      const mintTransactionMethod = 'POST'
      const mintTransactionBody = {
        network: 'devnet',
        mint_authority: process.env.MINT_AUTH_WALLET,
        token_address: process.env.TOKEN_ADDRESS,
        receiver: wallet,
        amount: parseFloat(tokensAmount),
        message: 'Has sido elegido para recibir NANA Tokens',
        fee_payer: process.env.MINT_AUTH_WALLET
      }

      const encodedTransaction =
        await TokenModel.processSignedShyftTokenRequest(
          mintTransactionUrl,
          mintTransactionMethod,
          mintTransactionBody
        )

      if (encodedTransaction) {
        const data = {
          user: wallet,
          tokensAmount,
          idPayment: charge.id,
          payment: 'true',
          encodedTransaction
        }
        return data
      }
    }

    return null
  } catch (error) {
    console.error(
      '[TokenModel - payTokens] Error al hacer pay de tokens',
      error
    )
    throw error
  }
}

TokenModel.mintToken = async () => {
  try {
  } catch (error) {
    console.error(
      '[TokenModel - mintToken] Error al hacer mint del token',
      error
    )
    throw error
  }
}

module.exports = TokenModel
