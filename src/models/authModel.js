const { Query } = require('mongoose')
const client = require('../config/db')

const AuthModel = {}

AuthModel.getDevicesCollection = async () => {
  try {
    await client.connect()
    const myDB = client.db('test')
    const myColl = myDB.collection('devices')
    return myColl
  } catch (error) {
    console.error(
      '[AuthModel - getDevicesCollection] Error al conectarse / obtener la colección devices',
      error
    )
    throw error
  }
}

AuthModel.createAuthData = async wallet => {
  try {
    const devicesCollection = await AuthModel.getDevicesCollection()
    const newDeviceDoc = { wallet: wallet, device_id: '', verified: false }
    const result = await devicesCollection.insertOne(newDeviceDoc)

    if (!result) return false

    return true
  } catch (error) {
    console.error(
      '[AuthModel - createAuthData] Error al guardar la información:',
      error
    )
    return false
  }
}

AuthModel.saveAuthData = async (userWallet, deviceId) => {
  try {
    const devicesCollection = await AuthModel.getDevicesCollection()
    const deviceFilter = { wallet: userWallet }
    const updateDeviceDoc = {
      $set: {
        device_id: deviceId,
        verified: true
      }
    }

    const result = await devicesCollection.updateOne(
      deviceFilter,
      updateDeviceDoc
    )

    if (!result) return false

    return true
  } catch (error) {
    console.error(
      '[AuthModel - saveAuthData] Error al guardar la información:',
      error
    )
    return false
  }
}

AuthModel.getDeviceIDbyWallet = async wallet => {
  const deviceID = []
  try {
    const setDevicesCollection = await AuthModel.getDevicesCollection()
    const result = await setDevicesCollection.find({ wallet: wallet })

    for await (const doc of result) {
      deviceID.push(doc)
    }

    return deviceID
  } catch (error) {
    console.error(
      '[AuthModel - getDeviceIDbyWallet] Error al recuperar deviceID por wallet',
      error
    )
    return false
  }
}

AuthModel.verify = async (_wallet, _deviceID) => {
  const data = []

  try {
    const setDevicesCollection = await AuthModel.getDevicesCollection()
    const result = await setDevicesCollection.find({
      wallet: _wallet,
      device_id: _deviceID
    })

    for await (const doc of result) {
      data.push(doc)
    }

    if (data.length == 0) return { found: false, verified: false }

    if (data[0]) return { found: true, verified: data[0].verified }

    return { found: false, verified: false }
  } catch (error) {
    console.error('[AuthModel - verify] Error al hacer verify', error)
    return false
  }
}

AuthModel.checkDevice = async _wallet => {
  const data = []

  try {
    const setDevicesCollection = await AuthModel.getDevicesCollection()
    const result = await setDevicesCollection.find({
      wallet: _wallet
    })

    for await (const doc of result) {
      data.push(doc)
    }

    if (data.length == 0) return { found: false, verified: false }

    if (data[0]) return { found: true, verified: data[0].verified }

    return { found: false, verified: false }
  } catch (error) {
    console.error('[AuthModel - verify] Error al checar device', error)
    return false
  }
}

AuthModel.deleteDevice = async _wallet => {
  const query = { wallet: _wallet }

  try {
    console.log('se pide eliminar')
    const setDevicesCollection = await AuthModel.getDevicesCollection()
    const result = await setDevicesCollection.deleteOne(query)

    if (!result) throw Error('Error al eliminar device')

    return { eliminados: result.deletedCount }
  } catch (error) {
    console.error('[AuthModel - verify] Error al eliminar device', error)
    return false
  }
}

module.exports = AuthModel
