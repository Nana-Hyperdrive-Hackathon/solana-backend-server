const client = require('../config/db')

const BlackModel = {}

BlackModel.setBlackCollection = async () => {
  try {
    await client.connect()
    const myDB = client.db('test')
    const myColl = myDB.collection('blacklist')
    return myColl
  } catch (error) {
    console.error(
      '[notModel - setNotCollection] Error al conectarse / obtener la colección blacklist',
      error
    )
    throw error
  }
}

BlackModel.addBlacklist = async _token => {
  const currentDate = new Date()
  const _timestamp = currentDate.toISOString().replace('Z', '+00:00')

  try {
    const setBlackCollection = await BlackModel.setBlackCollection()
    const newNotificationDoc = {
      token: _token,
      timestamp: _timestamp
    }
    const result = await setBlackCollection.insertOne(newNotificationDoc)

    if (!result) return false

    return true
  } catch (error) {
    console.error(
      '[NotModel - addBlacklist] Error al guardar en blacklist',
      error
    )
    return false
  }
}

BlackModel.getToken = async _token => {
  const token = []
  try {
    const setBlackCollection = await BlackModel.setBlackCollection()
    const result = await setBlackCollection.find({ token: _token })

    for await (const doc of result) {
      token.push(doc)
    }

    return token
  } catch (error) {
    console.error('[NotModel - getToken] Error al recuperar el token', error)
    return false
  }
}

module.exports = BlackModel
