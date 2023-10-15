const { GoogleAuth } = require('google-auth-library')
const SCOPES = ['https://www.googleapis.com/auth/cloud-platform']

async function getAccessToken() {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    },
    scopes: SCOPES
  })

  const jwtClient = auth.fromJSON({
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })

  return new Promise((resolve, reject) => {
    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err)
      } else {
        resolve(tokens.access_token)
      }
    })
  })
}

module.exports = getAccessToken
